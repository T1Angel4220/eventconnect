import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@config/jwtConfig";

declare module "express" {
  export interface Request {
    token?: string;
    user?: any;
  }
}

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    // Verificar JWT y adjuntar payload
    const decoded = jwt.verify(token, JWT_SECRET);
    req.token = token;
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT Error:', err);
    
    // Manejar específicamente el error de token expirado
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        error: "Token expired", 
        code: "TOKEN_EXPIRED",
        message: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
      });
    }
    
    // Otros errores de JWT
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        error: "Invalid token", 
        code: "INVALID_TOKEN",
        message: "Token inválido. Por favor, inicia sesión nuevamente."
      });
    }
    
    // Error genérico
    return res.status(401).json({ 
      error: "Authentication failed", 
      code: "AUTH_FAILED",
      message: "Error de autenticación. Por favor, inicia sesión nuevamente."
    });
  }
}

export default authMiddleware;
