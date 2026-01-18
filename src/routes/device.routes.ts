import { Router } from 'express';
import {
  createDevice,
  getDeviceByCode,
  getAllDevices,
  getDevicesByType,
  getDevicesByStatus,
  updateDevice,
  deleteDevice,
  createMultipleDevices,
  getDevicesBySucursal
} from '../controllers/Device.controller';

const router = Router();

// Rutas de dispositivos
router.post('/devices/bulk', createMultipleDevices);
router.post('/devices', createDevice);
router.get('/devices', getAllDevices);
router.get('/devices/sucursal/:idSucursal', getDevicesBySucursal);
router.get('/devices/code/:code', getDeviceByCode);
router.get('/devices/type/:type', getDevicesByType);
router.get('/devices/status/:status', getDevicesByStatus);
router.put('/devices/:code', updateDevice);
router.delete('/devices/:code', deleteDevice);

export default router;
