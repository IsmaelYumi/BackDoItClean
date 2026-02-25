import { Request, Response } from 'express';
import { UserService } from "../services/user.service";
import sessionService from '../services/session.service';
const userService = new UserService();
// Crear usuario
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, lastName, email, password, phone, idCard, role, rating, profileImageUrl, credit, address } = req.body;
    const result = await userService.createUser(name, lastName, email, phone, idCard, role, password, rating, profileImageUrl, credit, address);
    const status = result.success ? 201 : 400;
    res.status(status).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};
// Obtener usuario por ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await userService.getUserById(Number(userId));
    if (!user) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado', success: false });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Obtener todos los usuarios
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};
// Actualizar usuario
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const userData = req.body;
    const data = await userService.updateUser(Number(userId), userData);
    const status = data.success ? 200 : 404;
    res.status(status).json(data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};
// Eliminar usuario
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await userService.deleteUser(Number(userId));
    const status = result.success ? 200 : 404;
    res.status(status).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};
// Login de usuario
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        mensaje: 'Email y contraseña son requeridos' 
      });
    }
    const result = await userService.loginUser(email, password);
    if (!result.success) {
     return res.status(401).json({message:"Error en la verificacion"})
    }
     return res.status(200).json({token:" ",sessionId:"",expiredAt:"",result});
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Obtener usuarios por roles
export const getUsersByRoles = async (req: Request, res: Response) => {
  try {
    const { roles } = req.body;
    
    if (!roles || !Array.isArray(roles)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Debe proporcionar un array de roles' 
      });
    }

    const result = await userService.getUsersByRoles(roles);
    const status = result.success ? 200 : 400;
    res.status(status).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Crear sesión
export const createSession = async (req: Request, res: Response) => {
  try {
    const { operator, startDate, endDate } = req.body;
    
    if (!operator || !startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        mensaje: 'Operator, startDate y endDate son requeridos' 
      });
    }

    const result = await userService.createSession(operator, startDate, endDate);
    const status = result.success ? 201 : 400;
    res.status(status).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Obtener sesión por ID
export const getSessionById = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = await sessionService.getSessionById(Number(sessionId));
    
    if (!session) {
      return res.status(404).json({ mensaje: 'Sesión no encontrada', success: false });
    }
    
    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Obtener todas las sesiones
export const getAllSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await sessionService.getAllSessions();
    res.status(200).json({ success: true, sessions, count: sessions.length });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Obtener sesiones por operador
export const getSessionsByOperator = async (req: Request, res: Response) => {
  try {
    const { operator } = req.params;
    const sessions = await sessionService.getSessionsByOperator(Number(operator));
    res.status(200).json({ success: true, sessions, count: sessions.length });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};