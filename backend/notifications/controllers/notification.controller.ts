import { Request, Response } from "express";
import { notificationService } from "../services/notification.service";
import { CreateNotificationRequest } from "../models/notification.interface";

export const getUserNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      res.status(400).json({
        success: false,
        message: "ID de usuario inválido"
      });
      return;
    }

    const notifications = await notificationService.getUserNotifications(userId);
    
    res.status(200).json({
      success: true,
      data: notifications,
      message: "Notificaciones obtenidas exitosamente"
    });
  } catch (error) {
    console.error("Error getting user notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo notificaciones del usuario",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const getUnreadNotificationCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      res.status(400).json({
        success: false,
        message: "ID de usuario inválido"
      });
      return;
    }

    const count = await notificationService.getUnreadCount(userId);
    
    res.status(200).json({
      success: true,
      data: { count },
      message: "Conteo de notificaciones no leídas obtenido exitosamente"
    });
  } catch (error) {
    console.error("Error getting unread notification count:", error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo el conteo de notificaciones no leídas",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const notificationId = parseInt(req.params.notificationId);
    
    if (isNaN(notificationId)) {
      res.status(400).json({
        success: false,
        message: "ID de notificación inválido"
      });
      return;
    }

    const result = await notificationService.markNotificationAsRead(notificationId);
    
    if (result) {
      res.status(200).json({
        success: true,
        message: "Notificación marcada como leída exitosamente"
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Notificación no encontrada"
      });
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Error marcando notificación como leída",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const markAllNotificationsAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      res.status(400).json({
        success: false,
        message: "ID de usuario inválido"
      });
      return;
    }

    const result = await notificationService.markAllNotificationsAsRead(userId);
    
    res.status(200).json({
      success: true,
      message: "Todas las notificaciones marcadas como leídas exitosamente"
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Error marcando todas las notificaciones como leídas",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const notificationId = parseInt(req.params.notificationId);
    
    if (isNaN(notificationId)) {
      res.status(400).json({
        success: false,
        message: "ID de notificación inválido"
      });
      return;
    }

    const result = await notificationService.deleteNotification(notificationId);
    
    if (result) {
      res.status(200).json({
        success: true,
        message: "Notificación eliminada exitosamente"
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Notificación no encontrada"
      });
    }
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Error eliminando notificación",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const createNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, message, status }: CreateNotificationRequest = req.body;
    
    if (!user_id || !message) {
      res.status(400).json({
        success: false,
        message: "user_id y message son requeridos"
      });
      return;
    }

    const notification = await notificationService.createNotification({
      user_id,
      message,
      status
    });
    
    res.status(201).json({
      success: true,
      data: notification,
      message: "Notificación creada exitosamente"
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      success: false,
      message: "Error creando notificación",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};