import { Request, Response } from 'express';
import { Extras, TypeExtra } from '../services/Extras.service';

const extrasService = new Extras();

// Crear extra
export const createExtra = async (req: Request, res: Response) => {
    try {
        const { name, value, type, isVisible, isEnable } = req.body;

        const result = await extrasService.createExtra(
            name,
            value,
            type as TypeExtra,
            isVisible,
            isEnable
        );

        const status = result.success ? 201 : 400;
        res.status(status).json(result);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
    }
};

// Obtener todos los extras
export const getAllExtras = async (_req: Request, res: Response) => {
    try {
        const result = await extrasService.getAllExtras();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
    }
};

// Obtener extra por ID
export const getExtraById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await extrasService.getExtraById(id);
        const status = result.success ? 200 : 404;
        res.status(status).json(result);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
    }
};

// Obtener solo extras activos
export const getActiveExtras = async (_req: Request, res: Response) => {
    try {
        const result = await extrasService.getActiveExtras();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
    }
};

// Actualizar extra
export const updateExtra = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, value, type, isVisible, isEnable } = req.body;

        const result = await extrasService.updateExtra(id, {
            name,
            value,
            type: type as TypeExtra,
            isVisible,
            isEnable
        });

        const status = result.success ? 200 : 404;
        res.status(status).json(result);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
    }
};

// Eliminar extra
export const deleteExtra = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await extrasService.deleteExtra(id);
        const status = result.success ? 200 : 404;
        res.status(status).json(result);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
    }
};

// Activar o desactivar extra
export const toggleExtraStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await extrasService.toggleExtraStatus(id);
        const status = result.success ? 200 : 404;
        res.status(status).json(result);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
    }
};
