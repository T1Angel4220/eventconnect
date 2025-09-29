import { Router } from "express";
import { organizerController } from "authentication/controllers/organizer.controller";
import authMiddleware from "authentication/middlewares/auth.middleware";
import upload, { profileUpload } from "../../middleware/upload";

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas de gestión de perfil
router.get("/profile", organizerController.getMyProfile.bind(organizerController));
router.put("/profile", organizerController.updateMyProfile.bind(organizerController));
router.put("/change-password", organizerController.changePassword.bind(organizerController));

// Rutas de configuración de eventos
router.get("/event-preferences", organizerController.getEventPreferences.bind(organizerController));
router.put("/event-preferences", organizerController.updateEventPreferences.bind(organizerController));

// Rutas de imagen de perfil
router.post("/profile-image", profileUpload.single('profileImage'), organizerController.updateProfileImage.bind(organizerController));
router.delete("/profile-image", organizerController.deleteProfileImage.bind(organizerController));

export default router;
