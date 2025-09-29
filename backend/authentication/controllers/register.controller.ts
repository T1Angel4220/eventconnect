import { UserData } from "authentication/models/userData.interface";
import { authService } from "authentication/services/auth.service";
import { Request, Response } from "express";

export const register = async (req: Request, res: Response) => {
  try {
    const userData = req.body as UserData;
    const newUser = await authService.register(userData);

    // Generar token para el nuevo usuario
    const { login } = await import("./login.controller");
    const loginReq = {
      body: {
        email: userData.email,
        password: userData.password
      }
    } as Request;
    
    // Simular login para obtener token
    const { user, token } = await authService.login({
      email: userData.email,
      password: userData.password
    });

    res.status(201).json({
      message: "User registered successfully",
      token: token,
      role: user.role,
      firstName: user.first_name,
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
