import { Request, Response } from 'express';
import { ServiceSales, PaymentType, ServiceType } from '../services/Service.service';

const serviceService = new ServiceSales();

// Crear servicio/nota de venta
export const createService = async (req: Request, res: Response) => {
  try {
    const { IdCliente, Fecha, CartList, PaymentType, ServiceType, IdUser, Total } = req.body;

    
    const result = await serviceService.createService(
      IdCliente,
      Fecha,
      CartList,
      PaymentType as PaymentType,
      ServiceType as ServiceType,
      IdUser,
      Total
    );
    const status = result.success ? 201 : 400;

    res.status(status).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Obtener servicio por ID
export const getServiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await serviceService.getServiceById(id);
    const status = result.success ? 200 : 404;
    res.status(status).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Obtener servicios por cliente
export const getServicesByClient = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const result = await serviceService.getServicesByClient(clientId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Obtener servicios por usuario/operario
export const getServicesByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await serviceService.getServicesByUser(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Obtener todos los servicios
export const getAllServices = async (req: Request, res: Response) => {
  try {
    const result = await serviceService.getAllServices();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Obtener servicios por tipo
export const getServicesByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const result = await serviceService.getServicesByType(type as ServiceType);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Obtener servicios por rango de fechas
export const getServicesByDateRange = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        mensaje: 'Se requieren startDate y endDate como parámetros',
        success: false
      });
    }

    const result = await serviceService.getServicesByDateRange(
      new Date(startDate as string),
      new Date(endDate as string)
    );
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Validar transacción y actualizar estado del dispositivo
export const validateAndUpdateDeviceStatus = async (req: Request, res: Response) => {
  try {
    const { transactionId, deviceCode,  } = req.body;

    if (!transactionId || !deviceCode) {
      return res.status(400).json({
        mensaje: 'Se requieren transactionId, deviceCode',
        success: false
      });
    }

    const result = await serviceService.validateAndUpdateDeviceStatus(
      transactionId,
      deviceCode
    );

    const status = result.success ? 200 : 400;
    res.status(status).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};
