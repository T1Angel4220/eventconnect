// import { Router } from "express";
// import { eventController } from "authentication/controllers/event.controller";
// import authMiddleware from "authentication/middlewares/auth.middleware";
// import upload from "../../middleware/upload";
// import { listEvents } from "events/controllers/event.controller";
//
// const router = Router();
//
// // Aplicar middleware de autenticación a todas las rutas de eventos
// router.use(authMiddleware);
//
// // Rutas de eventos
// router.post('/', upload.single('event_image'), eventController.createEvent.bind(eventController));
// // RUTA PRINCIPAL CON FILTROS AVANZADOS
// router.get('/', listEvents);
// router.get('/with-organizer', eventController.getEventsWithOrganizer.bind(eventController));
// router.get('/upcoming', eventController.getUpcomingEvents.bind(eventController));
// router.get('/active', eventController.getActiveEvents.bind(eventController));
// router.get('/stats', eventController.getEventStats.bind(eventController));
// router.get('/organizer/:organizerId', eventController.getEventsByOrganizer.bind(eventController));
// router.get('/:id', eventController.getEventById.bind(eventController));
// router.put('/:id', upload.single('event_image'), eventController.updateEvent.bind(eventController));
// router.delete('/:id', eventController.deleteEvent.bind(eventController));
// router.put('/status/update', eventController.updateEventStatuses.bind(eventController));
//
// export default router;
