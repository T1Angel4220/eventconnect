import { UserData } from "authentication/models/userData.interface";
import { authService } from "authentication/services/auth.service";
import { Request, Response } from "express";

export const register = async (req: Request, res: Response) => {
  try {
    await authService.register(req.body as UserData);

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (err) {
    console.error(err);

    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};
