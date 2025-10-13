// Configuración de la API
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001/api',
  TIMEOUT: 10000, // 10 segundos
  RETRY_ATTEMPTS: 3,
};

// Headers por defecto
export const getDefaultHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Función para manejar errores de API
export const handleApiError = (error: unknown) => {
  console.error('API Error:', error);
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Verificar si es un logout manual
  const isManualLogout = localStorage.getItem('manual_logout');
  if (isManualLogout === 'true') {
    return 'Sesión cerrada';
  }

  // Verificar si es un error de token expirado específico
  if (errorMessage.includes('Token expired') || errorMessage.includes('TOKEN_EXPIRED')) {
    // Emitir evento personalizado para manejo centralizado
    window.dispatchEvent(new CustomEvent('auth-error', { 
      detail: { error: 'Sesión expirada' } 
    }));
    return 'Sesión expirada';
  }
  
  if (errorMessage.includes('401') || errorMessage.includes('INVALID_TOKEN')) {
    // Emitir evento personalizado para manejo centralizado
    window.dispatchEvent(new CustomEvent('auth-error', { 
      detail: { error: 'Token inválido' } 
    }));
    return 'Token inválido';
  }
  
  if (errorMessage.includes('403')) {
    return 'No tienes permisos para realizar esta acción.';
  }
  
  if (errorMessage.includes('404')) {
    return 'Recurso no encontrado.';
  }
  
  if (errorMessage.includes('500')) {
    return 'Error interno del servidor. Inténtalo más tarde.';
  }
  
  return errorMessage || 'Error desconocido';
};
