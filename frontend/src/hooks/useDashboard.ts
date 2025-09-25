import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import type { 
  DashboardStatsWithGrowth,
  EventWithOrganizer, 
  TopUser, 
  EventCategory 
} from '../types/dashboard.types';

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStatsWithGrowth | null>(null);
  const [recentEvents, setRecentEvents] = useState<EventWithOrganizer[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [eventCategories, setEventCategories] = useState<EventCategory[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
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
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
