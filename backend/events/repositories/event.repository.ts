import {
  EventData,
  EventRow,
  EventStats,
  EventWithOrganizer,
} from "authentication/models/event.interface";
import pool from "config/db";
import { EventFilters } from "events/models/filters.interface";

export interface EventRepository {
  create(event: EventData): Promise<EventRow>;
  findById(eventId: number): Promise<EventRow | null>;
  findAll(): Promise<EventRow[]>;
  findByOrganizer(organizerId: number): Promise<EventWithOrganizer[]>;
  update(eventId: number, event: Partial<EventData>): Promise<EventRow | null>;
  delete(eventId: number): Promise<boolean>;
  getStats(): Promise<EventStats>;
  getStatsByOrganizer(organizerId: number): Promise<EventStats>;
  getEventsWithOrganizer(): Promise<EventWithOrganizer[]>;
  getUpcomingEvents(limit?: number): Promise<EventWithOrganizer[]>;
  getActiveEvents(): Promise<EventWithOrganizer[]>;
}

class EventRepositoryImpl implements EventRepository {
  async create(event: EventData): Promise<EventRow> {
    try {
      console.log(
        "📝 Creando evento en repositorio con datos:",
        JSON.stringify(event, null, 2),
      );

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
        event.event_image,
      ];

      console.log("Query SQL:", query);
      console.log("Valores:", values);

      const result = await pool.query(query, values);
      console.log("Evento creado en base de datos:", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("Error en repositorio al crear evento:", error);
      console.error(
        "Stack trace:",
        error instanceof Error ? error.stack : "No stack trace",
      );
      throw error;
    }
  }

  findAllWithFilters = async (filters: EventFilters = {}): Promise<any[]> => {
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
      if (!filters.status || filters.status !== "completed") {
        query += ` AND e.status != 'completed'`;
        console.log("🚫 Excluyendo eventos completados del dashboard");
      }

      // Filtro de rango de fechas
      if (filters.dateRange) {
        const now = new Date();
        let startDate: Date | undefined;
        let endDate: Date | undefined;

        switch (filters.dateRange) {
          case "today":
            startDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              0,
              0,
              0,
              0,
            );
            endDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              23,
              59,
              59,
              999,
            );
            console.log("📅 Filtro TODAY:", { startDate, endDate });
            break;
          case "this_week":
            const dayOfWeek = now.getDay(); // 0 = domingo, 6 = sábado
            startDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate() - dayOfWeek,
              0,
              0,
              0,
              0,
            );
            endDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate() + (6 - dayOfWeek),
              23,
              59,
              59,
              999,
            );
            console.log("📅 Filtro THIS_WEEK:", { startDate, endDate });
            break;
          case "this_month":
            startDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              1,
              0,
              0,
              0,
              0,
            );
            endDate = new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              0,
              23,
              59,
              59,
              999,
            );
            console.log("📅 Filtro THIS_MONTH:", {
              startDate,
              endDate,
              currentMonth: now.getMonth(),
            });
            break;
          case "custom":
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

        if (filters.dateRange !== "custom" && startDate && endDate) {
          query += ` AND e.event_date >= $${paramIndex++} AND e.event_date <= $${paramIndex++}`;
          values.push(startDate.toISOString(), endDate.toISOString());
          console.log("📅 Aplicando filtro de fecha:", {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
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
      const sortBy = filters.sortBy || "date";
      const sortOrder = filters.sortOrder || "asc";

      switch (sortBy) {
        case "date":
          query += ` ORDER BY e.event_date ${sortOrder.toUpperCase()}, e.event_id ASC`;
          break;
        case "popularity":
          // Popularidad siempre DESC (más participantes primero), con orden secundario por event_id
          query += ` ORDER BY COALESCE(r.registered_count, 0) DESC, e.event_id ASC`;
          console.log(
            "📈 Ordenando por POPULARIDAD (más participantes primero)",
          );
          break;
        case "created_at":
          query += ` ORDER BY e.created_at ${sortOrder.toUpperCase()}, e.event_id ASC`;
          break;
        default:
          query += ` ORDER BY e.event_date ASC, e.event_id ASC`;
      }

      console.log("🔍 Query:", query);
      console.log("📊 Values:", values);

      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error("Error finding events with filters:", error);
      throw error;
    }
  };

  async findById(eventId: number): Promise<EventRow | null> {
    const query = "SELECT * FROM events WHERE event_id = $1";
    const result = await pool.query(query, [eventId]);
    return result.rows[0] || null;
  }

  async findAll(): Promise<EventRow[]> {
    const query = "SELECT * FROM events ORDER BY created_at DESC";
    const result = await pool.query(query);

    // Limpiar URLs blob automáticamente
    const cleanedRows = result.rows.map((row) => {
      if (row.event_image && row.event_image.startsWith("blob:")) {
        console.log(
          `🧹 Limpiando URL blob del evento ${row.event_id} en base de datos`,
        );
        // Actualizar en la base de datos
        pool
          .query("UPDATE events SET event_image = $1 WHERE event_id = $2", [
            "/uploads/events/default-event.jpg",
            row.event_id,
          ])
          .catch((err) => console.error("Error actualizando evento:", err));

        return {
          ...row,
          event_image: "/uploads/events/default-event.jpg",
        };
      }
      return row;
    });

    return cleanedRows;
  }

  async findByOrganizer(organizerId: number): Promise<EventWithOrganizer[]> {
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
      WHERE e.organizer_id = $1
      ORDER BY e.created_at DESC
    `;

    const result = await pool.query(query, [organizerId]);

    // Limpiar URLs blob automáticamente
    const cleanedRows = result.rows.map((row) => {
      if (row.event_image && row.event_image.startsWith("blob:")) {
        console.log(
          `Limpiando URL blob del evento ${row.event_id} en base de datos`,
        );
        // Actualizar en la base de datos
        pool
          .query("UPDATE events SET event_image = $1 WHERE event_id = $2", [
            "/uploads/events/default-event.jpg",
            row.event_id,
          ])
          .catch((err) => console.error("Error actualizando evento:", err));

        return {
          ...row,
          event_image: "/uploads/events/default-event.jpg",
        };
      }
      return row;
    });

    return cleanedRows;
  }

  async update(
    eventId: number,
    event: Partial<EventData>,
  ): Promise<EventRow | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(event).forEach(([key, value]) => {
      if (value !== undefined && key !== "event_id") {
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
      SET ${fields.join(", ")}
      WHERE event_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
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

  async getStatsByOrganizer(organizerId: number): Promise<EventStats> {
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
      WHERE e.organizer_id = $1
    `;

    const result = await pool.query(query, [organizerId]);
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
      WHERE e.status != 'completed'
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
    // Obtener todos los eventos
    const events = await this.findAll();

    const now = new Date();
    let updatedCount = 0;

    for (const event of events) {
      const eventDateTime = new Date(event.event_date);
      const endDateTime = new Date(
        eventDateTime.getTime() + event.duration * 60000,
      );

      let newStatus = "upcoming";
      if (now >= eventDateTime && now <= endDateTime) {
        newStatus = "in_progress";
      } else if (now > endDateTime) {
        newStatus = "completed";
      }

      // Solo actualizar si el estado ha cambiado
      if (event.status !== newStatus) {
        await this.updateStatus(event.event_id, newStatus);
        updatedCount++;
      }
    }

    return updatedCount;
  }

  async updateStatus(eventId: number, status: string): Promise<void> {
    await pool.query(
      "UPDATE events SET status = $1, updated_at = NOW() WHERE event_id = $2",
      [status, eventId],
    );
  }

  // === MÉTODOS PARA ADMIN ===

  async findAllWithOrganizer(): Promise<any[]> {
    try {
      const res = await pool.query(`
        SELECT 
          e.*,
          u.first_name as organizer_first_name,
          u.last_name as organizer_last_name,
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
      `);
      return res.rows;
    } catch (error) {
      console.error("Error finding all events with organizer:", error);
      return [];
    }
  }

  async delete(eventId: number): Promise<boolean> {
    try {
      const res = await pool.query("DELETE FROM events WHERE event_id = $1", [
        eventId,
      ]);
      return res.rowCount ? res.rowCount > 0 : false;
    } catch (error) {
      console.error("Error deleting event:", error);
      return false;
    }
  }

  async countAll(): Promise<number> {
    try {
      const res = await pool.query("SELECT COUNT(*) as count FROM events");
      return parseInt(res.rows[0].count);
    } catch (error) {
      console.error("Error counting events:", error);
      return 0;
    }
  }

  async countByType(): Promise<Record<string, number>> {
    try {
      const res = await pool.query(`
        SELECT event_type, COUNT(*) as count 
        FROM events 
        GROUP BY event_type
      `);

      const result: Record<string, number> = {};
      res.rows.forEach((row) => {
        result[row.event_type] = parseInt(row.count);
      });

      return result;
    } catch (error) {
      console.error("Error counting events by type:", error);
      return {};
    }
  }
}

export const eventRepository = new EventRepositoryImpl();
export { EventRepositoryImpl };
