import { Request, Response } from "express";
import { registrationService } from "authentication/services/registration.service";

export class RegistrationController {
  
  // Crear una nueva inscripción
  async createRegistration(req: Request, res: Response) {
    try {
      const { event_id } = req.body;
      const userId = (req as any).user?.user_id; // Viene del middleware de autenticación

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      if (!event_id) {
        return res.status(400).json({
          success: false,
          message: 'El ID del evento es requerido'
        });
      }

      // Verificar si el usuario puede inscribirse
      const eligibility = await registrationService.canUserRegisterToEvent(userId, event_id);
      if (!eligibility.canRegister) {
        return res.status(400).json({
          success: false,
          message: eligibility.reason
        });
      }

      const registration = await registrationService.createRegistration({ event_id }, userId);
      
      res.status(201).json({
        success: true,
        data: registration,
        message: 'Inscripción creada exitosamente'
      });
    } catch (error) {
      console.error('Error in createRegistration:', error);
      res.status(500).json({
        success: false,
        message: 'Error creando inscripción',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Obtener inscripción por ID
  async getRegistrationById(req: Request, res: Response) {
    try {
      const registrationId = parseInt(req.params.id);
      if (isNaN(registrationId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de inscripción inválido'
        });
      }

      const registration = await registrationService.getRegistrationById(registrationId);
      if (!registration) {
        return res.status(404).json({
          success: false,
          message: 'Inscripción no encontrada'
        });
      }

      res.json({
        success: true,
        data: registration
      });
    } catch (error) {
      console.error('Error in getRegistrationById:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo inscripción',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Obtener inscripciones del usuario autenticado
  async getUserRegistrations(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.user_id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const registrations = await registrationService.getUserRegistrations(userId);
      res.json({
        success: true,
        data: registrations
      });
    } catch (error) {
      console.error('Error in getUserRegistrations:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo inscripciones del usuario',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Obtener inscripciones de un evento específico
  async getEventRegistrations(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de evento inválido'
        });
      }

      const registrations = await registrationService.getEventRegistrations(eventId);
      res.json({
        success: true,
        data: registrations
      });
    } catch (error) {
      console.error('Error in getEventRegistrations:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo inscripciones del evento',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Obtener todas las inscripciones (solo para administradores/organizadores)
  async getAllRegistrations(req: Request, res: Response) {
    try {
      const userRole = (req as any).user?.role;
      if (userRole !== 'admin' && userRole !== 'organizer') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a esta información'
        });
      }

      const registrations = await registrationService.getAllRegistrations();
      res.json({
        success: true,
        data: registrations
      });
    } catch (error) {
      console.error('Error in getAllRegistrations:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo todas las inscripciones',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Actualizar estado de inscripción
  async updateRegistrationStatus(req: Request, res: Response) {
    try {
      const registrationId = parseInt(req.params.id);
      const { status } = req.body;

      if (isNaN(registrationId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de inscripción inválido'
        });
      }

      if (!status || !['registered', 'canceled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido. Debe ser "registered" o "canceled"'
        });
      }

      const registration = await registrationService.updateRegistrationStatus(registrationId, { status });
      if (!registration) {
        return res.status(404).json({
          success: false,
          message: 'Inscripción no encontrada'
        });
      }

      res.json({
        success: true,
        data: registration,
        message: 'Estado de inscripción actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error in updateRegistrationStatus:', error);
      res.status(500).json({
        success: false,
        message: 'Error actualizando estado de inscripción',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Cancelar inscripción
  async cancelRegistration(req: Request, res: Response) {
    try {
      const registrationId = parseInt(req.params.id);
      const userId = (req as any).user?.user_id;

      if (isNaN(registrationId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de inscripción inválido'
        });
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Verificar que la inscripción pertenece al usuario o es admin/organizer
      const registration = await registrationService.getRegistrationById(registrationId);
      const userRole = (req as any).user?.role;
      
      if (!registration) {
        return res.status(404).json({
          success: false,
          message: 'Inscripción no encontrada'
        });
      }

      if (registration.user_id !== userId && userRole !== 'admin' && userRole !== 'organizer') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para cancelar esta inscripción'
        });
      }

      const canceledRegistration = await registrationService.cancelRegistration(registrationId);
      
      res.json({
        success: true,
        data: canceledRegistration,
        message: 'Inscripción cancelada exitosamente'
      });
    } catch (error) {
      console.error('Error in cancelRegistration:', error);
      res.status(500).json({
        success: false,
        message: 'Error cancelando inscripción',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Eliminar inscripción completamente
  async deleteRegistration(req: Request, res: Response) {
    try {
      const registrationId = parseInt(req.params.id);
      const userRole = (req as any).user?.role;

      if (isNaN(registrationId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de inscripción inválido'
        });
      }

      if (userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo los administradores pueden eliminar inscripciones'
        });
      }

      const deleted = await registrationService.deleteRegistration(registrationId);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Inscripción no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Inscripción eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error in deleteRegistration:', error);
      res.status(500).json({
        success: false,
        message: 'Error eliminando inscripción',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Obtener estadísticas de inscripciones
  async getRegistrationStats(req: Request, res: Response) {
    try {
      const userRole = (req as any).user?.role;
      if (userRole !== 'admin' && userRole !== 'organizer') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a las estadísticas'
        });
      }

      const stats = await registrationService.getRegistrationStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error in getRegistrationStats:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas de inscripciones',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Verificar capacidad de un evento
  async getEventCapacity(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de evento inválido'
        });
      }

      const capacityInfo = await registrationService.getEventCapacityInfo(eventId);
      res.json({
        success: true,
        data: capacityInfo
      });
    } catch (error) {
      console.error('Error in getEventCapacity:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo información de capacidad del evento',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Buscar inscripciones
  async searchRegistrations(req: Request, res: Response) {
    try {
      const userRole = (req as any).user?.role;
      if (userRole !== 'admin' && userRole !== 'organizer') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para buscar inscripciones'
        });
      }

      const { userId, eventId, status, eventTitle, userName } = req.query;
      
      const criteria: any = {};
      if (userId) criteria.userId = parseInt(userId as string);
      if (eventId) criteria.eventId = parseInt(eventId as string);
      if (status) criteria.status = status as 'registered' | 'canceled';
      if (eventTitle) criteria.eventTitle = eventTitle as string;
      if (userName) criteria.userName = userName as string;

      const registrations = await registrationService.searchRegistrations(criteria);
      res.json({
        success: true,
        data: registrations
      });
    } catch (error) {
      console.error('Error in searchRegistrations:', error);
      res.status(500).json({
        success: false,
        message: 'Error buscando inscripciones',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const registrationController = new RegistrationController();
