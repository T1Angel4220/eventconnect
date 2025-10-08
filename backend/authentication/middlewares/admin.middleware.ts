import { NextFunction, Request, Response } from "express";

declare module "express" {
  export interface Request {
    token?: string;
    user?: any;
  }
}

/**
 * Middleware para verificar que el usuario autenticado tiene rol de admin
 */
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Verificar que el usuario tenga rol de admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador.',
        code: 'ADMIN_REQUIRED'
      });
    }

    // Si todo está bien, continuar
    next();
  } catch (error) {
    console.error('Error en adminMiddleware:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware para verificar que el usuario autenticado es admin u organizador
 */
export const adminOrOrganizerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Verificar que el usuario tenga rol de admin u organizador
    if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador u organizador.',
        code: 'ADMIN_OR_ORGANIZER_REQUIRED'
      });
    }

    // Si todo está bien, continuar
    next();
  } catch (error) {
    console.error('Error en adminOrOrganizerMiddleware:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export default adminMiddleware;
