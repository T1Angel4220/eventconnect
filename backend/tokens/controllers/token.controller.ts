import { Request, Response } from "express";
import { tokenService } from "tokens/services/token.service";

export const getAllTokens = async (_req: Request, res: Response) => {
  const tokens = await tokenService.getAll();
  res.json(tokens);
};

export const getToken = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const event = await tokenService.getById(id);
  if (!event) return res.status(404).json({ error: "Evento no encontrado" });
  res.json(event);
};

export const createToken = async (req: Request, res: Response) => {
  try {
    console.log("Creando token con datos: ", JSON.stringify(req.body, null, 2));

    const created = await tokenService.create(req.body);
    console.log("✅ Token creado con éxito:", JSON.stringify(created, null, 2));
    res.status(201).json(created);
  } catch (e: any) {
    console.error("❌ Error creando token:", e.message);
    console.error("📊 Stack trace:", e.stack);
    res.status(400).json({ error: e.message ?? "Error creando token" });
  }
};

export const updateToken = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const updated = await tokenService.update(id, req.body);
  if (!updated) return res.status(404).json({ error: "Token no encontrado" });
  res.json(updated);
};

export const deleteToken = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await tokenService.remove(id);
  res.status(204).send();
};
