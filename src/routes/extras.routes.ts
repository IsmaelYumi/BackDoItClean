import { Router } from 'express';
import {
    createExtra,
    getAllExtras,
    getExtraById,
    getActiveExtras,
    updateExtra,
    deleteExtra,
    toggleExtraStatus
} from '../controllers/Extras.controller';

const router = Router();

// Rutas de extras
router.post('/extras', createExtra);
router.get('/extras', getAllExtras);
router.get('/extras/active', getActiveExtras);
router.get('/extras/:id', getExtraById);
router.put('/extras/:id', updateExtra);
router.patch('/extras/:id/toggle-status', toggleExtraStatus);
router.delete('/extras/:id', deleteExtra);

export default router;
