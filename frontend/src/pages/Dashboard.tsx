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
  Activity
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
            color: 'bg-gradient-to-br from-purple-500 to-purple-600',
            iconColor: 'text-purple-100'
        },
      
        {
            title: 'Participantes Totales',
            value: '5,678',
            change: '+23%',
            changeType: 'positive',
            icon: Users,
            color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
            iconColor: 'text-indigo-100'
        },
        {
            title: 'Eventos Activos',
            value: '8',
            change: '+3',
            changeType: 'positive',
            icon: Activity,
            color: 'bg-gradient-to-br from-purple-600 to-purple-700',
            iconColor: 'text-purple-100'
        },
       
        {
            title: 'Eventos Próximos',
            value: '12',
            change: '+4',
            changeType: 'positive',
            icon: Calendar,
            color: 'bg-gradient-to-br from-indigo-600 to-indigo-700',
            iconColor: 'text-indigo-100'
        }
    ];

    const recentEvents = [
        { id: 1, name: 'Conferencia de Tecnología', date: '2025-01-15', attendees: 150, status: 'Activo', capacity: 200, category: 'Tecnología', organizer: 'Juan Pérez' },
        { id: 2, name: 'Workshop de Diseño', date: '2025-01-18', attendees: 75, status: 'Activo', capacity: 100, category: 'Diseño', organizer: 'María García' },
        { id: 3, name: 'Seminario de Marketing', date: '2025-01-20', attendees: 200, status: 'Próximo', capacity: 250, category: 'Marketing', organizer: 'Carlos López' },
        { id: 4, name: 'Networking Event', date: '2025-01-22', attendees: 120, status: 'Próximo', capacity: 150, category: 'Networking', organizer: 'Ana Martínez' },
        { id: 5, name: 'Curso de Programación', date: '2025-01-25', attendees: 90, status: 'Finalizado', capacity: 120, category: 'Educación', organizer: 'Pedro Rodríguez' },
        { id: 6, name: 'Expo de Innovación', date: '2025-01-28', attendees: 300, status: 'Próximo', capacity: 400, category: 'Innovación', organizer: 'Laura Sánchez' },
    ];

    const topUsers = [
        { name: 'Ana Rodríguez', eventsAttended: 12, favoriteCategory: 'Tecnología', joinDate: 'Ene 2024', avatar: 'AR' },
        { name: 'Carlos Mendoza', eventsAttended: 10, favoriteCategory: 'Marketing', joinDate: 'Feb 2024', avatar: 'CM' },
        { name: 'Laura Silva', eventsAttended: 9, favoriteCategory: 'Diseño', joinDate: 'Mar 2024', avatar: 'LS' },
        { name: 'Diego Torres', eventsAttended: 8, favoriteCategory: 'Educación', joinDate: 'Abr 2024', avatar: 'DT' },
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
                                    {recentEvents.map((event) => (
                                        <div key={event.id} className="grid grid-cols-6 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                                            <div className="flex items-center">
                                                <div>
                                                    <h4 className="font-semibold text-black dark:text-white text-sm">{event.name}</h4>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">{event.category}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                                {event.date}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                                {event.attendees}
                                            </div>
                                            <div className="flex items-center text-sm font-semibold text-purple-600 dark:text-purple-400">
                                                {event.capacity}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                                {event.organizer}
                                            </div>
                                            <div className="flex items-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    event.status === 'Activo' 
                                                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                                                        : event.status === 'Próximo'
                                                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
                                                        : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                                                }`}>
                                                    {event.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Content */}
                        <div className="space-y-6">
                            {/* Top Users */}
                            <div className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-2xl p-6 shadow-lg">
                                <h3 className="text-xl font-bold text-black dark:text-white mb-6">Top Usuarios más inscritos</h3>
                                <div className="space-y-4">
                                    {topUsers.map((user, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                                                    <span className="text-white font-bold text-base">{user.avatar}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-black dark:text-white text-sm">{user.name}</h4>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">{user.favoriteCategory}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">{user.eventsAttended} eventos</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500">{user.joinDate}</p>
                                            </div>
                                        </div>
                                    ))}
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
                                {[
                                    { category: 'Tecnología', count: 8, percentage: 35, color: 'from-purple-500 to-purple-600' },
                                    { category: 'Marketing', count: 6, percentage: 25, color: 'from-violet-500 to-violet-600' },
                                    { category: 'Diseño', count: 4, percentage: 17, color: 'from-indigo-500 to-indigo-600' },
                                    { category: 'Educación', count: 3, percentage: 13, color: 'from-purple-600 to-purple-700' },
                                    { category: 'Networking', count: 3, percentage: 10, color: 'from-violet-600 to-violet-700' }
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                        <div className="flex items-center">
                                            <div className={`w-4 h-4 bg-gradient-to-r ${item.color} rounded-full mr-3`}></div>
                                            <span className="font-medium text-black dark:text-white">{item.category}</span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{item.count} eventos</span>
                                            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{item.percentage}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;