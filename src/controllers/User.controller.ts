import { Request, Response } from 'express';
import { UserService } from "../services/user.service";

const userService = new UserService();

// Crear usuario
export const createUser = async (req: Request, res: Response) => {
  try {
    const { userId, name, lastname, email, password, phone, idcard, rol, rating, profileURL } = req.body;
    const result = await userService.createUser(userId, name, lastname, email, password, phone, idcard, rol, rating, profileURL);
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
    const user = await userService.getUserById(userId);
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
    const result = await userService.updateUser(userId, userData);
    const status = result.success ? 200 : 404;
    res.status(status).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};
// Eliminar usuario
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await userService.deleteUser(userId);
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
      return res.status(401).json({succes:1,token:" ",sessionID:"",expiredAt:"",user:result});
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};