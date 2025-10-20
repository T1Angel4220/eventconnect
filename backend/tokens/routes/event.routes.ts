import { Router } from "express";
import authMiddleware from "authentication/middlewares/auth.middleware";
import { createEvent, deleteEvent, getEvent, listEvents, updateEvent, updateEventStatuses } from "events/controllers/event.controller";

const eventRouter: Router = Router();

eventRouter.get("/", authMiddleware, listEvents);
eventRouter.get("/:id", authMiddleware, getEvent);
eventRouter.post("/", authMiddleware, createEvent);
eventRouter.put("/:id", authMiddleware, updateEvent);
eventRouter.delete("/:id", authMiddleware, deleteEvent);
eventRouter.put("/status/update", authMiddleware, updateEventStatuses);

export default eventRouter;


