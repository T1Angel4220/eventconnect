import { Request, Response } from "express";
import { registrationService } from "authentication/services/registration.service";
import { sendRegistrationConfirmation, sendRegistrationCancellation } from "authentication/services/email.service";
import { userRepository } from "authentication/repositories/user.repository";
import { eventRepository } from "authentication/repositories/event.repository";

export class RegistrationController {
  
  // Crear una nueva inscripción (auto-inscripción universitaria)
  async createRegistration(req: Request, res: Response) {
    try {
      const { event_id } = req.body;
      // ⚠️ El JWT usa camelCase: userId, no user_id
      const userId = (req as any).user?.userId; // Viene del middleware de autenticación

      console.log('🔍 Usuario desde JWT:', (req as any).user);
      console.log('🆔 userId extraído:', userId);

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
      
      // Enviar correo de confirmación (de forma no bloqueante)
      this.sendConfirmationEmail(userId, event_id).catch(error => {
        console.error('Error enviando correo de confirmación:', error);
        // No fallar la inscripción si el correo falla
      });
      
      res.status(201).json({
        success: true,
        data: registration,
        message: 'Inscripción confirmada automáticamente'
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
      const userId = (req as any).user?.userId; // ⚠️ Corregido a camelCase
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
      const userId = (req as any).user?.userId;
      
      if (userRole !== 'admin' && userRole !== 'organizer') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a esta información'
        });
      }

      // Para organizadores, filtrar solo las inscripciones de sus eventos
      const registrations = userRole === 'organizer' && userId
        ? await registrationService.getRegistrationsByOrganizer(userId)
        : await registrationService.getAllRegistrations();
        
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

  // En eventos universitarios, los participantes se auto-inscriben directamente
  // No hay necesidad de métodos de aprobación/rechazo por parte de organizadores

  // Cancelar inscripción (usuario puede cancelar su propia inscripción)
  async cancelRegistration(req: Request, res: Response) {
    try {
      const registrationId = parseInt(req.params.id);
      const userId = (req as any).user?.userId;

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

      // Verificar que la inscripción pertenece al usuario
      const registration = await registrationService.getRegistrationById(registrationId);
      if (!registration) {
        return res.status(404).json({
          success: false,
          message: 'Inscripción no encontrada'
        });
      }

      // Verificar propiedad de la inscripción
      if (registration.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para cancelar esta inscripción'
        });
      }

      // Verificar si ya está cancelada
      if (registration.status === 'canceled') {
        return res.status(400).json({
          success: false,
          message: 'Esta inscripción ya fue cancelada'
        });
      }

      // Cancelar la inscripción (cambiar status a 'canceled')
      const canceled = await registrationService.cancelRegistration(registrationId);
      if (!canceled) {
        return res.status(500).json({
          success: false,
          message: 'Error al cancelar la inscripción'
        });
      }

      // Enviar correo de cancelación (de forma no bloqueante)
      this.sendCancellationEmail(userId, registration.event_id).catch(error => {
        console.error('Error enviando correo de cancelación:', error);
        // No fallar la cancelación si el correo falla
      });

      res.json({
        success: true,
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

  // Eliminar inscripción completamente (solo para casos excepcionales - duplicados, errores técnicos)
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

  // Verificar si el usuario está inscrito en un evento
  async checkUserRegistration(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId);
      const userId = (req as any).user?.userId;

      if (isNaN(eventId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de evento inválido'
        });
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const registrationStatus = await registrationService.checkUserRegistration(userId, eventId);
      
      res.json({
        success: true,
        data: registrationStatus
      });
    } catch (error) {
      console.error('Error in checkUserRegistration:', error);
      res.status(500).json({
        success: false,
        message: 'Error verificando estado de inscripción',
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

  // Método auxiliar para enviar correo de confirmación de inscripción
  private async sendConfirmationEmail(userId: number, eventId: number): Promise<void> {
    try {
      console.log(`📧 Preparando envío de correo de confirmación para userId: ${userId}, eventId: ${eventId}`);
      
      // Obtener datos del usuario
      const user = await userRepository.findById(userId);
      if (!user) {
        console.error('❌ Usuario no encontrado para enviar correo');
        return;
      }

      // Obtener datos del evento con organizador
      const events = await eventRepository.getEventsWithOrganizer();
      const event = events.find(e => e.event_id === eventId);
      if (!event) {
        console.error('❌ Evento no encontrado para enviar correo');
        return;
      }

      // Formatear fecha (ej: "Lunes, 25 de Octubre de 2024")
      const eventDate = new Date(event.event_date);
      const formattedDate = eventDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Formatear hora (ej: "14:30")
      const formattedTime = eventDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      // Formatear duración (ej: "2 horas" o "1 hora 30 minutos")
      const hours = Math.floor(event.duration / 60);
      const minutes = event.duration % 60;
      let formattedDuration = '';
      if (hours > 0) {
        formattedDuration += `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
      }
      if (minutes > 0) {
        if (hours > 0) formattedDuration += ' ';
        formattedDuration += `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
      }

      // Mapear tipo de evento a español
      const eventTypeMap: { [key: string]: string } = {
        'academico': 'academico',
        'cultural': 'cultural',
        'deportivo': 'deportivo'
      };

      // Enviar correo
      const emailResult = await sendRegistrationConfirmation(
        user.email,
        user.first_name,
        {
          title: event.title,
          date: formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1), // Capitalizar primera letra
          time: formattedTime,
          location: event.location || 'Por definir',
          type: eventTypeMap[event.event_type] || 'academico',
          duration: formattedDuration || 'Por definir',
          organizerName: event.organizer_name
        }
      );

      if (emailResult.success) {
        console.log(`✅ Correo de confirmación enviado exitosamente a ${user.email}`);
      } else {
        console.error(`❌ Error al enviar correo: ${emailResult.error}`);
      }
    } catch (error) {
      console.error('❌ Error en sendConfirmationEmail:', error);
      throw error;
    }
  }

  // Método auxiliar para enviar correo de cancelación de inscripción
  private async sendCancellationEmail(userId: number, eventId: number): Promise<void> {
    try {
      console.log(`📧 Preparando envío de correo de cancelación para userId: ${userId}, eventId: ${eventId}`);
      
      // Obtener datos del usuario
      const user = await userRepository.findById(userId);
      if (!user) {
        console.error('❌ Usuario no encontrado para enviar correo de cancelación');
        return;
      }

      // Obtener datos del evento con organizador
      const events = await eventRepository.getEventsWithOrganizer();
      const event = events.find(e => e.event_id === eventId);
      if (!event) {
        console.error('❌ Evento no encontrado para enviar correo de cancelación');
        return;
      }

      // Formatear fecha (ej: "Lunes, 25 de Octubre de 2024")
      const eventDate = new Date(event.event_date);
      const formattedDate = eventDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Formatear hora (ej: "14:30")
      const formattedTime = eventDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      // Mapear tipo de evento a español
      const eventTypeMap: { [key: string]: string } = {
        'academico': 'academico',
        'cultural': 'cultural',
        'deportivo': 'deportivo'
      };

      // Enviar correo de cancelación
      const emailResult = await sendRegistrationCancellation(
        user.email,
        user.first_name,
        {
          title: event.title,
          date: formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1), // Capitalizar primera letra
          time: formattedTime,
          location: event.location || 'Por definir',
          type: eventTypeMap[event.event_type] || 'academico',
          organizerName: event.organizer_name
        }
      );

      if (emailResult.success) {
        console.log(`✅ Correo de cancelación enviado exitosamente a ${user.email}`);
      } else {
        console.error(`❌ Error al enviar correo de cancelación: ${emailResult.error}`);
      }
    } catch (error) {
      console.error('❌ Error en sendCancellationEmail:', error);
      throw error;
    }
  }
}

export const registrationController = new RegistrationController();
