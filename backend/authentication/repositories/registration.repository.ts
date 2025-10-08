import pool from "config/db";
import { 
  RegistrationData, 
  RegistrationRow, 
  RegistrationWithDetails, 
  RegistrationStats,
  UpdateRegistrationStatusPayload 
} from "authentication/models/registration.interface";

export interface RegistrationRepository {
  create(registration: RegistrationData): Promise<RegistrationRow>;
  findById(registrationId: number): Promise<RegistrationRow | null>;
  findByUserAndEvent(userId: number, eventId: number): Promise<RegistrationRow | null>;
  findByUser(userId: number): Promise<RegistrationWithDetails[]>;
  findByEvent(eventId: number): Promise<RegistrationWithDetails[]>;
  updateStatus(registrationId: number, status: UpdateRegistrationStatusPayload): Promise<RegistrationRow | null>;
  delete(registrationId: number): Promise<boolean>;
  getStats(): Promise<RegistrationStats>;
  getAllWithDetails(): Promise<RegistrationWithDetails[]>;
  getRegistrationsByEvent(eventId: number): Promise<RegistrationWithDetails[]>;
  getRegistrationsByUser(userId: number): Promise<RegistrationWithDetails[]>;
  checkEventCapacity(eventId: number): Promise<{ current: number; capacity: number }>;
  getTopUsers(limit: number): Promise<Array<{ user_id: number; user_name: string; events_attended: number; favorite_category: string; join_date: string }>>;
  getRecentRegistrations(limit: number): Promise<RegistrationWithDetails[]>;
}

class RegistrationRepositoryImpl implements RegistrationRepository {
  
  // Crear una nueva inscripción
  async create(registration: RegistrationData): Promise<RegistrationRow> {
    const query = `
      INSERT INTO registrations (user_id, event_id, status)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [
      registration.user_id,
      registration.event_id,
      registration.status || 'registered'
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Buscar inscripción por ID
  async findById(registrationId: number): Promise<RegistrationRow | null> {
    const query = 'SELECT * FROM registrations WHERE registration_id = $1';
    const result = await pool.query(query, [registrationId]);
    return result.rows[0] || null;
  }

  // Buscar inscripción por usuario y evento (para evitar duplicados)
  async findByUserAndEvent(userId: number, eventId: number): Promise<RegistrationRow | null> {
    const query = 'SELECT * FROM registrations WHERE user_id = $1 AND event_id = $2';
    const result = await pool.query(query, [userId, eventId]);
    return result.rows[0] || null;
  }

  // Obtener todas las inscripciones de un usuario con detalles
  async findByUser(userId: number): Promise<RegistrationWithDetails[]> {
    const query = `
      SELECT 
        r.*,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email,
        u.role as user_role,
        e.title as event_title,
        e.event_date,
        e.location as event_location,
        e.event_type,
        e.capacity as event_capacity,
        e.organizer_id,
        CONCAT(org.first_name, ' ', org.last_name) as organizer_name
      FROM registrations r
      JOIN users u ON r.user_id = u.user_id
      JOIN events e ON r.event_id = e.event_id
      JOIN users org ON e.organizer_id = org.user_id
      WHERE r.user_id = $1
      ORDER BY r.registered_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Obtener todas las inscripciones de un evento con detalles
  async findByEvent(eventId: number): Promise<RegistrationWithDetails[]> {
    const query = `
      SELECT 
        r.*,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email,
        u.role as user_role,
        e.title as event_title,
        e.event_date,
        e.location as event_location,
        e.event_type,
        e.capacity as event_capacity,
        e.organizer_id,
        CONCAT(org.first_name, ' ', org.last_name) as organizer_name
      FROM registrations r
      JOIN users u ON r.user_id = u.user_id
      JOIN events e ON r.event_id = e.event_id
      JOIN users org ON e.organizer_id = org.user_id
      WHERE r.event_id = $1
      ORDER BY r.registered_at DESC
    `;
    
    const result = await pool.query(query, [eventId]);
    return result.rows;
  }

  // Actualizar estado de inscripción
  async updateStatus(registrationId: number, status: UpdateRegistrationStatusPayload): Promise<RegistrationRow | null> {
    const query = `
      UPDATE registrations 
      SET status = $1
      WHERE registration_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [status.status, registrationId]);
    return result.rows[0] || null;
  }

  // Eliminar inscripción
  async delete(registrationId: number): Promise<boolean> {
    const query = 'DELETE FROM registrations WHERE registration_id = $1';
    const result = await pool.query(query, [registrationId]);
    return (result.rowCount || 0) > 0;
  }

  // Obtener estadísticas de inscripciones
  async getStats(): Promise<RegistrationStats> {
    // Estadísticas generales
    const generalStatsQuery = `
      SELECT 
        COUNT(*) as total_registrations,
        COUNT(CASE WHEN status = 'registered' THEN 1 END) as active_registrations,
        COUNT(CASE WHEN status = 'canceled' THEN 1 END) as canceled_registrations
      FROM registrations
    `;
    
    // Estadísticas por evento
    const eventStatsQuery = `
      SELECT 
        e.event_id,
        e.title as event_title,
        COUNT(r.registration_id) as registration_count
      FROM events e
      LEFT JOIN registrations r ON e.event_id = r.event_id AND r.status = 'registered'
      GROUP BY e.event_id, e.title
      ORDER BY registration_count DESC
    `;
    
    // Estadísticas por usuario
    const userStatsQuery = `
      SELECT 
        u.user_id,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        COUNT(r.registration_id) as registration_count
      FROM users u
      LEFT JOIN registrations r ON u.user_id = r.user_id AND r.status = 'registered'
      GROUP BY u.user_id, u.first_name, u.last_name
      ORDER BY registration_count DESC
      LIMIT 10
    `;

    const [generalResult, eventResult, userResult] = await Promise.all([
      pool.query(generalStatsQuery),
      pool.query(eventStatsQuery),
      pool.query(userStatsQuery)
    ]);

    return {
      total_registrations: parseInt(generalResult.rows[0].total_registrations),
      active_registrations: parseInt(generalResult.rows[0].active_registrations),
      canceled_registrations: parseInt(generalResult.rows[0].canceled_registrations),
      registrations_by_event: eventResult.rows,
      registrations_by_user: userResult.rows
    };
  }

  // Obtener todas las inscripciones con detalles
  async getAllWithDetails(): Promise<RegistrationWithDetails[]> {
    const query = `
      SELECT 
        r.*,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email,
        u.role as user_role,
        e.title as event_title,
        e.event_date,
        e.location as event_location,
        e.event_type,
        e.capacity as event_capacity,
        e.organizer_id,
        CONCAT(org.first_name, ' ', org.last_name) as organizer_name
      FROM registrations r
      JOIN users u ON r.user_id = u.user_id
      JOIN events e ON r.event_id = e.event_id
      JOIN users org ON e.organizer_id = org.user_id
      ORDER BY r.registered_at DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  // Obtener inscripciones por evento (alias para findByEvent)
  async getRegistrationsByEvent(eventId: number): Promise<RegistrationWithDetails[]> {
    return this.findByEvent(eventId);
  }

  // Obtener inscripciones por usuario (alias para findByUser)
  async getRegistrationsByUser(userId: number): Promise<RegistrationWithDetails[]> {
    return this.findByUser(userId);
  }

  // Verificar capacidad del evento
  async checkEventCapacity(eventId: number): Promise<{ current: number; capacity: number }> {
    const query = `
      SELECT 
        e.capacity,
        COUNT(r.registration_id) as current_registrations
      FROM events e
      LEFT JOIN registrations r ON e.event_id = r.event_id AND r.status = 'registered'
      WHERE e.event_id = $1
      GROUP BY e.capacity
    `;
    
    const result = await pool.query(query, [eventId]);
    const row = result.rows[0];
    
    return {
      current: parseInt(row.current_registrations) || 0,
      capacity: parseInt(row.capacity)
    };
  }

  // Obtener usuarios más activos (con más inscripciones)
  async getTopUsers(limit: number = 10): Promise<Array<{ user_id: number; user_name: string; events_attended: number; favorite_category: string; join_date: string }>> {
    const query = `
      SELECT 
        u.user_id,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        COUNT(r.registration_id) as events_attended,
        COALESCE(
          (SELECT e.event_type 
           FROM registrations r2 
           JOIN events e ON r2.event_id = e.event_id 
           WHERE r2.user_id = u.user_id AND r2.status = 'registered'
           GROUP BY e.event_type 
           ORDER BY COUNT(*) DESC 
           LIMIT 1), 
          'N/A'
        ) as favorite_category,
        u.created_at::text as join_date
      FROM users u
      LEFT JOIN registrations r ON u.user_id = r.user_id AND r.status = 'registered'
      WHERE u.role = 'participant'
      GROUP BY u.user_id, u.first_name, u.last_name, u.created_at
      ORDER BY events_attended DESC, u.created_at ASC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows.map(row => ({
      user_id: row.user_id,
      user_name: row.user_name,
      events_attended: parseInt(row.events_attended) || 0,
      favorite_category: row.favorite_category,
      join_date: row.join_date
    }));
  }

  // Obtener inscripciones recientes
  async getRecentRegistrations(limit: number = 10): Promise<RegistrationWithDetails[]> {
    const query = `
      SELECT 
        r.registration_id,
        r.user_id,
        r.event_id,
        r.registered_at,
        r.status,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email,
        u.role as user_role,
        e.title as event_title,
        e.event_date,
        e.location as event_location,
        e.event_type,
        e.capacity as event_capacity,
        o.first_name || ' ' || o.last_name as organizer_name,
        o.user_id as organizer_id
      FROM registrations r
      JOIN users u ON r.user_id = u.user_id
      JOIN events e ON r.event_id = e.event_id
      JOIN users o ON e.organizer_id = o.user_id
      ORDER BY r.registered_at DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows.map(row => ({
      registration_id: row.registration_id,
      user_id: row.user_id,
      event_id: row.event_id,
      registered_at: row.registered_at,
      status: row.status,
      user_first_name: row.user_first_name,
      user_last_name: row.user_last_name,
      user_email: row.user_email,
      user_role: row.user_role,
      event_title: row.event_title,
      event_date: row.event_date,
      event_location: row.event_location,
      event_type: row.event_type,
      event_capacity: row.event_capacity,
      organizer_name: row.organizer_name,
      organizer_id: row.organizer_id
    }));
  }

  // === MÉTODOS PARA ADMIN ===

  async countAll(): Promise<number> {
    try {
      const res = await pool.query("SELECT COUNT(*) as count FROM registrations WHERE status = 'registered'");
      return parseInt(res.rows[0].count);
    } catch (error) {
      console.error("Error counting registrations:", error);
      return 0;
    }
  }
}

export const registrationRepository = new RegistrationRepositoryImpl();
export { RegistrationRepositoryImpl };