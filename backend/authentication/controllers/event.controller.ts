import { Request, Response } from "express";
import { eventService } from "authentication/services/event.service";

export class EventController {
  async createEvent(req: Request, res: Response) {
    try {
      const eventData = req.body;
      
      // Validar datos requeridos
      if (!eventData.title || !eventData.event_date || !eventData.event_type || !eventData.capacity || !eventData.organizer_id) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: title, event_date, event_type, capacity, organizer_id'
        });
      }

      const event = await eventService.createEvent(eventData);
      res.status(201).json({
        success: true,
        data: event,
        message: 'Event created successfully'
      });
    } catch (error) {
      console.error('Error in createEvent:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating event',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getEventById(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid event ID'
        });
      }

      const event = await eventService.getEventById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      console.error('Error in getEventById:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting event',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getAllEvents(req: Request, res: Response) {
    try {
      const events = await eventService.getAllEvents();
      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      console.error('Error in getAllEvents:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting events',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getEventsByOrganizer(req: Request, res: Response) {
    try {
      const organizerId = parseInt(req.params.organizerId);
      if (isNaN(organizerId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid organizer ID'
        });
      }

      const events = await eventService.getEventsByOrganizer(organizerId);
      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      console.error('Error in getEventsByOrganizer:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting organizer events',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateEvent(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid event ID'
        });
      }

      const eventData = req.body;
      const event = await eventService.updateEvent(eventId, eventData);
      
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      res.json({
        success: true,
        data: event,
        message: 'Event updated successfully'
      });
    } catch (error) {
      console.error('Error in updateEvent:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating event',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async deleteEvent(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid event ID'
        });
      }

      const deleted = await eventService.deleteEvent(eventId);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      res.json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteEvent:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting event',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getEventsWithOrganizer(req: Request, res: Response) {
    try {
      const events = await eventService.getEventsWithOrganizer();
      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      console.error('Error in getEventsWithOrganizer:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting events with organizer details',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getUpcomingEvents(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const events = await eventService.getUpcomingEvents(limit);
      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      console.error('Error in getUpcomingEvents:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting upcoming events',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getActiveEvents(req: Request, res: Response) {
    try {
      const events = await eventService.getActiveEvents();
      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      console.error('Error in getActiveEvents:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting active events',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getEventStats(req: Request, res: Response) {
    try {
      const stats = await eventService.getEventStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error in getEventStats:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting event statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const eventController = new EventController();
