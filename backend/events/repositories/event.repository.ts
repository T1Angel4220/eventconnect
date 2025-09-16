import pool from "@config/db";
import { CreateEventDto, EventEntity, UpdateEventDto } from "events/models/event.interface";

export class EventRepository {
  async findAll(): Promise<EventEntity[]> {
    const result = await pool.query("SELECT * FROM events ORDER BY created_at DESC");
    return result.rows as EventEntity[];
  }

  async findById(eventId: number): Promise<EventEntity | null> {
    const result = await pool.query("SELECT * FROM events WHERE event_id = $1", [eventId]);
    return result.rows[0] || null;
  }

  async create(createDto: CreateEventDto, organizerId: number): Promise<EventEntity> {
    const { title, description, event_date, location, event_type, capacity } = createDto;
    const result = await pool.query(
      `INSERT INTO events (title, description, event_date, location, event_type, capacity, organizer_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, description || null, event_date, location || null, event_type, capacity, organizerId]
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
}

export const eventRepository = new EventRepository();


