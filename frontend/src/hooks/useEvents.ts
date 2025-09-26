import { useState, useEffect } from 'react';
import { eventService } from '../services/eventService';
import type { Event, EventStats, EventData } from '../types/event.types';
import type { EventWithOrganizer } from '../types/dashboard.types';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsWithOrganizer, setEventsWithOrganizer] = useState<EventWithOrganizer[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventWithOrganizer[]>([]);
  const [activeEvents, setActiveEvents] = useState<EventWithOrganizer[]>([]);
  const [stats, setStats] = useState<EventStats | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventsWithOrganizer = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getEventsWithOrganizer();
      setEventsWithOrganizer(data);
    } catch (err) {
      console.error('Error fetching events with organizer:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingEvents = async (limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getUpcomingEvents(limit);
      setUpcomingEvents(data);
    } catch (err) {
      console.error('Error fetching upcoming events:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getActiveEvents();
      setActiveEvents(data);
    } catch (err) {
      console.error('Error fetching active events:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getEventStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching event stats:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: EventData) => {
    try {
      setLoading(true);
      setError(null);
      const newEvent = await eventService.createEvent(eventData);
      setEvents(prev => [newEvent, ...prev]);
      return newEvent;
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (eventId: number, eventData: Partial<EventData>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedEvent = await eventService.updateEvent(eventId, eventData);
      setEvents(prev => prev.map(event => 
        event.event_id === eventId ? updatedEvent : event
      ));
      return updatedEvent;
    } catch (err) {
      console.error('Error updating event:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId: number) => {
    try {
      setLoading(true);
      setError(null);
      await eventService.deleteEvent(eventId);
      setEvents(prev => prev.filter(event => event.event_id !== eventId));
    } catch (err) {
      console.error('Error deleting event:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([
      fetchEvents(),
      fetchEventsWithOrganizer(),
      fetchUpcomingEvents(),
      fetchActiveEvents(),
      fetchEventStats()
    ]);
  };

  useEffect(() => {
    fetchEvents();
    fetchEventsWithOrganizer();
    fetchUpcomingEvents();
    fetchActiveEvents();
    fetchEventStats();
  }, []);

  return {
    events,
    eventsWithOrganizer,
    upcomingEvents,
    activeEvents,
    stats,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshAll,
    fetchEvents,
    fetchEventsWithOrganizer,
    fetchUpcomingEvents,
    fetchActiveEvents,
    fetchEventStats
  };
};
