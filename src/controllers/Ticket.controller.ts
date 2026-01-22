import { Request, Response } from 'express';
import { Ticket, PaymentType } from "../services/Ticket.service";

const ticketService = new Ticket();

// Crear ticket
export const createTicket = async (req: Request, res: Response) => {
  try {
    const { price, status, user, paymentType, cartList } = req.body;
    const result = await ticketService.CrarTickect(price, status, user, paymentType as PaymentType, cartList);
    const statusCode = result.success ? 201 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Obtener todos los tickets
export const getAllTickets = async (req: Request, res: Response) => {
  try {
    const result = await ticketService.GetAllTickets();
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Obtener ticket por ID
export const getTicketById = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const result = await ticketService.GetTicketById(ticketId);
    const statusCode = result.success ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Obtener tickets por usuario
export const getTicketsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await ticketService.GetTicketsByUser(userId);
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Actualizar ticket
export const updateTicket = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const updateData = req.body;
    const result = await ticketService.UpdateTicket(ticketId, updateData);
    const statusCode = result.success ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Actualizar estado del ticket
export const updateTicketStatus = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;
    const result = await ticketService.UpdateTicketStatus(ticketId, status);
    const statusCode = result.success ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Eliminar ticket
export const deleteTicket = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const result = await ticketService.DeleteTicket(ticketId);
    const statusCode = result.success ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};
