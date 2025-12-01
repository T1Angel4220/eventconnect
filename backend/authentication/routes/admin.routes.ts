import { Router } from "express";
import authMiddleware from "authentication/middlewares/auth.middleware";
import { adminMiddleware, adminOrOrganizerMiddleware } from "authentication/middlewares/admin.middleware";
import { adminController } from "authentication/controllers/admin.controller";

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// === RUTAS SOLO PARA ADMIN ===

// Gestión de usuarios (solo admin)
router.get('/users', adminMiddleware, adminController.getAllUsers);
router.delete('/users/:userId', adminMiddleware, adminController.deleteUser);
router.patch('/users/:userId/role', adminMiddleware, adminController.changeUserRole);

// Gestión de eventos (solo admin)
router.get('/events', adminMiddleware, adminController.getAllEvents);
router.delete('/events/:eventId', adminMiddleware, adminController.deleteEvent);

// Estadísticas del sistema (solo admin)
router.get('/stats/system', adminMiddleware, adminController.getSystemStats);

// Notificaciones globales (solo admin)
router.get('/notifications', adminMiddleware, adminController.getAllNotifications);
router.post('/notifications/global', adminMiddleware, adminController.sendGlobalNotification);

// === RUTAS PARA ADMIN U ORGANIZADOR ===

// Estas rutas pueden ser usadas tanto por admin como por organizadores
// pero con diferentes niveles de acceso según el rol

export default router;
