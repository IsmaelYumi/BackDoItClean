import { Request, Response } from 'express';
import { DryCleaning } from "../services/DryCleaning.service";

const dryCleaningService = new DryCleaning();

// Crear DryCleaning
export const createDryCleaning = async (req: Request, res: Response) => {
  try {
    const { price, userId, paymentType, cartList } = req.body;
    const result = await dryCleaningService.CreateDryCleaning(price, userId, paymentType, cartList);
    const statusCode = result.success ? 201 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};
// Obtener todos los DryCleanings
export const getAllDryCleanings = async (req: Request, res: Response) => {
  try {
    const result = await dryCleaningService.GetAllDryCleanings();
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Obtener DryCleaning por ID
export const getDryCleaningById = async (req: Request, res: Response) => {
  try {
    const { dryCleaningId } = req.params;
    const result = await dryCleaningService.GetDryCleaningById(dryCleaningId);
    const statusCode = result.success ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Obtener DryCleanings por usuario
export const getDryCleaningsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await dryCleaningService.GetDryCleaningsByUser(userId);
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Actualizar DryCleaning
export const updateDryCleaning = async (req: Request, res: Response) => {
  try {
    const { dryCleaningId } = req.params;
    const updateData = req.body;
    const result = await dryCleaningService.UpdateDryCleaning(dryCleaningId, updateData);
    const statusCode = result.success ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Actualizar estado de DryCleaning
export const updateDryCleaningStatus = async (req: Request, res: Response) => {
  try {
    const { dryCleaningId } = req.params;
    const { status } = req.body;
    const result = await dryCleaningService.UpdateDryCleaningStatus(dryCleaningId, status);
    const statusCode = result.success ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Eliminar DryCleaning
export const deleteDryCleaning = async (req: Request, res: Response) => {
  try {
    const { dryCleaningId } = req.params;
    const result = await dryCleaningService.DeleteDryCleaning(dryCleaningId);
    const statusCode = result.success ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};
