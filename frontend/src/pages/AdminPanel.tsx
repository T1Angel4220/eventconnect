"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Calendar, 
  Users, 
  LogOut, 
  Bell, 
  Search,
  Trash2,
  Sun,
  Moon,
  UserCheck,
  Shield,
  AlertTriangle,
  RefreshCw,
  Loader2,
  BarChart3
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useSessionExpired } from '../hooks/useSessionExpired';
import SessionExpiredModal from '../components/modals/SessionExpiredModal';
import { useNotifications } from '../hooks/useNotifications';
import AdminStatsChart from '../components/charts/AdminStatsChart';
import { getEventTypeLabel } from '../types/event.types';

interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  profile_image?: string;
  created_at: string;
}

interface Event {
  event_id: number;
  title: string;
  event_date: string;
  duration: number;
  location?: string;
  event_type: string;
  capacity: number;
  organizer_first_name: string;
  organizer_last_name: string;
  organizer_email: string;
  registered_count: number;
}

interface SystemStats {
  total_users: number;
  total_events: number;
  total_registrations: number;
  users_by_role: Record<string, number>;
  events_by_type: Record<string, number>;
  registrations_by_month?: Array<{ month: string; year: number; registrations: number }>;
}

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();
  const { checkAuth, logout } = useAuth();
  const { showSessionExpiredModal, goToLogin } = useSessionExpired();
  const { showSuccess, showError } = useNotifications();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'events' | 'stats' | 'notifications'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: 'user' | 'event', id: number, name: string} | null>(null);
  const [globalNotification, setGlobalNotification] = useState('');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const role = localStorage.getItem('role');
  const firstName = localStorage.getItem('firstName');
  const profileImage = localStorage.getItem('profileImage');

  const loadData = useCallback(async (loadAll = false) => {
    // Verificar si es un logout manual antes de hacer llamadas a la API
    const isManualLogout = localStorage.getItem('manual_logout');
    if (isManualLogout === 'true') {
      return; // No hacer llamadas a la API si es logout manual
    }

    // Verificar que el usuario esté autenticado
    const token = localStorage.getItem('token');
    if (!token) {
      return; // No hacer llamadas si no hay token
    }

    setLoading(true);
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      if (loadAll) {
        // Cargar todos los datos al inicio
        const [usersResponse, eventsResponse, statsResponse] = await Promise.all([
          fetch('http://localhost:3001/api/admin/users', { headers }),
          fetch('http://localhost:3001/api/admin/events', { headers }),
          fetch('http://localhost:3001/api/admin/stats/system', { headers })
        ]);

        const [usersData, eventsData, statsData] = await Promise.all([
          usersResponse.json(),
          eventsResponse.json(),
          statsResponse.json()
        ]);

        if (usersData.success) {
          setUsers(usersData.data);
        }
        if (eventsData.success) {
          setEvents(eventsData.data);
        }
        if (statsData.success) {
          setStats({
            total_users: statsData.data.totalUsers,
            total_events: statsData.data.totalEvents,
            total_registrations: statsData.data.totalRegistrations,
            users_by_role: statsData.data.usersByRole,
            events_by_type: statsData.data.eventsByType,
            registrations_by_month: statsData.data.registrationsByMonth,
          });
        }
      } else {
        // Cargar datos según la pestaña activa
        if (activeTab === 'users') {
          const response = await fetch('http://localhost:3001/api/admin/users', { headers });
          const data = await response.json();
          if (data.success) {
            setUsers(data.data);
          }
        } else if (activeTab === 'events') {
          const response = await fetch('http://localhost:3001/api/admin/events', { headers });
          const data = await response.json();
          if (data.success) {
            setEvents(data.data);
          }
        } else if (activeTab === 'stats') {
          const response = await fetch('http://localhost:3001/api/admin/stats/system', { headers });
          const data = await response.json();
          if (data.success) {
            // Convertir camelCase a snake_case para compatibilidad
            setStats({
              total_users: data.data.totalUsers,
              total_events: data.data.totalEvents,
              total_registrations: data.data.totalRegistrations,
              users_by_role: data.data.usersByRole,
              events_by_type: data.data.eventsByType,
              registrations_by_month: data.data.registrationsByMonth,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Error cargando datos', 'No se pudieron cargar los datos del sistema');
    } finally {
      setLoading(false);
    }
  }, [activeTab, showError]);

  // Verificar que el usuario sea admin y cargar todos los datos al inicio
  useEffect(() => {
    if (!checkAuth() || role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadData(true); // Cargar todos los datos al inicio
  }, [role, navigate, checkAuth, loadData]);

  useEffect(() => {
    // Solo recargar datos específicos cuando cambia de pestaña (opcional)
    // Los datos ya se cargaron todos al inicio, pero podemos mantener esto para actualizaciones
    if (activeTab !== 'users') { // 'users' es la pestaña por defecto, ya se cargó
      loadData(false);
    }
  }, [activeTab, loadData]);

  const handleDeleteUser = (userId: number, userName: string) => {
    setItemToDelete({ type: 'user', id: userId, name: userName });
    setShowDeleteModal(true);
  };

  const handleDeleteEvent = (eventId: number, eventTitle: string) => {
    setItemToDelete({ type: 'event', id: eventId, name: eventTitle });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    // Verificar si es un logout manual
    const isManualLogout = localStorage.getItem('manual_logout');
    if (isManualLogout === 'true') {
      return;
    }

    // Verificar que el usuario esté autenticado
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const endpoint = itemToDelete.type === 'user' 
        ? `http://localhost:3001/api/admin/users/${itemToDelete.id}`
        : `http://localhost:3001/api/admin/events/${itemToDelete.id}`;

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Eliminación exitosa', data.message);
        loadData(); // Recargar datos
      } else {
        showError('Error eliminando', data.message);
      }
    } catch (error) {
      console.error('Error deleting:', error);
      showError('Error eliminando', 'No se pudo eliminar el elemento');
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  const handleRefreshUsers = () => {
    loadData(false);
  };

  const handleRefreshEvents = () => {
    loadData(false);
  };

  const sendGlobalNotification = async () => {
    if (!globalNotification.trim()) {
      showError('Error', 'El mensaje no puede estar vacío');
      return;
    }

    // Verificar si es un logout manual
    const isManualLogout = localStorage.getItem('manual_logout');
    if (isManualLogout === 'true') {
      return;
    }

    // Verificar que el usuario esté autenticado
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/admin/notifications/global', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: globalNotification })
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Notificación enviada', data.message);
        setGlobalNotification('');
        setShowNotificationModal(false);
      } else {
        showError('Error enviando notificación', data.message);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      showError('Error enviando notificación', 'No se pudo enviar la notificación');
    }
  };

  const filteredUsers = users.filter(user => 
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.organizer_first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.organizer_last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const menuItems = [
    { icon: Users, label: 'Usuarios', active: activeTab === 'users', onClick: () => setActiveTab('users') },
    { icon: Calendar, label: 'Eventos', active: activeTab === 'events', onClick: () => setActiveTab('events') },
    { icon: BarChart3, label: 'Estadísticas', active: activeTab === 'stats', onClick: () => setActiveTab('stats') },
    { icon: Bell, label: 'Notificaciones', active: activeTab === 'notifications', onClick: () => setActiveTab('notifications') },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500 text-white';
      case 'organizer': return 'bg-blue-500 text-white';
      case 'participant': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'organizer': return 'Organizador';
      case 'participant': return 'Participante';
      default: return role;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'academico': return 'bg-blue-500 text-white';
      case 'cultural': return 'bg-purple-500 text-white';
      case 'deportivo': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-white">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-black dark:text-white">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-black dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={item.onClick}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                    item.active
                      ? 'bg-red-500 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-white">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600">
              {profileImage ? (
                <img 
                  src={`http://localhost:3001${profileImage}`}
                  alt="Imagen de perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-black dark:text-white">{firstName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Administrador</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-white">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-black dark:hover:text-white"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="ml-4 text-2xl font-bold text-black dark:text-white">
                Panel de Administración
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-white rounded-xl bg-gray-50 dark:bg-white text-black dark:text-black placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-3 rounded-full bg-white dark:bg-black border-2 border-gray-200 dark:border-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                aria-label="Cambiar tema"
              >
                {isDark ? <Sun className="h-6 w-6 text-yellow-500" /> : <Moon className="h-6 w-6 text-black" />}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Tabs */}
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Usuarios ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'events'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Eventos ({events.length})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Estadísticas
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'notifications'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Notificaciones
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-red-500" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando...</span>
            </div>
          ) : (
            <>
              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-black dark:text-white">Gestión de Usuarios</h3>
                    <button
                      onClick={handleRefreshUsers}
                      className="flex items-center px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Actualizar
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Usuario</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Email</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Rol</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Fecha Registro</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user.user_id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                                  <UserCheck className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </div>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {user.first_name} {user.last_name}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                {getRoleLabel(user.role)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleDeleteUser(user.user_id, `${user.first_name} ${user.last_name}`)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Eliminar usuario"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Events Tab */}
              {activeTab === 'events' && (
                <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-black dark:text-white">Gestión de Eventos</h3>
                    <button
                      onClick={handleRefreshEvents}
                      className="flex items-center px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Actualizar
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Evento</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Organizador</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Fecha</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Tipo</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Participantes</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEvents.map((event) => (
                          <tr key={event.event_id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="py-3 px-4">
                              <div className="font-medium text-gray-900 dark:text-white">{event.title}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{event.location}</div>
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                              {event.organizer_first_name} {event.organizer_last_name}
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                              {new Date(event.event_date).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.event_type)}`}>
                                {getEventTypeLabel(event.event_type)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                              {event.registered_count}/{event.capacity}
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleDeleteEvent(event.event_id, event.title)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Eliminar evento"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Stats Tab */}
              {activeTab === 'stats' && stats && (
                <div className="space-y-6">
                  {/* Tarjetas de resumen */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-white rounded-2xl p-6 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Usuarios</h4>
                          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {stats.total_users}
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-white rounded-2xl p-6 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Eventos</h4>
                          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {stats.total_events}
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-white rounded-2xl p-6 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Inscripciones</h4>
                          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                            {stats.total_registrations}
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                          <UserCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gráficos */}
                  <AdminStatsChart data={stats} loading={loading} />
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-black dark:text-white">Notificaciones Globales</h3>
                    <button
                      onClick={() => setShowNotificationModal(true)}
                      className="flex items-center px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Enviar Notificación
                    </button>
                  </div>
                  
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Envía notificaciones a todos los usuarios del sistema</p>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                ¿Eliminar {itemToDelete?.type === 'user' ? 'usuario' : 'evento'}?
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                ¿Estás seguro de que quieres eliminar <strong>{itemToDelete?.name}</strong>? 
                Esta acción no se puede deshacer.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                <Bell className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Enviar Notificación Global
              </h3>
              
              <textarea
                value={globalNotification}
                onChange={(e) => setGlobalNotification(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                className="w-full h-32 p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={sendGlobalNotification}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 shadow-2xl transform transition-all duration-300 scale-100">
            <div className="text-center">
              {/* Icono de advertencia */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                <LogOut className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              
              {/* Título */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                ¿Cerrar Sesión?
              </h3>
              
              {/* Mensaje */}
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                ¿Estás seguro de que quieres cerrar sesión? Tendrás que volver a iniciar sesión para acceder a tu cuenta.
              </p>
              
              {/* Botones */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg"
                >
                  Sí, Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Expired Modal */}
      <SessionExpiredModal 
        isOpen={showSessionExpiredModal}
        onClose={goToLogin}
      />

      {/* Notification Component - Solo mostrar si hay notificaciones */}
    </div>
  );
};

export default AdminPanel;
