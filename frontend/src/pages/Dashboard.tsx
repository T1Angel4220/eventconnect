"use client"

import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../hooks/useAuth';
import { useSessionExpired } from '../hooks/useSessionExpired';
import SessionExpiredModal from '../components/modals/SessionExpiredModal';
import { getEventTypeLabel } from '../types/event.types';
import ParticipantsChart from '../components/charts/ParticipantsChart';
import { formatDate, formatTime, formatDuration, getEventStatusText, getEventStatusColor } from '../utils/dateUtils';
import jsPDF from 'jspdf';
import { useNotifications } from '../hooks/useNotifications';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { toggleTheme, isDark } = useTheme();
    const { checkAuth, logout } = useAuth();
    const { showSessionExpiredModal, goToLogin } = useSessionExpired();
    const { showSuccess, showError } = useNotifications();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedChart, setSelectedChart] = useState<'participants' | 'categories' | null>(null);
    const [filterOptions, setFilterOptions] = useState({
        dateRange: 'all',
        category: 'all',
        status: 'all'
    });
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const role = localStorage.getItem('role');
    const firstName = localStorage.getItem('firstName');
    const profileImage = localStorage.getItem('profileImage');
    
    // Hook para datos del dashboard
    const {
        stats,
        recentEvents,
        topUsers,
        eventCategories,
        participantsData,
        loading,
        error,
        refreshData
    } = useDashboard();

    // Verificar autenticación al cargar
    useEffect(() => {
        if (!checkAuth()) {
            return;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Solo ejecutar una vez al montar

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        logout();
        setShowLogoutModal(false);
    };

    const handleNavigateToEvents = () => {
        navigate('/events-management');
    };

    const handleNavigateToRegistrations = () => {
        navigate('/registrations-management');
    };

    const handleNavigateToConfiguration = () => {
        navigate('/configuration');
    };

    // Funciones para acciones rápidas
    const handleCreateEvent = () => {
        navigate('/events-management');
    };

    const handleInviteUsers = () => {
        navigate('/registrations-management');
    };

    const handleViewReports = () => {
        // Por ahora mostrar las estadísticas del dashboard (scroll hacia abajo)
        const statsSection = document.getElementById('stats-section');
        if (statsSection) {
            statsSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Funciones para modales
    const handleViewDetails = (chartType: 'participants' | 'categories') => {
        setSelectedChart(chartType);
        setShowDetailsModal(true);
    };

    const handleOpenFilter = () => {
        setShowFilterModal(true);
    };

    const handleCloseModals = () => {
        setShowDetailsModal(false);
        setShowFilterModal(false);
        setSelectedChart(null);
    };

    const handleApplyFilter = () => {
        // Aquí aplicarías los filtros a los datos
        console.log('Aplicando filtros:', filterOptions);
        setShowFilterModal(false);
    };

    // Función para exportar eventos a PDF desde el Dashboard
    const exportEventsToPDF = () => {
        try {
            const doc = new jsPDF('landscape');
            
            // === ENCABEZADO PRINCIPAL ===
            doc.setFillColor(30, 64, 175);
            doc.rect(0, 0, doc.internal.pageSize.width, 60, 'F');
            
            // Logo/Ícono
            doc.setFillColor(255, 255, 255);
            doc.circle(35, 30, 18, 'F');
            doc.setDrawColor(30, 64, 175);
            doc.setLineWidth(2);
            doc.circle(35, 30, 18, 'S');
            doc.setTextColor(30, 64, 175);
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('EC', 28, 35);
            
            // Título principal
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(28);
            doc.setFont('helvetica', 'bold');
            doc.text('REPORTE DE EVENTOS - DASHBOARD', 70, 25);
            
            // Subtítulo
            doc.setFontSize(16);
            doc.setFont('helvetica', 'normal');
            doc.text('EventConnect - Resumen Ejecutivo', 70, 35);
            
            // Fecha y hora
            doc.setFontSize(12);
            const now = new Date();
            doc.text(`Generado el: ${now.toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })} a las ${now.toLocaleTimeString('es-ES')}`, 70, 45);
            
            // === RESUMEN ESTADÍSTICO ===
            let yPosition = 80;
            
            // Fondo para resumen
            doc.setFillColor(249, 250, 251);
            doc.rect(25, yPosition, doc.internal.pageSize.width - 50, 35, 'F');
            doc.setDrawColor(209, 213, 219);
            doc.setLineWidth(1);
            doc.rect(25, yPosition, doc.internal.pageSize.width - 50, 35, 'S');
            
            // Título del resumen
            doc.setTextColor(30, 64, 175);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('RESUMEN ESTADISTICO', 35, yPosition + 12);
            
            // Estadísticas usando los datos del dashboard
            const totalEvents = recentEvents.length;
            const upcomingEvents = recentEvents.filter(e => getEventStatusText(e.event_date, e.duration) === 'Próximo').length;
            const inProgressEvents = recentEvents.filter(e => getEventStatusText(e.event_date, e.duration) === 'En Progreso').length;
            const completedEvents = recentEvents.filter(e => getEventStatusText(e.event_date, e.duration) === 'Finalizado').length;
            
            // Crear tarjetas de estadísticas
            const statsCards = [
                { label: 'Total Eventos', value: totalEvents, color: [30, 64, 175] },
                { label: 'Próximos', value: upcomingEvents, color: [34, 197, 94] },
                { label: 'En Progreso', value: inProgressEvents, color: [251, 146, 60] },
                { label: 'Finalizados', value: completedEvents, color: [107, 114, 128] }
            ];
            
            const cardWidth = (doc.internal.pageSize.width - 100) / 4;
            statsCards.forEach((card, index) => {
                const cardX = 35 + (index * cardWidth);
                const cardY = yPosition + 18;
                
                // Fondo de la tarjeta
                doc.setFillColor(card.color[0], card.color[1], card.color[2]);
                doc.rect(cardX, cardY, cardWidth - 10, 12, 'F');
                
                // Texto de la tarjeta
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text(card.value.toString(), cardX + 5, cardY + 7);
                
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.text(card.label, cardX + 5, cardY + 10);
            });
            
            yPosition += 50;
            
            // === TABLA DE EVENTOS RECIENTES ===
            if (recentEvents.length > 0) {
                doc.addPage('landscape');
                yPosition = 30;
                
                const tableStartY = yPosition;
                const pageWidth = doc.internal.pageSize.width;
                const margin = 20;
                const cellHeight = 12;
                const totalTableWidth = pageWidth - (margin * 2);
                
                // Anchos de columna
                const colWidths = [
                    totalTableWidth * 0.25, // Evento
                    totalTableWidth * 0.12, // Fecha
                    totalTableWidth * 0.10, // Hora
                    totalTableWidth * 0.10, // Duración
                    totalTableWidth * 0.15, // Organizador
                    totalTableWidth * 0.10, // Participantes
                    totalTableWidth * 0.10, // Estado
                    totalTableWidth * 0.08  // Categoría
                ];
                
                const colPositions = [margin];
                for (let i = 1; i < colWidths.length; i++) {
                    colPositions.push(colPositions[i-1] + colWidths[i-1]);
                }
                
                // Encabezados de la tabla
                doc.setFillColor(30, 64, 175);
                doc.rect(margin, tableStartY, totalTableWidth, cellHeight, 'F');
                
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                
                const headers = ['EVENTO', 'FECHA', 'HORA', 'DURACION', 'ORGANIZADOR', 'PARTICIPANTES', 'ESTADO', 'CATEGORIA'];
                headers.forEach((header, index) => {
                    const textWidth = doc.getTextWidth(header);
                    const centerX = colPositions[index] + (colWidths[index] / 2) - (textWidth / 2);
                    doc.text(header, centerX, tableStartY + 8);
                });
                
                yPosition = tableStartY + cellHeight;
                
                // Datos de la tabla
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                
                recentEvents.forEach((event, index) => {
                    // Alternar colores de fila
                    if (index % 2 === 0) {
                        doc.setFillColor(248, 250, 252);
                        doc.rect(margin, yPosition, totalTableWidth, cellHeight, 'F');
                    }
                    
                    const eventData = [
                        event.title,
                        formatDate(event.event_date),
                        formatTime(event.event_date),
                        formatDuration(event.duration),
                        event.organizer_name || 'N/A',
                        `${event.registered_count}/${event.capacity}`,
                        getEventStatusText(event.event_date, event.duration),
                        getEventTypeLabel(event.event_type)
                    ];
                    
                    eventData.forEach((data, colIndex) => {
                        doc.setTextColor(0, 0, 0);
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(9);
                        
                        const displayText = data.toString();
                        const maxWidth = colWidths[colIndex] - 8;
                        
                        // Truncar texto si es muy largo
                        let truncatedText = displayText;
                        if (doc.getTextWidth(displayText) > maxWidth) {
                            truncatedText = displayText.substring(0, Math.floor(maxWidth / 3)) + '...';
                        }
                        
                        doc.text(truncatedText, colPositions[colIndex] + 4, yPosition + 8);
                    });
                    
                    yPosition += cellHeight;
                });
            }
            
            // === PIE DE PÁGINA ===
            const pageHeight = doc.internal.pageSize.height;
            doc.setFillColor(30, 64, 175);
            doc.rect(0, pageHeight - 30, doc.internal.pageSize.width, 30, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('EventConnect - Sistema de Gestión de Eventos Universitarios', 20, pageHeight - 15);
            doc.text(`Página ${doc.getCurrentPageInfo().pageNumber}`, doc.internal.pageSize.width - 40, pageHeight - 15);
            
            // Guardar el PDF
            const fileName = `reporte-eventos-dashboard-${now.toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            
            showSuccess(
                'Exportación exitosa',
                `Se ha generado el PDF con ${recentEvents.length} eventos del dashboard.`
            );
            
        } catch (error) {
            console.error('Error generando PDF:', error);
            showError(
                'Error generando PDF',
                'No se pudo generar el reporte. Inténtalo nuevamente.'
            );
        }
    };


    const menuItems = [
        { icon: Home, label: 'Dashboard', active: true, onClick: () => {} },
        { icon: Calendar, label: 'Eventos', active: false, onClick: handleNavigateToEvents },
        { icon: Users, label: 'Inscripciones', active: false, onClick: handleNavigateToRegistrations },
        { icon: Settings, label: 'Configuración', active: false, onClick: handleNavigateToConfiguration },
    ];

    // Función para formatear el cambio
    const formatChange = (growth: number) => {
        if (growth > 0) {
            return `+${growth}%`;
        } else if (growth < 0) {
            return `${growth}%`;
        } else {
            return '0%';
        }
    };

    // Función para determinar el tipo de cambio
    const getChangeType = (growth: number) => {
        if (growth > 0) return 'positive';
        if (growth < 0) return 'negative';
        return 'neutral';
    };

    // Generar tarjetas de estadísticas dinámicamente
    const statsCards = stats ? [
        {
            title: 'Total Eventos',
            value: stats.total_events.toString(),
            change: formatChange(stats.growth.events_growth),
            changeType: getChangeType(stats.growth.events_growth),
            icon: CalendarIcon,
            color: 'bg-gradient-to-br from-purple-500 to-purple-600',
            iconColor: 'text-purple-100'
        },
        {
            title: 'Participantes Totales',
            value: stats.total_participants.toLocaleString(),
            change: formatChange(stats.growth.participants_growth),
            changeType: getChangeType(stats.growth.participants_growth),
            icon: Users,
            color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
            iconColor: 'text-indigo-100'
        },
        {
            title: 'Eventos Activos',
            value: stats.active_events.toString(),
            change: formatChange(stats.growth.active_events_growth),
            changeType: getChangeType(stats.growth.active_events_growth),
            icon: Activity,
            color: 'bg-gradient-to-br from-purple-600 to-purple-700',
            iconColor: 'text-purple-100'
        },
        {
            title: 'Eventos Próximos',
            value: stats.upcoming_events.toString(),
            change: formatChange(stats.growth.upcoming_events_growth),
            changeType: getChangeType(stats.growth.upcoming_events_growth),
            icon: Calendar,
            color: 'bg-gradient-to-br from-indigo-600 to-indigo-700',
            iconColor: 'text-indigo-100'
        }
    ] : [];



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
                                <button 
                                    onClick={handleCreateEvent}
                                    className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
                                >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span className="font-medium">Crear Evento</span>
                                </button>
                                <button 
                                    onClick={handleInviteUsers}
                                    className="flex items-center px-4 py-2 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-xl hover:from-violet-600 hover:to-violet-700 transition-all duration-200 shadow-lg"
                                >
                                    <Users className="w-4 h-4 mr-2" />
                                    <span className="font-medium">Invitar Usuarios</span>
                                </button>
                                <button 
                                    onClick={handleViewReports}
                                    className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
                                >
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    <span className="font-medium">Ver Reportes</span>
                                </button>
                                <button 
                                    onClick={handleNavigateToConfiguration}
                                    className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                                >
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
                        <p className="text-gray-600 dark:text-gray-300">
                            Aquí tienes un resumen de tu actividad reciente en EventConnect.
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {statsCards.map((stat, index) => (
                            <div key={index} className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{stat.title}</p>
                                        <p className="text-2xl font-bold text-black dark:text-gray-100 mb-1">{stat.value}</p>
                                        <p className={`text-xs font-medium ${
                                            stat.changeType === 'positive' 
                                                ? 'text-green-600 dark:text-green-300' 
                                                : stat.changeType === 'negative'
                                                ? 'text-red-600 dark:text-red-300'
                                                : 'text-gray-600 dark:text-gray-300'
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
                                        <button 
                                            onClick={handleNavigateToEvents}
                                            className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Nuevo Evento
                                        </button>
                                        <button 
                                            onClick={exportEventsToPDF}
                                            className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Exportar
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Table Header */}
                                <div className="grid grid-cols-8 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-4 font-semibold text-sm text-gray-700 dark:text-gray-200">
                                    <div>Evento</div>
                                    <div>Fecha</div>
                                    <div>Participantes</div>
                                    <div>Capacidad</div>
                                    <div>Organizador</div>
                                    <div>Hora</div>
                                    <div>Duración</div>
                                    <div>Estado</div>
                                </div>
                                
                                <div className="space-y-3">
                                    {recentEvents.length > 0 ? recentEvents.map((event) => {
                                        const statusText = getEventStatusText(event.event_date, event.duration);
                                        const statusColor = getEventStatusColor(event.event_date, event.duration);
                                        return (
                                            <div key={event.event_id} className="grid grid-cols-8 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                                                <div className="flex items-center">
                                                    <div>
                                                        <h4 className="font-semibold text-black dark:text-white text-sm">{event.title}</h4>
                                                        <p className="text-xs text-gray-600 dark:text-gray-300">{getEventTypeLabel(event.event_type)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-700 dark:text-gray-200">
                                                    {formatDate(event.event_date)}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-700 dark:text-gray-200">
                                                    {event.registered_count}
                                                </div>
                                                <div className="flex items-center text-sm font-semibold text-purple-600 dark:text-purple-300">
                                                    {event.capacity}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-700 dark:text-gray-200">
                                                    {event.organizer_name}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-700 dark:text-gray-200">
                                                    {formatTime(event.event_date)}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-700 dark:text-gray-200">
                                                    {formatDuration(event.duration)}
                                                </div>
                                                <div className="flex items-center">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                                                        {statusText}
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
                    <div id="stats-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        {/* Participants Chart */}
                        <div className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-2xl p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-black dark:text-white">Participantes por Mes</h3>
                                <button 
                                    className="flex items-center px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-sm hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
                                    onClick={() => handleViewDetails('participants')}
                                >
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Ver Detalles
                                </button>
                            </div>
                            <div className="h-64">
                                <ParticipantsChart 
                                    data={participantsData} 
                                    loading={loading}
                                />
                            </div>
                        </div>

                        {/* Event Categories */}
                        <div className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-2xl p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-black dark:text-white">Categorías de Eventos</h3>
                                <button 
                                    className="flex items-center px-3 py-1 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-lg text-sm hover:from-violet-600 hover:to-violet-700 transition-all duration-200"
                                    onClick={() => handleViewDetails('categories')}
                                >
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Ver Detalles
                                </button>
                                <button 
                                    className="flex items-center px-3 py-1 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-lg text-sm hover:from-violet-600 hover:to-violet-700 transition-all duration-200"
                                    onClick={handleOpenFilter}
                                >
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

            {/* Modal de Ver Detalles */}
            {showDetailsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-2xl mx-2 shadow-2xl transform transition-all duration-300 my-2 max-h-[90vh] overflow-y-auto">
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-gray-600 dark:bg-gray-300 rounded-lg flex items-center justify-center shadow-md">
                                        <BarChart3 className="w-5 h-5 text-white dark:text-gray-800" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            {selectedChart === 'participants' ? 'Detalles de Participantes' : 'Detalles de Categorías'}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Información detallada de las estadísticas
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCloseModals}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-4 space-y-4">
                            {selectedChart === 'participants' ? (
                                <div className="space-y-4">
                                    <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm shadow-lg">
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Participantes por Mes</h4>
                                        <div className="h-64">
                                            <ParticipantsChart 
                                                data={participantsData} 
                                                loading={loading}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                                            <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Total Participantes</h5>
                                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                                                {participantsData.reduce((sum, item) => sum + item.participants, 0).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                                            <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Promedio Mensual</h5>
                                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                                                {participantsData.length > 0 ? Math.round(participantsData.reduce((sum, item) => sum + item.participants, 0) / participantsData.length).toLocaleString() : 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-gradient-to-r from-green-50/80 via-emerald-50/80 to-teal-50/80 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-green-200/50 dark:border-green-700/50 backdrop-blur-sm shadow-lg">
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Distribución por Categorías</h4>
                                        <div className="space-y-3">
                                            {eventCategories.map((item, index) => {
                                                const colors = [
                                                    'from-purple-500 to-purple-600',
                                                    'from-violet-500 to-violet-600',
                                                    'from-indigo-500 to-indigo-600',
                                                    'from-purple-600 to-purple-700',
                                                    'from-violet-600 to-violet-700'
                                                ];
                                                const color = colors[index % colors.length];
                                                
                                                return (
                                                    <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
                                                        <div className="flex items-center">
                                                            <div className={`w-4 h-4 bg-gradient-to-r ${color} rounded-full mr-3`}></div>
                                                            <span className="font-medium text-gray-900 dark:text-gray-100">{item.category}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{item.count.toLocaleString()} eventos</div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-300">{item.percentage}%</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                                            <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Total Eventos</h5>
                                            <p className="text-2xl font-bold text-green-600 dark:text-green-300">
                                                {eventCategories.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                                            <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Categoría Principal</h5>
                                            <p className="text-lg font-bold text-purple-600 dark:text-purple-300">
                                                {eventCategories.length > 0 ? eventCategories[0].category : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end px-4 py-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 rounded-b-2xl">
                            <button
                                onClick={handleCloseModals}
                                className="px-6 py-2 text-sm font-medium text-white dark:text-gray-800 bg-gray-700 dark:bg-gray-300 hover:bg-gray-800 dark:hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Filtrar */}
            {showFilterModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-md mx-2 shadow-2xl transform transition-all duration-300 my-2">
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-gray-600 dark:bg-gray-300 rounded-lg flex items-center justify-center shadow-md">
                                        <Filter className="w-5 h-5 text-white dark:text-gray-800" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            Filtrar Estadísticas
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Configura las opciones de filtrado
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCloseModals}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Rango de Fechas
                                </label>
                                <select
                                    value={filterOptions.dateRange}
                                    onChange={(e) => setFilterOptions(prev => ({ ...prev, dateRange: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="all">Todos los períodos</option>
                                    <option value="last7days">Últimos 7 días</option>
                                    <option value="last30days">Últimos 30 días</option>
                                    <option value="last3months">Últimos 3 meses</option>
                                    <option value="last6months">Últimos 6 meses</option>
                                    <option value="thisYear">Este año</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Categoría de Evento
                                </label>
                                <select
                                    value={filterOptions.category}
                                    onChange={(e) => setFilterOptions(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="all">Todas las categorías</option>
                                    <option value="academic">Académico</option>
                                    <option value="cultural">Cultural</option>
                                    <option value="sports">Deportes</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Estado del Evento
                                </label>
                                <select
                                    value={filterOptions.status}
                                    onChange={(e) => setFilterOptions(prev => ({ ...prev, status: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="all">Todos los estados</option>
                                    <option value="upcoming">Próximos</option>
                                    <option value="in_progress">En Progreso</option>
                                    <option value="completed">Finalizados</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 px-4 py-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 rounded-b-2xl">
                            <button
                                onClick={handleCloseModals}
                                className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleApplyFilter}
                                className="px-6 py-2 text-sm font-medium text-white dark:text-gray-800 bg-gray-700 dark:bg-gray-300 hover:bg-gray-800 dark:hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Aplicar Filtros
                            </button>
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

            {/* Modal de Sesión Expirada */}
            <SessionExpiredModal 
                isOpen={showSessionExpiredModal}
                onClose={goToLogin}
            />
        </div>
    );
};

export default Dashboard;