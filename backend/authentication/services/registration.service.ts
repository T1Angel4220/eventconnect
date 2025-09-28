import { registrationRepository } from "authentication/repositories/registration.repository";
import { 
  RegistrationData, 
  RegistrationRow, 
  RegistrationWithDetails, 
  RegistrationStats,
  CreateRegistrationPayload,
  UpdateRegistrationStatusPayload 
} from "authentication/models/registration.interface";

export class RegistrationService {
  
  // Crear una nueva inscripción
  async createRegistration(registrationData: CreateRegistrationPayload, userId: number): Promise<RegistrationRow> {
    try {
      // Verificar si el usuario ya está inscrito en el evento
      const existingRegistration = await registrationRepository.findByUserAndEvent(userId, registrationData.event_id);
      if (existingRegistration) {
        throw new Error('El usuario ya está inscrito en este evento');
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

      return await registrationRepository.create(registration);
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

  // Actualizar estado de inscripción
  async updateRegistrationStatus(registrationId: number, statusData: UpdateRegistrationStatusPayload): Promise<RegistrationRow | null> {
    try {
      return await registrationRepository.updateStatus(registrationId, statusData);
    } catch (error) {
      console.error('Error updating registration status:', error);
      throw new Error('Failed to update registration status');
    }
  }

  // Cancelar inscripción
  async cancelRegistration(registrationId: number): Promise<RegistrationRow | null> {
    try {
      const statusData: UpdateRegistrationStatusPayload = { status: 'canceled' };
      return await registrationRepository.updateStatus(registrationId, statusData);
    } catch (error) {
      console.error('Error canceling registration:', error);
      throw new Error('Failed to cancel registration');
    }
  }

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
      if (existingRegistration) {
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
