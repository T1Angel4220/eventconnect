import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSessionExpired = () => {
  const navigate = useNavigate();
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);

  const handleSessionExpired = useCallback(() => {
    setShowSessionExpiredModal(true);
  }, []);

  const goToLogin = useCallback(() => {
    setShowSessionExpiredModal(false);
    navigate('/login');
  }, [navigate]);

  return {
    showSessionExpiredModal,
    setShowSessionExpiredModal,
    handleSessionExpired,
    goToLogin
  };
};
