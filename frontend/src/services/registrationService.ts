// Servicio para manejar inscripciones/registrations desde el frontend
export interface RegistrationResponse {
  registration_id: number;
  user_id: number;
  event_id: number;
  registered_at: string;
  status: 'registered' | 'canceled';
}

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
  event_type: 'academico' | 'cultural' | 'deportivo';
  event_capacity: number;
  organizer_id: number;
  organizer_name: string;
}

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

export interface CreateRegistrationPayload {
  event_id: number;
}

export interface UpdateRegistrationStatusPayload {
  status: 'registered' | 'canceled';
}

export interface EventCapacityInfo {
  current: number;
  capacity: number;
  available: number;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  } as HeadersInit;
}

// Crear nueva inscripción
export async function createRegistration(payload: CreateRegistrationPayload): Promise<RegistrationResponse> {
  const res = await fetch(`${API_URL}/registrations`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Error creando inscripción");
  }
  
  const result = await res.json();
  return result.data;
}

// Obtener inscripciones del usuario autenticado
export async function getUserRegistrations(): Promise<RegistrationWithDetails[]> {
  const res = await fetch(`${API_URL}/registrations/my`, {
    headers: authHeaders(),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Error obteniendo inscripciones del usuario");
  }
  
  const result = await res.json();
  return result.data;
}

// Obtener todas las inscripciones (admin/organizer)
export async function getAllRegistrations(): Promise<RegistrationWithDetails[]> {
  const res = await fetch(`${API_URL}/registrations/all`, {
    headers: authHeaders(),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Error obteniendo todas las inscripciones");
  }
  
  const result = await res.json();
  return result.data;
}

// Obtener inscripciones de un evento específico
export async function getEventRegistrations(eventId: number): Promise<RegistrationWithDetails[]> {
  const res = await fetch(`${API_URL}/registrations/event/${eventId}`, {
    headers: authHeaders(),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Error obteniendo inscripciones del evento");
  }
  
  const result = await res.json();
  return result.data;
}

// Obtener información de capacidad de un evento
export async function getEventCapacity(eventId: number): Promise<EventCapacityInfo> {
  const res = await fetch(`${API_URL}/registrations/event/${eventId}/capacity`, {
    headers: authHeaders(),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Error obteniendo información de capacidad");
  }
  
  const result = await res.json();
  return result.data;
}

// Obtener inscripción por ID
export async function getRegistrationById(registrationId: number): Promise<RegistrationResponse> {
  const res = await fetch(`${API_URL}/registrations/${registrationId}`, {
    headers: authHeaders(),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Error obteniendo inscripción");
  }
  
  const result = await res.json();
  return result.data;
}

// En eventos universitarios, los participantes se auto-inscriben
// No hay necesidad de funciones de aprobación/rechazo
// Las inscripciones se confirman automáticamente

// Eliminar inscripción (solo admin)
export async function deleteRegistration(registrationId: number): Promise<void> {
  const res = await fetch(`${API_URL}/registrations/${registrationId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Error eliminando inscripción");
  }
}

// Obtener estadísticas de inscripciones
export async function getRegistrationStats(): Promise<RegistrationStats> {
  const res = await fetch(`${API_URL}/registrations/stats`, {
    headers: authHeaders(),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Error obteniendo estadísticas");
  }
  
  const result = await res.json();
  return result.data;
}

// Buscar inscripciones
export async function searchRegistrations(criteria: {
  userId?: number;
  eventId?: number;
  status?: 'registered' | 'canceled';
  eventTitle?: string;
  userName?: string;
}): Promise<RegistrationWithDetails[]> {
  const queryParams = new URLSearchParams();
  
  if (criteria.userId) queryParams.append('userId', criteria.userId.toString());
  if (criteria.eventId) queryParams.append('eventId', criteria.eventId.toString());
  if (criteria.status) queryParams.append('status', criteria.status);
  if (criteria.eventTitle) queryParams.append('eventTitle', criteria.eventTitle);
  if (criteria.userName) queryParams.append('userName', criteria.userName);
  
  const res = await fetch(`${API_URL}/registrations/search?${queryParams.toString()}`, {
    headers: authHeaders(),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Error buscando inscripciones");
  }
  
  const result = await res.json();
  return result.data;
}

// Función auxiliar para mapear estados de inscripción a español
export function mapRegistrationStatusToSpanish(status: 'registered' | 'canceled'): string {
  switch (status) {
    case 'registered':
      return 'Registrado';
    case 'canceled':
      return 'Cancelado';
    default:
      return 'Desconocido';
  }
}

// Función auxiliar para mapear tipos de evento a español
export function mapEventTypeToSpanish(eventType: 'academico' | 'cultural' | 'deportivo'): string {
  switch (eventType) {
    case 'academico':
      return 'Académico';
    case 'cultural':
      return 'Cultural';
    case 'deportivo':
      return 'Deportivo';
    default:
      return 'Desconocido';
  }
}

// Función auxiliar para formatear fechas
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

// Función auxiliar para formatear fechas y horas
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}
