import { Router } from 'express';
import {
  createService,
  getServiceById,
  getServicesByClient,
  getServicesByUser,
  getAllServices,
  getServicesByType,
  getServicesByDateRange,
  validateAndUpdateDeviceStatus
} from '../controllers/Service.controller';

const router = Router();

// Rutas de servicios
router.post('/services', createService);
router.post('/services/validate-device', validateAndUpdateDeviceStatus);
router.get('/services', getAllServices);
router.get('/services/date-range', getServicesByDateRange);
router.get('/services/:id', getServiceById);
router.get('/services/client/:clientId', getServicesByClient);
router.get('/services/user/:userId', getServicesByUser);
router.get('/services/type/:type', getServicesByType);

export default router;
