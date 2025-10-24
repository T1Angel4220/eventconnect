import pool from "@config/db";
import { CreateEventDto, EventEntity, UpdateEventDto } from "events/models/event.interface";

export interface EventFilters {
  // Filtros de fecha
  dateRange?: 'today' | 'this_week' | 'this_month' | 'custom';
  startDate?: string;
  endDate?: string;
  
  // Filtros básicos
  location?: string;
  eventType?: 'academico' | 'cultural' | 'deportivo';
  status?: 'upcoming' | 'in_progress' | 'completed';
  
  // Ordenamiento
  sortBy?: 'date' | 'popularity' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export class EventRepository {
  async findAll(): Promise<EventEntity[]> {
    const result = await pool.query("SELECT * FROM events ORDER BY created_at DESC");
    return result.rows as EventEntity[];
  }

  /**
   * Buscar eventos con filtros avanzados
   */
  async findAllWithFilters(filters: EventFilters = {}): Promise<any[]> {
    try {
      // Construir la query base con información de inscripciones
      let query = `
        SELECT 
          e.*,
          u.first_name as organizer_first_name,
          u.last_name as organizer_last_name,
          COALESCE(r.registered_count, 0) as registered_count,
          CASE 
            WHEN e.capacity IS NOT NULL THEN e.capacity - COALESCE(r.registered_count, 0)
            ELSE NULL
          END as available_spots
        FROM events e
        LEFT JOIN users u ON e.organizer_id = u.user_id
        LEFT JOIN (
          SELECT event_id, COUNT(*) as registered_count
          FROM registrations 
          WHERE status = 'registered'
          GROUP BY event_id
        ) r ON e.event_id = r.event_id
        WHERE 1=1
      `;

      const values: any[] = [];
      let paramIndex = 1;

      // FILTRO PREDETERMINADO: Excluir eventos completados SIEMPRE (a menos que se solicite explícitamente)
      // Esto asegura que el dashboard NUNCA muestre eventos finalizados para inscribirse
      if (!filters.status || filters.status !== 'completed') {
        query += ` AND e.status != 'completed'`;
        console.log('🚫 Excluyendo eventos completados del dashboard');
      }

      // Filtro de rango de fechas
      if (filters.dateRange) {
        const now = new Date();
        let startDate: Date | undefined;
        let endDate: Date | undefined;

        switch (filters.dateRange) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            console.log('📅 Filtro TODAY:', { startDate, endDate });
            break;
          case 'this_week':
            const dayOfWeek = now.getDay(); // 0 = domingo, 6 = sábado
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek, 0, 0, 0, 0);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - dayOfWeek), 23, 59, 59, 999);
            console.log('📅 Filtro THIS_WEEK:', { startDate, endDate });
            break;
          case 'this_month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            console.log('📅 Filtro THIS_MONTH:', { startDate, endDate, currentMonth: now.getMonth() });
            break;
          case 'custom':
            if (filters.startDate) {
              query += ` AND e.event_date >= $${paramIndex++}`;
              values.push(filters.startDate);
            }
            if (filters.endDate) {
              query += ` AND e.event_date <= $${paramIndex++}`;
              values.push(filters.endDate);
            }
            break;
        }

        if (filters.dateRange !== 'custom' && startDate && endDate) {
          query += ` AND e.event_date >= $${paramIndex++} AND e.event_date <= $${paramIndex++}`;
          values.push(startDate.toISOString(), endDate.toISOString());
          console.log('📅 Aplicando filtro de fecha:', { 
            start: startDate.toISOString(), 
            end: endDate.toISOString() 
          });
        }
      }

      // Filtro por ubicación
      if (filters.location) {
        query += ` AND LOWER(e.location) LIKE LOWER($${paramIndex++})`;
        values.push(`%${filters.location}%`);
      }

      // Filtro por tipo de evento
      if (filters.eventType) {
        query += ` AND e.event_type = $${paramIndex++}`;
        values.push(filters.eventType);
      }

      // Filtro por estado
      if (filters.status) {
        query += ` AND e.status = $${paramIndex++}`;
        values.push(filters.status);
      }

      // Ordenamiento
      const sortBy = filters.sortBy || 'date';
      const sortOrder = filters.sortOrder || 'asc';

      switch (sortBy) {
        case 'date':
          query += ` ORDER BY e.event_date ${sortOrder.toUpperCase()}, e.event_id ASC`;
          break;
        case 'popularity':
          // Popularidad siempre DESC (más participantes primero), con orden secundario por event_id
          query += ` ORDER BY COALESCE(r.registered_count, 0) DESC, e.event_id ASC`;
          console.log('📈 Ordenando por POPULARIDAD (más participantes primero)');
          break;
        case 'created_at':
          query += ` ORDER BY e.created_at ${sortOrder.toUpperCase()}, e.event_id ASC`;
          break;
        default:
          query += ` ORDER BY e.event_date ASC, e.event_id ASC`;
      }

      console.log('🔍 Query:', query);
      console.log('📊 Values:', values);

      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error("Error finding events with filters:", error);
      throw error;
    }
  }

  async findById(eventId: number): Promise<EventEntity | null> {
    const result = await pool.query("SELECT * FROM events WHERE event_id = $1", [eventId]);
    return result.rows[0] || null;
  }

  async create(createDto: CreateEventDto, organizerId: number): Promise<EventEntity> {
    const { title, description, event_date, duration, status, location, event_type, capacity } = createDto;
    const result = await pool.query(
      `INSERT INTO events (title, description, event_date, duration, status, location, event_type, capacity, organizer_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, description || null, event_date, duration, status || 'upcoming', location || null, event_type, capacity, organizerId]
    );
    return result.rows[0] as EventEntity;
  }

  async update(eventId: number, updateDto: UpdateEventDto): Promise<EventEntity | null> {
    // Build dynamic update
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const entries = Object.entries(updateDto).filter(([, v]) => v !== undefined);
    for (const [key, value] of entries) {
      fields.push(`${key} = $${idx++}`);
      values.push(value);
    }

    if (fields.length === 0) {
      const existing = await this.findById(eventId);
      return existing;
    }

    // updated_at
    fields.push(`updated_at = NOW()`);

    const query = `UPDATE events SET ${fields.join(", ")} WHERE event_id = $${idx} RETURNING *`;
    values.push(eventId);

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(eventId: number): Promise<void> {
    await pool.query("DELETE FROM events WHERE event_id = $1", [eventId]);
  }

  async countRegistrations(eventId: number): Promise<number> {
    const result = await pool.query(
      "SELECT COUNT(*)::int AS count FROM registrations WHERE event_id = $1 AND status = 'registered'",
      [eventId]
    );
    return result.rows[0]?.count || 0;
  }

  async updateStatus(eventId: number, status: string): Promise<void> {
    await pool.query(
      "UPDATE events SET status = $1, updated_at = NOW() WHERE event_id = $2",
      [status, eventId]
    );
  }
}

export const eventRepository = new EventRepository();


