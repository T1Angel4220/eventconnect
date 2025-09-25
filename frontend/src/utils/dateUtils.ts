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
 * Determina si un evento está activo, próximo o pasado
 */
export const getEventStatus = (eventDate: string): 'active' | 'upcoming' | 'past' => {
  const now = new Date();
  const eventDateTime = new Date(eventDate);
  const diffInHours = (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 0) {
    return 'past';
  } else if (diffInHours <= 24) {
    return 'active';
  } else {
    return 'upcoming';
  }
};

/**
 * Obtiene el texto del estado del evento
 */
export const getEventStatusText = (eventDate: string): string => {
  const status = getEventStatus(eventDate);
  switch (status) {
    case 'active':
      return 'Activo';
    case 'upcoming':
      return 'Próximo';
    case 'past':
      return 'Finalizado';
    default:
      return 'Desconocido';
  }
};

/**
 * Obtiene el color del estado del evento
 */
export const getEventStatusColor = (eventDate: string): string => {
  const status = getEventStatus(eventDate);
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'upcoming':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'past':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
