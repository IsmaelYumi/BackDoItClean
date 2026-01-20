import { Request, Response } from 'express';
import { Sucursal } from '../services/Sucursal.service';

const sucursalService = new Sucursal();

// Crear sucursal
export const createSucursal = async (req: Request, res: Response) => {
  try {
    const {
      nombre,
      numeroMaquinas,
      ud,
      floorDistribution,
      fechaExpiracionLicencia
    } = req.body;

    const result = await sucursalService.createSucursal(
      nombre,
      numeroMaquinas,
      ud,
      floorDistribution,
      new Date(fechaExpiracionLicencia)
    );

    const statusCode = result.success ? 201 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};
export const getSucursalById = async (req: Request, res: Response) => {
  try {
    const { idSucursal } = req.params;
    const result = await sucursalService.getSucursalById(Number(idSucursal));
    const status = result.success ? 200 : 404;
    res.status(status).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};
export const getAllSucursales = async (req: Request, res: Response) => {
  try {
    const result = await sucursalService.getAllSucursales();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};
// Actualizar sucursal
export const updateSucursal = async (req: Request, res: Response) => {
  try {
    const { id_sucursal } = req.params;
    const updateData = req.body;
    
    // Convertir fechaExpiracionLicencia a Date si existe
    if (updateData.fechaExpiracionLicencia) {
      updateData.fechaExpiracionLicencia = new Date(updateData.fechaExpiracionLicencia);
    }
    const result = await sucursalService.updateSucursal(Number(id_sucursal), updateData);
    const statusCode = result.success ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Eliminar sucursal
export const deleteSucursal = async (req: Request, res: Response) => {
  try {
    const { idSucursal } = req.params;
    const result = await sucursalService.deleteSucursal(Number(idSucursal));
    const statusCode = result.success ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Obtener sucursales con licencia próxima a expirar
export const getSucursalesLicenciaProximaExpirar = async (req: Request, res: Response) => {
  try {
    const { dias } = req.query;
    const diasNumber = dias ? Number(dias) : 30;
    const result = await sucursalService.getSucursalesLicenciaProximaExpirar(diasNumber);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};
