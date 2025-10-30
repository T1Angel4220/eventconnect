import { eventService } from "events/services/event.service";
import { EventFilters } from "events/models/filters.interface";
import { Request, Response } from "express";
import { notificationService } from "authentication/services/notification.service";
import { userRepository } from "authentication/repositories/user.repository";

export class EventController {
  listEvents = async (req: Request, res: Response) => {
    try {
      console.log("📥 Query params recibidos:", req.query);

      // Construir filtros desde query params
      const filters: EventFilters = {};

      // Filtros de fecha
      if (req.query.dateRange) {
        filters.dateRange = req.query.dateRange as any;
        console.log("📅 dateRange recibido:", req.query.dateRange);
      }
      if (req.query.startDate) {
        filters.startDate = req.query.startDate as string;
      }
      if (req.query.endDate) {
        filters.endDate = req.query.endDate as string;
      }

      // Filtros básicos
      if (req.query.location) {
        filters.location = req.query.location as string;
      }
      if (req.query.eventType) {
        filters.eventType = req.query.eventType as any;
      }
      if (req.query.status) {
        filters.status = req.query.status as any;
      }

      // Ordenamiento
      if (req.query.sortBy) {
        filters.sortBy = req.query.sortBy as any;
      }
      if (req.query.sortOrder) {
        filters.sortOrder = req.query.sortOrder as any;
      }

      console.log("🔍 Filtros procesados:", JSON.stringify(filters, null, 2));

      const events = await eventService.listWithFilters(filters);

      console.log(`✅ Retornando ${events.length} eventos`);

      res.json({
        success: true,
        data: events,
        filters: filters,
        count: events.length,
      });
    } catch (error) {
      console.error("❌ Error al listar eventos:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener eventos",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  createEvent = async (req: Request, res: Response) => {
    try {
      const eventData = req.body;
      console.log(
        "📝 Datos recibidos del frontend:",
        JSON.stringify(eventData, null, 2),
      );
      console.log("👤 Usuario autenticado:", req.user);

      // Obtener el organizer_id del usuario autenticado
      const organizerId = req.user?.userId;
      if (!organizerId) {
        console.log("❌ No hay userId en req.user");
        return res.status(401).json({
          success: false,
          message: "Usuario no autenticado",
        });
      }

      console.log("🔍 Organizer ID:", organizerId);

      // Validar datos requeridos (sin organizer_id ya que se obtiene del token)
      if (
        !eventData.title ||
        !eventData.event_date ||
        !eventData.event_type ||
        !eventData.capacity ||
        !eventData.duration ||
        eventData.duration <= 0
      ) {
        console.log("❌ Faltan campos requeridos:", {
          title: !!eventData.title,
          event_date: !!eventData.event_date,
          event_type: !!eventData.event_type,
          capacity: !!eventData.capacity,
          duration: eventData.duration,
        });
        return res.status(400).json({
          success: false,
          message:
            "Missing required fields: title, event_date, event_type, capacity, duration",
        });
      }

      // Manejar la imagen subida
      let eventImageUrl = "/uploads/events/default-event.jpg"; // Imagen por defecto
      if (req.file) {
        eventImageUrl = `/uploads/events/${req.file.filename}`;
        console.log("📷 Imagen subida:", eventImageUrl);
      } else {
        console.log("⚠️ No se subió imagen, usando imagen por defecto");
      }

      // Validar y convertir event_date a Date
      const eventDate = new Date(eventData.event_date);
      if (isNaN(eventDate.getTime())) {
        console.log("❌ Fecha inválida recibida:", eventData.event_date);
        return res.status(400).json({
          success: false,
          message: "Fecha inválida. Por favor, verifica la fecha del evento.",
        });
      }

      // Agregar el organizer_id al eventData y convertir event_date a Date
      const eventDataWithOrganizer = {
        ...eventData,
        organizer_id: organizerId,
        event_date: eventDate, // Usar la fecha validada
        event_image: eventImageUrl,
      };

      console.log(
        "📊 Datos finales para crear evento:",
        JSON.stringify(eventDataWithOrganizer, null, 2),
      );

      const event = await eventService.createEvent(eventDataWithOrganizer);
      console.log("✅ Evento creado exitosamente:", event.event_id);

      // Send notification about the new event
      try {
        const organizer = await userRepository.findById(organizerId);
        if (organizer) {
          await notificationService.sendEventCreatedNotification(
            event.title,
            `${organizer.first_name} ${organizer.last_name}`
          );
          console.log("📱 Notificación de evento creado enviada");
        }
      } catch (notificationError) {
        console.error("❌ Error enviando notificación de evento creado:", notificationError);
        // Don't fail the event creation if notification fails
      }

      res.status(201).json({
        success: true,
        data: event,
        message: "Event created successfully",
      });
    } catch (error) {
      console.error("❌ Error in createEvent:", error);
      console.error(
        "📊 Stack trace:",
        error instanceof Error ? error.stack : "No stack trace",
      );
      res.status(500).json({
        success: false,
        message: "Error creating event",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  getEventById = async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid event ID",
        });
      }

      const event = await eventService.getEventById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      res.json({
        success: true,
        data: event,
      });
    } catch (error) {
      console.error("Error in getEventById:", error);
      res.status(500).json({
        success: false,
        message: "Error getting event",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  getEventsByOrganizer = async (req: Request, res: Response) => {
    try {
      const organizerId = parseInt(req.params.organizerId);
      if (isNaN(organizerId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid organizer ID",
        });
      }

      const events = await eventService.getEventsByOrganizer(organizerId);
      res.json({
        success: true,
        data: events,
      });
    } catch (error) {
      console.error("Error in getEventsByOrganizer:", error);
      res.status(500).json({
        success: false,
        message: "Error getting organizer events",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  updateEvent = async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid event ID",
        });
      }

      const eventData = req.body;

      // Manejar la imagen subida si se proporciona una nueva
      if (req.file) {
        eventData.event_image = `/uploads/events/${req.file.filename}`;
        console.log(
          "📷 Nueva imagen subida para evento:",
          eventData.event_image,
        );
      }

      const event = await eventService.updateEvent(eventId, eventData);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      // Send notification about the event update
      try {
        const organizer = await userRepository.findById(event.organizer_id);
        if (organizer) {
          await notificationService.sendEventUpdatedNotification(
            event.title,
            `${organizer.first_name} ${organizer.last_name}`
          );
          console.log("📱 Notificación de evento actualizado enviada");
        }
      } catch (notificationError) {
        console.error("❌ Error enviando notificación de evento actualizado:", notificationError);
        // Don't fail the update if notification fails
      }

      res.json({
        success: true,
        data: event,
        message: "Event updated successfully",
      });
    } catch (error) {
      console.error("Error in updateEvent:", error);
      res.status(500).json({
        success: false,
        message: "Error updating event",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  deleteEvent = async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid event ID",
        });
      }

      // Get event details before deletion for notification
      const eventToDelete = await eventService.getEventById(eventId);
      if (!eventToDelete) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      const deleted = await eventService.deleteEvent(eventId);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      // Send notification about the event deletion
      try {
        const organizer = await userRepository.findById(eventToDelete.organizer_id);
        if (organizer) {
          await notificationService.sendEventDeletedNotification(
            eventToDelete.title,
            `${organizer.first_name} ${organizer.last_name}`
          );
          console.log("📱 Notificación de evento eliminado enviada");
        }
      } catch (notificationError) {
        console.error("❌ Error enviando notificación de evento eliminado:", notificationError);
        // Don't fail the deletion if notification fails
      }

      res.json({
        success: true,
        message: "Event deleted successfully",
      });
    } catch (error) {
      console.error("Error in deleteEvent:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting event",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  getEventsWithOrganizer = async (req: Request, res: Response) => {
    try {
      const events = await eventService.getEventsWithOrganizer();
      res.json({
        success: true,
        data: events,
      });
    } catch (error) {
      console.error("Error in getEventsWithOrganizer:", error);
      res.status(500).json({
        success: false,
        message: "Error getting events with organizer details",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  getUpcomingEvents = async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const events = await eventService.getUpcomingEvents(limit);
      res.json({
        success: true,
        data: events,
      });
    } catch (error) {
      console.error("Error in getUpcomingEvents:", error);
      res.status(500).json({
        success: false,
        message: "Error getting upcoming events",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  getActiveEvents = async (req: Request, res: Response) => {
    try {
      const events = await eventService.getActiveEvents();
      res.json({
        success: true,
        data: events,
      });
    } catch (error) {
      console.error("Error in getActiveEvents:", error);
      res.status(500).json({
        success: false,
        message: "Error getting active events",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  getEventStats = async (req: Request, res: Response) => {
    try {
      const stats = await eventService.getEventStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error in getEventStats:", error);
      res.status(500).json({
        success: false,
        message: "Error getting event statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  updateEventStatuses = async (req: Request, res: Response) => {
    try {
      const updatedCount = await eventService.updateAllEventStatuses();
      res.json({
        message: `Estados actualizados exitosamente`,
        updatedCount,
      });
    } catch (error) {
      console.error("❌ Error actualizando estados:", error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Error actualizando estados",
      });
    }
  };
}

export const eventController = new EventController();
