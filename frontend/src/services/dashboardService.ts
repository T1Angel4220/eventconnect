import type { 
  DashboardStats, 
  DashboardStatsWithGrowth,
  EventWithOrganizer, 
  TopUser, 
  RecentRegistration, 
  EventCategory, 
  Notification,
  ApiResponse 
} from '../types/dashboard.types';
import { API_CONFIG, getDefaultHeaders, handleApiError } from '../config/api';

class DashboardService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const config: RequestInit = {
      headers: {
        ...getDefaultHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`Error in dashboard service: ${endpoint}`, error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.request<DashboardStats>('/dashboard/stats');
    return response.data;
  }

  async getDashboardStatsWithGrowth(): Promise<DashboardStatsWithGrowth> {
    const response = await this.request<DashboardStatsWithGrowth>('/dashboard/stats-with-growth');
    return response.data;
  }

  // Events
  async getRecentEvents(limit: number = 10): Promise<EventWithOrganizer[]> {
    const response = await this.request<EventWithOrganizer[]>(`/dashboard/events/recent?limit=${limit}`);
    return response.data;
  }

  async getUpcomingEvents(limit: number = 10): Promise<EventWithOrganizer[]> {
    const response = await this.request<EventWithOrganizer[]>(`/dashboard/events/upcoming?limit=${limit}`);
    return response.data;
  }

  async getActiveEvents(): Promise<EventWithOrganizer[]> {
    const response = await this.request<EventWithOrganizer[]>('/dashboard/events/active');
    return response.data;
  }

  // Users
  async getTopUsers(limit: number = 10): Promise<TopUser[]> {
    const response = await this.request<TopUser[]>(`/dashboard/users/top?limit=${limit}`);
    return response.data;
  }

  // Registrations
  async getRecentRegistrations(limit: number = 10): Promise<RecentRegistration[]> {
    const response = await this.request<RecentRegistration[]>(`/dashboard/registrations/recent?limit=${limit}`);
    return response.data;
  }

  // Categories
  async getEventCategories(): Promise<EventCategory[]> {
    const response = await this.request<EventCategory[]>('/dashboard/events/categories');
    return response.data;
  }

  // Notifications
  async getUserNotifications(userId: number): Promise<Notification[]> {
    const response = await this.request<Notification[]>(`/dashboard/notifications/${userId}`);
    return response.data;
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    const response = await this.request<{ unread_count: number }>(`/dashboard/notifications/${userId}/unread-count`);
    return response.data.unread_count;
  }

  // Test endpoint (sin autenticación)
  async getTestStats(): Promise<DashboardStats> {
    const response = await this.request<DashboardStats>('/test/stats');
    return response.data;
  }
}

export const dashboardService = new DashboardService();
