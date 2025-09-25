import pool from "config/db";
import { RegistrationData, RegistrationRow, RegistrationStats, RegistrationWithDetails } from "authentication/models/registration.interface";

export interface RegistrationRepository {
  create(registration: RegistrationData): Promise<RegistrationRow>;
  findById(registrationId: number): Promise<RegistrationRow | null>;
  findByUser(userId: number): Promise<RegistrationWithDetails[]>;
  findByEvent(eventId: number): Promise<RegistrationWithDetails[]>;
  findByUserAndEvent(userId: number, eventId: number): Promise<RegistrationRow | null>;
  update(registrationId: number, registration: Partial<RegistrationData>): Promise<RegistrationRow | null>;
  delete(registrationId: number): Promise<boolean>;
  getStats(): Promise<RegistrationStats>;
  getTopUsers(limit?: number): Promise<Array<{ user_id: number; user_name: string; events_attended: number; favorite_category: string; join_date: string }>>;
  getRecentRegistrations(limit?: number): Promise<RegistrationWithDetails[]>;
}

class RegistrationRepositoryImpl implements RegistrationRepository {
  async create(registration: RegistrationData): Promise<RegistrationRow> {
    const query = `
      INSERT INTO registrations (user_id, event_id, status)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [registration.user_id, registration.event_id, registration.status];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findById(registrationId: number): Promise<RegistrationRow | null> {
    const query = 'SELECT * FROM registrations WHERE registration_id = $1';
    const result = await pool.query(query, [registrationId]);
    return result.rows[0] || null;
  }

  async findByUser(userId: number): Promise<RegistrationWithDetails[]> {
    const query = `
      SELECT 
        r.*,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        u.email as user_email,
        e.title as event_title,
        e.event_date
      FROM registrations r
      JOIN users u ON r.user_id = u.user_id
      JOIN events e ON r.event_id = e.event_id
      WHERE r.user_id = $1
      ORDER BY r.registered_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  async findByEvent(eventId: number): Promise<RegistrationWithDetails[]> {
    const query = `
      SELECT 
        r.*,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        u.email as user_email,
        e.title as event_title,
        e.event_date
      FROM registrations r
      JOIN users u ON r.user_id = u.user_id
      JOIN events e ON r.event_id = e.event_id
      WHERE r.event_id = $1
      ORDER BY r.registered_at DESC
    `;
    
    const result = await pool.query(query, [eventId]);
    return result.rows;
  }

  async findByUserAndEvent(userId: number, eventId: number): Promise<RegistrationRow | null> {
    const query = 'SELECT * FROM registrations WHERE user_id = $1 AND event_id = $2';
    const result = await pool.query(query, [userId, eventId]);
    return result.rows[0] || null;
  }

  async update(registrationId: number, registration: Partial<RegistrationData>): Promise<RegistrationRow | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(registration).forEach(([key, value]) => {
      if (value !== undefined && key !== 'registration_id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(registrationId);
    }

    values.push(registrationId);

    const query = `
      UPDATE registrations 
      SET ${fields.join(', ')}
      WHERE registration_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(registrationId: number): Promise<boolean> {
    const query = 'DELETE FROM registrations WHERE registration_id = $1';
    const result = await pool.query(query, [registrationId]);
    return result.rowCount > 0;
  }

  async getStats(): Promise<RegistrationStats> {
    const query = `
      SELECT 
        COUNT(*) as total_registrations,
        COUNT(CASE WHEN status = 'registered' THEN 1 END) as active_registrations,
        COUNT(CASE WHEN status = 'canceled' THEN 1 END) as canceled_registrations
      FROM registrations
    `;
    
    const result = await pool.query(query);
    return result.rows[0];
  }

  async getTopUsers(limit: number = 10): Promise<Array<{ user_id: number; user_name: string; events_attended: number; favorite_category: string; join_date: string }>> {
    const query = `
      SELECT 
        u.user_id,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        COUNT(r.registration_id) as events_attended,
        (
          SELECT e.event_type
          FROM registrations r2
          JOIN events e ON r2.event_id = e.event_id
          WHERE r2.user_id = u.user_id AND r2.status = 'registered'
          GROUP BY e.event_type
          ORDER BY COUNT(*) DESC
          LIMIT 1
        ) as favorite_category,
        TO_CHAR(u.created_at, 'Mon YYYY') as join_date
      FROM users u
      LEFT JOIN registrations r ON u.user_id = r.user_id AND r.status = 'registered'
      WHERE u.role = 'participant'
      GROUP BY u.user_id, u.first_name, u.last_name, u.created_at
      ORDER BY events_attended DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  async getRecentRegistrations(limit: number = 10): Promise<RegistrationWithDetails[]> {
    const query = `
      SELECT 
        r.*,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        u.email as user_email,
        e.title as event_title,
        e.event_date
      FROM registrations r
      JOIN users u ON r.user_id = u.user_id
      JOIN events e ON r.event_id = e.event_id
      WHERE r.status = 'registered'
      ORDER BY r.registered_at DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows;
  }
}

export const registrationRepository = new RegistrationRepositoryImpl();
export { RegistrationRepositoryImpl };
