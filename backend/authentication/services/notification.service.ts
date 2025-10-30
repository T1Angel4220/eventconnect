import Expo from "expo-server-sdk";
import { ExpoPushMessage } from "expo-server-sdk";
import { tokenService } from "tokens/services/token.service";

export class NotificationService {
  private expo: Expo;

  constructor() {
    this.expo = new Expo();
  }

  private async sendNotifications(messages: ExpoPushMessage[]): Promise<void> {
    if (messages.length === 0) {
      console.log("📱 No hay tokens para enviar notificaciones");
      return;
    }

    const chunks = this.expo.chunkPushNotifications(messages);

    for (let chunk of chunks) {
      try {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        console.log("📤 Notificaciones enviadas:", ticketChunk);
      } catch (error) {
        console.error("❌ Error enviando chunk de notificaciones:", error);
      }
    }
  }

  private async sendNotificationToSpecificUser(
    userId: number,
    title: string,
    body: string,
    data: any,
  ): Promise<void> {
    try {
      const tokens = await tokenService.getAll();
      const userTokens = tokens.filter((token) => token.user_id === userId);

      if (userTokens.length === 0) {
        console.log(`📱 No se encontraron tokens para el usuario ${userId}`);
        return;
      }

      const messages: ExpoPushMessage[] = [];

      for (let pushToken of userTokens) {
        if (!Expo.isExpoPushToken(pushToken.token)) {
          console.error("❌ Token de notificación inválido:", pushToken.token);
          continue;
        }

        messages.push({
          to: pushToken.token,
          sound: "default",
          title,
          body,
          data,
        });
      }

      await this.sendNotifications(messages);
      console.log(`✅ Notificación enviada a usuario ${userId}: ${title}`);
    } catch (error) {
      console.error(
        `❌ Error enviando notificación a usuario ${userId}:`,
        error,
      );
    }
  }

  async sendEventCreatedNotification(
    eventTitle: string,
    organizerName: string,
  ): Promise<void> {
    try {
      console.log("📱 Enviando notificación de evento creado:", eventTitle);

      const tokens = await tokenService.getAll();
      const messages: ExpoPushMessage[] = [];

      for (let pushToken of tokens) {
        if (!Expo.isExpoPushToken(pushToken.token)) {
          console.error("❌ Token de notificación inválido:", pushToken.token);
          continue;
        }

        messages.push({
          to: pushToken.token,
          sound: "default",
          title: "🎉 Nuevo Evento Disponible",
          body: `${organizerName} ha creado el evento "${eventTitle}". ¡No te lo pierdas!`,
          data: {
            type: "event_created",
            eventTitle,
            organizerName,
          },
        });
      }

      await this.sendNotifications(messages);
      console.log(
        `✅ Notificación de evento creado enviada a ${messages.length} usuarios`,
      );
    } catch (error) {
      console.error("❌ Error enviando notificación de evento creado:", error);
    }
  }

  async sendEventDeletedNotification(
    eventTitle: string,
    organizerName: string,
  ): Promise<void> {
    try {
      console.log("📱 Enviando notificación de evento eliminado:", eventTitle);

      const tokens = await tokenService.getAll();
      const messages: ExpoPushMessage[] = [];

      for (let pushToken of tokens) {
        if (!Expo.isExpoPushToken(pushToken.token)) {
          console.error("❌ Token de notificación inválido:", pushToken.token);
          continue;
        }

        messages.push({
          to: pushToken.token,
          sound: "default",
          title: "📅 Evento Cancelado",
          body: `El evento "${eventTitle}" de ${organizerName} ha sido cancelado.`,
          data: {
            type: "event_deleted",
            eventTitle,
            organizerName,
          },
        });
      }

      await this.sendNotifications(messages);
      console.log(
        `✅ Notificación de evento eliminado enviada a ${messages.length} usuarios`,
      );
    } catch (error) {
      console.error(
        "❌ Error enviando notificación de evento eliminado:",
        error,
      );
    }
  }

  async sendEventUpdatedNotification(
    eventTitle: string,
    organizerName: string,
  ): Promise<void> {
    try {
      console.log(
        "📱 Enviando notificación de evento actualizado:",
        eventTitle,
      );

      const tokens = await tokenService.getAll();
      const messages: ExpoPushMessage[] = [];

      for (let pushToken of tokens) {
        if (!Expo.isExpoPushToken(pushToken.token)) {
          console.error("❌ Token de notificación inválido:", pushToken.token);
          continue;
        }

        messages.push({
          to: pushToken.token,
          sound: "default",
          title: "📝 Evento Actualizado",
          body: `El evento "${eventTitle}" de ${organizerName} ha sido actualizado.`,
          data: {
            type: "event_updated",
            eventTitle,
            organizerName,
          },
        });
      }

      await this.sendNotifications(messages);
      console.log(
        `✅ Notificación de evento actualizado enviada a ${messages.length} usuarios`,
      );
    } catch (error) {
      console.error(
        "❌ Error enviando notificación de evento actualizado:",
        error,
      );
    }
  }

  async sendNewRegistrationToOrganizer(
    organizerId: number,
    eventTitle: string,
    userName: string,
  ): Promise<void> {
    try {
      console.log(
        `📱 Enviando notificación de nueva inscripción al organizador ${organizerId}`,
      );

      await this.sendNotificationToSpecificUser(
        organizerId,
        "👥 Nueva Inscripción",
        `${userName} se ha inscrito a tu evento "${eventTitle}".`,
        {
          type: "new_registration",
          eventTitle,
          userName,
        },
      );
    } catch (error) {
      console.error(
        "❌ Error enviando notificación de nueva inscripción:",
        error,
      );
    }
  }

  async sendRegistrationCanceledToOrganizer(
    organizerId: number,
    eventTitle: string,
    userName: string,
  ): Promise<void> {
    try {
      console.log(
        `📱 Enviando notificación de inscripción cancelada al organizador ${organizerId}`,
      );

      await this.sendNotificationToSpecificUser(
        organizerId,
        "❌ Inscripción Cancelada",
        `${userName} ha cancelado su inscripción a tu evento "${eventTitle}".`,
        {
          type: "registration_canceled",
          eventTitle,
          userName,
        },
      );
    } catch (error) {
      console.error(
        "❌ Error enviando notificación de inscripción cancelada:",
        error,
      );
    }
  }
}

export const notificationService = new NotificationService();

