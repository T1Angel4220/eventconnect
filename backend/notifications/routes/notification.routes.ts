import { Router } from "express";
import { 
  createNotification,
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from "../controllers/notification.controller";
import authMiddleware from "../../authentication/middlewares/auth.middleware";

const router = Router();

// Create notification
router.post('/', authMiddleware, createNotification);

// Get user notifications
router.get('/user/:userId', authMiddleware, getUserNotifications);

// Get unread count
router.get('/user/:userId/unread-count', authMiddleware, getUnreadNotificationCount);

// Mark notification as read
router.patch('/:notificationId/read', authMiddleware, markNotificationAsRead);

// Mark all notifications as read
router.patch('/user/:userId/read-all', authMiddleware, markAllNotificationsAsRead);

// Delete notification
router.delete('/:notificationId', authMiddleware, deleteNotification);

export default router;