"use client"

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  Plus,
  BarChart3,
  UserCheck,
  Calendar as CalendarIcon,
  Sun,
  Moon,
  Download,
  Filter,
  Activity,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useDashboard } from '../hooks/useDashboard';
import { getEventTypeLabel } from '../types/event.types';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { toggleTheme, isDark } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const role = localStorage.getItem('role');
    const firstName = localStorage.getItem('firstName');
    
    // Hook para datos del dashboard
    const {
        stats,
        recentEvents,
        topUsers,
        eventCategories,
        loading,
        error,
        refreshData
    } = useDashboard();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('firstName');
        navigate('/login');
    };

    const handleNavigateToEvents = () => {
        navigate('/events-management');
    };

    const handleNavigateToRegistrations = () => {
        navigate('/registrations-management');
    };

    const menuItems = [
        { icon: Home, label: 'Dashboard', active: true, onClick: () => {} },
        { icon: Calendar, label: 'Eventos', active: false, onClick: handleNavigateToEvents },
        { icon: Users, label: 'Inscripciones', active: false, onClick: handleNavigateToRegistrations },
        { icon: BarChart3, label: 'Estadísticas', active: false, onClick: () => {} },
        { icon: Settings, label: 'Configuración', active: false, onClick: () => {} },
    ];

    // Generar tarjetas de estadísticas dinámicamente
    const statsCards = stats ? [
        {
            title: 'Total Eventos',
            value: stats.total_events.toString(),
            change: '+12%',
            changeType: 'positive',
            icon: CalendarIcon,
            color: 'bg-gradient-to-br from-purple-500 to-purple-600',
            iconColor: 'text-purple-100'
        },
        {
            title: 'Participantes Totales',
            value: stats.total_participants.toLocaleString(),
            change: '+23%',
            changeType: 'positive',
            icon: Users,
            color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
            iconColor: 'text-indigo-100'
        },
        {
            title: 'Eventos Activos',
            value: stats.active_events.toString(),
            change: '+3',
            changeType: 'positive',
            icon: Activity,
            color: 'bg-gradient-to-br from-purple-600 to-purple-700',
            iconColor: 'text-purple-100'
        },
        {
            title: 'Eventos Próximos',
            value: stats.upcoming_events.toString(),
            change: '+4',
            changeType: 'positive',
            icon: Calendar,
            color: 'bg-gradient-to-br from-indigo-600 to-indigo-700',
            iconColor: 'text-indigo-100'
        }
    ] : [];

    // Función para determinar el estado del evento
    const getEventStatus = (eventDate: string) => {
        const now = new Date();
        const event = new Date(eventDate);
        const diffTime = event.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'Finalizado';
        if (diffDays === 0) return 'Activo';
        return 'Próximo';
    };

    // Función para formatear fecha
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // Función para generar avatar
    const generateAvatar = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };


    // Componente de loading
    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
                    <p className="text-gray-600 dark:text-gray-400">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    // Componente de error
    if (error) {
        return (
            <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error al cargar el dashboard</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={refreshData}
                        className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mx-auto"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-white">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white dark:text-black" />
                        </div>
                        <span className="ml-3 text-xl font-bold text-black dark:text-white">EventConnect</span>
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
                                            ? 'bg-black dark:bg-white text-white dark:text-black'
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
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <UserCheck className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-semibold text-black dark:text-white">{firstName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{role}</p>
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
                            <h1 className="ml-4 text-2xl font-bold text-black dark:text-white">Dashboard</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Search */}
                            <div className="relative hidden md:block">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Buscar eventos..."
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-white rounded-xl bg-gray-50 dark:bg-white text-black dark:text-black placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                                />
                            </div>

                            {/* Refresh Button */}
                            <button
                                onClick={refreshData}
                                className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                                title="Actualizar datos"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>

                            {/* Notifications */}
                            <button className="p-2 text-gray-400 hover:text-black dark:hover:text-white relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>

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
                    {/* Quick Actions Toolbar */}
                    <div className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-2xl p-4 shadow-lg mb-8">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-semibold text-black dark:text-white">Acciones Rápidas</h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <button className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span className="font-medium">Crear Evento</span>
                                </button>
                                <button className="flex items-center px-4 py-2 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-xl hover:from-violet-600 hover:to-violet-700 transition-all duration-200 shadow-lg">
                                    <Users className="w-4 h-4 mr-2" />
                                    <span className="font-medium">Invitar Usuarios</span>
                                </button>
                                <button className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-lg">
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    <span className="font-medium">Ver Reportes</span>
                                </button>
                                <button className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg">
                                    <Download className="w-4 h-4 mr-2" />
                                    <span className="font-medium">Exportar Datos</span>
                                </button>
                                <button className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200">
                                    <Settings className="w-4 h-4 mr-2" />
                                    <span className="font-medium">Configuración</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-black dark:text-white mb-2">
                            ¡Bienvenido de vuelta, {firstName}!
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Aquí tienes un resumen de tu actividad reciente en EventConnect.
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {statsCards.map((stat, index) => (
                            <div key={index} className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                                        <p className="text-2xl font-bold text-black dark:text-white mb-1">{stat.value}</p>
                                        <p className={`text-xs font-medium ${
                                            stat.changeType === 'positive' 
                                                ? 'text-green-600 dark:text-green-400' 
                                                : 'text-red-600 dark:text-red-400'
                                        }`}>
                                            {stat.change} desde el mes pasado
                                        </p>
                                    </div>
                                    <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center shadow-lg`}>
                                        <stat.icon className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Recent Events */}
                        <div className="lg:col-span-3">
                            <div className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-2xl p-6 shadow-lg">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-black dark:text-white">Gestión de Eventos</h3>
                                    <div className="flex space-x-3">
                                        <button className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Nuevo Evento
                                        </button>
                                        <button className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200">
                                            <Download className="w-4 h-4 mr-2" />
                                            Exportar
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Table Header */}
                                <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                    <div>Evento</div>
                                    <div>Fecha</div>
                                    <div>Participantes</div>
                                    <div>Capacidad</div>
                                    <div>Organizador</div>
                                    <div>Estado</div>
                                </div>
                                
                                <div className="space-y-3">
                                    {recentEvents.length > 0 ? recentEvents.map((event) => {
                                        const status = getEventStatus(event.event_date);
                                        return (
                                            <div key={event.event_id} className="grid grid-cols-6 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                                                <div className="flex items-center">
                                                    <div>
                                                        <h4 className="font-semibold text-black dark:text-white text-sm">{event.title}</h4>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">{getEventTypeLabel(event.event_type)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                                    {formatDate(event.event_date)}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                                    {event.registered_count}
                                                </div>
                                                <div className="flex items-center text-sm font-semibold text-purple-600 dark:text-purple-400">
                                                    {event.capacity}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                                    {event.organizer_name}
                                                </div>
                                                <div className="flex items-center">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        status === 'Activo' 
                                                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                                                            : status === 'Próximo'
                                                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
                                                            : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                                                    }`}>
                                                        {status}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>No hay eventos disponibles</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Content */}
                        <div className="space-y-6">
                            {/* Top Users */}
                            <div className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-2xl p-6 shadow-lg">
                                <h3 className="text-xl font-bold text-black dark:text-white mb-6">Top Usuarios más inscritos</h3>
                                <div className="space-y-4">
                                    {topUsers.length > 0 ? topUsers.map((user, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                                                    <span className="text-white font-bold text-base">{generateAvatar(user.user_name)}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-black dark:text-white text-sm">{user.user_name}</h4>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">{user.favorite_category}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">{user.events_attended} eventos</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500">{user.join_date}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>No hay usuarios disponibles</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Additional Management Sections */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        {/* Participants Chart Placeholder */}
                        <div className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-2xl p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-black dark:text-white">Participantes por Mes</h3>
                                <button className="flex items-center px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-sm hover:from-purple-600 hover:to-purple-700 transition-all duration-200">
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Ver Detalles
                                </button>
                            </div>
                            <div className="h-64 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl flex items-center justify-center">
                                <div className="text-center">
                                    <BarChart3 className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                                    <p className="text-gray-600 dark:text-gray-400 font-medium">Gráfico de Participantes</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-500">2,450 participantes este mes</p>
                                </div>
                            </div>
                        </div>

                        {/* Event Categories */}
                        <div className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-2xl p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-black dark:text-white">Categorías de Eventos</h3>
                                <button className="flex items-center px-3 py-1 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-lg text-sm hover:from-violet-600 hover:to-violet-700 transition-all duration-200">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filtrar
                                </button>
                            </div>
                            <div className="space-y-4">
                                {eventCategories.length > 0 ? eventCategories.map((item, index) => {
                                    const colors = [
                                        'from-purple-500 to-purple-600',
                                        'from-violet-500 to-violet-600',
                                        'from-indigo-500 to-indigo-600',
                                        'from-purple-600 to-purple-700',
                                        'from-violet-600 to-violet-700'
                                    ];
                                    const color = colors[index % colors.length];
                                    
                                    return (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                            <div className="flex items-center">
                                                <div className={`w-4 h-4 bg-gradient-to-r ${color} rounded-full mr-3`}></div>
                                                <span className="font-medium text-black dark:text-white">{item.category}</span>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">{item.count} eventos</span>
                                                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{item.percentage}%</span>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No hay categorías disponibles</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;