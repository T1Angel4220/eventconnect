import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      setIsAuthenticated(false);
      navigate('/login');
      return false;
    }

    setIsAuthenticated(true);
    return true;
  }, [navigate]);

  const logout = () => {
    // Marcar que es un logout manual para evitar que se dispare el modal de sesión expirada
    localStorage.setItem('manual_logout', 'true');
    
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
    
    setIsAuthenticated(false);
    navigate('/login');
    
    // Limpiar la marca después de un breve delay
    setTimeout(() => {
      localStorage.removeItem('manual_logout');
    }, 1000);
  };

  const handleTokenExpired = () => {
    // Preservar el tema antes de limpiar
    const theme = localStorage.getItem('theme');
    localStorage.clear();
    if (theme) {
      localStorage.setItem('theme', theme);
    }
    setIsAuthenticated(false);
    // El modal se manejará en cada componente individual
    navigate('/login');
  };

  useEffect(() => {
    // Verificar autenticación al montar el componente
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const firstName = localStorage.getItem('firstName');
    
    if (token && role && firstName) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []); // Solo ejecutar una vez al montar

  return {
    checkAuth,
    logout,
    handleTokenExpired,
    isAuthenticated
  };
};
