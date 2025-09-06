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
  Edit,
  Trash2,
  Eye,
  Sun,
  Moon,
  Download,
  Filter,
  UserCheck,
  Clock,
  MapPin,
  Tag
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const EventsManagement: React.FC = () => {
    const navigate = useNavigate();
    const { toggleTheme, isDark } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [newEvent, setNewEvent] = useState({
        name: '',
        date: '',
        time: '',
        location: '',
        capacity: '',
        category: '',
        description: ''
    });
    const role = localStorage.getItem('role');
    const firstName = localStorage.getItem('firstName');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('firstName');
        navigate('/login');
    };

    const handleCreateEvent = () => {
        // Aquí se implementaría la lógica para crear un evento
        console.log('Crear evento:', newEvent);
        setShowCreateModal(false);
        setNewEvent({
            name: '',
            date: '',
            time: '',
            location: '',
            capacity: '',
            category: '',
            description: ''
        });
    };

    const handleEditEvent = (event) => {
        setEditingEvent(event);
        setNewEvent({
            name: event.name,
            date: event.date,
            time: event.time,
            location: event.location,
            capacity: event.capacity.toString(),
            category: event.category,
            description: event.description
        });
        setShowCreateModal(true);
    };

    const handleDeleteEvent = (eventId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
            // Aquí se implementaría la lógica para eliminar un evento
            console.log('Eliminar evento:', eventId);
        }
    };

    const handleViewDetails = (event) => {
        setSelectedEvent(event);
        setShowDetailsModal(true);
    };

    const menuItems = [
        { icon: Home, label: 'Dashboard', active: false, path: '/dashboard' },
        { icon: Calendar, label: 'Eventos', active: true, path: '/events-management' },
        { icon: Users, label: 'Inscripciones', active: false, path: '/registrations-management' },
        { icon: Settings, label: 'Configuración', active: false, path: '/settings' },
    ];

    const events = [
        { 
            id: 1, 
            name: 'Conferencia de Tecnología', 
            date: '2025-01-15', 
            time: '09:00',
            location: 'Centro de Convenciones',
            attendees: 150, 
            capacity: 200,
            status: 'Activo', 
            category: 'Tecnología', 
            organizer: 'Juan Pérez',
            description: 'Una conferencia sobre las últimas tendencias en tecnología y desarrollo de software.',
            createdAt: '2025-01-10'
        },
        { 
            id: 2, 
            name: 'Workshop de Diseño', 
            date: '2025-01-18', 
            time: '14:00',
            location: 'Sala de Talleres',
            attendees: 75, 
            capacity: 100,
            status: 'Activo', 
            category: 'Diseño', 
            organizer: 'María García',
            description: 'Taller práctico de diseño UX/UI con herramientas modernas.',
            createdAt: '2025-01-12'
        },
        { 
            id: 3, 
            name: 'Seminario de Marketing', 
            date: '2025-01-20', 
            time: '10:00',
            location: 'Auditorio Principal',
            attendees: 200, 
            capacity: 250,
            status: 'Próximo', 
            category: 'Marketing', 
            organizer: 'Carlos López',
            description: 'Estrategias de marketing digital para empresas modernas.',
            createdAt: '2025-01-14'
        },
        { 
            id: 4, 
            name: 'Networking Event', 
            date: '2025-01-22', 
            time: '18:00',
            location: 'Hotel Downtown',
            attendees: 120, 
            capacity: 150,
            status: 'Próximo', 
            category: 'Networking', 
            organizer: 'Ana Martínez',
            description: 'Evento de networking para profesionales del sector tecnológico.',
            createdAt: '2025-01-16'
        },
        { 
            id: 5, 
            name: 'Curso de Programación', 
            date: '2025-01-25', 
            time: '16:00',
            location: 'Laboratorio de Computación',
            attendees: 90, 
            capacity: 120,
            status: 'Finalizado', 
            category: 'Educación', 
            organizer: 'Pedro Rodríguez',
            description: 'Curso intensivo de programación en JavaScript y React.',
            createdAt: '2025-01-18'
        },
        { 
            id: 6, 
            name: 'Expo de Innovación', 
            date: '2025-01-28', 
            time: '11:00',
            location: 'Centro de Exposiciones',
            attendees: 300, 
            capacity: 400,
            status: 'Próximo', 
            category: 'Innovación', 
            organizer: 'Laura Sánchez',
            description: 'Exposición de proyectos innovadores y startups tecnológicas.',
            createdAt: '2025-01-20'
        },
    ];

    const categories = ['Tecnología', 'Diseño', 'Marketing', 'Networking', 'Educación', 'Innovación'];

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            event.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            event.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Activo':
                return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
            case 'Próximo':
                return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
            case 'Finalizado':
                return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
            default:
                return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
        }
    };

    const getCategoryColor = (category: string) => {
        const colors = {
            'Tecnología': 'from-purple-500 to-purple-600',
            'Diseño': 'from-violet-500 to-violet-600',
            'Marketing': 'from-indigo-500 to-indigo-600',
            'Networking': 'from-purple-600 to-purple-700',
            'Educación': 'from-violet-600 to-violet-700',
            'Innovación': 'from-indigo-600 to-indigo-700'
        };
        return colors[category] || 'from-gray-500 to-gray-600';
    };

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
                                    onClick={() => navigate(item.path)}
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
                            <h1 className="ml-4 text-2xl font-bold text-black dark:text-white">Gestión de Eventos</h1>
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
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
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
                                <button 
                                    onClick={() => setShowCreateModal(true)}
                                    className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    <span className="font-medium">Crear Evento</span>
                                </button>
                                <button className="flex items-center px-4 py-2 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-xl hover:from-violet-600 hover:to-violet-700 transition-all duration-200 shadow-lg">
                                    <Download className="w-4 h-4 mr-2" />
                                    <span className="font-medium">Exportar</span>
                                </button>
                                <div className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
                                    <Filter className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="bg-transparent text-gray-700 dark:text-gray-300 text-sm focus:outline-none"
                                    >
                                        <option value="all">Todas las categorías</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Events Table */}
                    <div className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-black dark:text-white">Lista de Eventos</h3>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {filteredEvents.length} de {events.length} eventos
                            </div>
                        </div>

                        {/* Table Header */}
                        <div className="grid grid-cols-8 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                            <div>Evento</div>
                            <div>Fecha</div>
                            <div>Hora</div>
                            <div>Ubicación</div>
                            <div>Participantes</div>
                            <div>Categoría</div>
                            <div>Estado</div>
                            <div>Acciones</div>
                        </div>

                        <div className="space-y-3">
                            {filteredEvents.map((event) => (
                                <div key={event.id} className="grid grid-cols-8 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                                    <div className="flex items-center">
                                        <div>
                                            <h4 className="font-semibold text-black dark:text-white text-sm">{event.name}</h4>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">{event.organizer}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                        {event.date}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                        {event.time}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        {event.location}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                        {event.attendees}/{event.capacity}
                                    </div>
                                    <div className="flex items-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(event.category)} text-white`}>
                                            {event.category}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                                            {event.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button 
                                            onClick={() => handleViewDetails(event)}
                                            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleEditEvent(event)}
                                            className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteEvent(event.id)}
                                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredEvents.length === 0 && (
                            <div className="text-center py-12">
                                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-gray-400 font-medium">No se encontraron eventos</p>
                                <p className="text-sm text-gray-500 dark:text-gray-500">Intenta ajustar los filtros de búsqueda</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Modal para crear/editar evento */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-2xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-xl font-bold text-black dark:text-white mb-6">
                            {editingEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nombre del Evento
                                </label>
                                <input
                                    type="text"
                                    value={newEvent.name}
                                    onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-white rounded-xl bg-gray-50 dark:bg-white text-black dark:text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Ingresa el nombre del evento"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Fecha
                                    </label>
                                    <input
                                        type="date"
                                        value={newEvent.date}
                                        onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-white rounded-xl bg-gray-50 dark:bg-white text-black dark:text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Hora
                                    </label>
                                    <input
                                        type="time"
                                        value={newEvent.time}
                                        onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-white rounded-xl bg-gray-50 dark:bg-white text-black dark:text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Ubicación
                                </label>
                                <input
                                    type="text"
                                    value={newEvent.location}
                                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-white rounded-xl bg-gray-50 dark:bg-white text-black dark:text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Ingresa la ubicación"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Capacidad
                                    </label>
                                    <input
                                        type="number"
                                        value={newEvent.capacity}
                                        onChange={(e) => setNewEvent({...newEvent, capacity: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-white rounded-xl bg-gray-50 dark:bg-white text-black dark:text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Categoría
                                    </label>
                                    <select
                                        value={newEvent.category}
                                        onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-white rounded-xl bg-gray-50 dark:bg-white text-black dark:text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">Selecciona una categoría</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-white rounded-xl bg-gray-50 dark:bg-white text-black dark:text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Describe el evento..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setEditingEvent(null);
                                    setNewEvent({
                                        name: '',
                                        date: '',
                                        time: '',
                                        location: '',
                                        capacity: '',
                                        category: '',
                                        description: ''
                                    });
                                }}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateEvent}
                                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
                            >
                                {editingEvent ? 'Actualizar' : 'Crear'} Evento
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para ver detalles del evento */}
            {showDetailsModal && selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-2xl p-6 w-full max-w-lg mx-4">
                        <h3 className="text-xl font-bold text-black dark:text-white mb-6">
                            Detalles del Evento
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-lg font-semibold text-black dark:text-white">{selectedEvent.name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Organizado por: {selectedEvent.organizer}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{selectedEvent.date}</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{selectedEvent.time}</span>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{selectedEvent.location}</span>
                            </div>

                            <div className="flex items-center">
                                <Users className="w-4 h-4 mr-2 text-gray-500" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {selectedEvent.attendees} / {selectedEvent.capacity} participantes
                                </span>
                            </div>

                            <div className="flex items-center">
                                <Tag className="w-4 h-4 mr-2 text-gray-500" />
                                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(selectedEvent.category)} text-white`}>
                                    {selectedEvent.category}
                                </span>
                            </div>

                            <div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedEvent.status)}`}>
                                    {selectedEvent.status}
                                </span>
                            </div>

                            <div>
                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción:</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEvent.description}</p>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventsManagement;
