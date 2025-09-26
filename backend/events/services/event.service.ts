import { CreateEventDto, EventEntity, UpdateEventDto } from "events/models/event.interface";
import { EventRepository, eventRepository } from "events/repositories/event.repository";

export class EventService {
  constructor(private repo: EventRepository) {}

  async list(): Promise<(EventEntity & { attendees: number })[]> {
    const events = await this.repo.findAll();
    const withCounts = await Promise.all(
      events.map(async (e) => ({ ...e, attendees: await this.repo.countRegistrations(e.event_id) }))
    );
    return withCounts;
  }

  async getById(eventId: number): Promise<(EventEntity & { attendees: number }) | null> {
    const event = await this.repo.findById(eventId);
    if (!event) return null;
    const attendees = await this.repo.countRegistrations(eventId);
    return { ...event, attendees };
  }

  async create(dto: CreateEventDto, organizerId: number): Promise<EventEntity> {
    console.log("🔍 Validando datos del evento:", dto);
    
    // Validar campos requeridos
    if (!dto.title) {
      throw new Error("El título es requerido");
    }
    if (!dto.event_date) {
      throw new Error("La fecha del evento es requerida");
    }
    if (!dto.duration || dto.duration <= 0) {
      throw new Error("La duración debe ser mayor a 0");
    }
    if (!dto.event_type) {
      throw new Error("El tipo de evento es requerido");
    }
    if (!dto.capacity || dto.capacity <= 0) {
      throw new Error("La capacidad debe ser mayor a 0");
    }
    
    console.log("✅ Validación exitosa, creando evento...");
    return this.repo.create(dto, organizerId);
  }

  async update(eventId: number, dto: UpdateEventDto): Promise<EventEntity | null> {
    return this.repo.update(eventId, dto);
  }

  async remove(eventId: number): Promise<void> {
    await this.repo.delete(eventId);
  }
}

export const eventService = new EventService(eventRepository);


