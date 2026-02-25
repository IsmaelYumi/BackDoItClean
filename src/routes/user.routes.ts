import { Router } from 'express';
import {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  loginUser,
  getUsersByRoles,
  createSession,
  getSessionById,
  getAllSessions,
  getSessionsByOperator
} from '../controllers/User.controller';

const router = Router();

// Rutas de usuarios
router.post('/users/login', loginUser);
router.post('/users', createUser);
router.post('/users/by-roles', getUsersByRoles);
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserById);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);

// Rutas de sesiones
router.post('/sessions', createSession);
router.get('/sessions', getAllSessions);
router.get('/sessions/:sessionId', getSessionById);
router.get('/sessions/operator/:operator', getSessionsByOperator);

export default router;
