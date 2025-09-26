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
  console.log("🔐 Verificando autenticación...");
  const authHeader = req.headers.authorization;
  console.log("📋 Authorization header:", authHeader);
  
  const token = authHeader && authHeader.split(" ")[1];
  console.log("🎫 Token extraído:", token ? "Presente" : "Ausente");

  if (!token) {
    console.log("❌ No token provided");
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    // Verificar JWT y adjuntar payload
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("✅ Token válido, usuario:", decoded);
    req.token = token;
    req.user = decoded;
    next();
  } catch (err: any) {
    console.error("❌ Error verificando token:", err.message);
    return res.status(403).json({ error: "Invalid token" });
  }
}

export default authMiddleware;
