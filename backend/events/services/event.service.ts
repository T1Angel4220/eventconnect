import {
  EventData,
  EventRow,
  EventWithOrganizer,
} from "events/models/event.interface";
import { EventFilters } from "events/models/filters.interface";
import { eventRepository } from "events/repositories/event.repository";

export class EventService {
  listWithFilters = async (filters: EventFilters): Promise<any[]> => {
    return await eventRepository.findAllWithFilters(filters);
  };

  createEvent = async (eventData: EventData): Promise<EventRow> => {
    try {
      console.log(
        "📝 Servicio: Creando evento con datos:",
        JSON.stringify(eventData, null, 2),
      );
      const result = await eventRepository.create(eventData);
      console.log("✅ Servicio: Evento creado exitosamente:", result.event_id);
      return result;
    } catch (error) {
      console.error("❌ Servicio: Error creating event:", error);
      console.error(
        "📊 Stack trace:",
        error instanceof Error ? error.stack : "No stack trace",
      );
      throw new Error("Failed to create event");
    }
  };

  async getEventById(eventId: number): Promise<EventRow | null> {
    try {
      return await eventRepository.findById(eventId);
    } catch (error) {
      console.error("Error getting event by ID:", error);
      throw new Error("Failed to get event");
    }
  }

  async getAllEvents(): Promise<EventRow[]> {
    try {
      return await eventRepository.findAll();
    } catch (error) {
      console.error("Error getting all events:", error);
      throw new Error("Failed to get events");
    }
  }

  async getEventsByOrganizer(
    organizerId: number,
  ): Promise<EventWithOrganizer[]> {
    try {
      return await eventRepository.findByOrganizer(organizerId);
    } catch (error) {
      console.error("Error getting events by organizer:", error);
      throw new Error("Failed to get organizer events");
    }
  }

  async updateEvent(
    eventId: number,
    eventData: Partial<EventData>,
  ): Promise<EventRow | null> {
    try {
      return await eventRepository.update(eventId, eventData);
    } catch (error) {
      console.error("Error updating event:", error);
      throw new Error("Failed to update event");
    }
  }

  async deleteEvent(eventId: number): Promise<boolean> {
    try {
      return await eventRepository.delete(eventId);
    } catch (error) {
      console.error("Error deleting event:", error);
      throw new Error("Failed to delete event");
    }
  }

  async getUpcomingEvents(limit: number = 10): Promise<EventWithOrganizer[]> {
    try {
      return await eventRepository.getUpcomingEvents(limit);
    } catch (error) {
      console.error("Error getting upcoming events:", error);
      throw new Error("Failed to get upcoming events");
    }
  }

  async getActiveEvents(): Promise<EventWithOrganizer[]> {
    try {
      return await eventRepository.getActiveEvents();
    } catch (error) {
      console.error("Error getting active events:", error);
      throw new Error("Failed to get active events");
    }
  }

  async getEventStats() {
    try {
      return await eventRepository.getStats();
    } catch (error) {
      console.error("Error getting event stats:", error);
      throw new Error("Failed to get event statistics");
    }
  }

  async getEventsWithOrganizer(): Promise<EventWithOrganizer[]> {
    try {
      return await eventRepository.getEventsWithOrganizer();
    } catch (error) {
      console.error("Error getting events with organizer:", error);
      throw new Error("Failed to get events with organizer details");
    }
  }

  async updateAllEventStatuses(): Promise<number> {
    try {
      return await eventRepository.updateAllEventStatuses();
    } catch (error) {
      console.error("Error updating event statuses:", error);
      throw new Error("Failed to update event statuses");
    }
  }
}

export const eventService = new EventService();
