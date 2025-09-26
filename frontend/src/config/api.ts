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
export const handleApiError = (error: any) => {
  console.error('API Error:', error);
  
  // Verificar si es un error de token expirado específico
  if (error.message?.includes('Token expired') || error.message?.includes('TOKEN_EXPIRED')) {
    // Limpiar datos de sesión
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('firstName');
    localStorage.removeItem('userId');
    
    // Mostrar mensaje y redirigir
    alert('Tu sesión ha expirado. Serás redirigido al login.');
    window.location.href = '/login';
    return 'Sesión expirada. Redirigiendo al login...';
  }
  
  if (error.message?.includes('401') || error.message?.includes('INVALID_TOKEN')) {
    // Token inválido
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('firstName');
    localStorage.removeItem('userId');
    
    alert('Token inválido. Serás redirigido al login.');
    window.location.href = '/login';
    return 'Token inválido. Redirigiendo al login...';
  }
  
  if (error.message?.includes('403')) {
    return 'No tienes permisos para realizar esta acción.';
  }
  
  if (error.message?.includes('404')) {
    return 'Recurso no encontrado.';
  }
  
  if (error.message?.includes('500')) {
    return 'Error interno del servidor. Inténtalo más tarde.';
  }
  
  return error.message || 'Error desconocido';
};
