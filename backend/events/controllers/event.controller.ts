import { Request, Response } from "express";
import { eventService } from "events/services/event.service";

export const listEvents = async (_req: Request, res: Response) => {
  const events = await eventService.list();
  res.json(events);
};

export const getEvent = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const event = await eventService.getById(id);
  if (!event) return res.status(404).json({ error: "Evento no encontrado" });
  res.json(event);
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const organizerId = req.user?.userId;
    if (!organizerId) return res.status(401).json({ error: "No autorizado" });
    const created = await eventService.create(req.body, organizerId);
    res.status(201).json(created);
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? "Error creando evento" });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const updated = await eventService.update(id, req.body);
  if (!updated) return res.status(404).json({ error: "Evento no encontrado" });
  res.json(updated);
};

export const deleteEvent = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await eventService.remove(id);
  res.status(204).send();
};


