import { Router } from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
  createMultipleProducts
} from '../controllers/Product.controller';

const router = Router();

// Rutas de productos
router.post('/products/bulk', createMultipleProducts);
router.post('/products', createProduct);
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.delete('/products/:id', deleteProduct);

export default router;
