import { Router } from "express";
import { eventController } from "authentication/controllers/event.controller";
import authMiddleware from "authentication/middlewares/auth.middleware";

const router = Router();

// Aplicar middleware de autenticación a todas las rutas de eventos
router.use(authMiddleware);

// Rutas de eventos
router.post('/', eventController.createEvent.bind(eventController));
router.get('/', eventController.getAllEvents.bind(eventController));
router.get('/with-organizer', eventController.getEventsWithOrganizer.bind(eventController));
router.get('/upcoming', eventController.getUpcomingEvents.bind(eventController));
router.get('/active', eventController.getActiveEvents.bind(eventController));
router.get('/stats', eventController.getEventStats.bind(eventController));
router.get('/organizer/:organizerId', eventController.getEventsByOrganizer.bind(eventController));
router.get('/:id', eventController.getEventById.bind(eventController));
router.put('/:id', eventController.updateEvent.bind(eventController));
router.delete('/:id', eventController.deleteEvent.bind(eventController));

export default router;
