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
  Tag,
  ChevronDown,
  Check
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useNotifications } from '../hooks/useNotifications';
import { createEvent as apiCreateEvent, deleteEvent as apiDeleteEvent, fetchEvents as apiFetchEvents, updateEvent as apiUpdateEvent } from '../services/eventsService';
import Notification from '../components/ui/Notification';
import ConfirmModal from '../components/ui/ConfirmModal';
import '../components/ui/CustomSelect.css';

const EventsManagement: React.FC = () => {
    const navigate = useNavigate();
    const { toggleTheme, isDark } = useTheme();
    const { notifications, removeNotification, showSuccess, showError, showWarning } = useNotifications();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [newEvent, setNewEvent] = useState({
        name: '',
        date: '',
        time: '',
        duration: '',
        location: '',
        capacity: '',
        category: '',
        description: ''
    });
    const role = localStorage.getItem('role');
    const firstName = localStorage.getItem('firstName');
    const [events, setEvents] = useState<any[]>([]);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<any>(null);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    // Temporalmente deshabilitado para debug
    // React.useEffect(() => {
    //     const handleClickOutside = (event: MouseEvent) => {
    //         const target = event.target as HTMLElement;
    //         if (showCategoryDropdown && !target.closest('.category-dropdown')) {
    //             setShowCategoryDropdown(false);
    //         }
    //     };

    //     if (showCategoryDropdown) {
    //         document.addEventListener('click', handleClickOutside);
    //     }

    //     return () => {
    //         document.removeEventListener('click', handleClickOutside);
    //     };
    // }, [showCategoryDropdown]);

    // Debug: Log cuando cambia selectedCategory
    React.useEffect(() => {
        console.log('🔄 selectedCategory cambió a:', selectedCategory);
    }, [selectedCategory]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('firstName');
        navigate('/login');
    };

    // Función para calcular el estado del evento basado en fecha, hora y duración
    const calculateEventStatus = (eventDate: string, duration: number): string => {
        const now = new Date();
        const eventDateTime = new Date(eventDate);
        const endDateTime = new Date(eventDateTime.getTime() + duration * 60000); // Convertir minutos a milisegundos
        
        if (now < eventDateTime) {
            return 'upcoming';
        } else if (now >= eventDateTime && now <= endDateTime) {
            return 'in_progress';
        } else {
            return 'completed';
        }
    };

    const loadEvents = async () => {
        try {
            const data = await apiFetchEvents();
            setEvents(data as any);
        } catch (e: any) {
            showError(
                'Error cargando eventos',
                e.message || 'Error cargando eventos'
            );
        }
    };

    React.useEffect(() => {
        loadEvents();
    }, []);

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!newEvent.name.trim()) {
            errors.name = 'El nombre del evento es requerido';
        }

        if (!newEvent.date) {
            errors.date = 'La fecha es requerida';
        } else {
            const eventDate = new Date(`${newEvent.date}T${newEvent.time || '00:00'}`);
            const now = new Date();
            // Comparar solo fecha si no hay hora especificada
            if (!newEvent.time) {
                const eventDateOnly = new Date(newEvent.date);
                const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                if (eventDateOnly < todayOnly) {
                    errors.date = 'La fecha debe ser futura';
                }
            } else {
                if (eventDate <= now) {
                    errors.date = 'La fecha y hora deben ser futuras';
                }
            }
        }

        if (!newEvent.time) {
            errors.time = 'La hora es requerida';
        }

        if (!newEvent.duration || Number(newEvent.duration) <= 0) {
            errors.duration = 'La duración debe ser mayor a 0 minutos';
        }

        if (!newEvent.capacity || Number(newEvent.capacity) <= 0) {
            errors.capacity = 'La capacidad debe ser mayor a 0';
        }

        if (!newEvent.category) {
            errors.category = 'La categoría es requerida';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateOrUpdateEvent = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            // Crear fecha correctamente combinando fecha y hora en zona horaria local
            const [year, month, day] = newEvent.date.split('-');
            const [hours, minutes] = newEvent.time.split(':');
            
            // Crear string de fecha en formato ISO pero manteniendo la hora local
            const eventDateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
            
            const payload: any = {
                title: newEvent.name,
                description: newEvent.description || undefined,
                event_date: eventDateString,
                duration: Number(newEvent.duration || 0),
                location: newEvent.location || undefined,
                event_type: mapUiCategoryToEventType(newEvent.category),
                capacity: Number(newEvent.capacity || 0),
            };
            if (editingEvent?.event_id) {
                await apiUpdateEvent(editingEvent.event_id, payload);
                showSuccess(
                    'Evento actualizado',
                    `El evento "${newEvent.name}" ha sido actualizado exitosamente.`
                );
            } else {
                await apiCreateEvent(payload);
                showSuccess(
                    'Evento creado',
                    `El evento "${newEvent.name}" ha sido creado exitosamente.`
                );
            }
            await loadEvents();
            setShowCreateModal(false);
            setEditingEvent(null);
        setNewEvent({
            name: '',
            date: '',
            time: '',
            duration: '',
            location: '',
            capacity: '',
            category: '',
            description: ''
        });
            setFormErrors({});
        } catch (e: any) {
            const errorMessage = e.message || 'Error guardando evento';
            showError(
                'Error al guardar evento',
                errorMessage
            );
        }
    };

    const handleEditEvent = (event: any) => {
        setEditingEvent(event);
        const dt = new Date(event.event_date);
        
        // Extraer fecha en formato YYYY-MM-DD sin conversión de zona horaria
        const year = dt.getFullYear();
        const month = (dt.getMonth() + 1).toString().padStart(2, '0');
        const day = dt.getDate().toString().padStart(2, '0');
        const dateStr = isNaN(dt.getTime()) ? '' : `${year}-${month}-${day}`;
        
        // Formatear hora correctamente para el input time (HH:MM)
        const hours = dt.getHours().toString().padStart(2, '0');
        const minutes = dt.getMinutes().toString().padStart(2, '0');
        const timeStr = isNaN(dt.getTime()) ? '' : `${hours}:${minutes}`;
        
        setNewEvent({
            name: event.title,
            date: dateStr,
            time: timeStr,
            duration: String(event.duration ?? ''),
            status: event.status || 'upcoming',
            location: event.location || '',
            capacity: String(event.capacity ?? ''),
            category: mapEventTypeToUiCategory(event.event_type),
            description: event.description || ''
        });
        setFormErrors({}); // Limpiar errores al editar
        setShowCreateModal(true);
    };

    const handleDeleteEvent = (event: any) => {
        setEventToDelete(event);
        setShowDeleteModal(true);
    };

    const handleCancelCreate = () => {
        // Verificar si hay datos en el formulario
        const hasData = newEvent.name || newEvent.date || newEvent.time || 
                       newEvent.duration || newEvent.status !== 'upcoming' ||
                       newEvent.location || newEvent.capacity || newEvent.category || newEvent.description;
        
        if (hasData) {
            setShowCancelModal(true);
        } else {
            handleConfirmCancel();
        }
    };

    const handleConfirmCancel = () => {
        const isEditing = editingEvent?.event_id;
        
        setShowCreateModal(false);
        setEditingEvent(null);
        setNewEvent({
            name: '',
            date: '',
            time: '',
            duration: '',
            location: '',
            capacity: '',
            category: '',
            description: ''
        });
        setFormErrors({});
        setShowCancelModal(false);
        
        if (isEditing) {
            showWarning(
                'Edición cancelada',
                `Se ha cancelado la edición del evento "${editingEvent.title}". Los cambios no se han guardado.`
            );
        } else {
            showWarning(
                'Creación cancelada',
                'Se ha cancelado la creación del evento. Los datos ingresados se han perdido.'
            );
        }
    };

    const confirmDeleteEvent = async () => {
        if (!eventToDelete) return;
        try {
            await apiDeleteEvent(eventToDelete.event_id);
            await loadEvents();
            setShowDeleteModal(false);
            setEventToDelete(null);
            showSuccess(
                'Evento eliminado',
                `El evento "${eventToDelete.title}" ha sido eliminado exitosamente.`
            );
        } catch (e: any) {
            const errorMessage = e.message || 'Error eliminando evento';
            showError(
                'Error al eliminar evento',
                errorMessage
            );
        }
    };

    const handleViewDetails = (event: any) => {
        setSelectedEvent(event);
        setShowDetailsModal(true);
    };

    const menuItems = [
        { icon: Home, label: 'Dashboard', active: false, path: '/dashboard' },
        { icon: Calendar, label: 'Eventos', active: true, path: '/events-management' },
        { icon: Users, label: 'Inscripciones', active: false, path: '/registrations-management' },
        { icon: Settings, label: 'Configuración', active: false, path: '/settings' },
    ];

    const uiEvents = React.useMemo(() => {
        return events.map((e: any) => {
            const dt = new Date(e.event_date);
            // Calcular el estado automáticamente basado en fecha, hora y duración
            const calculatedStatus = calculateEventStatus(e.event_date, e.duration || 0);
            
            // Mapear status para mostrar en UI
            const statusText = {
                'upcoming': 'Próximo',
                'in_progress': 'En Progreso', 
                'completed': 'Finalizado'
            }[calculatedStatus] || 'Próximo';
            
            return {
                id: e.event_id,
                name: e.title,
                date: dt.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }),
                time: dt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                duration: e.duration || 0,
                location: e.location || '',
                attendees: e.attendees ?? 0,
                capacity: e.capacity,
                status: statusText,
                category: mapEventTypeToUiCategory(e.event_type),
                organizer: '—',
                description: e.description || '',
                createdAt: e.created_at,
                raw: e,
            };
        });
    }, [events]);

    const categories = ['Académico', 'Cultural', 'Deportes'];

    const filteredEvents = uiEvents.filter(event => {
        const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            event.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            event.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });

    // Debug log para ver el estado del filtro
    console.log('Estado del filtro:');
    console.log('- selectedCategory:', selectedCategory);
    console.log('- total events:', uiEvents.length);
    console.log('- filtered events:', filteredEvents.length);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'upcoming':
            case 'Próximo':
                return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
            case 'in_progress':
            case 'En Progreso':
                return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
            case 'completed':
            case 'Finalizado':
                return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
            default:
                return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
        }
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'Académico': 'from-blue-500 to-cyan-500',
            'Cultural': 'from-green-500 to-emerald-500',
            'Deportes': 'from-orange-500 to-red-500'
        };
        return colors[category] || 'from-gray-500 to-gray-600';
    };

    function mapEventTypeToUiCategory(type: 'academic' | 'cultural' | 'sports'): string {
        switch (type) {
            case 'academic': return 'Académico';
            case 'cultural': return 'Cultural';
            case 'sports': return 'Deportes';
            default: return 'Académico';
        }
    }

    function mapUiCategoryToEventType(category: string): 'academic' | 'cultural' | 'sports' {
        switch (category) {
            case 'Académico': return 'academic';
            case 'Cultural': return 'cultural';
            case 'Deportes': return 'sports';
            default: return 'academic';
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-white">
                    <div className="flex items-center">
                        <div className="w-6 h-6 bg-black dark:bg-white rounded-lg flex items-center justify-center">
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
                                    className={`w-full flex items-center px-4 py-2 text-left rounded-xl transition-all duration-200 ${
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
                        className="w-full flex items-center px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
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
                                className="p-3 rounded-full bg-white dark:bg-black border-2 border-gray-200 dark:border-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                                aria-label="Cambiar tema"
                            >
                                {isDark ? <Sun className="h-6 w-6 text-yellow-500" /> : <Moon className="h-6 w-6 text-black" />}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-4">
                    {/* Quick Actions Toolbar */}
                    <div className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-2xl p-4 shadow-lg mb-8">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-semibold text-black dark:text-white">Acciones Rápidas</h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <button 
                                    onClick={() => {
                                        setShowCreateModal(true);
                                        setFormErrors({}); // Limpiar errores al abrir modal
                                    }}
                                    className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
                                >
                                    <Plus className="w-3 h-3 mr-2" />
                                    <span className="font-medium">Crear Evento</span>
                                </button>
                                <button className="flex items-center px-4 py-2 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-xl hover:from-violet-600 hover:to-violet-700 transition-all duration-200 shadow-lg">
                                    <Download className="w-3 h-3 mr-2" />
                                    <span className="font-medium">Exportar</span>
                                </button>
                                <div className="relative category-dropdown">
                                    <button
                                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                        className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-700 transition-all duration-200"
                                    >
                                        <Filter className="w-3 h-3 mr-3 text-gray-600 dark:text-gray-400" />
                                        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                                            {selectedCategory === 'all' ? 'Todas las categorías' : selectedCategory}
                                        </span>
                                        <ChevronDown className={`w-3 h-3 ml-2 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {showCategoryDropdown && (
                                        <div className="absolute top-full left-0 mt-2 w-full min-w-[200px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-600/50 backdrop-blur-sm z-50 overflow-hidden">
                                            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filtrar por categoría</span>
                                                <button 
                                                    onClick={() => setShowCategoryDropdown(false)}
                                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="py-2">
                                                <button
                                                    onClick={() => {
                                                        console.log('Seleccionando: Todas las categorías');
                                                        setSelectedCategory('all');
                                                        setShowCategoryDropdown(false);
                                                    }}
                                                    className={`w-full flex items-center px-4 py-3 text-left transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 dark:hover:from-purple-900/20 dark:hover:to-indigo-900/20 ${
                                                        selectedCategory === 'all' 
                                                            ? 'bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-700 dark:text-purple-300' 
                                                            : 'text-gray-700 dark:text-gray-300'
                                                    }`}
                                                >
                                                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mr-3"></div>
                                                    <span className="font-semibold">Todas las categorías</span>
                                                    {selectedCategory === 'all' && (
                                                        <Check className="w-4 h-4 ml-auto text-purple-600 dark:text-purple-400" />
                                                    )}
                                                </button>
                                                
                                                {categories.map((category, index) => (
                                                    <button
                                                        key={category}
                                                        onClick={() => {
                                                            console.log('Seleccionando categoría:', category);
                                                            setSelectedCategory(category);
                                                            setShowCategoryDropdown(false);
                                                        }}
                                                        className={`w-full flex items-center px-4 py-3 text-left transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 dark:hover:from-purple-900/20 dark:hover:to-indigo-900/20 ${
                                                            selectedCategory === category 
                                                                ? 'bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-700 dark:text-purple-300' 
                                                                : 'text-gray-700 dark:text-gray-300'
                                                        }`}
                                                    >
                                                        <div className={`w-2 h-2 rounded-full mr-3 ${
                                                            index === 0 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                                                            index === 1 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                                            'bg-gradient-to-r from-orange-500 to-red-500'
                                                        }`}></div>
                                                        <span className="font-semibold">{category}</span>
                                                        {selectedCategory === category && (
                                                            <Check className="w-4 h-4 ml-auto text-purple-600 dark:text-purple-400" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Events Table */}
                    <div className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-2xl p-4 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-black dark:text-white">Lista de Eventos</h3>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {filteredEvents.length} de {uiEvents.length} eventos
                            </div>
                        </div>

                        {/* Table Header */}
                        <div className="grid grid-cols-9 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                            <div>Evento</div>
                            <div>Fecha</div>
                            <div>Hora</div>
                            <div>Duración</div>
                            <div>Ubicación</div>
                            <div>Participantes</div>
                            <div>Categoría</div>
                            <div>Estado</div>
                            <div>Acciones</div>
                        </div>

                        <div className="space-y-3">
                            {filteredEvents.map((event) => (
                                <div key={event.id} className="grid grid-cols-9 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
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
                                        <Clock className="w-3 h-3 mr-1" />
                                        {event.duration} min
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
                                            <Eye className="w-3 h-3" />
                                        </button>
                                        <button 
                                            onClick={() => handleEditEvent(event.raw)}
                                            className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                        >
                                            <Edit className="w-3 h-3" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteEvent(event.raw)}
                                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" />
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-xl shadow-2xl my-1 transform transition-all duration-300">
                        {/* Header sobrio */}
                        <div className="px-6 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-t-2xl">
                            <div className="flex items-center space-x-4">
                                <div className="w-6 h-6 bg-gray-600 dark:bg-gray-300 rounded-lg flex items-center justify-center shadow-md">
                                    <Calendar className="w-3 h-3 text-white dark:text-gray-800" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {editingEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}
                        </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {editingEvent ? 'Modifica la información del evento' : 'Completa la información del evento'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 space-y-2">
                            <div className="group">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mr-3 animate-pulse"></div>
                                    Nombre del Evento
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={newEvent.name}
                                        onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                                        className={`w-full pl-12 pr-4 py-2 border-2 rounded-2xl bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-4 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl group-focus-within:scale-[1.02] ${
                                            formErrors.name 
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                                                : 'border-gray-200/50 dark:border-gray-600/50 focus:border-blue-500 focus:ring-blue-100'
                                        }`}
                                        placeholder="Ingresa el nombre del evento"
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                                        <Tag className="w-3 h-3 text-white" />
                                    </div>
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 pointer-events-none"></div>
                                </div>
                                {formErrors.name && (
                                    <div className="mt-3 flex items-center text-red-500 text-sm">
                                        <div className="w-1 h-1 bg-red-500 rounded-full mr-2"></div>
                                        {formErrors.name}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="group">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                                        <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mr-3 animate-pulse"></div>
                                        Fecha
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={newEvent.date}
                                            onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                                            min={new Date().toISOString().split('T')[0]}
                                            className={`w-full pl-12 pr-4 py-2 border-2 rounded-2xl bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white focus:outline-none focus:ring-4 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl group-focus-within:scale-[1.02] ${
                                                formErrors.date 
                                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                                                    : 'border-gray-200/50 dark:border-gray-600/50 focus:border-green-500 focus:ring-green-100'
                                            }`}
                                        />
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                                            <Calendar className="w-3 h-3 text-white" />
                                        </div>
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/5 to-emerald-500/5 pointer-events-none"></div>
                                    </div>
                                    {formErrors.date && (
                                        <div className="mt-3 flex items-center text-red-500 text-sm">
                                            <div className="w-1 h-1 bg-red-500 rounded-full mr-2"></div>
                                            {formErrors.date}
                                        </div>
                                    )}
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                                        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3 animate-pulse"></div>
                                        Hora
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            value={newEvent.time}
                                            onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                                            className={`w-full pl-12 pr-4 py-2 border-2 rounded-2xl bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white focus:outline-none focus:ring-4 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl group-focus-within:scale-[1.02] ${
                                                formErrors.time 
                                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                                                    : 'border-gray-200/50 dark:border-gray-600/50 focus:border-purple-500 focus:ring-purple-100'
                                            }`}
                                        />
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                                            <Clock className="w-3 h-3 text-white" />
                                        </div>
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none"></div>
                                    </div>
                                    {formErrors.time && (
                                        <div className="mt-3 flex items-center text-red-500 text-sm">
                                            <div className="w-1 h-1 bg-red-500 rounded-full mr-2"></div>
                                            {formErrors.time}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Campo de Duración */}
                            <div className="group">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mr-3 animate-pulse"></div>
                                    Duración (minutos)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="1"
                                        value={newEvent.duration}
                                        onChange={(e) => setNewEvent({...newEvent, duration: e.target.value})}
                                        placeholder="120"
                                        className={`w-full pl-12 pr-4 py-2 border-2 rounded-2xl bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white focus:outline-none focus:ring-4 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl group-focus-within:scale-[1.02] ${
                                            formErrors.duration 
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                                                : 'border-gray-200/50 dark:border-gray-600/50 focus:border-blue-500 focus:ring-blue-100'
                                        }`}
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                                        <Clock className="w-3 h-3 text-white" />
                                    </div>
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-cyan-500/5 pointer-events-none"></div>
                                </div>
                                {formErrors.duration && (
                                    <div className="mt-3 flex items-center text-red-500 text-sm">
                                        <div className="w-1 h-1 bg-red-500 rounded-full mr-2"></div>
                                        {formErrors.duration}
                                    </div>
                                )}
                            </div>


                            <div className="group">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                                    <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mr-3 animate-pulse"></div>
                                    Ubicación
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={newEvent.location}
                                        onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                                        className="w-full pl-12 pr-4 py-2 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl group-focus-within:scale-[1.02]"
                                        placeholder="Ingresa la ubicación"
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md">
                                        <MapPin className="w-3 h-3 text-white" />
                                    </div>
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/5 to-red-500/5 pointer-events-none"></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="group">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                                        <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mr-3 animate-pulse"></div>
                                        Capacidad
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={newEvent.capacity}
                                            onChange={(e) => setNewEvent({...newEvent, capacity: e.target.value})}
                                            className={`w-full pl-12 pr-4 py-2 border-2 rounded-2xl bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-4 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl group-focus-within:scale-[1.02] ${
                                                formErrors.capacity 
                                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                                                    : 'border-gray-200/50 dark:border-gray-600/50 focus:border-cyan-500 focus:ring-cyan-100'
                                            }`}
                                            placeholder="100"
                                        />
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
                                            <Users className="w-3 h-3 text-white" />
                                        </div>
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 pointer-events-none"></div>
                                    </div>
                                    {formErrors.capacity && (
                                        <div className="mt-3 flex items-center text-red-500 text-sm">
                                            <div className="w-1 h-1 bg-red-500 rounded-full mr-2"></div>
                                            {formErrors.capacity}
                                        </div>
                                    )}
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                                        <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mr-3 animate-pulse"></div>
                                        Categoría
                                    </label>
                                    <div className="relative custom-select">
                                        <select
                                            value={newEvent.category}
                                            onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                                            className={`w-full pl-12 py-2 border-2 rounded-2xl bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white focus:outline-none focus:ring-4 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl group-focus-within:scale-[1.02] appearance-none cursor-pointer ${
                                                formErrors.category 
                                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                                                    : 'border-gray-200/50 dark:border-gray-600/50 focus:border-indigo-500 focus:ring-indigo-100'
                                            }`}
                                        >
                                            <option value="" disabled>Selecciona una categoría</option>
                                            {categories.map(category => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                                            <Tag className="w-3 h-3 text-white" />
                                        </div>
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>
                                    </div>
                                    {formErrors.category && (
                                        <div className="mt-3 flex items-center text-red-500 text-sm">
                                            <div className="w-1 h-1 bg-red-500 rounded-full mr-2"></div>
                                            {formErrors.category}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                                    <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mr-3 animate-pulse"></div>
                                    Descripción
                                </label>
                                <textarea
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                                    rows={4}
                                    className="w-full px-6 py-2 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-500 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl group-focus-within:scale-[1.02]"
                                    placeholder="Describe el evento..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 px-6 py-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 rounded-b-2xl">
                            <button
                                onClick={handleCancelCreate}
                                className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateOrUpdateEvent}
                                className="px-6 py-2 text-sm font-medium text-white dark:text-gray-800 bg-gray-700 dark:bg-gray-300 hover:bg-gray-800 dark:hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                {editingEvent ? 'Actualizar' : 'Crear'} Evento
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para ver detalles del evento */}
            {showDetailsModal && selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-md mx-4 shadow-2xl transform transition-all duration-300 my-1">
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-gray-600 dark:bg-gray-300 rounded-lg flex items-center justify-center shadow-md">
                                        <Calendar className="w-5 h-5 text-white dark:text-gray-800" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Detalles del Evento
                            </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Información completa del evento
                                        </p>
                                    </div>
                                </div>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            </div>
                        </div>
                        
                        <div className="p-3 space-y-3">
                            {/* Header del evento */}
                            <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm shadow-lg">
                                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{selectedEvent.name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Organizado por: {selectedEvent.organizer}</p>
                                <div className="flex items-center gap-4">
                                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(selectedEvent.status)} shadow-lg`}>
                                        {selectedEvent.status}
                                    </span>
                                    <span className={`px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r ${getCategoryColor(selectedEvent.category)} text-white shadow-lg`}>
                                        {selectedEvent.category}
                                    </span>
                                </div>
                            </div>

                            {/* Información detallada */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="group flex items-center p-4 bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                            <Calendar className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Fecha</p>
                                            <p className="text-base font-semibold text-gray-900 dark:text-white">{selectedEvent.date}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="group flex items-center p-4 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200/50 dark:border-green-700/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                            <Clock className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Hora</p>
                                            <p className="text-base font-semibold text-gray-900 dark:text-white">{selectedEvent.time}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="group flex items-center p-4 bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                            <Clock className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Duración</p>
                                            <p className="text-base font-semibold text-gray-900 dark:text-white">{selectedEvent.duration} minutos</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="group flex items-center p-4 bg-gradient-to-r from-orange-50/80 to-red-50/80 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl border border-orange-200/50 dark:border-orange-700/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                            <MapPin className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Ubicación</p>
                                            <p className="text-base font-semibold text-gray-900 dark:text-white">{selectedEvent.location || 'No especificada'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="group flex items-center p-4 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                            <Users className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Participantes</p>
                                            <p className="text-base font-semibold text-gray-900 dark:text-white">
                                                {selectedEvent.attendees} / {selectedEvent.capacity}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Descripción */}
                            {selectedEvent.description && (
                                <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-indigo-200/50 dark:border-indigo-700/50 backdrop-blur-sm shadow-lg">
                                    <h5 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                                        <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                                            <Tag className="w-3 h-3 text-white" />
                                        </div>
                                        Descripción
                                    </h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl backdrop-blur-sm">{selectedEvent.description}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end px-4 py-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 rounded-b-2xl">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="px-6 py-2 text-sm font-medium text-white dark:text-gray-800 bg-gray-700 dark:bg-gray-300 hover:bg-gray-800 dark:hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para eliminar evento */}
            {showDeleteModal && eventToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-2xl p-4 w-full max-w-md mx-4 shadow-2xl">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
                                <Trash2 className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-black dark:text-white mb-4">
                                ¿Eliminar evento?
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Estás a punto de eliminar el evento:
                            </p>
                            <p className="text-lg font-semibold text-black dark:text-white mb-6">
                                "{eventToDelete.title}"
                            </p>
                            <p className="text-sm text-red-600 dark:text-red-400 mb-8">
                                Esta acción no se puede deshacer. Se eliminarán también todas las inscripciones asociadas.
                            </p>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setEventToDelete(null);
                                }}
                                className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-white bg-white dark:bg-black text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDeleteEvent}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para cancelar creación/edición */}
            <ConfirmModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleConfirmCancel}
                title={editingEvent?.event_id ? "Cancelar edición" : "Cancelar creación"}
                message={
                    editingEvent?.event_id 
                        ? `¿Estás seguro de que quieres cancelar la edición del evento "${editingEvent.title}"? Los cambios no se guardarán.`
                        : "¿Estás seguro de que quieres cancelar la creación del evento? Se perderán todos los datos ingresados."
                }
                confirmText="Sí, cancelar"
                cancelText={editingEvent?.event_id ? "Continuar editando" : "Continuar creando"}
                type="warning"
            />

            {/* Notificaciones */}
            {notifications.map((notification) => (
                <Notification
                    key={notification.id}
                    id={notification.id}
                    type={notification.type}
                    title={notification.title}
                    message={notification.message}
                    duration={notification.duration}
                    onClose={removeNotification}
                />
            ))}
        </div>
    );
};

export default EventsManagement;
