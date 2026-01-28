import { Router } from 'express';
import {
  createTicket,
  getAllTickets,
  getTicketById,
  getTicketsByUser,
  updateTicket,
  updateTicketStatus,
  deleteTicket,
  getTicketsWithUsers
} from '../controllers/Ticket.controller';

const router = Router();

// Rutas de Ticket
router.post('/ticket', createTicket);
router.get('/ticket', getAllTickets);
router.get('/ticket/with-users', getTicketsWithUsers);
router.get('/ticket/:ticketId', getTicketById);
router.get('/ticket/user/:userId', getTicketsByUser);
router.put('/ticket/:ticketId', updateTicket);
router.patch('/ticket/:ticketId/status', updateTicketStatus);
router.delete('/ticket/:ticketId', deleteTicket);
export default router;
