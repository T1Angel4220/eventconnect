import { Router } from "express";
import authMiddleware from "authentication/middlewares/auth.middleware";
import { createEvent, deleteEvent, getEvent, listEvents, updateEvent } from "events/controllers/event.controller";

const eventRouter: Router = Router();

eventRouter.get("/events", authMiddleware, listEvents);
eventRouter.get("/events/:id", authMiddleware, getEvent);
eventRouter.post("/events", authMiddleware, createEvent);
eventRouter.put("/events/:id", authMiddleware, updateEvent);
eventRouter.delete("/events/:id", authMiddleware, deleteEvent);

export default eventRouter;


