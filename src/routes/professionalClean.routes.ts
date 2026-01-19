import { Router } from 'express';
import {
  createProfessionalClean,
  getAllProfessionalCleans,
  getProfessionalCleanById,
  deleteProfessionalClean,
  createMultipleProfessionalCleans
} from '../controllers/ProfessionalClean.controller';

const router = Router();

// Rutas de professional cleans
router.post('/professional-cleans/bulk', createMultipleProfessionalCleans);
router.post('/professional-cleans', createProfessionalClean);
router.get('/professional-cleans', getAllProfessionalCleans);
router.get('/professional-cleans/:id', getProfessionalCleanById);
router.delete('/professional-cleans/:id', deleteProfessionalClean);

export default router;
