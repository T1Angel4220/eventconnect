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
    try {
      console.log("📝 Creando evento en repositorio con datos:", JSON.stringify(event, null, 2));
      
      const query = `
        INSERT INTO events (title, description, event_date, duration, location, event_type, capacity, organizer_id, event_image)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      const values = [
        event.title,
        event.description || null,
        event.event_date,
        event.duration,
        event.location || null,
        event.event_type,
        event.capacity,
        event.organizer_id,
        event.event_image
      ];
      
      console.log("🔍 Query SQL:", query);
      console.log("📊 Valores:", values);
      
      const result = await pool.query(query, values);
      console.log("✅ Evento creado en base de datos:", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("❌ Error en repositorio al crear evento:", error);
      console.error("📊 Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    }
  }

  async findById(eventId: number): Promise<EventRow | null> {
    const query = 'SELECT * FROM events WHERE event_id = $1';
    const result = await pool.query(query, [eventId]);
    return result.rows[0] || null;
  }

  async findAll(): Promise<EventRow[]> {
    const query = 'SELECT * FROM events ORDER BY created_at DESC';
    const result = await pool.query(query);
    
    // Limpiar URLs blob automáticamente
    const cleanedRows = result.rows.map(row => {
      if (row.event_image && row.event_image.startsWith('blob:')) {
        console.log(`🧹 Limpiando URL blob del evento ${row.event_id} en base de datos`);
        // Actualizar en la base de datos
        pool.query(
          'UPDATE events SET event_image = $1 WHERE event_id = $2',
          ['/uploads/events/default-event.jpg', row.event_id]
        ).catch(err => console.error('Error actualizando evento:', err));
        
        return {
          ...row,
          event_image: '/uploads/events/default-event.jpg'
        };
      }
      return row;
    });
    
    return cleanedRows;
  }

  async findByOrganizer(organizerId: number): Promise<EventRow[]> {
    const query = 'SELECT * FROM events WHERE organizer_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [organizerId]);
    
    // Limpiar URLs blob automáticamente
    const cleanedRows = result.rows.map(row => {
      if (row.event_image && row.event_image.startsWith('blob:')) {
        console.log(`🧹 Limpiando URL blob del evento ${row.event_id} en base de datos`);
        // Actualizar en la base de datos
        pool.query(
          'UPDATE events SET event_image = $1 WHERE event_id = $2',
          ['/uploads/events/default-event.jpg', row.event_id]
        ).catch(err => console.error('Error actualizando evento:', err));
        
        return {
          ...row,
          event_image: '/uploads/events/default-event.jpg'
        };
      }
      return row;
    });
    
    return cleanedRows;
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

  async updateAllEventStatuses(): Promise<number> {
    console.log("🔄 Iniciando actualización de estados de eventos...");
    
    // Obtener todos los eventos
    const events = await this.findAll();
    console.log(`📊 Total de eventos encontrados: ${events.length}`);
    
    const now = new Date();
    let updatedCount = 0;
    
    for (const event of events) {
      const eventDateTime = new Date(event.event_date);
      const endDateTime = new Date(eventDateTime.getTime() + event.duration * 60000);
      
      let newStatus = 'upcoming';
      if (now >= eventDateTime && now <= endDateTime) {
        newStatus = 'in_progress';
      } else if (now > endDateTime) {
        newStatus = 'completed';
      }
      
      // Solo actualizar si el estado ha cambiado
      if (event.status !== newStatus) {
        console.log(`🔄 Actualizando evento ${event.event_id}: ${event.status} -> ${newStatus}`);
        await this.updateStatus(event.event_id, newStatus);
        updatedCount++;
      }
    }
    
    console.log(`✅ Actualización completada. ${updatedCount} eventos actualizados.`);
    return updatedCount;
  }

  async updateStatus(eventId: number, status: string): Promise<void> {
    await pool.query(
      "UPDATE events SET status = $1, updated_at = NOW() WHERE event_id = $2",
      [status, eventId]
    );
  }
}

export const eventRepository = new EventRepositoryImpl();
export { EventRepositoryImpl };
