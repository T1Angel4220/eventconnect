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
  CheckCircle,
  XCircle,
  Eye,
  Sun,
  Moon,
  Download,
  Filter,
  UserCheck,
  Clock,
  Calendar as CalendarIcon,
  User
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useNotifications } from '../hooks/useNotifications';
import { useSessionExpired } from '../hooks/useSessionExpired';
import SessionExpiredModal from '../components/modals/SessionExpiredModal';
import { 
  getAllRegistrations, 
  mapRegistrationStatusToSpanish,
  mapEventTypeToSpanish,
  formatDate,
  formatDateTime,
  type RegistrationWithDetails 
} from '../services/registrationService';
import Notification from '../components/ui/Notification';
import CustomDropdown from '../components/ui/CustomDropdown';
import ExportModal from '../components/ui/ExportModal';
import { generateRegistrationsPDF } from '../utils/pdfGenerator';

const RegistrationsManagement: React.FC = () => {
    const navigate = useNavigate();
    const { toggleTheme, isDark } = useTheme();
    const { notifications, removeNotification, showSuccess, showError } = useNotifications();
    const { showSessionExpiredModal, handleSessionExpired, goToLogin } = useSessionExpired();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedEvent, setSelectedEvent] = useState('all');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState<RegistrationWithDetails | null>(null);
    const [registrations, setRegistrations] = useState<RegistrationWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const role = localStorage.getItem('role');
    const firstName = localStorage.getItem('firstName');
    const profileImage = localStorage.getItem('profileImage');

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('firstName');
        setShowLogoutModal(false);
        navigate('/login');
    };

    const handleNavigateToConfiguration = () => {
        navigate('/configuration');
    };

    // Cargar inscripciones desde el backend
    const loadRegistrations = React.useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAllRegistrations();
            setRegistrations(data);
        } catch (error: unknown) {
            console.error('Error cargando inscripciones:', error);
            
            // Si es un error de sesión expirada, mostrar modal
            if (error instanceof Error && error.message.includes('Sesión expirada')) {
                handleSessionExpired();
                return;
            }
            
            showError(
                'Error cargando inscripciones',
                error instanceof Error ? error.message : 'Error cargando inscripciones'
            );
        } finally {
            setLoading(false);
        }
    }, [showError, handleSessionExpired]);

    // Cargar datos al montar el componente
    React.useEffect(() => {
        loadRegistrations();
    }, [loadRegistrations]);

    const handleNavigateToDashboard = () => {
        navigate('/dashboard');
    };

    const handleNavigateToEvents = () => {
        navigate('/events-management');
    };

    const handleNavigateToRegistrations = () => {
        navigate('/registrations-management');
    };

    const menuItems = [
        { icon: Home, label: 'Dashboard', active: false, onClick: handleNavigateToDashboard },
        { icon: Calendar, label: 'Eventos', active: false, onClick: handleNavigateToEvents },
        { icon: Users, label: 'Inscripciones', active: true, onClick: handleNavigateToRegistrations },
        { icon: Settings, label: 'Configuración', active: false, onClick: handleNavigateToConfiguration },
    ];

    // Obtener lista única de eventos para el filtro
    const events = React.useMemo(() => {
        const uniqueEvents = [...new Set(registrations.map(r => r.event_title))];
        return uniqueEvents.sort();
    }, [registrations]);

    // Opciones para los dropdowns
    const statusOptions = [
        { value: 'all', label: 'Todos los estados' },
        { value: 'Registrado', label: 'Registrados' },
        { value: 'Cancelado', label: 'Cancelados' }
    ];

    const eventOptions = React.useMemo(() => [
        { value: 'all', label: 'Todos los eventos' },
        ...events.map(event => ({ value: event, label: event }))
    ], [events]);

    const filteredRegistrations = registrations.filter(registration => {
        const participantName = `${registration.user_first_name} ${registration.user_last_name}`;
        const matchesSearch = participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            registration.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            registration.event_title.toLowerCase().includes(searchTerm.toLowerCase());
        
        const spanishStatus = mapRegistrationStatusToSpanish(registration.status);
        const matchesStatus = selectedStatus === 'all' || spanishStatus === selectedStatus;
        const matchesEvent = selectedEvent === 'all' || registration.event_title === selectedEvent;
        
        return matchesSearch && matchesStatus && matchesEvent;
    });

    const getStatusColor = (status: 'registered' | 'canceled') => {
        switch (status) {
            case 'registered':
                return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
            case 'canceled':
                return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
            default:
                return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
        }
    };

    const getStatusIcon = (status: 'registered' | 'canceled') => {
        switch (status) {
            case 'registered':
                return <CheckCircle className="w-4 h-4" />;
            case 'canceled':
                return <XCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    // En eventos universitarios, los participantes se auto-inscriben
    // No hay necesidad de funciones de aprobar/rechazar

    const handleViewDetails = (registration: RegistrationWithDetails) => {
        setSelectedRegistration(registration);
        setShowDetailsModal(true);
    };

    // Función para manejar la exportación
    const handleExport = (options: {
        type: 'all' | 'specific' | 'filtered';
        eventTitle?: string;
        status?: string;
        eventType?: string;
        includeStats: boolean;
        includeEventInfo: boolean;
    }) => {
        try {
            let dataToExport = registrations;

            // Aplicar filtros según las opciones
            if (options.type === 'specific' && options.eventTitle && options.eventTitle !== 'all') {
                dataToExport = dataToExport.filter(r => r.event_title === options.eventTitle);
            }

            if (options.status && options.status !== 'all') {
                const englishStatus = options.status === 'Registrado' ? 'registered' : 'canceled';
                dataToExport = dataToExport.filter(r => r.status === englishStatus);
            }

            if (options.eventType && options.eventType !== 'all') {
                dataToExport = dataToExport.filter(r => r.event_type === options.eventType);
            }

            // Generar PDF
            generateRegistrationsPDF(
                dataToExport,
                options,
                firstName || 'Organizador'
            );

            showSuccess(
                'PDF generado exitosamente',
                `Se ha generado el reporte con ${dataToExport.length} inscripciones`
            );
        } catch (error: unknown) {
            console.error('Error generando PDF:', error);
            showError(
                'Error generando PDF',
                error instanceof Error ? error.message : 'Error generando el reporte'
            );
        }
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
                            <p className="text-xs text-gray-500 dark:text-gray-400">{role === 'organizer' ? 'Organizador' : role}</p>
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
                            <h1 className="ml-4 text-2xl font-bold text-black dark:text-white">Gestión de Inscripciones</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Search */}
                            <div className="relative hidden md:block">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Buscar inscripciones..."
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
                <main className="p-6">
                    {/* Quick Actions Toolbar */}
                    <div className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-2xl p-4 shadow-lg mb-8">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-semibold text-black dark:text-white">Filtros y Acciones</h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <button 
                                    onClick={() => setShowExportModal(true)}
                                    className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    <span className="font-medium">Exportar</span>
                                </button>
                                
                                <CustomDropdown
                                    options={statusOptions}
                                        value={selectedStatus}
                                    onChange={setSelectedStatus}
                                    icon={<Filter className="w-4 h-4" />}
                                    className="min-w-[180px]"
                                />
                                
                                <CustomDropdown
                                    options={eventOptions}
                                        value={selectedEvent}
                                    onChange={setSelectedEvent}
                                    icon={<CalendarIcon className="w-4 h-4" />}
                                    className="min-w-[200px]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Registrations Table */}
                    <div className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-black dark:text-white">Inscripciones Confirmadas</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    En eventos universitarios, los participantes se auto-inscriben directamente
                                </p>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {filteredRegistrations.length} de {registrations.length} inscripciones
                            </div>
                        </div>

                        {/* Table Header */}
                        <div className="grid grid-cols-7 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                            <div>Participante</div>
                            <div>Evento</div>
                            <div>Fecha de Inscripción</div>
                            <div>Estado</div>
                            <div>Rol</div>
                            <div>Tipo de Evento</div>
                            <div>Acciones</div>
                        </div>

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
                                <p className="text-gray-600 dark:text-gray-400">Cargando inscripciones...</p>
                            </div>
                        ) : (
                        <div className="space-y-3">
                            {filteredRegistrations.map((registration) => (
                                <div key={registration.registration_id} className="grid grid-cols-7 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                                {registration.user_first_name} {registration.user_last_name}
                                            </h4>
                                            <p className="text-xs text-gray-600 dark:text-gray-300">{registration.user_email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{registration.event_title}</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-300">{formatDate(registration.event_date)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-800 dark:text-gray-200">
                                        {formatDate(registration.registered_at)}
                                    </div>
                                    <div className="flex items-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(registration.status)}`}>
                                            {getStatusIcon(registration.status)}
                                            <span className="ml-1">{mapRegistrationStatusToSpanish(registration.status)}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-800 dark:text-gray-200">
                                        {registration.user_role}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-800 dark:text-gray-200">
                                        <div className="text-center">
                                            <div className="font-medium">{mapEventTypeToSpanish(registration.event_type)}</div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                Capacidad: {registration.event_capacity}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button 
                                            onClick={() => handleViewDetails(registration)}
                                            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                            title="Ver detalles de la inscripción"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        {/* En eventos universitarios, los participantes se auto-inscriben */}
                                        {/* No hay necesidad de aprobar/rechazar inscripciones */}
                                    </div>
                                </div>
                            ))}
                        </div>
                        )}

                        {!loading && filteredRegistrations.length === 0 && (
                            <div className="text-center py-12">
                                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-gray-400 font-medium">No se encontraron inscripciones</p>
                                <p className="text-sm text-gray-500 dark:text-gray-500">Intenta ajustar los filtros de búsqueda</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedRegistration && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-black rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-black dark:text-white">Detalles de la Inscripción</h3>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="p-2 text-gray-400 hover:text-black dark:hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Event Info */}
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                                <h4 className="font-semibold text-black dark:text-white mb-3">Información del Evento</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Evento:</p>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{selectedRegistration.event_title}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Fecha:</p>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{formatDateTime(selectedRegistration.event_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Ubicación:</p>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{selectedRegistration.event_location || 'No especificada'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Fecha de Solicitud:</p>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{formatDateTime(selectedRegistration.registered_at)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Tipo:</p>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{mapEventTypeToSpanish(selectedRegistration.event_type)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Capacidad:</p>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{selectedRegistration.event_capacity} personas</p>
                                    </div>
                                </div>
                            </div>

                            {/* Participant Info */}
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                                <h4 className="font-semibold text-black dark:text-white mb-3">Información del Participante</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Nombre:</p>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            {selectedRegistration.user_first_name} {selectedRegistration.user_last_name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Email:</p>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{selectedRegistration.user_email}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Rol:</p>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{selectedRegistration.user_role}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Estado:</p>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{mapRegistrationStatusToSpanish(selectedRegistration.status)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Información adicional para organizadores universitarios */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                    📋 Información para Organizadores
                                </h4>
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    En eventos universitarios, los participantes se auto-inscriben directamente. 
                                    Esta inscripción está confirmada automáticamente.
                                </p>
                                <div className="mt-3 flex items-center text-sm text-blue-700 dark:text-blue-300">
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                    <span>Inscripción confirmada automáticamente</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Modal */}
            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                onExport={handleExport}
                registrations={registrations}
                events={events}
            />

            {/* Notifications */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
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

            {/* Modal de Sesión Expirada */}
            <SessionExpiredModal 
                isOpen={showSessionExpiredModal}
                onClose={goToLogin}
            />
        </div>
    );
};

export default RegistrationsManagement;
