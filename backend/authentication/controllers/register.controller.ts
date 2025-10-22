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
      success: true,
      message: "User registered successfully",
      token: token,
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        profile_image: user.profile_image,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error(err);

    if (err instanceof Error) {
      res.status(400).json({ 
        success: false,
        message: err.message 
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: "Internal server error" 
      });
    }
  }
};
