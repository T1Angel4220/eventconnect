import React from 'react';
import { AlertTriangle, LogIn } from 'lucide-react';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 shadow-2xl transform transition-all duration-300 scale-100">
        <div className="text-center">
          {/* Icono de advertencia */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900 mb-4">
            <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          
          {/* Título */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Sesión Expirada
          </h3>
          
          {/* Mensaje */}
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Tu sesión ha expirado por seguridad. Por favor, inicia sesión nuevamente para continuar.
          </p>
          
          {/* Botón */}
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg"
          >
            <LogIn className="w-4 h-4 mr-2 inline" />
            Volver al Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
