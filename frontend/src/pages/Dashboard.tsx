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
  TrendingUp,
  UserCheck,
  Calendar as CalendarIcon,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { toggleTheme, isDark } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const role = localStorage.getItem('role');
    const firstName = localStorage.getItem('firstName');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('firstName');
        navigate('/login');
    };

    const menuItems = [
        { icon: Home, label: 'Dashboard', active: true },
        { icon: Calendar, label: 'Eventos', active: false },
        { icon: Users, label: 'Usuarios', active: false },
        { icon: BarChart3, label: 'Estadísticas', active: false },
        { icon: Settings, label: 'Configuración', active: false },
    ];

    const statsCards = [
        {
            title: 'Total Eventos',
            value: '24',
            change: '+12%',
            changeType: 'positive',
            icon: CalendarIcon,
            color: 'bg-black dark:bg-white'
        },
        {
            title: 'Mis Eventos',
            value: '1,234',
            change: '+8%',
            changeType: 'positive',
            icon: UserCheck,
            color: 'bg-black dark:bg-white'
        },
        {
            title: 'Inscripciones',
            value: '2 pendientes',
            change: '',
            changeType: 'positive',
            icon: TrendingUp,
            color: 'bg-black dark:bg-white'
        },
        {
            title: 'Participantes',
            value: '5,678',
            change: '+23%',
            changeType: 'positive',
            icon: Users,
            color: 'bg-black dark:bg-white'
        }
    ];

    const recentEvents = [
        { id: 1, name: 'Conferencia de Tecnología', date: '2025-01-15', attendees: 150, status: 'Activo' },
        { id: 2, name: 'Workshop de Diseño', date: '2025-01-18', attendees: 75, status: 'Activo' },
        { id: 3, name: 'Seminario de Marketing', date: '2025-01-20', attendees: 200, status: 'Próximo' },
        { id: 4, name: 'Networking Event', date: '2025-01-22', attendees: 120, status: 'Próximo' },
    ];

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

                            {/* Notifications */}
                            <button className="p-2 text-gray-400 hover:text-black dark:hover:text-white relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 text-gray-400 hover:text-black dark:hover:text-white"
                                aria-label="Cambiar tema"
                            >
                                {isDark ? (
                                    <Sun className="h-5 w-5" />
                                ) : (
                                    <Moon className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-6">
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
                            <div key={index} className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                                        <p className="text-3xl font-bold text-black dark:text-white mt-2">{stat.value}</p>
                                        <p className={`text-sm font-medium mt-1 ${
                                            stat.changeType === 'positive' 
                                                ? 'text-green-600 dark:text-green-400' 
                                                : 'text-red-600 dark:text-red-400'
                                        }`}>
                                            {stat.change} desde el mes pasado
                                        </p>
                                    </div>
                                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                                        <stat.icon className="w-6 h-6 text-white dark:text-black" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Recent Events */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-2xl p-6 shadow-lg">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-black dark:text-white">Eventos Recientes</h3>
                                    <button className="flex items-center px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-200">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Nuevo Evento
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {recentEvents.map((event) => (
                                        <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center mr-4">
                                                    <Calendar className="w-6 h-6 text-white dark:text-black" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-black dark:text-white">{event.name}</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{event.date} • {event.attendees} participantes</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                event.status === 'Activo' 
                                                    ? 'bg-black dark:bg-white text-white dark:text-black'
                                                    : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
                                            }`}>
                                                {event.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <div className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-2xl p-6 shadow-lg">
                                <h3 className="text-xl font-bold text-black dark:text-white mb-6">Acciones Rápidas</h3>
                                <div className="space-y-4">
                                    <button className="w-full flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                                        <Calendar className="w-5 h-5 mr-3 text-black dark:text-white" />
                                        <span className="text-black dark:text-white font-medium">Crear Evento</span>
                                    </button>
                                    <button className="w-full flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                                        <Users className="w-5 h-5 mr-3 text-black dark:text-white" />
                                        <span className="text-black dark:text-white font-medium">Invitar Usuarios</span>
                                    </button>
                                    <button className="w-full flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                                        <BarChart3 className="w-5 h-5 mr-3 text-black dark:text-white" />
                                        <span className="text-black dark:text-white font-medium">Ver Reportes</span>
                                    </button>
                                    <button className="w-full flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                                        <Settings className="w-5 h-5 mr-3 text-black dark:text-white" />
                                        <span className="text-black dark:text-white font-medium">Configuración</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
