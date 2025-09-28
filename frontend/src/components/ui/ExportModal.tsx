import React, { useState } from 'react';
import { X, Download, FileText, Calendar, Users, Filter } from 'lucide-react';
import CustomDropdown from './CustomDropdown';
import { RegistrationWithDetails } from '../../services/registrationService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  registrations: RegistrationWithDetails[];
  events: string[];
}

interface ExportOptions {
  type: 'all' | 'specific' | 'filtered';
  eventTitle?: string;
  status?: string;
  eventType?: string;
  includeStats: boolean;
  includeEventInfo: boolean;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  registrations,
  events
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    type: 'all',
    includeStats: true,
    includeEventInfo: true
  });

  const reportTypeOptions = [
    { value: 'all', label: 'Todos los eventos' },
    { value: 'specific', label: 'Evento específico' },
    { value: 'filtered', label: 'Con filtros' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'Registrado', label: 'Solo registrados' },
    { value: 'Cancelado', label: 'Solo cancelados' }
  ];

  const eventTypeOptions = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'academic', label: 'Académico' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'sports', label: 'Deportes' }
  ];

  const eventOptions = [
    { value: 'all', label: 'Seleccionar evento...' },
    ...events.map(event => ({ value: event, label: event }))
  ];

  const handleExport = () => {
    onExport(exportOptions);
    onClose();
  };

  const getFilteredRegistrations = () => {
    let filtered = registrations;

    if (exportOptions.type === 'specific' && exportOptions.eventTitle && exportOptions.eventTitle !== 'all') {
      filtered = filtered.filter(r => r.event_title === exportOptions.eventTitle);
    }

    if (exportOptions.status && exportOptions.status !== 'all') {
      const spanishStatus = exportOptions.status === 'Registrado' ? 'registered' : 'canceled';
      filtered = filtered.filter(r => r.status === spanishStatus);
    }

    if (exportOptions.eventType && exportOptions.eventType !== 'all') {
      filtered = filtered.filter(r => r.event_type === exportOptions.eventType);
    }

    return filtered;
  };

  const filteredCount = getFilteredRegistrations().length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Exportar Reporte
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generar PDF con inscripciones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tipo de Reporte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <FileText className="w-4 h-4 inline mr-2" />
              Tipo de Reporte
            </label>
            <CustomDropdown
              options={reportTypeOptions}
              value={exportOptions.type}
              onChange={(value) => setExportOptions(prev => ({ ...prev, type: value as any }))}
              className="w-full"
            />
          </div>

          {/* Evento Específico */}
          {exportOptions.type === 'specific' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <Calendar className="w-4 h-4 inline mr-2" />
                Seleccionar Evento
              </label>
              <CustomDropdown
                options={eventOptions}
                value={exportOptions.eventTitle || 'all'}
                onChange={(value) => setExportOptions(prev => ({ ...prev, eventTitle: value }))}
                className="w-full"
              />
            </div>
          )}

          {/* Filtros */}
          {exportOptions.type === 'filtered' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Estado de Inscripción
                </label>
                <CustomDropdown
                  options={statusOptions}
                  value={exportOptions.status || 'all'}
                  onChange={(value) => setExportOptions(prev => ({ ...prev, status: value }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Tipo de Evento
                </label>
                <CustomDropdown
                  options={eventTypeOptions}
                  value={exportOptions.eventType || 'all'}
                  onChange={(value) => setExportOptions(prev => ({ ...prev, eventType: value }))}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Opciones de Contenido */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Contenido del Reporte
            </h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includeStats}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeStats: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Incluir estadísticas y resumen
                </span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includeEventInfo}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeEventInfo: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Incluir información detallada del evento
                </span>
              </label>
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Resumen del Reporte
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Se exportarán <strong>{filteredCount}</strong> inscripciones
              {exportOptions.type === 'specific' && exportOptions.eventTitle && exportOptions.eventTitle !== 'all' && 
                ` del evento "${exportOptions.eventTitle}"`
              }
              {exportOptions.type === 'filtered' && 
                ` con los filtros aplicados`
              }
              {exportOptions.type === 'all' && 
                ` de todos los eventos`
              }
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleExport}
            disabled={filteredCount === 0}
            className="flex items-center px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
