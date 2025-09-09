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
  Mail,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
  User
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const RegistrationsManagement: React.FC = () => {
    const navigate = useNavigate();
    const { toggleTheme, isDark } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedEvent, setSelectedEvent] = useState('all');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const role = localStorage.getItem('role');
    const firstName = localStorage.getItem('firstName');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('firstName');
        navigate('/login');
    };

    const menuItems = [
        { icon: Home, label: 'Dashboard', active: false, path: '/dashboard' },
        { icon: Calendar, label: 'Eventos', active: false, path: '/events' },
        { icon: Users, label: 'Inscripciones', active: true, path: '/registrations' },
        { icon: Settings, label: 'Configuración', active: false, path: '/settings' },
    ];

    const registrations = [
        {
            id: 1,
            eventName: 'Conferencia de Tecnología',
            eventDate: '2025-01-15',
            eventLocation: 'Centro de Convenciones',
            participant: {
                name: 'Ana Rodríguez',
                email: 'ana.rodriguez@email.com',
                phone: '+1 234 567 8900',
                company: 'Tech Solutions Inc.',
                position: 'Desarrolladora Senior',
                experience: '5 años en desarrollo web'
            },
            registrationDate: '2025-01-12',
            status: 'Pendiente',
            motivation: 'Interesada en aprender sobre las últimas tendencias en desarrollo de software y networking con otros profesionales.',
            previousEvents: 3,
            notes: 'Participante activa en eventos anteriores'
        },
        {
            id: 2,
            eventName: 'Workshop de Diseño',
            eventDate: '2025-01-18',
            eventLocation: 'Sala de Talleres',
            participant: {
                name: 'Carlos Mendoza',
                email: 'carlos.mendoza@email.com',
                phone: '+1 234 567 8901',
                company: 'Design Studio',
                position: 'Diseñador UX/UI',
                experience: '3 años en diseño digital'
            },
            registrationDate: '2025-01-13',
            status: 'Aprobada',
            motivation: 'Busco mejorar mis habilidades en diseño UX/UI y conocer nuevas herramientas del mercado.',
            previousEvents: 1,
            notes: 'Primera vez en nuestros eventos'
        },
        {
            id: 3,
            eventName: 'Seminario de Marketing',
            eventDate: '2025-01-20',
            eventLocation: 'Auditorio Principal',
            participant: {
                name: 'Laura Silva',
                email: 'laura.silva@email.com',
                phone: '+1 234 567 8902',
                company: 'Marketing Pro',
                position: 'Especialista en Marketing Digital',
                experience: '4 años en marketing digital'
            },
            registrationDate: '2025-01-14',
            status: 'Rechazada',
            motivation: 'Necesito actualizar mis conocimientos en estrategias de marketing digital para mi empresa.',
            previousEvents: 0,
            notes: 'Capacidad del evento completada'
        },
        {
            id: 4,
            eventName: 'Networking Event',
            eventDate: '2025-01-22',
            eventLocation: 'Hotel Downtown',
            participant: {
                name: 'Diego Torres',
                email: 'diego.torres@email.com',
                phone: '+1 234 567 8903',
                company: 'StartupTech',
                position: 'CEO',
                experience: '7 años en emprendimiento'
            },
            registrationDate: '2025-01-15',
            status: 'Pendiente',
            motivation: 'Busco oportunidades de networking para mi startup y posibles inversores.',
            previousEvents: 2,
            notes: 'CEO de startup emergente'
        },
        {
            id: 5,
            eventName: 'Curso de Programación',
            eventDate: '2025-01-25',
            eventLocation: 'Laboratorio de Computación',
            participant: {
                name: 'María González',
                email: 'maria.gonzalez@email.com',
                phone: '+1 234 567 8904',
                company: 'Freelance',
                position: 'Desarrolladora Frontend',
                experience: '2 años en desarrollo frontend'
            },
            registrationDate: '2025-01-16',
            status: 'Aprobada',
            motivation: 'Quiero mejorar mis habilidades en JavaScript y React para avanzar en mi carrera.',
            previousEvents: 1,
            notes: 'Desarrolladora freelance con potencial'
        },
        {
            id: 6,
            eventName: 'Expo de Innovación',
            eventDate: '2025-01-28',
            eventLocation: 'Centro de Exposiciones',
            participant: {
                name: 'Roberto Pérez',
                email: 'roberto.perez@email.com',
                phone: '+1 234 567 8905',
                company: 'Innovation Labs',
                position: 'CTO',
                experience: '10 años en tecnología'
            },
            registrationDate: '2025-01-17',
            status: 'Pendiente',
            motivation: 'Interesado en presentar nuestro proyecto innovador y conocer otras iniciativas.',
            previousEvents: 4,
            notes: 'CTO con amplia experiencia'
        }
    ];

    const events = ['Conferencia de Tecnología', 'Workshop de Diseño', 'Seminario de Marketing', 'Networking Event', 'Curso de Programación', 'Expo de Innovación'];

    const filteredRegistrations = registrations.filter(registration => {
        const matchesSearch = registration.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            registration.participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            registration.eventName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || registration.status === selectedStatus;
        const matchesEvent = selectedEvent === 'all' || registration.eventName === selectedEvent;
        return matchesSearch && matchesStatus && matchesEvent;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Aprobada':
                return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
            case 'Rechazada':
                return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
            case 'Pendiente':
                return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
            default:
                return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Aprobada':
                return <CheckCircle className="w-4 h-4" />;
            case 'Rechazada':
                return <XCircle className="w-4 h-4" />;
            case 'Pendiente':
                return <Clock className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const handleApprove = (registrationId: number) => {
        console.log('Aprobar inscripción:', registrationId);
        // Aquí iría la lógica para aprobar la inscripción
    };

    const handleReject = (registrationId: number) => {
        console.log('Rechazar inscripción:', registrationId);
        // Aquí iría la lógica para rechazar la inscripción
    };

    const handleViewDetails = (registration: any) => {
        setSelectedRegistration(registration);
        setShowDetailsModal(true);
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
                                <button className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg">
                                    <Download className="w-4 h-4 mr-2" />
                                    <span className="font-medium">Exportar</span>
                                </button>
                                <div className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
                                    <Filter className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="bg-transparent text-gray-700 dark:text-gray-300 text-sm focus:outline-none"
                                    >
                                        <option value="all">Todos los estados</option>
                                        <option value="Pendiente">Pendientes</option>
                                        <option value="Aprobada">Aprobadas</option>
                                        <option value="Rechazada">Rechazadas</option>
                                    </select>
                                </div>
                                <div className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
                                    <CalendarIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                                    <select
                                        value={selectedEvent}
                                        onChange={(e) => setSelectedEvent(e.target.value)}
                                        className="bg-transparent text-gray-700 dark:text-gray-300 text-sm focus:outline-none"
                                    >
                                        <option value="all">Todos los eventos</option>
                                        {events.map(event => (
                                            <option key={event} value={event}>{event}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Registrations Table */}
                    <div className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-black dark:text-white">Solicitudes de Inscripción</h3>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {filteredRegistrations.length} de {registrations.length} inscripciones
                            </div>
                        </div>

                        {/* Table Header */}
                        <div className="grid grid-cols-7 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                            <div>Participante</div>
                            <div>Evento</div>
                            <div>Fecha de Solicitud</div>
                            <div>Estado</div>
                            <div>Experiencia</div>
                            <div>Eventos Anteriores</div>
                            <div>Acciones</div>
                        </div>

                        <div className="space-y-3">
                            {filteredRegistrations.map((registration) => (
                                <div key={registration.id} className="grid grid-cols-7 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-black dark:text-white text-sm">{registration.participant.name}</h4>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">{registration.participant.company}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div>
                                            <p className="text-sm font-medium text-black dark:text-white">{registration.eventName}</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">{registration.eventDate}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                        {registration.registrationDate}
                                    </div>
                                    <div className="flex items-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(registration.status)}`}>
                                            {getStatusIcon(registration.status)}
                                            <span className="ml-1">{registration.status}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                        {registration.participant.experience}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                        {registration.previousEvents} eventos
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button 
                                            onClick={() => handleViewDetails(registration)}
                                            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        {registration.status === 'Pendiente' && (
                                            <>
                                                <button 
                                                    onClick={() => handleApprove(registration.id)}
                                                    className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleReject(registration.id)}
                                                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredRegistrations.length === 0 && (
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
                                        <p className="font-medium text-black dark:text-white">{selectedRegistration.eventName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Fecha:</p>
                                        <p className="font-medium text-black dark:text-white">{selectedRegistration.eventDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Ubicación:</p>
                                        <p className="font-medium text-black dark:text-white">{selectedRegistration.eventLocation}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Fecha de Solicitud:</p>
                                        <p className="font-medium text-black dark:text-white">{selectedRegistration.registrationDate}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Participant Info */}
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                                <h4 className="font-semibold text-black dark:text-white mb-3">Información del Participante</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Nombre:</p>
                                        <p className="font-medium text-black dark:text-white">{selectedRegistration.participant.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Empresa:</p>
                                        <p className="font-medium text-black dark:text-white">{selectedRegistration.participant.company}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Posición:</p>
                                        <p className="font-medium text-black dark:text-white">{selectedRegistration.participant.position}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Experiencia:</p>
                                        <p className="font-medium text-black dark:text-white">{selectedRegistration.participant.experience}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Email:</p>
                                        <p className="font-medium text-black dark:text-white">{selectedRegistration.participant.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Teléfono:</p>
                                        <p className="font-medium text-black dark:text-white">{selectedRegistration.participant.phone}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Motivation */}
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                                <h4 className="font-semibold text-black dark:text-white mb-3">Motivación</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedRegistration.motivation}</p>
                            </div>

                            {/* Notes */}
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                                <h4 className="font-semibold text-black dark:text-white mb-3">Notas</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedRegistration.notes}</p>
                            </div>

                            {/* Actions */}
                            {selectedRegistration.status === 'Pendiente' && (
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => {
                                            handleApprove(selectedRegistration.id);
                                            setShowDetailsModal(false);
                                        }}
                                        className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Aprobar Inscripción
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleReject(selectedRegistration.id);
                                            setShowDetailsModal(false);
                                        }}
                                        className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Rechazar Inscripción
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegistrationsManagement;
