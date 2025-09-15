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
    console.error(err);
    return res.status(403).json({ error: "Invalid token" });
  }
}

export default authMiddleware;
