import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extender la interfaz Request para incluir el usuario decodificado
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ 
        mensaje: "No se proporcionó token de autenticación", 
        success: false 
      });
    }

    // El formato esperado es: "Bearer TOKEN"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        mensaje: "Formato de token inválido", 
        success: false 
      });
    }

    // Verificar el token
    const secret = process.env.JWT_SECRET || 'tu_clave_secreta_aqui';
    const decoded = jwt.verify(token, secret);
    
    // Agregar la información del usuario decodificado al request
    req.user = decoded;
    
    // Continuar con el siguiente middleware o controlador
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        mensaje: "Token expirado", 
        success: false 
      });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        mensaje: "Token inválido", 
        success: false 
      });
    }
    
    return res.status(500).json({ 
      mensaje: "Error al verificar token", 
      success: false 
    });
  }
};

// Middleware opcional para verificar roles específicos
export const verifyRole = (...rolesPermitidos: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        mensaje: "Usuario no autenticado", 
        success: false 
      });
    }

    const userRole = req.user.rol || req.user.role;
    
    if (!rolesPermitidos.includes(userRole)) {
      return res.status(403).json({ 
        mensaje: "No tienes permisos para acceder a este recurso", 
        success: false 
      });
    }

    next();
  };
};