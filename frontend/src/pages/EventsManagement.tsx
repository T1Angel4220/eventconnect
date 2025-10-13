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
import { useSessionExpired } from '../hooks/useSessionExpired';
import SessionExpiredModal from '../components/modals/SessionExpiredModal';
import { createEvent as apiCreateEvent, deleteEvent as apiDeleteEvent, fetchEvents as apiFetchEvents, fetchEventsByOrganizer as apiFetchEventsByOrganizer, updateEvent as apiUpdateEvent, updateEventStatuses as apiUpdateEventStatuses } from '../services/eventsService';
import type { EventResponse } from '../services/eventsService';
import Notification from '../components/ui/Notification';
import ConfirmModal from '../components/ui/ConfirmModal';
import jsPDF from 'jspdf';
import '../components/ui/CustomSelect.css';

// Interfaces para tipado fuerte
interface EventData {
    event_id: number;
    title: string;
    event_date: string;
    duration: number;
    location?: string;
    event_type: 'academico' | 'cultural' | 'deportivo';
    capacity: number;
    attendees?: number;
    event_image: string;
    description?: string;
    organizer_name?: string;
    organizer_email?: string;
    registered_count?: number;
    [key: string]: unknown;
}

interface UIEvent {
    id: number;
    name: string;
    date: string;
    time: string;
    duration: number;
    location: string;
    attendees: number;
    capacity: number;
    status: string;
    category: string;
    organizer: string;
    description: string;
    event_image: string;
    createdAt: string;
    raw: EventData;
}

const EventsManagement: React.FC = () => {
    const navigate = useNavigate();
    const { toggleTheme, isDark } = useTheme();
    const { notifications, removeNotification, showSuccess, showError, showWarning } = useNotifications();
    const { showSessionExpiredModal, goToLogin } = useSessionExpired();
    
    // Función helper para construir URLs de imágenes
    const getImageUrl = (imagePath: string): string => {
        if (!imagePath) {
            console.log("🖼️ No hay imagen, usando por defecto");
            return 'http://localhost:3001/uploads/events/default-event.jpg';
        }
        if (imagePath.startsWith('http')) {
            console.log("🖼️ URL completa:", imagePath);
            return imagePath;
        }
        const fullUrl = `http://localhost:3001${imagePath}`;
        console.log("🖼️ Construyendo URL:", imagePath, "->", fullUrl);
        return fullUrl;
    };
    
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState<{event_id: number; title: string; event_image: string} | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<UIEvent | null>(null);
    const [newEvent, setNewEvent] = useState({
        name: '',
        date: '',
        time: '',
        duration: '',
        location: '',
        capacity: '',
        category: '',
        description: '',
        image: null as File | null
    });
    const [existingEventImage, setExistingEventImage] = useState<string>('');
    const [newImagePreview, setNewImagePreview] = useState<string>('');
    const role = localStorage.getItem('role');
    const firstName = localStorage.getItem('firstName');
    const profileImage = localStorage.getItem('profileImage');
    const userId = localStorage.getItem('userId');
    const [events, setEvents] = useState<EventData[]>([]);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<{event_id: number; title: string} | null>(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
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

    // Función auxiliar para verificar si hay espacio suficiente para una fila de tabla
    const checkTableRowSpace = (doc: jsPDF, currentY: number, cellHeight: number = 12) => {
        const pageHeight = doc.internal.pageSize.height;
        const footerSpace = 100; // Espacio aumentado para pie de página
        const availableSpace = pageHeight - currentY - footerSpace;
        
        if (availableSpace < cellHeight + 5) { // 5px de margen adicional
            doc.addPage('landscape');
            return 20; // Nueva posición Y para encabezados
        }
        return currentY;
    };

    // Función auxiliar para dibujar encabezados de tabla en nueva página
    const drawTableHeaders = (doc: jsPDF, yPosition: number, margin: number, totalTableWidth: number, cellHeight: number, headers: string[], colPositions: number[], colWidths: number[]) => {
        // Encabezados de la tabla
        doc.setFillColor(30, 64, 175);
        doc.rect(margin, yPosition, totalTableWidth, cellHeight, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        
        headers.forEach((header, index) => {
            // Centrar texto en cada columna
            const textWidth = doc.getTextWidth(header);
            const centerX = colPositions[index] + (colWidths[index] / 2) - (textWidth / 2);
            doc.text(header, centerX, yPosition + 8);
        });
        
        return yPosition + cellHeight;
    };

    // Función auxiliar para truncar texto que exceda el ancho de columna
    const truncateText = (doc: jsPDF, text: string, maxWidth: number, fontSize: number = 9) => {
        doc.setFontSize(fontSize);
        const textWidth = doc.getTextWidth(text);
        
        if (textWidth <= maxWidth) {
            return text;
        }
        
        // Truncar texto agregando "..." al final
        let truncatedText = text;
        while (doc.getTextWidth(truncatedText + '...') > maxWidth && truncatedText.length > 0) {
            truncatedText = truncatedText.slice(0, -1);
        }
        
        return truncatedText + '...';
    };

    // Función auxiliar para verificar si el contenido se superpone con el pie de página
    const ensureFooterSpace = (doc: jsPDF, currentY: number, contentHeight: number) => {
        const pageHeight = doc.internal.pageSize.height;
        const footerSpace = 100; // Espacio aumentado para pie de página
        const availableSpace = pageHeight - currentY - footerSpace;
        
        if (availableSpace < contentHeight) {
            doc.addPage('landscape');
            return 30; // Nueva posición Y
        }
        
        return currentY;
    };

    // Función para exportar eventos a PDF
    const exportToPDF = () => {
        try {
            // Definir filteredEvents dentro de la función para evitar errores de scope
            const filteredEvents = uiEvents.filter(event => {
                const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    event.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    event.location.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
                
                return matchesSearch && matchesCategory;
            });
            const doc = new jsPDF('landscape');
            
            // === ENCABEZADO PRINCIPAL MEJORADO ===
            // Fondo del encabezado con gradiente simulado
            doc.setFillColor(30, 64, 175); // Azul más oscuro
            doc.rect(0, 0, doc.internal.pageSize.width, 60, 'F');
            
            // Logo/Ícono mejorado
            doc.setFillColor(255, 255, 255);
            doc.circle(35, 30, 18, 'F');
            doc.setDrawColor(30, 64, 175);
            doc.setLineWidth(2);
            doc.circle(35, 30, 18, 'S');
            doc.setTextColor(30, 64, 175);
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('EC', 28, 35);
            
            // Título principal con sombra
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(28);
            doc.setFont('helvetica', 'bold');
            doc.text('REPORTE DE EVENTOS', 70, 25);
            
            // Subtítulo
            doc.setFontSize(16);
            doc.setFont('helvetica', 'normal');
            doc.text('EventConnect - Sistema de Gestión de Eventos', 70, 35);
            
            // Fecha y hora con mejor formato
            doc.setFontSize(12);
            const now = new Date();
            doc.text(`Generado el: ${now.toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })} a las ${now.toLocaleTimeString('es-ES')}`, 70, 45);
            
            // === SECCIÓN DE RESUMEN MEJORADA ===
            let yPosition = 80;
            
            // Fondo para resumen con bordes redondeados simulados
            doc.setFillColor(249, 250, 251);
            doc.rect(25, yPosition, doc.internal.pageSize.width - 50, 35, 'F');
            doc.setDrawColor(209, 213, 219);
            doc.setLineWidth(1);
            doc.rect(25, yPosition, doc.internal.pageSize.width - 50, 35, 'S');
            
            // Título del resumen
            doc.setTextColor(30, 64, 175);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('RESUMEN ESTADÍSTICO', 35, yPosition + 12);
            
            // Estadísticas mejoradas
            const totalEvents = filteredEvents.length;
            const upcomingEvents = filteredEvents.filter(e => e.status === 'Próximo').length;
            const inProgressEvents = filteredEvents.filter(e => e.status === 'En Progreso').length;
            const completedEvents = filteredEvents.filter(e => e.status === 'Finalizado').length;
            
            // Crear tarjetas de estadísticas
            const statsCards = [
                { label: 'Total de Eventos', value: totalEvents, color: [30, 64, 175] },
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
            
            // Iniciar la tabla en una nueva página para mejor presentación
            doc.addPage('landscape');
            yPosition = 30; // Resetear yPosition para la nueva página
            
            // === TABLA DE EVENTOS MEJORADA ===
            const tableStartY = yPosition;
            const pageWidth = doc.internal.pageSize.width;
            const margin = 20;
            const cellHeight = 12;
            const totalTableWidth = pageWidth - (margin * 2);
            
            // Anchos de columna optimizados para mejor distribución
            const colWidths = [
                totalTableWidth * 0.20, // Evento (20%) - Reducido para dar espacio a Participantes
                totalTableWidth * 0.10, // Fecha (10%)
                totalTableWidth * 0.08, // Hora (8%)
                totalTableWidth * 0.08, // Duración (8%)
                totalTableWidth * 0.18, // Ubicación (18%)
                totalTableWidth * 0.12, // Categoría (12%)
                totalTableWidth * 0.12, // Estado (12%)
                totalTableWidth * 0.12  // Participantes (12%) - Aumentado para evitar truncamiento
            ];
            
            const colPositions = [margin];
            for (let i = 1; i < colWidths.length; i++) {
                colPositions.push(colPositions[i-1] + colWidths[i-1]);
            }
            
            // Encabezados de la tabla mejorados
            doc.setFillColor(30, 64, 175);
            doc.rect(margin, tableStartY, totalTableWidth, cellHeight, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            
            const headers = ['EVENTO', 'FECHA', 'HORA', 'DURACIÓN', 'UBICACIÓN', 'CATEGORÍA', 'ESTADO', 'PARTICIPANTES'];
            headers.forEach((header, index) => {
                // Centrar texto en cada columna
                const textWidth = doc.getTextWidth(header);
                const centerX = colPositions[index] + (colWidths[index] / 2) - (textWidth / 2);
                doc.text(header, centerX, tableStartY + 8);
            });
            
            yPosition = tableStartY + cellHeight;
            
            // Datos de la tabla mejorados
            doc.setTextColor(0, 0, 0); // Negro sólido para asegurar visibilidad
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            
            console.log('Total de eventos a procesar:', filteredEvents.length);
            
            filteredEvents.forEach((event, index) => {
                console.log(`Procesando evento ${index + 1}:`, event.name);
                
                // Verificar espacio para la fila actual usando la función mejorada
                yPosition = checkTableRowSpace(doc, yPosition, cellHeight);
                
                // Si se creó una nueva página, redibujar encabezados
                if (yPosition === 20) {
                    console.log('Redibujando encabezados en nueva página...');
                    yPosition = drawTableHeaders(doc, yPosition, margin, totalTableWidth, cellHeight, headers, colPositions, colWidths);
                }
                
                // Alternar colores de fila para mejor legibilidad
                if (index % 2 === 0) {
                    doc.setFillColor(248, 250, 252);
                    doc.rect(margin, yPosition, totalTableWidth, cellHeight, 'F');
                } else {
                    doc.setFillColor(255, 255, 255);
                    doc.rect(margin, yPosition, totalTableWidth, cellHeight, 'F');
                }
                
                // Datos del evento con truncamiento inteligente
                const eventData = [
                    event.name,
                    event.date,
                    event.time,
                    event.duration + ' min',
                    event.location || 'No especificada',
                    event.category,
                    event.status,
                    event.attendees + '/' + event.capacity
                ];
                
                // Asegurar que el texto sea negro y visible en cada celda
                    doc.setTextColor(0, 0, 0);
                eventData.forEach((data, colIndex) => {
                    // Forzar color negro en cada celda para máxima visibilidad
                    doc.setTextColor(0, 0, 0);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9);
                    
                    const displayText = data.toString();
                    const maxWidth = colWidths[colIndex] - 8; // 8px de margen interno
                    
                    // Truncar texto si excede el ancho de columna
                    const truncatedText = truncateText(doc, displayText, maxWidth, 9);
                    
                    // Alinear a la izquierda para mejor legibilidad
                    doc.text(truncatedText, colPositions[colIndex] + 4, yPosition + 8);
                });
                
                yPosition += cellHeight;
                console.log(`Evento ${index + 1} procesado. Nueva posicion Y: ${yPosition}`);
            });
            
            // === GRÁFICOS ESTADÍSTICOS ===
            // Agregar página de gráficos después de la tabla
            doc.addPage('landscape');
            yPosition = 30;
            
            // Título de la sección de gráficos
            doc.setTextColor(30, 64, 175);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('ANÁLISIS ESTADÍSTICO DETALLADO', 35, yPosition);
            
            yPosition += 30;
            
            // Gráfico de barras - Eventos por categoría
            const categoryStats = filteredEvents.reduce((acc, event) => {
                acc[event.category] = (acc[event.category] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            const categories = Object.keys(categoryStats);
            const categoryValues = Object.values(categoryStats);
            const maxCategoryValue = Math.max(...categoryValues);
            
            doc.setTextColor(40, 40, 40);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Eventos por Categoría', 35, yPosition);
            
            const chartStartX = 35;
            const chartStartY = yPosition + 10;
            const chartWidth = 200;
            const chartHeight = 80;
            const barWidth = chartWidth / categories.length;
            
            // Dibujar ejes
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.5);
            doc.line(chartStartX, chartStartY, chartStartX + chartWidth, chartStartY);
            doc.line(chartStartX, chartStartY, chartStartX, chartStartY + chartHeight);
            
            // Colores para las barras
            const barColors = [
                [59, 130, 246],   // Azul
                [34, 197, 94],    // Verde
                [251, 146, 60],  // Naranja
                [168, 85, 247],  // Púrpura
                [236, 72, 153],  // Rosa
                [14, 165, 233]   // Cian
            ];
            
            categories.forEach((category, index) => {
                const barHeight = (categoryValues[index] / maxCategoryValue) * chartHeight;
                const barX = chartStartX + (index * barWidth) + 5;
                const barY = chartStartY + chartHeight - barHeight;
                
                // Dibujar barra
                doc.setFillColor(barColors[index % barColors.length][0], 
                                barColors[index % barColors.length][1], 
                                barColors[index % barColors.length][2]);
                doc.rect(barX, barY, barWidth - 10, barHeight, 'F');
                
                // Etiqueta de la categoría
                doc.setTextColor(40, 40, 40);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.text(category, barX + (barWidth - 10) / 2 - doc.getTextWidth(category) / 2, chartStartY + chartHeight + 5);
                
                // Valor numérico
                doc.text(categoryValues[index].toString(), barX + (barWidth - 10) / 2 - doc.getTextWidth(categoryValues[index].toString()) / 2, barY - 5);
            });
            
            yPosition += 110;
            
            // Gráfico circular - Distribución por estado
            const statusStats = {
                'Próximo': filteredEvents.filter(e => e.status === 'Próximo').length,
                'En Progreso': filteredEvents.filter(e => e.status === 'En Progreso').length,
                'Finalizado': filteredEvents.filter(e => e.status === 'Finalizado').length
            };
            
            // Variables movidas a la nueva página
            const statusColors = [
                [34, 197, 94],   // Verde para Próximo
                [251, 146, 60],  // Naranja para En Progreso
                [107, 114, 128]  // Gris para Finalizado
            ];
            
            const statusLabels = Object.keys(statusStats);
            const statusValues = Object.values(statusStats);
            
            // === GRÁFICO CIRCULAR ===
            // Crear nueva página para el gráfico circular
            doc.addPage('landscape');
            yPosition = 30;
            
            // Título del gráfico circular (solo una vez, con ortografía correcta)
            doc.setTextColor(40, 40, 40);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Distribución por Estado', 35, yPosition);
            
            yPosition += 30;
            
            // === GRÁFICO CIRCULAR MEJORADO Y PROFESIONAL ===
            const pieChartX = 80;
            const pieChartY = yPosition + 10;
            const pieRadius = 35; // Más reducido para asegurar espacio del pie de página
            
            const centerX = pieChartX + pieRadius;
            const centerY = pieChartY + pieRadius;
            
            console.log('Dibujando grafico circular mejorado:', centerX, centerY);
            console.log('Datos del grafico:', statusStats);
            
            // === FONDO DEL GRÁFICO CON SOMBRA ===
            // Sombra sutil
            doc.setFillColor(220, 220, 220);
            doc.circle(centerX + 2, centerY + 2, pieRadius + 2, 'F');
            
            // Fondo principal
            doc.setFillColor(248, 250, 252);
            doc.circle(centerX, centerY, pieRadius + 2, 'F');
            
            // Borde elegante
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(2);
            doc.circle(centerX, centerY, pieRadius + 2, 'S');
            
            // === DIBUJAR SECTORES DEL GRÁFICO ===
            const total = statusValues.reduce((sum, val) => sum + val, 0);
            let currentAngle = -90; // Empezar desde arriba
            
            statusLabels.forEach((status, index) => {
                if (statusValues[index] > 0) {
                    const sliceAngle = (statusValues[index] / total) * 360;
                    
                    console.log(`Dibujando sector ${status}:`, statusValues[index], 'angulo:', sliceAngle);
                    
                    // === DIBUJAR SECTOR CON GRADIENTE SIMULADO ===
                    const startAngle = currentAngle;
                    const endAngle = currentAngle + sliceAngle;
                    
                    // Color base del sector
                    const baseColor = statusColors[index];
                    
                    // Dibujar sector con múltiples arcos para simular gradiente
                    for (let radius = pieRadius; radius > 0; radius -= 3) {
                        const alpha = (pieRadius - radius) / pieRadius;
                        const r = Math.floor(baseColor[0] + (255 - baseColor[0]) * alpha);
                        const g = Math.floor(baseColor[1] + (255 - baseColor[1]) * alpha);
                        const b = Math.floor(baseColor[2] + (255 - baseColor[2]) * alpha);
                        
                        doc.setFillColor(r, g, b);
                        
                        // Dibujar arco del sector
                        for (let angle = startAngle; angle <= endAngle; angle += 5) {
                            const x1 = centerX + Math.cos(angle * Math.PI / 180) * radius;
                            const y1 = centerY + Math.sin(angle * Math.PI / 180) * radius;
                            const x2 = centerX + Math.cos((angle + 5) * Math.PI / 180) * radius;
                            const y2 = centerY + Math.sin((angle + 5) * Math.PI / 180) * radius;
                            
                            // Dibujar línea del arco
                            doc.setDrawColor(r, g, b);
                            doc.setLineWidth(2);
                            doc.line(x1, y1, x2, y2);
                        }
                    }
                    
                    // === BORDES DEL SECTOR ===
                    // Líneas divisorias elegantes
                    doc.setDrawColor(255, 255, 255);
                    doc.setLineWidth(3);
                    
                    const startX = centerX + Math.cos(startAngle * Math.PI / 180) * pieRadius;
                    const startY = centerY + Math.sin(startAngle * Math.PI / 180) * pieRadius;
                    const endX = centerX + Math.cos(endAngle * Math.PI / 180) * pieRadius;
                    const endY = centerY + Math.sin(endAngle * Math.PI / 180) * pieRadius;
                    
                    doc.line(centerX, centerY, startX, startY);
                    doc.line(centerX, centerY, endX, endY);
                    
                    // === ETIQUETAS EN EL GRÁFICO ===
                    const labelAngle = (startAngle + endAngle) / 2;
                    const labelRadius = pieRadius * 0.7;
                    const labelX = centerX + Math.cos(labelAngle * Math.PI / 180) * labelRadius;
                    const labelY = centerY + Math.sin(labelAngle * Math.PI / 180) * labelRadius;
                    
                    // Fondo para la etiqueta
                    doc.setFillColor(255, 255, 255);
                    doc.circle(labelX, labelY, 8, 'F');
                    doc.setDrawColor(200, 200, 200);
                    doc.setLineWidth(1);
                    doc.circle(labelX, labelY, 8, 'S');
                    
                    // Texto de la etiqueta
                    doc.setTextColor(40, 40, 40);
                    doc.setFontSize(8);
                    doc.setFont('helvetica', 'bold');
                    const percentage = ((statusValues[index] / total) * 100).toFixed(0);
                    doc.text(percentage + '%', labelX - 2, labelY + 2);
                    
                    currentAngle += sliceAngle;
                }
            });
            
            // === LEYENDA MEJORADA ===
            const legendX = pieChartX + pieRadius * 2 + 20;
            const legendY = pieChartY;
            
            // Título de la leyenda
            doc.setTextColor(40, 40, 40);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Estados de Eventos', legendX, legendY - 8);
            
            statusLabels.forEach((status, index) => {
                if (statusValues[index] > 0) {
                    const legendItemY = legendY + (index * 16);
                    
                    // === TARJETA DE LEYENDA ULTRA COMPACTA ===
                    // Fondo de la tarjeta (ultra compacta)
                    doc.setFillColor(255, 255, 255);
                    doc.rect(legendX, legendItemY - 2, 90, 12, 'F');
                    doc.setDrawColor(220, 220, 220);
                    doc.setLineWidth(0.5);
                    doc.rect(legendX, legendItemY - 2, 90, 12, 'S');
                    
                    // Círculo de color (muy pequeño)
                    doc.setFillColor(statusColors[index][0], statusColors[index][1], statusColors[index][2]);
                    doc.circle(legendX + 6, legendItemY + 4, 3, 'F');
                    doc.setDrawColor(255, 255, 255);
                    doc.setLineWidth(0.5);
                    doc.circle(legendX + 6, legendItemY + 4, 3, 'S');
                    
                    // Texto de la leyenda (ultra compacto)
                    doc.setTextColor(40, 40, 40);
                    doc.setFontSize(8);
                    doc.setFont('helvetica', 'bold');
                    doc.text(status, legendX + 12, legendItemY + 1);
                    
                    // Valor y porcentaje (en una sola línea, más pequeño)
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(7);
                    const percentage = ((statusValues[index] / total) * 100).toFixed(1);
                    doc.text(`${statusValues[index]} (${percentage}%)`, legendX + 12, legendItemY + 6);
                }
            });
            
            // === INFORMACIÓN ADICIONAL (ULTRA COMPACTA) ===
            const infoY = legendY + (statusLabels.length * 16) + 10;
            
            // Total de eventos (ultra compacto)
            doc.setTextColor(30, 64, 175);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(`Total: ${total} eventos`, legendX, infoY);
            
            // Fecha de generación (muy pequeña)
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(6);
            doc.text('Gen: ' + new Date().toLocaleDateString('es-ES'), legendX, infoY + 8);
            
            yPosition = infoY + 15; // Posición final más conservadora para evitar superposición
            
            // === ANÁLISIS ADICIONALES PARA EL ORGANIZADOR ===
            // Crear nueva página para el análisis
            doc.addPage('landscape');
            yPosition = 30;
            
            // Título de análisis adicionales
            doc.setTextColor(30, 64, 175);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('ANÁLISIS AVANZADO PARA ORGANIZADORES', 35, yPosition);
            
            yPosition += 30;
            
            // Análisis de capacidad vs asistencia
            const capacityAnalysis = filteredEvents.map(event => ({
                name: event.name,
                capacity: event.capacity,
                attendees: event.attendees,
                utilization: (event.attendees / event.capacity) * 100
            }));
            
            doc.setTextColor(40, 40, 40);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Análisis de Utilización de Capacidad', 35, yPosition);
            
            yPosition += 20;
            
            // Verificar si hay datos para mostrar
            if (capacityAnalysis.length === 0) {
                doc.setTextColor(100, 100, 100);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text('No hay datos de capacidad disponibles para mostrar.', 35, yPosition + 10);
                yPosition += 30;
            } else {
                // Tabla de análisis de capacidad - Solo dibujar encabezados cuando hay datos
                const analysisMargin = 35;
                const analysisCellHeight = 12; // Reducido de 15 a 12 para más filas por página
                const analysisTableWidth = doc.internal.pageSize.width - (analysisMargin * 2);
                
                const analysisHeaders = ['EVENTO', 'CAPACIDAD', 'ASISTENTES', 'UTILIZACIÓN'];
                const analysisColWidths = [
                    analysisTableWidth * 0.4, // Evento (40%)
                    analysisTableWidth * 0.2, // Capacidad (20%)
                    analysisTableWidth * 0.2, // Asistentes (20%)
                    analysisTableWidth * 0.2  // Utilización (20%)
                ];
                
                const analysisColPositions = [analysisMargin];
                for (let i = 1; i < analysisColWidths.length; i++) {
                    analysisColPositions.push(analysisColPositions[i-1] + analysisColWidths[i-1]);
                }
                
                // Función para dibujar encabezados
                const drawAnalysisHeaders = (currentY: number) => {
                    doc.setFillColor(30, 64, 175);
                    doc.rect(analysisMargin, currentY, analysisTableWidth, analysisCellHeight, 'F');
                    
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'bold');
                    
                    analysisHeaders.forEach((header, index) => {
                        const textWidth = doc.getTextWidth(header);
                        const centerX = analysisColPositions[index] + (analysisColWidths[index] / 2) - (textWidth / 2);
                        doc.text(header, centerX, currentY + 8);
                    });
                    
                    return currentY + analysisCellHeight;
                };
                
                // Datos de análisis - Verificar espacio antes de dibujar encabezados
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8); // Reducido de 9 a 8 para más compacto
                
                let headersDrawn = false;
                
                capacityAnalysis.forEach((analysis, index) => {
                    // Verificar espacio disponible en la página actual
                    const pageHeight = doc.internal.pageSize.height;
                    const footerSpace = 50; // Ajustado para evitar choque con el footer
                    const availableSpace = pageHeight - yPosition - footerSpace;
                    
                    // Calcular cuántas filas más pueden caber
                    const remainingRows = Math.floor(availableSpace / analysisCellHeight);
                    
                    // Solo crear nueva página si quedan menos de 1 fila disponible
                    // Esto maximiza el uso del espacio disponible
                    if (remainingRows < 1) {
                        doc.addPage('landscape');
                        yPosition = 20;
                        headersDrawn = false; // Resetear flag para nueva página
                    }
                    
                    // Dibujar encabezados solo si no se han dibujado en esta página
                    if (!headersDrawn) {
                        yPosition = drawAnalysisHeaders(yPosition);
                        headersDrawn = true;
                    }
                
                // Alternar colores de fila
                if (index % 2 === 0) {
                    doc.setFillColor(248, 250, 252);
                    doc.rect(analysisMargin, yPosition, analysisTableWidth, analysisCellHeight, 'F');
                } else {
                    doc.setFillColor(255, 255, 255);
                    doc.rect(analysisMargin, yPosition, analysisTableWidth, analysisCellHeight, 'F');
                }
                
                const analysisData = [
                    analysis.name,
                    analysis.capacity.toString(),
                    analysis.attendees.toString(),
                    `${analysis.utilization.toFixed(1)}%`
                ];
                
                analysisData.forEach((data, colIndex) => {
                    // Forzar color negro en cada celda para máxima visibilidad
                    doc.setTextColor(0, 0, 0);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9);
                    
                    const displayText = data.toString();
                    const maxWidth = analysisColWidths[colIndex] - 8; // 8px de margen interno
                    
                    // Truncar texto si excede el ancho de columna
                    const truncatedText = truncateText(doc, displayText, maxWidth, 8);
                    
                    doc.text(truncatedText, analysisColPositions[colIndex] + 4, yPosition + 8);
                });
                
                    yPosition += analysisCellHeight;
                });
            }
            
            yPosition += 20;
            
            // Verificar espacio para insights de manera más eficiente
            const pageHeight = doc.internal.pageSize.height;
            const footerSpace = 50;
            const availableSpace = pageHeight - yPosition - footerSpace;
            const insightsSpaceNeeded = 120; // Espacio necesario para insights (título + 6-7 líneas)
            
            // Solo crear nueva página si realmente no hay espacio suficiente
            if (availableSpace < insightsSpaceNeeded) {
                doc.addPage('landscape');
                yPosition = 20;
            }
            
            // Resumen de insights para el organizador
            doc.setTextColor(30, 64, 175);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('INSIGHTS PARA EL ORGANIZADOR', 35, yPosition);
            
            yPosition += 20;
            
            // Asegurar que el texto sea visible
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            
            // Calcular insights
            const totalCapacity = filteredEvents.reduce((sum, event) => sum + event.capacity, 0);
            const totalAttendees = filteredEvents.reduce((sum, event) => sum + event.attendees, 0);
            const averageUtilization = (totalAttendees / totalCapacity) * 100;
            const mostPopularCategory = Object.keys(categoryStats).reduce((a, b) => categoryStats[a] > categoryStats[b] ? a : b);
            const upcomingEventsCount = filteredEvents.filter(e => e.status === 'Próximo').length;
            
            doc.setTextColor(40, 40, 40);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            
            const insights = [
                `• Categoría más popular: ${mostPopularCategory} (${categoryStats[mostPopularCategory]} eventos)`,
                `• Eventos próximos: ${upcomingEventsCount}`,
                `• Total de capacidad disponible: ${totalCapacity} personas`,
            ];
            
            console.log('Generando insights:', insights);
            
            insights.forEach((insight, index) => {
                console.log(`Agregando insight ${index + 1}:`, insight);
                doc.text(insight, 35, yPosition);
                yPosition += 10; // Reducido de 12 a 10 para más compacto
            });
            
            yPosition += 20;
            
            // Verificar espacio para recomendaciones
            yPosition = ensureFooterSpace(doc, yPosition, 200);
            
            // Recomendaciones adicionales para el organizador
            doc.setTextColor(30, 64, 175);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('RECOMENDACIONES PARA MEJORAR', 35, yPosition);
            
            yPosition += 25;
            
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            
            const recommendations = [
                `• Si la utilización promedio es menor al 50%, considera reducir la capacidad de futuros eventos`,
                `• Enfócate en la categoría "${mostPopularCategory}" que es la más exitosa`,
                `• Considera estrategias de marketing para aumentar la asistencia`,
                `• Revisa eventos con baja utilización para identificar problemas`
            ];
            
            console.log('Generando recomendaciones:', recommendations);
            
            recommendations.forEach((recommendation, index) => {
                console.log(`Agregando recomendacion ${index + 1}:`, recommendation);
                // Verificar espacio antes de agregar cada recomendación
                yPosition = ensureFooterSpace(doc, yPosition, 15);
                doc.text(recommendation, 35, yPosition);
                yPosition += 12;
            });
            
            yPosition += 100;
            
            // Verificar espacio para resumen ejecutivo
            yPosition = ensureFooterSpace(doc, yPosition, 150);
            
            // Resumen ejecutivo
            doc.setTextColor(30, 64, 175);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('RESUMEN EJECUTIVO', 35, yPosition);
            
            yPosition += 25;
            
            doc.setTextColor(40, 40, 40);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            
            const executiveSummary = [
                `Este reporte analiza ${totalEvents} eventos gestionados a través del sistema EventConnect.`,
                `La categoría "${mostPopularCategory}" representa el mayor éxito con ${categoryStats[mostPopularCategory]} eventos.`,
                `Se recomienda continuar enfocándose en eventos de tipo "${mostPopularCategory}" y optimizar la capacidad basada en datos históricos.`
            ];
            
            console.log('Generando resumen ejecutivo:', executiveSummary);
            console.log('Posicion Y actual:', yPosition);
            
            executiveSummary.forEach((summary, index) => {
                console.log(`Agregando resumen ${index + 1}:`, summary);
                // Verificar espacio antes de agregar cada línea del resumen
                yPosition = ensureFooterSpace(doc, yPosition, 15);
                console.log(`Posicion Y para resumen ${index + 1}:`, yPosition);
                doc.text(summary, 35, yPosition);
                yPosition += 12;
            });
            
            console.log('PDF generado exitosamente con', doc.getNumberOfPages(), 'paginas');
            
            // === PIE DE PÁGINA MEJORADO Y CONSISTENTE ===
            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                
                // Verificar que no haya contenido en el área del pie de página
                const footerY = doc.internal.pageSize.height - 50;
                
                // Línea separadora elegante
                doc.setDrawColor(200, 200, 200);
                doc.setLineWidth(0.5);
                doc.line(25, footerY, doc.internal.pageSize.width - 25, footerY);
                
                // Información del pie mejorada con mejor espaciado
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                
                // Página actual
                doc.text('Página ' + i + ' de ' + pageCount, 25, footerY + 8);
                
                // Información de la empresa (alineada a la derecha)
                doc.text('EventConnect v1.0', doc.internal.pageSize.width - 25, footerY + 8, { align: 'right' });
                doc.text('Sistema de Gestión de Eventos', doc.internal.pageSize.width - 25, footerY + 15, { align: 'right' });
                doc.text('© 2025 EventConnect. Todos los derechos reservados.', doc.internal.pageSize.width - 25, footerY + 22, { align: 'right' });
            }
            
            // === DESCARGAR ===
            const fileName = `reporte_eventos_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            
            showSuccess(
                'Exportación exitosa',
                `Se ha generado el PDF profesional con ${filteredEvents.length} eventos.`
            );
            
        } catch (error) {
            console.error('Error al exportar PDF:', error);
            showError(
                'Error al exportar',
                'No se pudo generar el archivo PDF. Inténtalo de nuevo.'
            );
        }
    };

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

    // Función para convertir EventResponse a EventData
    const convertEventResponseToEventData = (eventResponse: EventResponse): EventData => {
        return {
            event_id: eventResponse.event_id,
            title: eventResponse.title,
            event_date: eventResponse.event_date,
            duration: eventResponse.duration,
            location: eventResponse.location || undefined,
            event_type: eventResponse.event_type,
            capacity: eventResponse.capacity,
            attendees: eventResponse.attendees,
            event_image: eventResponse.event_image,
            description: eventResponse.description || undefined,
            organizer_name: eventResponse.organizer_name,
            organizer_email: eventResponse.organizer_email,
            registered_count: eventResponse.registered_count
        };
    };

    // Función para actualizar un evento específico en el estado local
    const updateEventInLocalState = (eventId: number, updatedEventData: EventResponse) => {
        const convertedData = convertEventResponseToEventData(updatedEventData);
        setEvents(prevEvents => {
            return prevEvents.map(event => {
                if (event.event_id === eventId) {
                    // Mantener todos los campos existentes y actualizar solo los nuevos
                    return {
                        ...event,
                        title: convertedData.title || event.title,
                        description: convertedData.description || event.description,
                        event_date: convertedData.event_date || event.event_date,
                        duration: convertedData.duration || event.duration,
                        location: convertedData.location || event.location,
                        event_type: convertedData.event_type || event.event_type,
                        capacity: convertedData.capacity || event.capacity,
                        event_image: convertedData.event_image || event.event_image,
                        organizer_name: convertedData.organizer_name || event.organizer_name,
                        organizer_email: convertedData.organizer_email || event.organizer_email,
                        registered_count: convertedData.registered_count || event.registered_count
                    };
                }
                return event;
            });
        });
    };

    const loadEvents = React.useCallback(async () => {
        try {
            // Actualizar estados en la base de datos primero
            try {
                await apiUpdateEventStatuses();
            } catch (updateError: unknown) {
                // Solo logear errores críticos, no errores de autenticación
                const errorMessage = updateError instanceof Error ? updateError.message : 'Unknown error';
                if (!errorMessage.includes('401') && 
                    !errorMessage.includes('403')) {
                    console.warn('⚠️ Error actualizando estados:', errorMessage);
                }
            }
            
            // Cargar eventos actualizados - solo del organizador actual
            let response;
            if (userId && role === 'organizer') {
                response = await apiFetchEventsByOrganizer(parseInt(userId));
            } else {
                // Para admins, mostrar todos los eventos
                response = await apiFetchEvents();
            }
            
            // Extraer el array de datos del objeto de respuesta
            let eventsData: EventData[] = response as unknown as EventData[];
            if (response && typeof response === 'object' && 'data' in response) {
                eventsData = (response as {data: EventData[]}).data;
            }
            
            // Validar que eventsData sea un array
            if (Array.isArray(eventsData)) {
                // Limpiar cualquier URL blob en las imágenes de eventos
                const cleanedEvents = eventsData.map(event => {
                    if (event.event_image && event.event_image.startsWith('blob:')) {
                        console.log(`🧹 Evento ${event.event_id} tiene URL blob, limpiando...`);
                        return {
                            ...event,
                            event_image: '/uploads/events/default-event.jpg' // URL por defecto
                        };
                    }
                    return event;
                });
                
                setEvents(cleanedEvents);
            } else {
                console.error('❌ Los datos extraídos no son un array:', eventsData);
                setEvents([]);
                showError(
                    'Error en formato de datos',
                    'Los datos recibidos del servidor no tienen el formato esperado'
                );
            }
        } catch (e: unknown) {
            console.error('❌ Error cargando eventos:', e);
            setEvents([]);
            const errorMessage = e instanceof Error ? e.message : 'Error cargando eventos';
            showError(
                'Error cargando eventos',
                errorMessage
            );
        }
    }, [showError, role, userId]);

    React.useEffect(() => {
        loadEvents();
        
        // Actualizar estados automáticamente cada 5 minutos (reducido de 1-2 minutos)
        const interval = setInterval(async () => {
            try {
                await apiUpdateEventStatuses();
            } catch (error: unknown) {
                // Solo logear errores críticos
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                if (!errorMessage.includes('401') && 
                    !errorMessage.includes('403')) {
                    console.warn('⚠️ Error en actualización automática:', errorMessage);
                }
            }
        }, 5 * 60 * 1000); // 5 minutos para reducir llamadas
        
        return () => {
            clearInterval(interval);
        };
    }, [loadEvents]);

    // Limpiar cualquier URL blob que pueda estar en localStorage o sessionStorage
    React.useEffect(() => {
        // Limpiar localStorage de URLs blob
        Object.keys(localStorage).forEach(key => {
            const value = localStorage.getItem(key);
            if (value && value.includes('blob:')) {
                console.log(`🧹 Limpiando URL blob de localStorage: ${key}`);
                localStorage.removeItem(key);
            }
        });

        // Limpiar sessionStorage de URLs blob
        Object.keys(sessionStorage).forEach(key => {
            const value = sessionStorage.getItem(key);
            if (value && value.includes('blob:')) {
                console.log(`🧹 Limpiando URL blob de sessionStorage: ${key}`);
                sessionStorage.removeItem(key);
            }
        });
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

        // Solo validar imagen si no hay imagen existente (al crear nuevo evento)
        if (!editingEvent && !newEvent.image) {
            errors.image = 'La imagen del evento es obligatoria';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateOrUpdateEvent = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            // Validar que la fecha y hora sean válidas
            if (!newEvent.date || !newEvent.time) {
                showError(
                    'Error de validación',
                    'La fecha y hora son requeridas'
                );
                return;
            }

            // Crear fecha correctamente combinando fecha y hora en zona horaria local
            const [year, month, day] = newEvent.date.split('-');
            const [hours, minutes] = newEvent.time.split(':');
            
            // Validar que los componentes de fecha sean válidos
            if (!year || !month || !day || !hours || !minutes) {
                showError(
                    'Error de validación',
                    'La fecha y hora deben tener un formato válido'
                );
                return;
            }

            // Validar que la fecha sea válida
            const testDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`);
            if (isNaN(testDate.getTime())) {
                showError(
                    'Error de validación',
                    'La fecha ingresada no es válida'
                );
                return;
            }
            
            // Crear string de fecha en formato ISO pero manteniendo la hora local
            const eventDateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
            
            console.log("📅 Fecha construida:", eventDateString);
            console.log("📅 Fecha validada:", testDate.toISOString());
            
            // Crear FormData para enviar archivo
            const formData = new FormData();
            formData.append('title', newEvent.name);
            formData.append('description', newEvent.description || '');
            formData.append('event_date', eventDateString);
            formData.append('duration', String(Number(newEvent.duration) || 60));
            formData.append('location', newEvent.location || '');
            formData.append('event_type', mapUiCategoryToEventType(newEvent.category));
            formData.append('capacity', String(Number(newEvent.capacity || 0)));
            
            // Agregar imagen si se seleccionó una nueva
            if (newEvent.image) {
                formData.append('event_image', newEvent.image);
            }
            if (editingEvent?.event_id) {
                // Para editar, usar FormData si hay nueva imagen, sino método tradicional
                if (newEvent.image) {
                    // Hay nueva imagen, usar FormData
                    const updatedEvent = await apiUpdateEvent(editingEvent.event_id, formData);
                    // Actualizar inmediatamente en el estado local
                    updateEventInLocalState(editingEvent.event_id, updatedEvent);
                } else {
                    // No hay nueva imagen, usar método tradicional
                    const updatePayload = {
                        title: newEvent.name,
                        description: newEvent.description || undefined,
                        event_date: eventDateString,
                        duration: Number(newEvent.duration) || 60,
                        location: newEvent.location || undefined,
                        event_type: mapUiCategoryToEventType(newEvent.category),
                        capacity: Number(newEvent.capacity || 0),
                        event_image: existingEventImage // Mantener imagen existente
                    };
                const updatedEvent = await apiUpdateEvent(editingEvent.event_id, updatePayload);
                // Actualizar inmediatamente en el estado local
                updateEventInLocalState(editingEvent.event_id, updatedEvent);
                }
                showSuccess(
                    'Evento actualizado',
                    `El evento "${newEvent.name}" ha sido actualizado exitosamente.`
                );
            } else {
                // Para crear, usar FormData
                await apiCreateEvent(formData);
                showSuccess(
                    'Evento creado',
                    `El evento "${newEvent.name}" ha sido creado exitosamente.`
                );
            }
            // Ya no necesitamos llamar loadEvents() porque actualizamos el estado local directamente
            setShowCreateModal(false);
            setEditingEvent(null);
            
            // Actualizar estados después de crear/editar evento
            try {
                await apiUpdateEventStatuses();
            } catch (error: unknown) {
                // Solo logear errores críticos
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                if (!errorMessage.includes('401') && 
                    !errorMessage.includes('403')) {
                    console.warn('⚠️ Error actualizando estados después de crear/editar:', errorMessage);
                }
            }
            setNewEvent({
                name: '',
                date: '',
                time: '',
                duration: '',
                location: '',
                capacity: '',
                category: '',
                description: '',
                image: null
            });
            setExistingEventImage('');
            setNewImagePreview('');
            setFormErrors({});
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'Error guardando evento';
            showError(
                'Error al guardar evento',
                errorMessage
            );
        }
    };

    const handleEditEvent = (event: {event_id: number; title: string; event_date: string; duration: number; location?: string; event_type: string; capacity: number; description?: string; event_image: string}) => {
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
            // status se calcula automáticamente
            location: event.location || '',
            capacity: String(event.capacity ?? ''),
            category: mapEventTypeToUiCategory(event.event_type as 'academico' | 'cultural' | 'deportivo'),
            description: event.description || '',
            image: null // No podemos mostrar la imagen existente en el input file
        });
        
        // Almacenar la imagen existente para mostrarla
        console.log("🖼️ Imagen del evento a editar:", event.event_image);
        setExistingEventImage(event.event_image || '');
        setFormErrors({}); // Limpiar errores al editar
        setShowCreateModal(true);
    };

    const handleDeleteEvent = (event: {event_id: number; title: string}) => {
        setEventToDelete(event);
        setShowDeleteModal(true);
    };

    const handleCancelCreate = () => {
        // Verificar si hay datos en el formulario
        const hasData = newEvent.name || newEvent.date || newEvent.time || 
                       newEvent.duration || newEvent.location || newEvent.capacity || newEvent.category || newEvent.description || newEvent.image;
        
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
            description: '',
            image: null
        });
        setExistingEventImage('');
        setNewImagePreview('');
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
            
            // Actualizar estados después de eliminar evento
            try {
                await apiUpdateEventStatuses();
            } catch (error: unknown) {
                // Solo logear errores críticos
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                if (!errorMessage.includes('401') && 
                    !errorMessage.includes('403')) {
                    console.warn('⚠️ Error actualizando estados después de eliminar:', errorMessage);
                }
            }
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'Error eliminando evento';
            showError(
                'Error al eliminar evento',
                errorMessage
            );
        }
    };

    const handleViewDetails = (event: UIEvent) => {
        setSelectedEvent(event);
        setShowDetailsModal(true);
    };

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
        { icon: Calendar, label: 'Eventos', active: true, onClick: handleNavigateToEvents },
        { icon: Users, label: 'Inscripciones', active: false, onClick: handleNavigateToRegistrations },
        { icon: Settings, label: 'Configuración', active: false, onClick: handleNavigateToConfiguration },
    ];

    const uiEvents = React.useMemo(() => {
        if (!Array.isArray(events)) {
            console.warn('⚠️ events no es un array:', events);
            return [];
        }
        return events.map((e: EventData) => {
            // Corregir problema de zona horaria: tratar la fecha como fecha local
            let dt: Date;
            if (typeof e.event_date === 'string') {
                // Si la fecha viene como string, crear Date sin conversión de zona horaria
                const dateStr = e.event_date.replace('T', ' ').replace('Z', '');
                dt = new Date(dateStr + ' UTC'); // Forzar interpretación como UTC
                console.log(`🔧 Fecha corregida para ${e.title}: ${e.event_date} -> ${dt.toISOString().split('T')[0]}`);
            } else {
                dt = new Date(e.event_date);
            }
            
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
                attendees: e.registered_count ?? e.attendees ?? 0,
                capacity: e.capacity,
                status: statusText,
                category: mapEventTypeToUiCategory(e.event_type as 'academico' | 'cultural' | 'deportivo'),
                organizer: e.organizer_name || 'Organizador no disponible',
                description: e.description || '',
                event_image: e.event_image || '',
                createdAt: e.created_at as string,
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
            'Deportivo': 'from-orange-500 to-red-500'
        };
        return colors[category] || 'from-gray-500 to-gray-600';
    };

    function mapEventTypeToUiCategory(type: 'academico' | 'cultural' | 'deportivo'): string {
        switch (type) {
            case 'academico': return 'Académico';
            case 'cultural': return 'Cultural';
            case 'deportivo': return 'Deportivo';
            default: return 'Académico';
        }
    }

    function mapUiCategoryToEventType(category: string): 'academico' | 'cultural' | 'deportivo' {
        switch (category) {
            case 'Académico': return 'academico';
            case 'Cultural': return 'cultural';
            case 'Deportivo': return 'deportivo';
            default: return 'academico';
        }
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
                                <button 
                                    onClick={exportToPDF}
                                    className="flex items-center px-4 py-2 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-xl hover:from-violet-600 hover:to-violet-700 transition-all duration-200 shadow-lg"
                                >
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

                        {/* Desktop Table View */}
                        <div className="hidden lg:block">
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
                                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                                            {/* Imagen del evento - tamaño fijo para evitar que se achique */}
                                            {event.event_image && (
                                                <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 shadow-sm flex-shrink-0">
                                                    <img
                                                        src={getImageUrl(event.event_image)}
                                                        alt={event.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-semibold text-black dark:text-white text-sm leading-tight line-clamp-2">{event.name}</h4>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{event.organizer}</p>
                                            </div>
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
                                    <div className="flex items-center space-x-3">
                                        <button 
                                            onClick={() => handleViewDetails(event)}
                                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleEditEvent(event.raw)}
                                            className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteEvent(event.raw)}
                                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            </div>
                        </div>

                        {/* Tablet View */}
                        <div className="hidden md:block lg:hidden">
                            {/* Table Header */}
                            <div className="grid grid-cols-6 gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                <div>Evento</div>
                                <div>Fecha</div>
                                <div>Duración</div>
                                <div>Participantes</div>
                                <div>Categoría</div>
                                <div>Acciones</div>
                            </div>

                            <div className="space-y-3">
                                {filteredEvents.map((event) => (
                                    <div key={event.id} className="grid grid-cols-6 gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                                        <div className="flex items-center">
                                            <div className="flex items-center space-x-3">
                                                {event.event_image && (
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 shadow-sm">
                                                        <img
                                                            src={getImageUrl(event.event_image)}
                                                            alt={event.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-semibold text-black dark:text-white text-sm">{event.name}</h4>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">{event.organizer}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                            <div>
                                                <div>{event.date}</div>
                                                <div className="text-xs text-gray-500">{event.time}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {event.duration} min
                                        </div>
                                        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                            {event.attendees}/{event.capacity}
                                        </div>
                                        <div className="flex items-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(event.category)} text-white`}>
                                                {event.category}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button 
                                                onClick={() => handleViewDetails(event)}
                                                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleEditEvent(event.raw)}
                                                className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteEvent(event.raw)}
                                                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="block md:hidden">
                            <div className="space-y-4">
                                {filteredEvents.map((event) => (
                                    <div key={event.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                                        {/* Header with image and basic info */}
                                        <div className="flex items-start space-x-3 mb-3">
                                            {event.event_image && (
                                                <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 shadow-sm flex-shrink-0">
                                                    <img
                                                        src={getImageUrl(event.event_image)}
                                                        alt={event.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-black dark:text-white text-base mb-1 leading-tight line-clamp-2">{event.name}</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">{event.organizer}</p>
                                                
                                                {/* Date and time */}
                                                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 mb-2">
                                                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                                                    <span className="truncate">{event.date} - {event.time}</span>
                                                </div>
                                                
                                                {/* Duration and location */}
                                                <div className="flex items-start text-sm text-gray-700 dark:text-gray-300 mb-2">
                                                    <div className="flex items-center">
                                                        <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                                                        <span className="whitespace-nowrap">{event.duration} min</span>
                                                    </div>
                                                    {event.location && (
                                                        <div className="flex items-center ml-3 min-w-0">
                                                            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                                                            <span className="truncate">{event.location}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Bottom section with participants, category, status and actions */}
                                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                            {/* Participants info */}
                                            <div className="mb-3">
                                                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                                    {event.attendees}/{event.capacity} participantes
                                                </span>
                                            </div>
                                            
                                            {/* Tags and actions row */}
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                {/* Tags container */}
                                                <div className="flex flex-wrap items-center gap-2 min-w-0">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(event.category)} text-white whitespace-nowrap max-w-[120px] truncate`} title={event.category}>
                                                        {event.category}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)} whitespace-nowrap`}>
                                                        {event.status}
                                                    </span>
                                                </div>
                                                
                                                {/* Actions */}
                                                <div className="flex items-center justify-end space-x-2 flex-shrink-0">
                                                    <button 
                                                        onClick={() => handleViewDetails(event)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                                        title="Ver detalles"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEditEvent(event.raw)}
                                                        className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                                                        title="Editar evento"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteEvent(event.raw)}
                                                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                        title="Eliminar evento"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-xl shadow-2xl my-4 transform transition-all duration-300 max-h-[95vh] flex flex-col">
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

                        <div className="p-4 space-y-2 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
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

                            {/* Campo de imagen del evento */}
                            <div className="group">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full mr-3 animate-pulse"></div>
                                    Imagen del Evento *
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setNewEvent({...newEvent, image: file});
                                                
                                                // Crear preview en base64
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    setNewImagePreview(event.target?.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="w-full px-6 py-2 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl group-focus-within:scale-[1.02] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900/20 dark:file:text-purple-300"
                                    />
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 to-violet-500/5 pointer-events-none"></div>
                                </div>
                                {formErrors.image && (
                                    <div className="mt-3 flex items-center text-red-500 text-sm">
                                        <div className="w-1 h-1 bg-red-500 rounded-full mr-2"></div>
                                        {formErrors.image}
                                    </div>
                                )}
                                {/* Mostrar imagen existente al editar */}
                                {editingEvent && existingEventImage && !newEvent.image && (
                                    <div className="mt-3 space-y-3">
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                                            <div className="flex items-center text-blue-700 dark:text-blue-300 text-sm">
                                                <div className="w-4 h-4 mr-2">📷</div>
                                                Imagen actual del evento
                                            </div>
                                        </div>
                                        
                                        {/* Preview de la imagen existente - Grande pero optimizada */}
                                        <div className="relative">
                                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Imagen actual:</div>
                                            <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                                                <img
                                                    src={getImageUrl(existingEventImage)}
                                                    alt="Imagen actual del evento"
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                                <div className="absolute bottom-2 left-2 right-2">
                                                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-2 py-1">
                                                        <div className="text-xs font-medium text-gray-800 dark:text-gray-200">
                                                            Imagen actual
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Mostrar nueva imagen seleccionada */}
                                {newEvent.image && (
                                    <div className="mt-3 space-y-3">
                                        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                                            <div className="flex items-center text-green-700 dark:text-green-300 text-sm">
                                                <Check className="w-4 h-4 mr-2" />
                                                Nueva imagen seleccionada: {newEvent.image.name}
                                            </div>
                                        </div>
                                        
                                        {/* Preview de la nueva imagen - Grande pero optimizada */}
                                        <div className="relative">
                                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Vista previa de la nueva imagen:</div>
                                            <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                                                <img
                                                    src={newImagePreview || '/uploads/events/default-event.jpg'}
                                                    alt="Preview del evento"
                                                    className="w-full h-full object-contain"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                                <div className="absolute bottom-2 left-2 right-2">
                                                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-2 py-1">
                                                        <div className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                                                            {newEvent.image.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
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

                        <div className="flex justify-end space-x-3 px-6 py-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 rounded-b-2xl flex-shrink-0">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-2xl mx-2 shadow-2xl transform transition-all duration-300 my-2 max-h-[90vh] overflow-y-auto">
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
                        
                        <div className="p-4 space-y-4">
                            {/* Header del evento */}
                            <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm shadow-lg">
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{selectedEvent.name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Organizado por: {selectedEvent.organizer}</p>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedEvent.status)} shadow-lg`}>
                                        {selectedEvent.status}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getCategoryColor(selectedEvent.category)} text-white shadow-lg`}>
                                        {selectedEvent.category}
                                    </span>
                                </div>
                            </div>

                            {/* Imagen del evento */}
                            {selectedEvent.event_image && (
                                <div className="relative">
                                    <div className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                                        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full mr-2 animate-pulse"></div>
                                        Imagen del Evento
                                    </div>
                                    <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600 shadow-lg">
                                        <img
                                            src={getImageUrl(selectedEvent.event_image)}
                                            alt={`Imagen de ${selectedEvent.name}`}
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = getImageUrl('/uploads/events/default-event.jpg'); // Imagen de respaldo
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                                        <div className="absolute bottom-3 left-3 right-3">
                                            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-2">
                                                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                    {selectedEvent.name}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Información detallada - Grid más compacto */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center p-3 bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm shadow-lg">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                                        <Calendar className="w-4 h-4 text-white" />
                                    </div>
                                        <div>
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Fecha</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedEvent.date}</p>
                                        </div>
                                    </div>
                                    
                                <div className="flex items-center p-3 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50 backdrop-blur-sm shadow-lg">
                                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                                        <Clock className="w-4 h-4 text-white" />
                                    </div>
                                        <div>
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Hora</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedEvent.time}</p>
                                        </div>
                                </div>
                                
                                <div className="flex items-center p-3 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50 backdrop-blur-sm shadow-lg">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                                        <Clock className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Duración</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedEvent.duration} min</p>
                                    </div>
                                </div>

                                <div className="flex items-center p-3 bg-gradient-to-r from-orange-50/80 to-red-50/80 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200/50 dark:border-orange-700/50 backdrop-blur-sm shadow-lg">
                                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                                        <MapPin className="w-4 h-4 text-white" />
                                    </div>
                                        <div>
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Ubicación</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedEvent.location || 'No especificada'}</p>
                                        </div>
                                    </div>
                                    
                                <div className="flex items-center p-3 bg-gradient-to-r from-indigo-50/80 to-blue-50/80 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border border-indigo-200/50 dark:border-indigo-700/50 backdrop-blur-sm shadow-lg col-span-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                                        <Users className="w-4 h-4 text-white" />
                                    </div>
                                        <div>
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Participantes</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {selectedEvent.attendees} / {selectedEvent.capacity}
                                            </p>
                                    </div>
                                </div>
                            </div>

                            {/* Descripción - Más compacta */}
                            {selectedEvent.description && (
                                <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-200/50 dark:border-indigo-700/50 backdrop-blur-sm shadow-lg">
                                    <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                        <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-2 shadow-lg">
                                            <Tag className="w-3 h-3 text-white" />
                                        </div>
                                        Descripción
                                    </h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg backdrop-blur-sm">{selectedEvent.description}</p>
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
            )            )}

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

export default EventsManagement;
