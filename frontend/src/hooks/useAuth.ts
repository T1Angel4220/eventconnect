import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const navigate = useNavigate();

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const firstName = localStorage.getItem('firstName');

    if (!token || !role || !firstName) {
      // Si no hay datos de autenticación, limpiar solo datos de auth pero preservar el tema
      const theme = localStorage.getItem('theme');
      localStorage.clear();
      if (theme) {
        localStorage.setItem('theme', theme);
      }
      navigate('/login');
      return false;
    }

    return true;
  }, [navigate]);

  const logout = () => {
    // Preservar el tema antes de limpiar
    const theme = localStorage.getItem('theme');
    
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('firstName');
    localStorage.removeItem('userId');
    
    // Restaurar el tema si existía
    if (theme) {
      localStorage.setItem('theme', theme);
    }
    
    navigate('/login');
  };

  const handleTokenExpired = () => {
    // Preservar el tema antes de limpiar
    const theme = localStorage.getItem('theme');
    localStorage.clear();
    if (theme) {
      localStorage.setItem('theme', theme);
    }
    alert('Tu sesión ha expirado. Serás redirigido al login.');
    navigate('/login');
  };

  useEffect(() => {
    // Verificar autenticación al montar el componente
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

  return {
    checkAuth,
    logout,
    handleTokenExpired,
    isAuthenticated: checkAuth()
  };
};
