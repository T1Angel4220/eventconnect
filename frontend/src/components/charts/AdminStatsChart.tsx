import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useTheme } from '../../hooks/useTheme';

// Registrar los componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AdminStatsChartProps {
  data: {
    total_users: number;
    users_by_role: Record<string, number>;
    total_events: number;
    events_by_type: Record<string, number>;
    total_registrations: number;
  };
  loading?: boolean;
}

const AdminStatsChart: React.FC<AdminStatsChartProps> = ({ data, loading = false }) => {
  const { isDark } = useTheme();
  
  // Colores para los gráficos
  const colors = useMemo(() => ({
    primary: isDark ? 'rgba(239, 68, 68, 0.8)' : 'rgba(220, 38, 38, 0.8)',
    secondary: isDark ? 'rgba(59, 130, 246, 0.8)' : 'rgba(37, 99, 235, 0.8)',
    success: isDark ? 'rgba(34, 197, 94, 0.8)' : 'rgba(21, 128, 61, 0.8)',
    warning: isDark ? 'rgba(245, 158, 11, 0.8)' : 'rgba(180, 83, 9, 0.8)',
    purple: isDark ? 'rgba(139, 92, 246, 0.8)' : 'rgba(124, 58, 237, 0.8)',
  }), [isDark]);

  // Gráfico de barras para usuarios por rol
  const usersChartData = useMemo(() => ({
    labels: Object.keys(data.users_by_role || {}).map(role => 
      role.charAt(0).toUpperCase() + role.slice(1)
    ),
    datasets: [{
      label: 'Usuarios',
      data: Object.values(data.users_by_role || {}),
      backgroundColor: [
        colors.primary,
        colors.secondary,
        colors.success,
      ],
      borderColor: [
        isDark ? 'rgba(239, 68, 68, 1)' : 'rgba(220, 38, 38, 1)',
        isDark ? 'rgba(59, 130, 246, 1)' : 'rgba(37, 99, 235, 1)',
        isDark ? 'rgba(34, 197, 94, 1)' : 'rgba(21, 128, 61, 1)',
      ],
      borderWidth: 2,
      borderRadius: 8,
    }],
  }), [data.users_by_role, colors, isDark]);

  // Gráfico de dona para eventos por tipo
  const eventsChartData = useMemo(() => ({
    labels: Object.keys(data.events_by_type || {}).map(type => 
      type.charAt(0).toUpperCase() + type.slice(1)
    ),
    datasets: [{
      data: Object.values(data.events_by_type || {}),
      backgroundColor: [
        colors.primary,
        colors.secondary,
        colors.success,
        colors.warning,
        colors.purple,
      ],
      borderColor: isDark ? '#1F2937' : '#FFFFFF',
      borderWidth: 3,
    }],
  }), [data.events_by_type, colors, isDark]);

  // Gráfico de líneas para inscripciones por mes
  const registrationsChartData = useMemo(() => {
    // Por ahora mostrar datos vacíos hasta que tengamos datos reales de la BD
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    
    return {
      labels: months,
      datasets: [{
        label: 'Inscripciones',
        data: [0, 0, 0, 0, 0, 0], // Datos reales vendrán del backend
        borderColor: colors.purple,
        backgroundColor: colors.purple,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: colors.purple,
        pointBorderColor: isDark ? '#1F2937' : '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 6,
      }],
    };
  }, [colors, isDark]);

  // Gráfico de barras horizontales para comparación de usuarios vs eventos
  const comparisonChartData = useMemo(() => ({
    labels: ['Usuarios', 'Eventos', 'Inscripciones'],
    datasets: [{
      label: 'Cantidad',
      data: [
        data.total_users || 0,
        data.total_events || 0,
        data.total_registrations || 0,
      ],
      backgroundColor: [
        colors.primary,
        colors.secondary,
        colors.success,
      ],
      borderColor: [
        isDark ? 'rgba(239, 68, 68, 1)' : 'rgba(220, 38, 38, 1)',
        isDark ? 'rgba(59, 130, 246, 1)' : 'rgba(37, 99, 235, 1)',
        isDark ? 'rgba(34, 197, 94, 1)' : 'rgba(21, 128, 61, 1)',
      ],
      borderWidth: 2,
      borderRadius: 8,
    }],
  }), [data.total_users, data.total_events, data.total_registrations, colors, isDark]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDark ? '#FFFFFF' : '#1F2937',
          font: {
            size: 12,
            weight: 500,
          },
        },
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: isDark ? 'rgba(139, 92, 246, 1)' : 'rgba(124, 58, 237, 1)',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDark ? '#F9FAFB' : '#374151',
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: isDark ? '#F9FAFB' : '#374151',
          font: {
            size: 11,
          },
          stepSize: 1,
        },
      },
    },
  };

  const doughnutOptions = {
    ...chartOptions,
    cutout: '60%',
    plugins: {
      ...chartOptions.plugins,
      legend: {
        ...chartOptions.plugins.legend,
        position: 'bottom' as const,
      },
    },
  };

  const lineOptions = {
    ...chartOptions,
    scales: {
      x: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: isDark ? '#F9FAFB' : '#374151',
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: isDark ? '#F9FAFB' : '#374151',
          font: {
            size: 11,
          },
          stepSize: 5,
        },
      },
    },
  };

  const horizontalBarOptions = {
    ...chartOptions,
    indexAxis: 'y' as const,
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: isDark ? '#F9FAFB' : '#374151',
          font: {
            size: 11,
          },
          stepSize: 1,
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDark ? '#F9FAFB' : '#374151',
          font: {
            size: 11,
          },
        },
      },
    },
  };

  // Verificar si hay datos válidos
  const hasUsersData = data.users_by_role && Object.keys(data.users_by_role).length > 0;
  const hasEventsData = data.events_by_type && Object.keys(data.events_by_type).length > 0;
  const hasRegistrationsData = data.total_registrations && data.total_registrations > 0;
  const hasAnyData = data.total_users > 0 || data.total_events > 0 || data.total_registrations > 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-white rounded-2xl p-6">
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
              <p className="text-gray-500 dark:text-gray-400">Cargando gráfico...</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de barras - Usuarios por rol */}
      <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-white rounded-2xl p-6 shadow-lg">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          👥 Usuarios por Rol
        </h4>
        <div className="h-64">
          {hasUsersData ? (
            <Bar data={usersChartData} options={barOptions} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">No hay datos de usuarios</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gráfico de dona - Eventos por tipo */}
      <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-white rounded-2xl p-6 shadow-lg">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          📅 Eventos por Tipo
        </h4>
        <div className="h-64">
          {hasEventsData ? (
            <Doughnut data={eventsChartData} options={doughnutOptions} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">No hay datos de eventos</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gráfico de líneas - Inscripciones por mes */}
      <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-white rounded-2xl p-6 shadow-lg">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          📈 Inscripciones por Mes
        </h4>
        <div className="h-64">
          {hasRegistrationsData ? (
            <Line data={registrationsChartData} options={lineOptions} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">No hay inscripciones registradas</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Los datos aparecerán cuando haya registros</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gráfico de barras horizontales - Comparación general */}
      <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-white rounded-2xl p-6 shadow-lg">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          📊 Comparación General
        </h4>
        <div className="h-64">
          {hasAnyData ? (
            <Bar data={comparisonChartData} options={horizontalBarOptions} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">No hay datos del sistema</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Los datos aparecerán cuando haya actividad</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStatsChart;
