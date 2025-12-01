import { Notification } from '../types/dashboard.types';

const API_BASE_URL = 'http://localhost:3001/api';

class NotificationService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error de red' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    const response = await this.request<{ success: boolean; data: Notification[] }>(`/notifications/user/${userId}`);
    return response.data;
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    const response = await this.request<{ success: boolean; data: { count: number } }>(`/notifications/user/${userId}/unread-count`);
    return response.data.count;
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await this.request(`/notifications/${notificationId}/read`, {
      method: 'PATCH'
    });
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    await this.request(`/notifications/user/${userId}/read-all`, {
      method: 'PATCH'
    });
  }

  async deleteNotification(notificationId: number): Promise<void> {
    await this.request(`/notifications/${notificationId}`, {
      method: 'DELETE'
    });
  }

  async createNotification(userId: number, message: string, status?: 'sent' | 'pending' | 'read'): Promise<Notification> {
    const response = await this.request<{ success: boolean; data: Notification }>(`/notifications`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        message,
        status: status || 'pending'
      })
    });
    return response.data;
  }

  async getAllNotifications(): Promise<(Notification & { first_name: string; last_name: string; email: string })[]> {
    const response = await this.request<{ success: boolean; data: (Notification & { first_name: string; last_name: string; email: string })[] }>(`/admin/notifications`);
    return response.data;
  }
}

export const notificationService = new NotificationService();
export default notificationService;