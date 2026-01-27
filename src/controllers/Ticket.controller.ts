import { Request, Response } from 'express';
import { Ticket } from "../services/Ticket.service";

const ticketService = new Ticket();

// Crear Ticket
export const createTicket = async (req: Request, res: Response) => {
  try {
    const { price, userId, paymentType, status, cartList, dueAt, operatorId, paidAmount, printedAt } = req.body;
    const result = await ticketService.CreateTicket(price, status, userId, paymentType, cartList, dueAt, operatorId, paidAmount, printedAt);
    const statusCode = result.success ? 201 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};
// Obtener todos los Tickets
export const getAllTickets = async (req: Request, res: Response) => {
  try {
    const result = await ticketService.GetAllTickets();
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor', success: false, error });
  }
};

// Obtener Ticket por ID
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

// Obtener Tickets por usuario
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

// Actualizar Ticket
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

// Actualizar estado de Ticket
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

// Eliminar Ticket
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
