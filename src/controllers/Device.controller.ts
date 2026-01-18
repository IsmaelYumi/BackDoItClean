import { Request, Response } from 'express';
import { Device, DeviceType, DeviceStatus } from '../services/Device.service';

const deviceService = new Device();

// Crear dispositivo
export const createDevice = async (req: Request, res: Response) => {
  try {
    const {
      id,
      idSucursal,
      code,
      type,
      name,
      price,
      brand,
      description,
      label,
      model,
      category,
      capacityKg,
      isVisible,
      status,
      programGroups,
      error,
      imageUrl
    } = req.body;

    const result = await deviceService.createDevice(
      id,
      idSucursal,
      code,
      type as DeviceType,
      name,
      price,
      brand,
      description,
      label,
      model,
      category,
      capacityKg,
      isVisible,
      status as DeviceStatus,
      programGroups,
      error,
      imageUrl
    );

    const statusCode = result.success ? 201 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};
// Obtener dispositivo por ID
export const getDeviceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await deviceService.getDeviceById(Number(id));
    const status = result.success ? 200 : 404;
    res.status(status).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};
// Obtener dispositivo por código
export const getDeviceByCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const result = await deviceService.getDeviceByCode(code);
    const status = result.success ? 200 : 404;
    res.status(status).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Obtener todos los dispositivos
export const getAllDevices = async (req: Request, res: Response) => {
  try {
    const result = await deviceService.getAllDevices();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Obtener dispositivos por tipo
export const getDevicesByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const result = await deviceService.getDevicesByType(type as DeviceType);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Obtener dispositivos por estado
export const getDevicesByStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    const result = await deviceService.getDevicesByStatus(status as DeviceStatus);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Actualizar dispositivo
export const updateDevice = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const updateData = req.body;
    const result = await deviceService.updateDevice(code, updateData);
    const status = result.success ? 200 : 404;
    res.status(status).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Eliminar dispositivo
export const deleteDevice = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const result = await deviceService.deleteDevice(code);
    const status = result.success ? 200 : 404;
    res.status(status).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Crear múltiples dispositivos
export const createMultipleDevices = async (req: Request, res: Response) => {
  try {
    const { devices } = req.body;

    if (!Array.isArray(devices) || devices.length === 0) {
      return res.status(400).json({
        mensaje: 'Se requiere un array de dispositivos',
        success: false
      });
    }

    const result = await deviceService.createMultipleDevices(devices);
    const statusCode = result.success ? 201 : 207; // 207 Multi-Status si hay algunos fallidos
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Obtener dispositivos por sucursal
export const getDevicesBySucursal = async (req: Request, res: Response) => {
  try {
    const { idSucursal } = req.params;
    const result = await deviceService.getDevicesBySucursal(Number(idSucursal));
    const status = result.success ? 200 : 404;
    res.status(status).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Obtener todos los datos de dispositivos por sucursal
export const getAllDeviceDataBySucursal = async (req: Request, res: Response) => {
  try {
    const { idSucursal } = req.params;
    const result = await deviceService.getAllDeviceDataBySucursal(Number(idSucursal));
    const status = result.success ? 200 : 404;
    res.status(status).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};
