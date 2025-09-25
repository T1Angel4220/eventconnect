import { Request, Response } from "express";
import { dashboardService } from "authentication/services/dashboard.service";

export class DashboardController {
  async getDashboardStats(req: Request, res: Response) {
    try {
      const stats = await dashboardService.getDashboardStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting dashboard statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getRecentEvents(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const events = await dashboardService.getRecentEvents(limit);
      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      console.error('Error in getRecentEvents:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting recent events',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getUpcomingEvents(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const events = await dashboardService.getUpcomingEvents(limit);
      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      console.error('Error in getUpcomingEvents:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting upcoming events',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getActiveEvents(req: Request, res: Response) {
    try {
      const events = await dashboardService.getActiveEvents();
      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      console.error('Error in getActiveEvents:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting active events',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getTopUsers(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const users = await dashboardService.getTopUsers(limit);
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Error in getTopUsers:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting top users',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getRecentRegistrations(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const registrations = await dashboardService.getRecentRegistrations(limit);
      res.json({
        success: true,
        data: registrations
      });
    } catch (error) {
      console.error('Error in getRecentRegistrations:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting recent registrations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getEventCategories(req: Request, res: Response) {
    try {
      const categories = await dashboardService.getEventCategories();
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error in getEventCategories:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting event categories',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getUserNotifications(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
      }

      const notifications = await dashboardService.getUserNotifications(userId);
      res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      console.error('Error in getUserNotifications:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting user notifications',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getUnreadNotificationCount(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
      }

      const count = await dashboardService.getUnreadNotificationCount(userId);
      res.json({
        success: true,
        data: { unread_count: count }
      });
    } catch (error) {
      console.error('Error in getUnreadNotificationCount:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting unread notification count',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const dashboardController = new DashboardController();
