import { Request, Response } from "express";
import { userRepository } from "authentication/repositories/user.repository";
import { eventRepository } from "authentication/repositories/event.repository";
import { registrationRepository } from "authentication/repositories/registration.repository";
import { notificationRepository } from "authentication/repositories/notification.repository";

export class AdminController {
  
  // === GESTIÓN DE USUARIOS ===
  
  /**
   * Obtener todos los usuarios del sistema (solo admin)
   */
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userRepository.findAll();
      
      // Remover información sensible
      const safeUsers = users.map(user => ({
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        profile_image: user.profile_image,
        created_at: user.created_at
      }));

      res.json({
        success: true,
        data: safeUsers,
        message: 'Usuarios obtenidos exitosamente'
      });
    } catch (error) {
      console.error('Error getting all users:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo usuarios',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Eliminar cualquier usuario del sistema (solo admin)
   */
  async deleteUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const currentAdminId = req.user?.userId;

      // Verificar que el admin no se esté eliminando a sí mismo
      if (parseInt(userId) === currentAdminId) {
        return res.status(400).json({
          success: false,
          message: 'No puedes eliminarte a ti mismo'
        });
      }

      const user = await userRepository.findById(parseInt(userId));
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Eliminar usuario (esto también eliminará sus eventos e inscripciones por CASCADE)
      const deleted = await userRepository.delete(parseInt(userId));
      
      if (deleted) {
        res.json({
          success: true,
          message: `Usuario ${user.first_name} ${user.last_name} eliminado exitosamente`
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error eliminando usuario'
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        message: 'Error eliminando usuario',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Cambiar rol de usuario (solo admin)
   */
  async changeUserRole(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { newRole } = req.body;
      const currentAdminId = req.user?.userId;

      // Verificar que el admin no se esté cambiando su propio rol
      if (parseInt(userId) === currentAdminId) {
        return res.status(400).json({
          success: false,
          message: 'No puedes cambiar tu propio rol'
        });
      }

      // Validar rol
      const validRoles = ['participant', 'organizer', 'admin'];
      if (!validRoles.includes(newRole)) {
        return res.status(400).json({
          success: false,
          message: 'Rol inválido. Roles válidos: participant, organizer, admin'
        });
      }

      const user = await userRepository.findById(parseInt(userId));
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Actualizar rol
      const updated = await userRepository.updateRole(parseInt(userId), newRole);
      
      if (updated) {
        res.json({
          success: true,
          message: `Rol de ${user.first_name} ${user.last_name} cambiado a ${newRole} exitosamente`
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error actualizando rol'
        });
      }
    } catch (error) {
      console.error('Error changing user role:', error);
      res.status(500).json({
        success: false,
        message: 'Error cambiando rol de usuario',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // === GESTIÓN DE EVENTOS ===

  /**
   * Obtener todos los eventos del sistema (solo admin)
   */
  async getAllEvents(req: Request, res: Response) {
    try {
      const events = await eventRepository.findAllWithOrganizer();
      
      res.json({
        success: true,
        data: events,
        message: 'Eventos obtenidos exitosamente'
      });
    } catch (error) {
      console.error('Error getting all events:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo eventos',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Eliminar cualquier evento del sistema (solo admin)
   */
  async deleteEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;

      const event = await eventRepository.findById(parseInt(eventId));
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado'
        });
      }

      // Eliminar evento (esto también eliminará las inscripciones por CASCADE)
      const deleted = await eventRepository.delete(parseInt(eventId));
      
      if (deleted) {
        res.json({
          success: true,
          message: `Evento "${event.title}" eliminado exitosamente`
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error eliminando evento'
        });
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({
        success: false,
        message: 'Error eliminando evento',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // === ESTADÍSTICAS GLOBALES ===

  /**
   * Obtener estadísticas globales del sistema (solo admin)
   */
  async getSystemStats(req: Request, res: Response) {
    try {
      const [
        totalUsers,
        totalEvents,
        totalRegistrations,
        usersByRole,
        eventsByType,
        registrationsByMonth
      ] = await Promise.all([
        userRepository.countAll(),
        eventRepository.countAll(),
        registrationRepository.countAll(),
        userRepository.countByRole(),
        eventRepository.countByType(),
        registrationRepository.getRegistrationsByMonth(6)
      ]);

      res.json({
        success: true,
        data: {
          totalUsers,
          totalEvents,
          totalRegistrations,
          usersByRole,
          eventsByType,
          registrationsByMonth
        },
        message: 'Estadísticas del sistema obtenidas exitosamente'
      });
    } catch (error) {
      console.error('Error getting system stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas del sistema',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // === GESTIÓN DE NOTIFICACIONES GLOBALES ===

  /**
   * Enviar notificación global a todos los usuarios (solo admin)
   */
  async sendGlobalNotification(req: Request, res: Response) {
    try {
      const { message } = req.body;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'El mensaje es requerido'
        });
      }

      // Obtener todos los usuarios
      const users = await userRepository.findAll();
      
      // Crear notificaciones para todos los usuarios
      const notifications = users.map(user => ({
        user_id: user.user_id,
        message: message.trim(),
        status: 'pending' as const
      }));

      // Insertar todas las notificaciones
      for (const notification of notifications) {
        await notificationRepository.create(notification);
      }

      res.json({
        success: true,
        message: `Notificación enviada a ${users.length} usuarios exitosamente`
      });
    } catch (error) {
      console.error('Error sending global notification:', error);
      res.status(500).json({
        success: false,
        message: 'Error enviando notificación global',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const adminController = new AdminController();
