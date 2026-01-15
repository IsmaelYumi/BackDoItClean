import { Request, Response } from 'express';
import { productos } from '../services/product.service';

const productService = new productos();

// Crear producto
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { id, Nombre, precio, categoria, imagenUrl, codigo, isVisible, descripccion } = req.body;
    const result = await productService.createProduct(
      id,
      Nombre,
      precio,
      categoria,
      imagenUrl,
      codigo,
      isVisible,
      descripccion
    );
    const status = result.codigo ? 201 : 400;
    res.status(status).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Obtener producto por ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await productService.getProductById(Number(id));
    const status = result.success ? 200 : 404;
    res.status(status).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Eliminar producto
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await productService.DeleteProduct(Number(id));
    const status = result.success ? 200 : 404;
    res.status(status).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Crear múltiples productos
export const createMultipleProducts = async (req: Request, res: Response) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        mensaje: 'Se requiere un array de productos',
        success: false
      });
    }

    const result = await productService.createMultipleProducts(products);
    const statusCode = result.success ? 201 : 207; // 207 Multi-Status si hay algunos fallidos
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};
