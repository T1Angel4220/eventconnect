import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Eye, Trash2, RefreshCw } from 'lucide-react';
import { Notification } from '../../types/dashboard.types';
import notificationService from '../../services/notificationService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface NotificationsPanelProps {
  userId: number;
  onUnreadCountChange?: (count: number) => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ userId, onUnreadCountChange }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const [notificationsData, unreadCountData] = await Promise.all([
        notificationService.getUserNotifications(userId),
        notificationService.getUnreadNotificationCount(userId)
      ]);
      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
      onUnreadCountChange?.(unreadCountData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando notificaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification.notification_id === notificationId
            ? { ...notification, status: 'read' }
            : notification
        )
      );
      const newUnreadCount = Math.max(0, unreadCount - 1);
      setUnreadCount(newUnreadCount);
      onUnreadCountChange?.(newUnreadCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error marcando como leída');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllNotificationsAsRead(userId);
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, status: 'read' as const }))
      );
      setUnreadCount(0);
      onUnreadCountChange?.(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error marcando todas como leídas');
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => 
        prev.filter(notification => notification.notification_id !== notificationId)
      );
      // Recalcular unread count
      const notification = notifications.find(n => n.notification_id === notificationId);
      if (notification && notification.status !== 'read') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando notificación');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando notificaciones...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl">
      <div className="p-6 border-b border-gray-200 dark:border-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="w-6 h-6 text-purple-600 mr-3" />
            <h2 className="text-xl font-semibold text-black dark:text-white">
              Notificaciones
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h2>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={fetchNotifications}
              className="p-2 text-gray-400 hover:text-black dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Actualizar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-3 py-1 text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md"
                title="Marcar todas como leídas"
              >
                <Check className="w-4 h-4 inline mr-1" />
                Marcar todas como leídas
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400">
            <div className="flex">
              <X className="w-5 h-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p>No tienes notificaciones</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-white">
            {notifications.map((notification) => (
              <div
                key={notification.notification_id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  notification.status !== 'read' ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-400' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${
                      notification.status !== 'read' ? 'font-medium text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(notification.sent_at)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {notification.status !== 'read' && (
                      <button
                        onClick={() => handleMarkAsRead(notification.notification_id)}
                        className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded"
                        title="Marcar como leída"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification.notification_id)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                      title="Eliminar notificación"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};