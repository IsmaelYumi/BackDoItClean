import { Router } from 'express';
import {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  loginUser
} from '../controllers/User.controller';

const router = Router();

// Rutas de usuarios
router.post('/users/login', loginUser);
router.post('/users', createUser);
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserById);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);

export default router;
