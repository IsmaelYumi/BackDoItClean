import { Request, Response } from 'express';
import { professionalCleans } from '../services/ProfessionalClean.service';

const professionalCleanService = new professionalCleans();

// Crear professional clean
export const createProfessionalClean = async (req: Request, res: Response) => {
  try {
    const { 
      code, 
      name, 
      price, 
      description, 
      category, 
      imageUrl, 
      isVisible, 
      programGroups 
    } = req.body;
    
    const result = await professionalCleanService.createProfessionalClean(
      code,
      name,
      price,
      description,
      category,
      imageUrl,
      isVisible,
      programGroups
    );
    const status = result.success ? 201 : 400;
    res.status(status).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Obtener todos los professional cleans
export const getAllProfessionalCleans = async (req: Request, res: Response) => {
  try {
    const result = await professionalCleanService.getAllProfessionalCleans();
    const status = result.success ? 200 : 500;
    res.status(status).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Obtener professional clean por ID
export const getProfessionalCleanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await professionalCleanService.getProfessionalCleanById(Number(id));
    const status = result.success ? 200 : 404;
    res.status(status).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Eliminar professional clean
export const deleteProfessionalClean = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await professionalCleanService.DeleteProfessionalClean(Number(id));
    const status = result.success ? 200 : 404;
    res.status(status).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Crear múltiples professional cleans
export const createMultipleProfessionalCleans = async (req: Request, res: Response) => {
  try {
    const { professionalCleans } = req.body;

    if (!Array.isArray(professionalCleans) || professionalCleans.length === 0) {
      return res.status(400).json({
        mensaje: 'Se requiere un array de professional cleans',
        success: false
      });
    }

    const result = await professionalCleanService.createMultipleProfessionalCleans(professionalCleans);
    const statusCode = result.success ? 201 : 207; // 207 Multi-Status si hay algunos fallidos
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};
