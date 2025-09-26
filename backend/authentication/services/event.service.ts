import { eventRepository } from "authentication/repositories/event.repository";
import { EventData, EventRow, EventWithOrganizer } from "authentication/models/event.interface";

export class EventService {
  async createEvent(eventData: EventData): Promise<EventRow> {
    try {
      return await eventRepository.create(eventData);
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error('Failed to create event');
    }
  }

  async getEventById(eventId: number): Promise<EventRow | null> {
    try {
      return await eventRepository.findById(eventId);
    } catch (error) {
      console.error('Error getting event by ID:', error);
      throw new Error('Failed to get event');
    }
  }

  async getAllEvents(): Promise<EventRow[]> {
    try {
      return await eventRepository.findAll();
    } catch (error) {
      console.error('Error getting all events:', error);
      throw new Error('Failed to get events');
    }
  }

  async getEventsByOrganizer(organizerId: number): Promise<EventRow[]> {
    try {
      return await eventRepository.findByOrganizer(organizerId);
    } catch (error) {
      console.error('Error getting events by organizer:', error);
      throw new Error('Failed to get organizer events');
    }
  }

  async updateEvent(eventId: number, eventData: Partial<EventData>): Promise<EventRow | null> {
    try {
      return await eventRepository.update(eventId, eventData);
    } catch (error) {
      console.error('Error updating event:', error);
      throw new Error('Failed to update event');
    }
  }

  async deleteEvent(eventId: number): Promise<boolean> {
    try {
      return await eventRepository.delete(eventId);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw new Error('Failed to delete event');
    }
  }

  async getEventsWithOrganizer(): Promise<EventWithOrganizer[]> {
    try {
      return await eventRepository.getEventsWithOrganizer();
    } catch (error) {
      console.error('Error getting events with organizer:', error);
      throw new Error('Failed to get events with organizer details');
    }
  }

  async getUpcomingEvents(limit: number = 10): Promise<EventWithOrganizer[]> {
    try {
      return await eventRepository.getUpcomingEvents(limit);
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      throw new Error('Failed to get upcoming events');
    }
  }

  async getActiveEvents(): Promise<EventWithOrganizer[]> {
    try {
      return await eventRepository.getActiveEvents();
    } catch (error) {
      console.error('Error getting active events:', error);
      throw new Error('Failed to get active events');
    }
  }

  async getEventStats() {
    try {
      return await eventRepository.getStats();
    } catch (error) {
      console.error('Error getting event stats:', error);
      throw new Error('Failed to get event statistics');
    }
  }
}

export const eventService = new EventService();
