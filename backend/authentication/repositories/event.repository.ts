import pool from "config/db";
import { EventData, EventRow, EventStats, EventWithOrganizer } from "authentication/models/event.interface";

export interface EventRepository {
  create(event: EventData): Promise<EventRow>;
  findById(eventId: number): Promise<EventRow | null>;
  findAll(): Promise<EventRow[]>;
  findByOrganizer(organizerId: number): Promise<EventRow[]>;
  update(eventId: number, event: Partial<EventData>): Promise<EventRow | null>;
  delete(eventId: number): Promise<boolean>;
  getStats(): Promise<EventStats>;
  getEventsWithOrganizer(): Promise<EventWithOrganizer[]>;
  getUpcomingEvents(limit?: number): Promise<EventWithOrganizer[]>;
  getActiveEvents(): Promise<EventWithOrganizer[]>;
}

class EventRepositoryImpl implements EventRepository {
  async create(event: EventData): Promise<EventRow> {
    const query = `
      INSERT INTO events (title, description, event_date, location, event_type, capacity, organizer_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      event.title,
      event.description || null,
      event.event_date,
      event.location || null,
      event.event_type,
      event.capacity,
      event.organizer_id
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findById(eventId: number): Promise<EventRow | null> {
    const query = 'SELECT * FROM events WHERE event_id = $1';
    const result = await pool.query(query, [eventId]);
    return result.rows[0] || null;
  }

  async findAll(): Promise<EventRow[]> {
    const query = 'SELECT * FROM events ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  async findByOrganizer(organizerId: number): Promise<EventRow[]> {
    const query = 'SELECT * FROM events WHERE organizer_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [organizerId]);
    return result.rows;
  }

  async update(eventId: number, event: Partial<EventData>): Promise<EventRow | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(event).forEach(([key, value]) => {
      if (value !== undefined && key !== 'event_id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(eventId);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(eventId);

    const query = `
      UPDATE events 
      SET ${fields.join(', ')}
      WHERE event_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(eventId: number): Promise<boolean> {
    const query = 'DELETE FROM events WHERE event_id = $1';
    const result = await pool.query(query, [eventId]);
    return result.rowCount > 0;
  }

  async getStats(): Promise<EventStats> {
    const query = `
      SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN event_date > CURRENT_TIMESTAMP THEN 1 END) as upcoming_events,
        COUNT(CASE WHEN event_date <= CURRENT_TIMESTAMP AND event_date >= CURRENT_TIMESTAMP - INTERVAL '1 day' THEN 1 END) as active_events,
        COALESCE(SUM(r.registered_count), 0) as total_participants
      FROM events e
      LEFT JOIN (
        SELECT event_id, COUNT(*) as registered_count
        FROM registrations 
        WHERE status = 'registered'
        GROUP BY event_id
      ) r ON e.event_id = r.event_id
    `;
    
    const result = await pool.query(query);
    return result.rows[0];
  }

  async getEventsWithOrganizer(): Promise<EventWithOrganizer[]> {
    const query = `
      SELECT 
        e.*,
        CONCAT(u.first_name, ' ', u.last_name) as organizer_name,
        u.email as organizer_email,
        COALESCE(r.registered_count, 0) as registered_count
      FROM events e
      JOIN users u ON e.organizer_id = u.user_id
      LEFT JOIN (
        SELECT event_id, COUNT(*) as registered_count
        FROM registrations 
        WHERE status = 'registered'
        GROUP BY event_id
      ) r ON e.event_id = r.event_id
      ORDER BY e.created_at DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  async getUpcomingEvents(limit: number = 10): Promise<EventWithOrganizer[]> {
    const query = `
      SELECT 
        e.*,
        CONCAT(u.first_name, ' ', u.last_name) as organizer_name,
        u.email as organizer_email,
        COALESCE(r.registered_count, 0) as registered_count
      FROM events e
      JOIN users u ON e.organizer_id = u.user_id
      LEFT JOIN (
        SELECT event_id, COUNT(*) as registered_count
        FROM registrations 
        WHERE status = 'registered'
        GROUP BY event_id
      ) r ON e.event_id = r.event_id
      WHERE e.event_date > CURRENT_TIMESTAMP
      ORDER BY e.event_date ASC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  async getActiveEvents(): Promise<EventWithOrganizer[]> {
    const query = `
      SELECT 
        e.*,
        CONCAT(u.first_name, ' ', u.last_name) as organizer_name,
        u.email as organizer_email,
        COALESCE(r.registered_count, 0) as registered_count
      FROM events e
      JOIN users u ON e.organizer_id = u.user_id
      LEFT JOIN (
        SELECT event_id, COUNT(*) as registered_count
        FROM registrations 
        WHERE status = 'registered'
        GROUP BY event_id
      ) r ON e.event_id = r.event_id
      WHERE e.event_date <= CURRENT_TIMESTAMP AND e.event_date >= CURRENT_TIMESTAMP - INTERVAL '1 day'
      ORDER BY e.event_date DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }
}

export const eventRepository = new EventRepositoryImpl();
export { EventRepositoryImpl };
