import { Router } from "express";
import { registrationController } from "authentication/controllers/registration.controller";
import authMiddleware from "authentication/middlewares/auth.middleware";

const router = Router();

// Aplicar middleware de autenticación a todas las rutas de registrations
router.use(authMiddleware);

// Rutas de registrations
// POST /api/registrations - Crear nueva inscripción
router.post('/', registrationController.createRegistration.bind(registrationController));

// GET /api/registrations/my - Obtener inscripciones del usuario autenticado
router.get('/my', registrationController.getUserRegistrations.bind(registrationController));

// GET /api/registrations/all - Obtener todas las inscripciones (admin/organizer)
router.get('/all', registrationController.getAllRegistrations.bind(registrationController));

// GET /api/registrations/search - Buscar inscripciones (admin/organizer)
router.get('/search', registrationController.searchRegistrations.bind(registrationController));

// GET /api/registrations/stats - Obtener estadísticas de inscripciones (admin/organizer)
router.get('/stats', registrationController.getRegistrationStats.bind(registrationController));

// GET /api/registrations/event/:eventId - Obtener inscripciones de un evento específico
router.get('/event/:eventId', registrationController.getEventRegistrations.bind(registrationController));

// GET /api/registrations/event/:eventId/capacity - Obtener información de capacidad de un evento
router.get('/event/:eventId/capacity', registrationController.getEventCapacity.bind(registrationController));

// GET /api/registrations/:id - Obtener inscripción por ID
router.get('/:id', registrationController.getRegistrationById.bind(registrationController));

// PUT /api/registrations/:id/status - Actualizar estado de inscripción
router.put('/:id/status', registrationController.updateRegistrationStatus.bind(registrationController));

// PUT /api/registrations/:id/cancel - Cancelar inscripción
router.put('/:id/cancel', registrationController.cancelRegistration.bind(registrationController));

// DELETE /api/registrations/:id - Eliminar inscripción completamente (solo admin)
router.delete('/:id', registrationController.deleteRegistration.bind(registrationController));

export default router;
