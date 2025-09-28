import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { TooltipItem } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../../hooks/useTheme';

// Registrar los componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyData {
  month: string;
  year: number;
  participants: number;
  events: number;
}

interface ParticipantsChartProps {
  data: MonthlyData[];
  loading?: boolean;
}

const ParticipantsChart: React.FC<ParticipantsChartProps> = ({ data, loading = false }) => {
  // Usar el hook de tema para detectar cambios dinámicos
  const { isDark } = useTheme();
  
  // Preparar los datos para el gráfico
  const chartData = useMemo(() => ({
    labels: data.map(item => `${item.month.trim()} ${item.year}`),
    datasets: [
      {
        label: 'Participantes',
        data: data.map(item => item.participants),
        backgroundColor: isDark ? 'rgba(139, 92, 246, 0.9)' : 'rgba(124, 58, 237, 0.8)',
        borderColor: isDark ? 'rgba(139, 92, 246, 1)' : 'rgba(124, 58, 237, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'Eventos',
        data: data.map(item => item.events),
        backgroundColor: isDark ? 'rgba(59, 130, 246, 0.9)' : 'rgba(37, 99, 235, 0.8)',
        borderColor: isDark ? 'rgba(59, 130, 246, 1)' : 'rgba(37, 99, 235, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ],
  }), [data, isDark]);

  const options = useMemo(() => ({
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
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: isDark ? 'rgba(139, 92, 246, 1)' : 'rgba(124, 58, 237, 1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(context: TooltipItem<'bar'>[]) {
            return context[0].label;
          },
          label: function(context: TooltipItem<'bar'>) {
            const label = context.dataset?.label || '';
            const value = context.parsed?.y || 0;
            return `${label}: ${Number(value).toLocaleString()}`;
          }
        }
      },
    },
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
          callback: function(value: number | string) {
            return Number.isInteger(Number(value)) ? value : null;
          }
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  }), [isDark]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-500 dark:text-gray-400">Cargando gráfico...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-purple-400">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">No hay datos disponibles</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Los datos aparecerán cuando haya registros</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ParticipantsChart;
