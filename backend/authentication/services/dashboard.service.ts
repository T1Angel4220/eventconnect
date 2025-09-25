import { eventRepository } from "authentication/repositories/event.repository";
import { registrationRepository } from "authentication/repositories/registration.repository";
import { notificationRepository } from "authentication/repositories/notification.repository";
import { statsRepository } from "authentication/repositories/stats.repository";
import { DashboardStats } from "authentication/models/notification.interface";
import { EventWithOrganizer } from "authentication/models/event.interface";
import { RegistrationWithDetails } from "authentication/models/registration.interface";
import pool from "config/db";

export class DashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [eventStats, registrationStats, userStats] = await Promise.all([
        eventRepository.getStats(),
        registrationRepository.getStats(),
        this.getUserStats()
      ]);

      return {
        total_events: parseInt(eventStats.total_events),
        total_participants: parseInt(eventStats.total_participants),
        active_events: parseInt(eventStats.active_events),
        upcoming_events: parseInt(eventStats.upcoming_events),
        total_users: userStats,
        recent_registrations: parseInt(registrationStats.active_registrations)
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw new Error('Failed to get dashboard statistics');
    }
  }

  async getDashboardStatsWithGrowth(): Promise<DashboardStats & { growth: any }> {
    try {
      const [stats, growth] = await Promise.all([
        this.getDashboardStats(),
        statsRepository.getMonthlyGrowth()
      ]);

      return {
        ...stats,
        growth
      };
    } catch (error) {
      console.error('Error getting dashboard stats with growth:', error);
      throw new Error('Failed to get dashboard statistics with growth');
    }
  }

  async getRecentEvents(limit: number = 10): Promise<EventWithOrganizer[]> {
    try {
      return await eventRepository.getEventsWithOrganizer();
    } catch (error) {
      console.error('Error getting recent events:', error);
      throw new Error('Failed to get recent events');
    }
  }

  async getUpcomingEvents(limit: number = 10): Promise<EventWithOrganizer[]> {
    try {
      return await eventRepository.getUpcomingEvents(limit);
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      throw new Error('Failed to get upcoming events');
    }
  }

  async getActiveEvents(): Promise<EventWithOrganizer[]> {
    try {
      return await eventRepository.getActiveEvents();
    } catch (error) {
      console.error('Error getting active events:', error);
      throw new Error('Failed to get active events');
    }
  }

  async getTopUsers(limit: number = 10): Promise<Array<{ user_id: number; user_name: string; events_attended: number; favorite_category: string; join_date: string }>> {
    try {
      return await registrationRepository.getTopUsers(limit);
    } catch (error) {
      console.error('Error getting top users:', error);
      throw new Error('Failed to get top users');
    }
  }

  async getRecentRegistrations(limit: number = 10): Promise<RegistrationWithDetails[]> {
    try {
      return await registrationRepository.getRecentRegistrations(limit);
    } catch (error) {
      console.error('Error getting recent registrations:', error);
      throw new Error('Failed to get recent registrations');
    }
  }

  async getEventCategories(): Promise<Array<{ category: string; count: number; percentage: number }>> {
    try {
      const events = await eventRepository.getEventsWithOrganizer();
      const categoryCount: { [key: string]: number } = {};
      
      events.forEach(event => {
        categoryCount[event.event_type] = (categoryCount[event.event_type] || 0) + 1;
      });

      const total = events.length;
      const categories = Object.entries(categoryCount).map(([category, count]) => ({
        category: this.formatCategoryName(category),
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }));

      return categories.sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error getting event categories:', error);
      throw new Error('Failed to get event categories');
    }
  }

  async getUserNotifications(userId: number): Promise<Array<{ notification_id: number; message: string; sent_at: Date; status: string; is_unread: boolean }>> {
    try {
      const notifications = await notificationRepository.findByUser(userId);
      return notifications.map(notification => ({
        notification_id: notification.notification_id,
        message: notification.message,
        sent_at: notification.sent_at,
        status: notification.status,
        is_unread: notification.status !== 'read'
      }));
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw new Error('Failed to get user notifications');
    }
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    try {
      return await notificationRepository.getUnreadCount(userId);
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      throw new Error('Failed to get unread notification count');
    }
  }

  private async getUserStats(): Promise<number> {
    try {
      const query = 'SELECT COUNT(*) as count FROM users WHERE role = $1';
      const result = await pool.query(query, ['participant']);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error getting user stats:', error);
      return 0;
    }
  }

  private formatCategoryName(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'academic': 'Académico',
      'cultural': 'Cultural',
      'sports': 'Deportes'
    };
    return categoryMap[category] || category;
  }
}

export const dashboardService = new DashboardService();
