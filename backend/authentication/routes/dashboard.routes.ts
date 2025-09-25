import { Router } from "express";
import { dashboardController } from "authentication/controllers/dashboard.controller";
import authMiddleware from "authentication/middlewares/auth.middleware";

const router = Router();

// Aplicar middleware de autenticación a todas las rutas del dashboard
router.use(authMiddleware);

// Rutas del dashboard
router.get('/stats', dashboardController.getDashboardStats.bind(dashboardController));
router.get('/stats-with-growth', dashboardController.getDashboardStatsWithGrowth.bind(dashboardController));
router.get('/events/recent', dashboardController.getRecentEvents.bind(dashboardController));
router.get('/events/upcoming', dashboardController.getUpcomingEvents.bind(dashboardController));
router.get('/events/active', dashboardController.getActiveEvents.bind(dashboardController));
router.get('/users/top', dashboardController.getTopUsers.bind(dashboardController));
router.get('/registrations/recent', dashboardController.getRecentRegistrations.bind(dashboardController));
router.get('/events/categories', dashboardController.getEventCategories.bind(dashboardController));
router.get('/notifications/:userId', dashboardController.getUserNotifications.bind(dashboardController));
router.get('/notifications/:userId/unread-count', dashboardController.getUnreadNotificationCount.bind(dashboardController));

export default router;
