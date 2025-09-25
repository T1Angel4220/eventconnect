import { useState, useEffect, useCallback, useRef } from 'react';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from './useAuth';
import type { 
  DashboardStatsWithGrowth,
  EventWithOrganizer, 
  TopUser, 
  EventCategory 
} from '../types/dashboard.types';

export const useDashboard = () => {
  const { handleTokenExpired } = useAuth();
  const [stats, setStats] = useState<DashboardStatsWithGrowth | null>(null);
  const [recentEvents, setRecentEvents] = useState<EventWithOrganizer[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [eventCategories, setEventCategories] = useState<EventCategory[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Ref para evitar múltiples llamadas simultáneas
  const isLoadingRef = useRef(false);

  const fetchDashboardData = useCallback(async () => {
    // Evitar múltiples llamadas simultáneas
    if (isLoadingRef.current) {
      return;
    }
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      const [
        statsData,
        recentEventsData,
        topUsersData,
        eventCategoriesData
      ] = await Promise.all([
        dashboardService.getDashboardStatsWithGrowth(),
        dashboardService.getRecentEvents(10),
        dashboardService.getTopUsers(10),
        dashboardService.getEventCategories()
      ]);

      setStats(statsData);
      setRecentEvents(recentEventsData);
      setTopUsers(topUsersData);
      setEventCategories(eventCategoriesData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      
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

  const refreshData = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

  return {
    stats,
    recentEvents,
    topUsers,
    eventCategories,
    loading,
    error,
    refreshData
  };
};
