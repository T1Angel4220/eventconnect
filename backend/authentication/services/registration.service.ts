import { registrationRepository } from "authentication/repositories/registration.repository";
import { 
  RegistrationData, 
  RegistrationRow, 
  RegistrationWithDetails, 
  RegistrationStats,
  CreateRegistrationPayload,
  UpdateRegistrationStatusPayload 
} from "authentication/models/registration.interface";
import { notificationService } from "../../notifications/services/notification.service";
import { eventService } from "../../events/services/event.service";
import { userService } from "./user.service";

export class RegistrationService {
  
  // Crear una nueva inscripción
  async createRegistration(registrationData: CreateRegistrationPayload, userId: number): Promise<RegistrationRow> {
    try {
      // Verificar si el usuario ya está inscrito en el evento
      const existingRegistration = await registrationRepository.findByUserAndEvent(userId, registrationData.event_id);
      
      // Si ya existe una inscripción ACTIVA, no permitir duplicados
      if (existingRegistration && existingRegistration.status === 'registered') {
        throw new Error('El usuario ya está inscrito en este evento');
      }

      // Si existe una inscripción CANCELADA, reactivarla en lugar de crear una nueva
      if (existingRegistration && existingRegistration.status === 'canceled') {
        const statusPayload: UpdateRegistrationStatusPayload = {
          status: 'registered'
        };
        const reactivated = await registrationRepository.updateStatus(existingRegistration.registration_id, statusPayload);
        if (!reactivated) {
          throw new Error('No se pudo reactivar la inscripción');
        }

        // Crear notificación para el organizador sobre la reactivación
        try {
          const event = await eventService.getEventById(registrationData.event_id);
          const user = await userService.getUserById(userId);
          
          if (event && user) {
            const userName = `${user.first_name} ${user.last_name}`;
            await notificationService.createRegistrationNotificationForOrganizer(
              event.organizer_id,
              event.title,
              userName
            );
            console.log(`✅ Notificación enviada al organizador ${event.organizer_id} sobre reactivación de inscripción`);
          }
        } catch (notificationError) {
          console.error('❌ Error enviando notificación al organizador:', notificationError);
          // No fallar la reactivación si hay error en la notificación
        }

        return reactivated;
      }

      // Verificar capacidad del evento
      const capacityInfo = await registrationRepository.checkEventCapacity(registrationData.event_id);
      if (capacityInfo.current >= capacityInfo.capacity) {
        throw new Error('El evento ha alcanzado su capacidad máxima');
      }

      // Crear la inscripción
      const registration: RegistrationData = {
        user_id: userId,
        event_id: registrationData.event_id,
        status: 'registered'
      };

      const newRegistration = await registrationRepository.create(registration);

      // Crear notificación para el organizador
      try {
        const event = await eventService.getEventById(registrationData.event_id);
        const user = await userService.getUserById(userId);
        
        if (event && user) {
          const userName = `${user.first_name} ${user.last_name}`;
          await notificationService.createRegistrationNotificationForOrganizer(
            event.organizer_id,
            event.title,
            userName
          );
          console.log(`✅ Notificación enviada al organizador ${event.organizer_id} sobre nueva inscripción`);
        }
      } catch (notificationError) {
        console.error('❌ Error enviando notificación al organizador:', notificationError);
        // No fallar la inscripción si hay error en la notificación
      }

      return newRegistration;
    } catch (error) {
      console.error('Error creating registration:', error);
      throw new Error('Failed to create registration');
    }
  }

  // Obtener inscripción por ID
  async getRegistrationById(registrationId: number): Promise<RegistrationRow | null> {
    try {
      return await registrationRepository.findById(registrationId);
    } catch (error) {
      console.error('Error getting registration by ID:', error);
      throw new Error('Failed to get registration');
    }
  }

  // Cancelar una inscripción (cambiar status a 'canceled')
  async cancelRegistration(registrationId: number): Promise<RegistrationRow | null> {
    try {
      // Obtener datos de la inscripción antes de cancelarla
      const existingRegistration = await registrationRepository.findById(registrationId);
      
      const statusPayload: UpdateRegistrationStatusPayload = {
        status: 'canceled'
      };
      const canceledRegistration = await registrationRepository.updateStatus(registrationId, statusPayload);

      // Crear notificación para el organizador
      if (canceledRegistration && existingRegistration) {
        try {
          const event = await eventService.getEventById(existingRegistration.event_id);
          const user = await userService.getUserById(existingRegistration.user_id);
          
          if (event && user) {
            const userName = `${user.first_name} ${user.last_name}`;
            await notificationService.createCancellationNotificationForOrganizer(
              event.organizer_id,
              event.title,
              userName
            );
            console.log(`✅ Notificación enviada al organizador ${event.organizer_id} sobre cancelación de inscripción`);
          }
        } catch (notificationError) {
          console.error('❌ Error enviando notificación al organizador:', notificationError);
          // No fallar la cancelación si hay error en la notificación
        }
      }

      return canceledRegistration;
    } catch (error) {
      console.error('Error canceling registration:', error);
      throw new Error('Failed to cancel registration');
    }
  }

  // Obtener inscripciones de un usuario
  async getUserRegistrations(userId: number): Promise<RegistrationWithDetails[]> {
    try {
      return await registrationRepository.findByUser(userId);
    } catch (error) {
      console.error('Error getting user registrations:', error);
      throw new Error('Failed to get user registrations');
    }
  }

  // Obtener inscripciones de un evento
  async getEventRegistrations(eventId: number): Promise<RegistrationWithDetails[]> {
    try {
      return await registrationRepository.findByEvent(eventId);
    } catch (error) {
      console.error('Error getting event registrations:', error);
      throw new Error('Failed to get event registrations');
    }
  }

  // Obtener todas las inscripciones con detalles
  async getAllRegistrations(): Promise<RegistrationWithDetails[]> {
    try {
      return await registrationRepository.getAllWithDetails();
    } catch (error) {
      console.error('Error getting all registrations:', error);
      throw new Error('Failed to get all registrations');
    }
  }

  // Obtener inscripciones por organizador
  async getRegistrationsByOrganizer(organizerId: number): Promise<RegistrationWithDetails[]> {
    try {
      return await registrationRepository.getRegistrationsByOrganizer(organizerId);
    } catch (error) {
      console.error('Error getting registrations by organizer:', error);
      throw new Error('Failed to get registrations by organizer');
    }
  }

  // En eventos universitarios, los participantes se auto-inscriben directamente
  // No hay necesidad de métodos de aprobación/rechazo por parte de organizadores

  // Eliminar inscripción completamente
  async deleteRegistration(registrationId: number): Promise<boolean> {
    try {
      return await registrationRepository.delete(registrationId);
    } catch (error) {
      console.error('Error deleting registration:', error);
      throw new Error('Failed to delete registration');
    }
  }

  // Obtener estadísticas de inscripciones
  async getRegistrationStats(): Promise<RegistrationStats> {
    try {
      return await registrationRepository.getStats();
    } catch (error) {
      console.error('Error getting registration stats:', error);
      throw new Error('Failed to get registration statistics');
    }
  }

  // Verificar si un usuario puede inscribirse a un evento
  async canUserRegisterToEvent(userId: number, eventId: number): Promise<{ canRegister: boolean; reason?: string }> {
    try {
      // Verificar si ya está inscrito
      const existingRegistration = await registrationRepository.findByUserAndEvent(userId, eventId);
      
      // Solo bloquear si la inscripción está ACTIVA (registered)
      // Si está CANCELADA, permitir re-inscripción
      if (existingRegistration && existingRegistration.status === 'registered') {
        return { 
          canRegister: false, 
          reason: 'El usuario ya está inscrito en este evento' 
        };
      }

      // Verificar capacidad del evento
      const capacityInfo = await registrationRepository.checkEventCapacity(eventId);
      if (capacityInfo.current >= capacityInfo.capacity) {
        return { 
          canRegister: false, 
          reason: 'El evento ha alcanzado su capacidad máxima' 
        };
      }

      return { canRegister: true };
    } catch (error) {
      console.error('Error checking registration eligibility:', error);
      throw new Error('Failed to check registration eligibility');
    }
  }

  // Obtener información de capacidad de un evento
  async getEventCapacityInfo(eventId: number): Promise<{ current: number; capacity: number; available: number }> {
    try {
      const capacityInfo = await registrationRepository.checkEventCapacity(eventId);
      return {
        current: capacityInfo.current,
        capacity: capacityInfo.capacity,
        available: capacityInfo.capacity - capacityInfo.current
      };
    } catch (error) {
      console.error('Error getting event capacity info:', error);
      throw new Error('Failed to get event capacity information');
    }
  }

  // Verificar si el usuario está inscrito en un evento específico
  async checkUserRegistration(userId: number, eventId: number): Promise<{
    isRegistered: boolean;
    status?: 'registered' | 'canceled';
    registrationId?: number;
    registeredAt?: Date;
  }> {
    try {
      const registration = await registrationRepository.findByUserAndEvent(userId, eventId);
      
      if (!registration) {
        return { isRegistered: false };
      }

      // Solo considerar como "inscrito" si el status es 'registered'
      // Si está 'canceled', considerarlo como no inscrito
      return {
        isRegistered: registration.status === 'registered',
        status: registration.status,
        registrationId: registration.registration_id,
        registeredAt: new Date(registration.registered_at)
      };
    } catch (error) {
      console.error('Error checking user registration:', error);
      throw new Error('Failed to check user registration status');
    }
  }

  // Buscar inscripciones por criterios específicos
  async searchRegistrations(criteria: {
    userId?: number;
    eventId?: number;
    status?: 'registered' | 'canceled';
    eventTitle?: string;
    userName?: string;
  }): Promise<RegistrationWithDetails[]> {
    try {
      // Por ahora usamos getAllWithDetails y filtramos en memoria
      // En una implementación más avanzada, podrías crear queries específicas
      const allRegistrations = await registrationRepository.getAllWithDetails();
      
      return allRegistrations.filter(registration => {
        if (criteria.userId && registration.user_id !== criteria.userId) return false;
        if (criteria.eventId && registration.event_id !== criteria.eventId) return false;
        if (criteria.status && registration.status !== criteria.status) return false;
        if (criteria.eventTitle && !registration.event_title.toLowerCase().includes(criteria.eventTitle.toLowerCase())) return false;
        if (criteria.userName && !`${registration.user_first_name} ${registration.user_last_name}`.toLowerCase().includes(criteria.userName.toLowerCase())) return false;
        
        return true;
      });
    } catch (error) {
      console.error('Error searching registrations:', error);
      throw new Error('Failed to search registrations');
    }
  }
}

export const registrationService = new RegistrationService();
