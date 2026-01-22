import { Router } from 'express';
import {
  createTicket,
  getAllTickets,
  getTicketById,
  getTicketsByUser,
  updateTicket,
  updateTicketStatus,
  deleteTicket
} from '../controllers/Ticket.controller';

const router = Router();

// Rutas de tickets
router.post('/tickets', createTicket);
router.get('/tickets', getAllTickets);
router.get('/tickets/:ticketId', getTicketById);
router.get('/tickets/user/:userId', getTicketsByUser);
router.put('/tickets/:ticketId', updateTicket);
router.patch('/tickets/:ticketId/status', updateTicketStatus);
router.delete('/tickets/:ticketId', deleteTicket);

export default router;
