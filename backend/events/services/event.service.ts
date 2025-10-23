import { CreateEventDto, EventEntity, UpdateEventDto } from "events/models/event.interface";
import { EventRepository, EventFilters, eventRepository } from "events/repositories/event.repository";

export class EventService {
  constructor(private repo: EventRepository) {}

  async list(): Promise<(EventEntity & { attendees: number })[]> {
    const events = await this.repo.findAll();
    const withCounts = await Promise.all(
      events.map(async (e) => ({ ...e, attendees: await this.repo.countRegistrations(e.event_id) }))
    );
    return withCounts;
  }

  /**
   * Listar eventos con filtros avanzados
   */
  async listWithFilters(filters: EventFilters): Promise<any[]> {
    return await this.repo.findAllWithFilters(filters);
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
    
    // Calcular el estado automáticamente basado en la fecha actual
    const now = new Date();
    const eventDateTime = new Date(dto.event_date);
    const endDateTime = new Date(eventDateTime.getTime() + dto.duration * 60000);
    
    let calculatedStatus = 'upcoming';
    if (now >= eventDateTime && now <= endDateTime) {
      calculatedStatus = 'in_progress';
    } else if (now > endDateTime) {
      calculatedStatus = 'completed';
    }
    
    // Agregar el estado calculado al DTO
    const dtoWithStatus = { ...dto, status: calculatedStatus };
    
    console.log("✅ Validación exitosa, creando evento...");
    return this.repo.create(dtoWithStatus, organizerId);
  }

  async update(eventId: number, dto: UpdateEventDto): Promise<EventEntity | null> {
    return this.repo.update(eventId, dto);
  }

  async remove(eventId: number): Promise<void> {
    await this.repo.delete(eventId);
  }

  async updateAllEventStatuses(): Promise<number> {
    console.log("🔄 Iniciando actualización de estados de eventos...");
    
    // Obtener todos los eventos
    const events = await this.repo.findAll();
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
        await this.repo.updateStatus(event.event_id, newStatus);
        updatedCount++;
      }
    }
    
    console.log(`✅ Actualización completada. ${updatedCount} eventos actualizados.`);
    return updatedCount;
  }
}

export const eventService = new EventService(eventRepository);


