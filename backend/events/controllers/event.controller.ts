import { Request, Response } from "express";
import { eventService } from "events/services/event.service";
import { EventFilters } from "events/repositories/event.repository";

export const listEvents = async (req: Request, res: Response) => {
  try {
    console.log('📥 Query params recibidos:', req.query);
    
    // Construir filtros desde query params
    const filters: EventFilters = {};

    // Filtros de fecha
    if (req.query.dateRange) {
      filters.dateRange = req.query.dateRange as any;
      console.log('📅 dateRange recibido:', req.query.dateRange);
    }
    if (req.query.startDate) {
      filters.startDate = req.query.startDate as string;
    }
    if (req.query.endDate) {
      filters.endDate = req.query.endDate as string;
    }

    // Filtros básicos
    if (req.query.location) {
      filters.location = req.query.location as string;
    }
    if (req.query.eventType) {
      filters.eventType = req.query.eventType as any;
    }
    if (req.query.status) {
      filters.status = req.query.status as any;
    }

    // Ordenamiento
    if (req.query.sortBy) {
      filters.sortBy = req.query.sortBy as any;
    }
    if (req.query.sortOrder) {
      filters.sortOrder = req.query.sortOrder as any;
    }

    console.log('🔍 Filtros procesados:', JSON.stringify(filters, null, 2));

    const events = await eventService.listWithFilters(filters);
    
    console.log(`✅ Retornando ${events.length} eventos`);
    
    res.json({
      success: true,
      data: events,
      filters: filters,
      count: events.length
    });
  } catch (error) {
    console.error('❌ Error al listar eventos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener eventos',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
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


