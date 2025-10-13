import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSessionExpired = () => {
  const navigate = useNavigate();
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);

  const handleSessionExpired = useCallback(() => {
    // Preservar el tema antes de limpiar
    const theme = localStorage.getItem('theme');
    localStorage.clear();
    if (theme) {
      localStorage.setItem('theme', theme);
    }
    
    setShowSessionExpiredModal(true);
  }, []);

  const goToLogin = useCallback(() => {
    setShowSessionExpiredModal(false);
    navigate('/login');
  }, [navigate]);

  // Escuchar errores de autenticación globalmente
  useEffect(() => {
    const handleAuthError = (event: CustomEvent) => {
      const { error } = event.detail;
      
      // Verificar si es un logout manual
      const isManualLogout = localStorage.getItem('manual_logout');
      if (isManualLogout === 'true') {
        return; // No mostrar modal si es logout manual
      }
      
      if (error?.includes('Sesión expirada') || error?.includes('Token inválido')) {
        handleSessionExpired();
      }
    };

    window.addEventListener('auth-error', handleAuthError as EventListener);
    
    return () => {
      window.removeEventListener('auth-error', handleAuthError as EventListener);
    };
  }, [handleSessionExpired]);

  return {
    showSessionExpiredModal,
    setShowSessionExpiredModal,
    handleSessionExpired,
    goToLogin
  };
};
