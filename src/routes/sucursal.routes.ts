import { Router } from 'express';
import {
  createSucursal,
  getSucursalById,
  getAllSucursales,
  updateSucursal,
  deleteSucursal,
  getSucursalesLicenciaProximaExpirar
} from '../controllers/Sucursal.controller';

const router = Router();

// Rutas de sucursales
router.post('/sucursales', createSucursal);
router.get('/sucursales', getAllSucursales);
router.get('/sucursales/licencia-expira', getSucursalesLicenciaProximaExpirar);
router.get('/sucursales/:idSucursal', getSucursalById);
router.put('/sucursales/:idSucursal', updateSucursal);
router.delete('/sucursales/:idSucursal', deleteSucursal);

export default router;
