import { eventController } from "events/controllers/event.controller";
import authMiddleware from "authentication/middlewares/auth.middleware";
import { Router } from "express";
import upload from "../../middleware/upload";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  upload.single("event_image"),
  eventController.createEvent.bind(eventController),
);
router.get("/", eventController.listEvents.bind(eventController));
router.get(
  "/with-organizer",
  eventController.getEventsWithOrganizer.bind(eventController),
);
router.get(
  "/upcoming",
  eventController.getUpcomingEvents.bind(eventController),
);
router.get("/active", eventController.getActiveEvents.bind(eventController));
router.get("/stats", eventController.getEventStats.bind(eventController));
router.get(
  "/organizer/:organizerId",
  eventController.getEventsByOrganizer.bind(eventController),
);
router.get("/:id", eventController.getEventById.bind(eventController));
router.put(
  "/:id",
  upload.single("event_image"),
  eventController.updateEvent.bind(eventController),
);
router.delete("/:id", eventController.deleteEvent.bind(eventController));
router.put(
  "/status/update",
  eventController.updateEventStatuses.bind(eventController),
);

export default router;
