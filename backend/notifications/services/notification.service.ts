import { notificationRepository } from "../repositories/notification.repository";
import { NotificationData, NotificationRow, CreateNotificationRequest } from "../models/notification.interface";

export class NotificationService {
  async createNotification(request: CreateNotificationRequest): Promise<NotificationRow> {
    try {
      const notificationData: NotificationData = {
        user_id: request.user_id,
        message: request.message,
        status: request.status || 'pending'
      };

      const notification = await notificationRepository.create(notificationData);
      console.log(`✅ Notificación creada para usuario ${request.user_id}: ${request.message}`);
      return notification;
    } catch (error) {
      console.error("❌ Error creando notificación:", error);
      throw new Error("Failed to create notification");
    }
  }

  async getUserNotifications(userId: number): Promise<NotificationRow[]> {
    try {
      const notifications = await notificationRepository.findByUser(userId);
      return notifications;
    } catch (error) {
      console.error("❌ Error obteniendo notificaciones del usuario:", error);
      throw new Error("Failed to get user notifications");
    }
  }

  async markNotificationAsRead(notificationId: number): Promise<boolean> {
    try {
      const result = await notificationRepository.markAsRead(notificationId);
      if (result) {
        console.log(`✅ Notificación ${notificationId} marcada como leída`);
      }
      return result;
    } catch (error) {
      console.error("❌ Error marcando notificación como leída:", error);
      throw new Error("Failed to mark notification as read");
    }
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    try {
      const result = await notificationRepository.markAllAsRead(userId);
      if (result) {
        console.log(`✅ Todas las notificaciones del usuario ${userId} marcadas como leídas`);
      }
      return result;
    } catch (error) {
      console.error("❌ Error marcando todas las notificaciones como leídas:", error);
      throw new Error("Failed to mark all notifications as read");
    }
  }

  async getUnreadCount(userId: number): Promise<number> {
    try {
      const count = await notificationRepository.getUnreadCount(userId);
      return count;
    } catch (error) {
      console.error("❌ Error obteniendo el conteo de notificaciones no leídas:", error);
      throw new Error("Failed to get unread notification count");
    }
  }

  async deleteNotification(notificationId: number): Promise<boolean> {
    try {
      const result = await notificationRepository.delete(notificationId);
      if (result) {
        console.log(`✅ Notificación ${notificationId} eliminada`);
      }
      return result;
    } catch (error) {
      console.error("❌ Error eliminando notificación:", error);
      throw new Error("Failed to delete notification");
    }
  }

  async createRegistrationNotificationForOrganizer(
    organizerId: number,
    eventTitle: string,
    userName: string
  ): Promise<NotificationRow> {
    const message = `El usuario ${userName} se inscribió a tu evento "${eventTitle}"`;
    
    return this.createNotification({
      user_id: organizerId,
      message,
      status: 'pending'
    });
  }

  async createCancellationNotificationForOrganizer(
    organizerId: number,
    eventTitle: string,
    userName: string
  ): Promise<NotificationRow> {
    const message = `El usuario ${userName} canceló su inscripción a tu evento "${eventTitle}"`;
    
    return this.createNotification({
      user_id: organizerId,
      message,
      status: 'pending'
    });
  }
}

export const notificationService = new NotificationService();