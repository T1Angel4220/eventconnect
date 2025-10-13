import React, { useState, useEffect, useCallback, useRef } from 'react';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../hooks/useAuth';
import { DashboardContext } from './DashboardContextDefinition';
import type { 
  DashboardStatsWithGrowth,
  EventWithOrganizer, 
  TopUser, 
  EventCategory 
} from '../types/dashboard.types';
import type { MonthlyParticipantsData } from '../types/dashboard-context.types';

interface DashboardProviderProps {
  children: React.ReactNode;
}

const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const { handleTokenExpired } = useAuth();
  const [stats, setStats] = useState<DashboardStatsWithGrowth | null>(null);
  const [recentEvents, setRecentEvents] = useState<EventWithOrganizer[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [eventCategories, setEventCategories] = useState<EventCategory[]>([]);
  const [participantsData, setParticipantsData] = useState<MonthlyParticipantsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  const fetchDashboardData = useCallback(async (forceRefresh = false) => {
    // Si ya se cargaron los datos y no es un refresh forzado, no hacer nada
    if (hasLoadedRef.current && !forceRefresh) {
      return;
    }

    // Evitar múltiples llamadas simultáneas
    if (isLoadingRef.current) {
      return;
    }
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      // Obtener información del usuario actual
      const role = localStorage.getItem('role');
      const userId = localStorage.getItem('userId');

      // Cargar datos críticos primero (más rápidos)
      const criticalData = await Promise.all([
        dashboardService.getDashboardStatsWithGrowth(),
        // Para organizadores, filtrar solo sus eventos
        role === 'organizer' && userId 
          ? dashboardService.getRecentEventsByOrganizer(parseInt(userId), 10)
          : dashboardService.getRecentEvents(10),
        dashboardService.getEventCategories()
      ]);

      setStats(criticalData[0]);
      setRecentEvents(criticalData[1]);
      setEventCategories(criticalData[2]);

      // Cargar datos secundarios en paralelo (pueden fallar sin afectar el dashboard)
      try {
        const [topUsersData, participantsData] = await Promise.allSettled([
          dashboardService.getTopUsers(10),
          dashboardService.getParticipantsByMonth(6)
        ]);

        if (topUsersData.status === 'fulfilled') {
          setTopUsers(topUsersData.value);
        } else {
          console.warn('Error loading top users:', topUsersData.reason);
          setTopUsers([]);
        }

        if (participantsData.status === 'fulfilled') {
          setParticipantsData(participantsData.value);
        } else {
          console.warn('Error loading participants data:', participantsData.reason);
          setParticipantsData([]);
        }
      } catch (secondaryError) {
        console.warn('Error loading secondary data:', secondaryError);
        // No afectar el estado de loading principal
      }

      setLastUpdated(new Date());
      hasLoadedRef.current = true;

    } catch (err) {
      console.error('Error fetching critical dashboard data:', err);
      
      // Si es un error de token expirado, manejar la redirección
      if (err instanceof Error && err.message.includes('Sesión expirada')) {
        handleTokenExpired();
        return;
      }
      
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [handleTokenExpired]);

  const refreshData = useCallback(async () => {
    await fetchDashboardData(true);
  }, [fetchDashboardData]);

  const clearData = useCallback(() => {
    setStats(null);
    setRecentEvents([]);
    setTopUsers([]);
    setEventCategories([]);
    setParticipantsData([]);
    setError(null);
    setLastUpdated(null);
    hasLoadedRef.current = false;
  }, []);

  // Cargar datos al montar el provider (solo una vez)
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const value = {
    stats,
    recentEvents,
    topUsers,
    eventCategories,
    participantsData,
    loading,
    error,
    lastUpdated,
    refreshData,
    clearData
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export { DashboardProvider };

