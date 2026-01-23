import { Router } from 'express';
import {
  createDryCleaning,
  getAllDryCleanings,
  getDryCleaningById,
  getDryCleaningsByUser,
  updateDryCleaning,
  updateDryCleaningStatus,
  deleteDryCleaning
} from '../controllers/DryCleaning.controller';

const router = Router();

// Rutas de DryCleaning
router.post('/drycleaning', createDryCleaning);
router.get('/drycleaning', getAllDryCleanings);
router.get('/drycleaning/:dryCleaningId', getDryCleaningById);
router.get('/drycleaning/user/:userId', getDryCleaningsByUser);
router.put('/drycleaning/:dryCleaningId', updateDryCleaning);
router.patch('/drycleaning/:dryCleaningId/status', updateDryCleaningStatus);
router.delete('/drycleaning/:dryCleaningId', deleteDryCleaning);
export default router;
