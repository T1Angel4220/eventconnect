/**
 * Utilidades para formatear fechas y horas
 */

/**
 * Formatea una fecha ISO string a formato DD/MM/YYYY
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formatea una fecha ISO string a formato HH:MM
 */
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

/**
 * Formatea una fecha ISO string a formato DD/MM/YYYY HH:MM
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

/**
 * Formatea la duración en minutos a formato legible
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  } else if (minutes < 1440) { // Less than 24 hours
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  } else {
    const days = Math.floor(minutes / 1440);
    const remainingHours = Math.floor((minutes % 1440) / 60);
    if (remainingHours === 0) {
      return `${days} día${days > 1 ? 's' : ''}`;
    }
    return `${days} día${days > 1 ? 's' : ''} ${remainingHours}h`;
  }
};

/**
 * Determina si un evento está activo, próximo o pasado basado en fecha y duración
 */
export const getEventStatus = (eventDate: string, durationMinutes: number = 60): 'upcoming' | 'in_progress' | 'completed' => {
  const now = new Date();
  const eventDateTime = new Date(eventDate);
  const eventEndTime = new Date(eventDateTime.getTime() + durationMinutes * 60 * 1000);

  if (now < eventDateTime) {
    return 'upcoming';
  } else if (now >= eventDateTime && now <= eventEndTime) {
    return 'in_progress';
  } else {
    return 'completed';
  }
};

/**
 * Obtiene el texto del estado del evento
 */
export const getEventStatusText = (eventDate: string, durationMinutes: number = 60): string => {
  const status = getEventStatus(eventDate, durationMinutes);
  switch (status) {
    case 'upcoming':
      return 'Próximo';
    case 'in_progress':
      return 'En Progreso';
    case 'completed':
      return 'Finalizado';
    default:
      return 'Desconocido';
  }
};

/**
 * Obtiene el color del estado del evento
 */
export const getEventStatusColor = (eventDate: string, durationMinutes: number = 60): string => {
  const status = getEventStatus(eventDate, durationMinutes);
  switch (status) {
    case 'upcoming':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'in_progress':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'completed':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
