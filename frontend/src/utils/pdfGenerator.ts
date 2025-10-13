import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { RegistrationWithDetails } from '../services/registrationService';
import { getEventTypeLabel } from '../types/event.types';

// Tipos para autoTable

interface ExportOptions {
  type: 'all' | 'specific' | 'filtered';
  eventTitle?: string;
  status?: string;
  eventType?: string;
  includeStats: boolean;
  includeEventInfo: boolean;
}

export const generateRegistrationsPDF = (
  registrations: RegistrationWithDetails[],
  options: ExportOptions,
  organizerName: string
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  let yPosition = 20;
  
  // Configuración de colores
  const primaryColor = [139, 69, 19]; // Marrón universitario
  
  // Función para agregar texto con estilo
  const addText = (text: string, x: number, y: number, options: { fontSize?: number; color?: number[] } = {}) => {
    doc.setFontSize(options.fontSize || 12);
    const color = options.color || [0, 0, 0];
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(text, x, y);
  };
  
  // Encabezado
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  addText('UNIVERSIDAD EVENTCONNECT', 20, 15, { 
    fontSize: 16, 
    color: [255, 255, 255] 
  });
  
  addText('Reporte de Inscripciones', 20, 25, { 
    fontSize: 12, 
    color: [255, 255, 255] 
  });
  
  addText(`Generado: ${new Date().toLocaleDateString('es-ES')}`, pageWidth - 60, 15, { 
    fontSize: 10, 
    color: [255, 255, 255] 
  });
  
  addText(`Organizador: ${organizerName}`, pageWidth - 60, 25, { 
    fontSize: 10, 
    color: [255, 255, 255] 
  });
  
  yPosition = 50;
  
  // Título del reporte
  let reportTitle = 'Reporte de Inscripciones';
  if (options.type === 'specific' && options.eventTitle && options.eventTitle !== 'all') {
    reportTitle = `Inscripciones - ${options.eventTitle}`;
  } else if (options.type === 'filtered') {
    reportTitle = 'Reporte Filtrado de Inscripciones';
  }
  
  addText(reportTitle, 20, yPosition, { fontSize: 18 });
  yPosition += 15;
  
  // Estadísticas (si está habilitado)
  if (options.includeStats) {
    addText('RESUMEN EJECUTIVO', 20, yPosition, { fontSize: 14 });
    yPosition += 10;
    
    const totalRegistrations = registrations.length;
    const registeredCount = registrations.filter(r => r.status === 'registered').length;
    const canceledCount = registrations.filter(r => r.status === 'canceled').length;
    
    // Estadísticas por evento
    const eventStats = registrations.reduce((acc, reg) => {
      if (!acc[reg.event_title]) {
        acc[reg.event_title] = {
          total: 0,
          registered: 0,
          capacity: reg.event_capacity
        };
      }
      acc[reg.event_title].total++;
      if (reg.status === 'registered') {
        acc[reg.event_title].registered++;
      }
      return acc;
    }, {} as Record<string, { total: number; registered: number; capacity: number }>);
    
    addText(`• Total de inscripciones: ${totalRegistrations}`, 20, yPosition);
    yPosition += 7;
    addText(`• Inscripciones activas: ${registeredCount}`, 20, yPosition);
    yPosition += 7;
    addText(`• Inscripciones canceladas: ${canceledCount}`, 20, yPosition);
    yPosition += 7;
    addText(`• Eventos con inscripciones: ${Object.keys(eventStats).length}`, 20, yPosition);
    yPosition += 15;
    
    // Estadísticas por evento
    if (Object.keys(eventStats).length > 1) {
      addText('ESTADÍSTICAS POR EVENTO', 20, yPosition, { fontSize: 14 });
      yPosition += 10;
      
      Object.entries(eventStats).forEach(([eventTitle, stats]) => {
        const percentage = stats.capacity > 0 ? Math.round((stats.registered / stats.capacity) * 100) : 0;
        addText(`• ${eventTitle}: ${stats.registered}/${stats.capacity} (${percentage}%)`, 20, yPosition);
        yPosition += 7;
      });
      yPosition += 10;
    }
  }
  
  // Información del evento (si es específico y está habilitado)
  if (options.type === 'specific' && options.eventTitle && options.eventTitle !== 'all' && options.includeEventInfo) {
    const eventRegistrations = registrations.filter(r => r.event_title === options.eventTitle);
    if (eventRegistrations.length > 0) {
      const event = eventRegistrations[0];
      
      addText('INFORMACIÓN DEL EVENTO', 20, yPosition, { fontSize: 14 });
      yPosition += 10;
      
      addText(`• Título: ${event.event_title}`, 20, yPosition);
      yPosition += 7;
      addText(`• Fecha: ${new Date(event.event_date).toLocaleDateString('es-ES')}`, 20, yPosition);
      yPosition += 7;
      addText(`• Ubicación: ${event.event_location || 'No especificada'}`, 20, yPosition);
      yPosition += 7;
      addText(`• Tipo: ${getEventTypeLabel(event.event_type)}`, 20, yPosition);
      yPosition += 7;
      addText(`• Capacidad: ${event.event_capacity} personas`, 20, yPosition);
      yPosition += 7;
      addText(`• Organizador: ${event.organizer_name}`, 20, yPosition);
      yPosition += 15;
    }
  }
  
  // Tabla de inscripciones
  addText('LISTA DE PARTICIPANTES', 20, yPosition, { fontSize: 14 });
  yPosition += 15;
  
  // Preparar datos para la tabla
  const tableData = registrations.map(reg => [
    `${reg.user_first_name} ${reg.user_last_name}`,
    reg.user_email,
    reg.user_role,
    reg.event_title,
    new Date(reg.registered_at).toLocaleDateString('es-ES'),
    reg.status === 'registered' ? 'Registrado' : 'Cancelado'
  ]);
  
  // Generar tabla
  autoTable(doc, {
    startY: yPosition,
    head: [['Nombre', 'Email', 'Rol', 'Evento', 'Fecha Inscripción', 'Estado']],
    body: tableData,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [primaryColor[0], primaryColor[1], primaryColor[2]],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { left: 20, right: 20 },
    didDrawPage: (data: { pageNumber: number }) => {
      // Pie de página
      const pageCount = doc.getNumberOfPages();
      const currentPage = data.pageNumber;
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Página ${currentPage} de ${pageCount}`,
        pageWidth - 30,
        pageHeight - 10
      );
      
      doc.text(
        `Generado por EventConnect - ${new Date().toLocaleDateString('es-ES')}`,
        20,
        pageHeight - 10
      );
    }
  });
  
  // Guardar el PDF
  const fileName = `reporte-inscripciones-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export default generateRegistrationsPDF;
