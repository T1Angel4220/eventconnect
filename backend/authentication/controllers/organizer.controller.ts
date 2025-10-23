import { Request, Response } from "express";
import { userService } from "authentication/services/user.service";
import { encryptPassword } from "@utils/helpers";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";

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

      // Normalizar email a minúsculas
      const normalizedEmail = email.trim().toLowerCase();

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de email inválido'
        });
      }

      // Verificar si el email ya existe en otro usuario
      const existingUser = await userService.getUserByEmail(normalizedEmail);
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
        email: normalizedEmail
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

  // Actualizar imagen de perfil
  async updateProfileImage(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Verificar si se subió un archivo
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ninguna imagen'
        });
      }

      // Obtener información del usuario actual
      const user = await userService.getUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Eliminar imagen anterior si existe
      if (user.profile_image) {
        const oldImagePath = path.join(__dirname, '../../uploads/profiles', path.basename(user.profile_image));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Generar URL de la nueva imagen
      const imageUrl = `/uploads/profiles/${req.file.filename}`;

      // Actualizar imagen en la base de datos
      await userService.updateUserProfile(userId, { 
        first_name: user.first_name, 
        last_name: user.last_name, 
        email: user.email, 
        profile_image: imageUrl 
      });

      return res.status(200).json({
        success: true,
        message: 'Imagen de perfil actualizada exitosamente',
        data: {
          profile_image: imageUrl
        }
      });

    } catch (error) {
      console.error('Error updating profile image:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Eliminar imagen de perfil
  async deleteProfileImage(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Obtener información del usuario actual
      const user = await userService.getUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Eliminar imagen del servidor si existe
      if (user.profile_image) {
        const imagePath = path.join(__dirname, '../../uploads/profiles', path.basename(user.profile_image));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      // Actualizar base de datos para eliminar referencia
      await userService.updateUserProfile(userId, { 
        first_name: user.first_name, 
        last_name: user.last_name, 
        email: user.email, 
        profile_image: undefined 
      });

      return res.status(200).json({
        success: true,
        message: 'Imagen de perfil eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error deleting profile image:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Eliminar cuenta propia
  async deleteMyAccount(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const { password } = req.body;

      // Validar que se proporcione la contraseña
      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Debes proporcionar tu contraseña para confirmar la eliminación'
        });
      }

      // Obtener información del usuario actual
      const user = await userService.getUserById(userId);
      if (!user || !user.password) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Contraseña incorrecta'
        });
      }

      // Eliminar imagen de perfil del servidor si existe
      if (user.profile_image) {
        const imagePath = path.join(__dirname, '../../uploads/profiles', path.basename(user.profile_image));
        if (fs.existsSync(imagePath)) {
          try {
            fs.unlinkSync(imagePath);
          } catch (error) {
            console.error('Error deleting profile image file:', error);
          }
        }
      }

      // Eliminar cuenta (esto también eliminará eventos e inscripciones por CASCADE)
      const deleted = await userService.deleteUser(userId);
      
      if (deleted) {
        return res.status(200).json({
          success: true,
          message: 'Tu cuenta ha sido eliminada exitosamente'
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Error al eliminar la cuenta'
        });
      }

    } catch (error) {
      console.error('Error deleting account:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

export const organizerController = new OrganizerController();
