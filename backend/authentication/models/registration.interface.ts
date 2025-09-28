// Interfaces para el manejo de inscripciones/registrations
export interface RegistrationData {
  user_id: number;
  event_id: number;
  status?: 'registered' | 'canceled';
}

export interface RegistrationRow {
  registration_id: number;
  user_id: number;
  event_id: number;
  registered_at: string;
  status: 'registered' | 'canceled';
}

// Interface para mostrar registrations con información del usuario y evento
export interface RegistrationWithDetails {
  registration_id: number;
  user_id: number;
  event_id: number;
  registered_at: string;
  status: 'registered' | 'canceled';
  // Información del usuario
  user_first_name: string;
  user_last_name: string;
  user_email: string;
  user_role: string;
  // Información del evento
  event_title: string;
  event_date: string;
  event_location: string | null;
  event_type: 'academic' | 'cultural' | 'sports';
  event_capacity: number;
  organizer_id: number;
  organizer_name: string;
}

// Interface para estadísticas de registrations
export interface RegistrationStats {
  total_registrations: number;
  active_registrations: number;
  canceled_registrations: number;
  registrations_by_event: Array<{
    event_id: number;
    event_title: string;
    registration_count: number;
  }>;
  registrations_by_user: Array<{
    user_id: number;
    user_name: string;
    registration_count: number;
  }>;
}

// Interface para crear una nueva inscripción
export interface CreateRegistrationPayload {
  event_id: number;
  user_id?: number; // Opcional si viene del token de autenticación
}

// Interface para actualizar el estado de una inscripción
export interface UpdateRegistrationStatusPayload {
  status: 'registered' | 'canceled';
}