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
    console.log("📝 Creando evento con datos:", JSON.stringify(req.body, null, 2));
    console.log("👤 Usuario:", req.user);
    
    const organizerId = req.user?.userId;
    if (!organizerId) {
      console.log("❌ No hay userId en req.user");
      return res.status(401).json({ error: "No autorizado" });
    }
    
    console.log("🔍 Organizer ID:", organizerId);
    const created = await eventService.create(req.body, organizerId);
    console.log("✅ Evento creado exitosamente:", created.event_id);
    res.status(201).json(created);
  } catch (e: any) {
    console.error("❌ Error creando evento:", e.message);
    console.error("📊 Stack trace:", e.stack);
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

export const updateEventStatuses = async (_req: Request, res: Response) => {
  try {
    console.log("🔄 Actualizando estados de eventos...");
    const updatedCount = await eventService.updateAllEventStatuses();
    console.log(`✅ Se actualizaron ${updatedCount} eventos`);
    res.json({ 
      message: `Estados actualizados exitosamente`, 
      updatedCount 
    });
  } catch (e: any) {
    console.error("❌ Error actualizando estados:", e.message);
    res.status(500).json({ error: e.message ?? "Error actualizando estados" });
  }
};


