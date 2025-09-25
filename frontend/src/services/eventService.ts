import type { Event, EventData, EventStats } from '../types/event.types';
import type { EventWithOrganizer, ApiResponse } from '../types/dashboard.types';
import { API_CONFIG, getDefaultHeaders, handleApiError } from '../config/api';

class EventService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const config: RequestInit = {
      headers: {
        ...getDefaultHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`Error in event service: ${endpoint}`, error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }

  // CRUD Operations
  async createEvent(eventData: EventData): Promise<Event> {
    const response = await this.request<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
    return response.data;
  }

  async getAllEvents(): Promise<Event[]> {
    const response = await this.request<Event[]>('/events');
    return response.data;
  }

  async getEventById(eventId: number): Promise<Event> {
    const response = await this.request<Event>(`/events/${eventId}`);
    return response.data;
  }

  async updateEvent(eventId: number, eventData: Partial<EventData>): Promise<Event> {
    const response = await this.request<Event>(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
    return response.data;
  }

  async deleteEvent(eventId: number): Promise<void> {
    await this.request(`/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  // Specialized Queries
  async getEventsWithOrganizer(): Promise<EventWithOrganizer[]> {
    const response = await this.request<EventWithOrganizer[]>('/events/with-organizer');
    return response.data;
  }

  async getUpcomingEvents(limit: number = 10): Promise<EventWithOrganizer[]> {
    const response = await this.request<EventWithOrganizer[]>(`/events/upcoming?limit=${limit}`);
    return response.data;
  }

  async getActiveEvents(): Promise<EventWithOrganizer[]> {
    const response = await this.request<EventWithOrganizer[]>('/events/active');
    return response.data;
  }

  async getEventsByOrganizer(organizerId: number): Promise<Event[]> {
    const response = await this.request<Event[]>(`/events/organizer/${organizerId}`);
    return response.data;
  }

  async getEventStats(): Promise<EventStats> {
    const response = await this.request<EventStats>('/events/stats');
    return response.data;
  }
}

export const eventService = new EventService();
