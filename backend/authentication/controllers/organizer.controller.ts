import { Request, Response } from "express";
import { userService } from "authentication/services/user.service";
import { encryptPassword } from "@utils/helpers";
import bcrypt from "bcryptjs";

export class OrganizerController {
  // Obtener perfil del organizador autenticado
  async getMyProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const user = await userService.getUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // No devolver la contraseña
      const { password, ...userProfile } = user;

      res.json({
        success: true,
        data: userProfile
      });
    } catch (error) {
      console.error('Error in getMyProfile:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener perfil',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Actualizar información personal del organizador
  async updateMyProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const { first_name, last_name, email } = req.body;

      // Validar campos requeridos
      if (!first_name || !last_name || !email) {
        return res.status(400).json({
          success: false,
          message: 'Los campos nombre, apellido y email son requeridos'
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de email inválido'
        });
      }

      // Verificar si el email ya existe en otro usuario
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser && existingUser.user_id !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Este email ya está en uso por otro usuario'
        });
      }

      // Actualizar usuario (necesitaremos crear este método en userService)
      const updatedUser = await userService.updateUserProfile(userId, {
        first_name,
        last_name,
        email
      });

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // No devolver la contraseña
      const { password, ...userProfile } = updatedUser;

      res.json({
        success: true,
        data: userProfile,
        message: 'Perfil actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error in updateMyProfile:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar perfil',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Cambiar contraseña del organizador
  async changePassword(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const { currentPassword, newPassword } = req.body;

      // Validar campos requeridos
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña actual y la nueva contraseña son requeridas'
        });
      }

      // Validar nueva contraseña con criterios robustos
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe tener al menos 8 caracteres'
        });
      }

      if (newPassword.length > 128) {
        return res.status(400).json({
          success: false,
          message: 'La nueva contraseña no puede exceder 128 caracteres'
        });
      }

      // Validar que contenga al menos una letra mayúscula, una minúscula y un número
      const hasUpperCase = /[A-Z]/.test(newPassword);
      const hasLowerCase = /[a-z]/.test(newPassword);
      const hasNumber = /\d/.test(newPassword);

      if (!hasUpperCase) {
        return res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe contener al menos una letra mayúscula'
        });
      }

      if (!hasLowerCase) {
        return res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe contener al menos una letra minúscula'
        });
      }

      if (!hasNumber) {
        return res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe contener al menos un número'
        });
      }

      // Obtener usuario actual
      const user = await userService.getUserById(userId);
      if (!user || !user.password) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar contraseña actual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña actual es incorrecta'
        });
      }

      // Hashear la nueva contraseña antes de guardarla
      const hashedNewPassword = await encryptPassword(newPassword);
      
      // Actualizar contraseña
      const success = await userService.updateUserPassword(userId, hashedNewPassword);
      if (!success) {
        return res.status(500).json({
          success: false,
          message: 'Error al actualizar la contraseña'
        });
      }

      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error in changePassword:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cambiar contraseña',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Obtener preferencias de eventos del organizador
  async getEventPreferences(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Por ahora devolvemos preferencias por defecto
      // Más adelante podremos almacenar estas preferencias en la base de datos
      const preferences = {
        default_locations: ['Auditorio Principal', 'Sala de Conferencias', 'Centro de Convenciones'],
        default_durations: [30, 60, 90, 120], // en minutos
        event_types: ['academic', 'cultural', 'sports'],
        default_capacity: 50
      };

      res.json({
        success: true,
        data: preferences
      });
    } catch (error) {
      console.error('Error in getEventPreferences:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener preferencias',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Actualizar preferencias de eventos del organizador
  async updateEventPreferences(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const { default_locations, default_durations, event_types, default_capacity } = req.body;

      // Validar tipos de eventos
      const validEventTypes = ['academic', 'cultural', 'sports'];
      if (event_types && !event_types.every((type: string) => validEventTypes.includes(type))) {
        return res.status(400).json({
          success: false,
          message: 'Tipos de eventos inválidos. Solo se permiten: academic, cultural, sports'
        });
      }

      // Validar capacidad por defecto
      if (default_capacity && (default_capacity < 1 || default_capacity > 1000)) {
        return res.status(400).json({
          success: false,
          message: 'La capacidad por defecto debe estar entre 1 y 1000'
        });
      }

      // Por ahora solo validamos y devolvemos éxito
      // Más adelante podremos almacenar estas preferencias en la base de datos
      const preferences = {
        default_locations: default_locations || ['Auditorio Principal', 'Sala de Conferencias', 'Centro de Convenciones'],
        default_durations: default_durations || [30, 60, 90, 120],
        event_types: event_types || ['academic', 'cultural', 'sports'],
        default_capacity: default_capacity || 50
      };

      res.json({
        success: true,
        data: preferences,
        message: 'Preferencias actualizadas exitosamente'
      });
    } catch (error) {
      console.error('Error in updateEventPreferences:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar preferencias',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const organizerController = new OrganizerController();
