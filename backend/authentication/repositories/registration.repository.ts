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
}

export const registrationRepository = new RegistrationRepositoryImpl();
export { RegistrationRepositoryImpl };