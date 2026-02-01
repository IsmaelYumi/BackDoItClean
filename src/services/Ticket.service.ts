import {db} from '../config/dbconfig.config';
import { getAllTickets } from '../controllers/Ticket.controller';
import { UserService } from "../services/user.service";
import admin from 'firebase-admin';
const userService = new UserService();
export enum StatusTicket{
    OPEN="open",
    CLOSE="close",
    NULLLED="nulled",
    TOPAY="toPay"
}
export enum PaymentType{
    CASH="cash",
    TRANSFER="Transfer"
}
export class Ticket{
    private ticketCollection = db.collection("Tickets");
    private counterCollection = db.collection("Counters");
    async getNextId(): Promise<number> {
        const counterRef = this.counterCollection.doc("ticketCounter");
        
        try {
            const result = await db.runTransaction(async (transaction) => {
                const counterDoc = await transaction.get(counterRef);
                
                let newId: number;
                if (!counterDoc.exists) {
                    newId = 1;
                    transaction.set(counterRef, { lastId: newId });
                } else {
                    newId = counterDoc.data()!.lastId + 1;
                    transaction.update(counterRef, { lastId: newId });
                }
                
                return newId;
            });
            
            return result;
        } catch (error) {
            console.error("Error getting next ID:", error);
            throw error;
        }
    }
    async CreateTicket(price: number, status:StatusTicket,user: string, paymentType: PaymentType, cartList: any[], dueAt: string, operatorId:string, changeAmount: number, paidAmount: number,type:string, printedAt?:string, createdAt?: string, updatedAt?: string) {
        try {
            const nextId = await this.getNextId();
            const ticketRef = this.ticketCollection.doc(nextId.toString());
            const ticketData = {
                id: nextId,
                price: price,
                status:  status,
                userId: user,
                paymentType: paymentType,
                cartList: cartList,
                printedAt: printedAt,
                dueAt:dueAt,
                createdAt: createdAt ,
                updatedAt: updatedAt , 
                operatorId:operatorId,
                paidAmount: paidAmount || 0,
                changeAmount: changeAmount || 0,
                type: type
            };
            // Crear el ticket
            await ticketRef.set(ticketData);
            
            // Solo actualizar el cash del usuario si el estado no es "open"
            if (status !== StatusTicket.OPEN) {
                const restante = Number(paidAmount) - Number(price);
                const cashToAdd = restante - Number(changeAmount);
                // Actualizar el cash del usuario (convertir a number)
                const cashResult = await userService.updateCash(user, cashToAdd);
                if (cashResult.success === true) {
                    return {
                        success: true,
                        ticketId: nextId,
                        cashUpdated: cashResult
                    };
                } else {
                    return {
                        success: false,
                        message: "Error en la actualizacion del usuario"
                    };
                }
            }
            
            // Si el estado es "open", solo devolver el ticket sin actualizar el usuario
            return {
                success: true,
                ticketId: nextId,
                cashUpdated: null
            };
        } catch (error) {
            console.error("Error creating ticket:", error);
            return {
                success: false,
                error: error
            };
        }
    }
    async GetAllTickets() {
        try {
            const snapshot = await this.ticketCollection.get();
            const tickets = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    type:data?.type || "professionalClean",
                    ...data,
                    createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
                    printedAt: data.printedAt?.toDate?.() ? data.printedAt.toDate().toISOString() : data.printedAt
                };
            });
            return {
                success: true,
                data: tickets
            };
        } catch (error) {
            console.error("Error getting tickets:", error);
            return {
                success: false,
                error: error
            };
        }
    }
    async GetTicketById(ticketId: string) {
        try {
            const doc = await this.ticketCollection.doc(ticketId).get();
            if (!doc.exists) {
                return {
                    success: false,
                    error: "Ticket not found"
                };
            }
            const data = doc.data();
            return {
                success: true,
                data: {
                    id: doc.id,
                    ...data,
                    type: data?.type || "professionalClean"
                }
            };
        } catch (error) {
            console.error("Error getting ticket:", error);
            return {
                success: false,
                error: error
            };
        }
    }
    async GetTicketsByUser(userId: string) {
        try {
            const snapshot = await this.ticketCollection.where("userId", "==", userId).get();
            const tickets = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return {
                success: true,
                data: tickets
            };
        } catch (error) {
            console.error("Error getting tickets by user:", error);
            return {
                success: false,
                error: error
            };
        }
    }
    async GetTicketsByDate(date: string, operatorId?:string) {
        try {
            // Parsear la fecha en formato ISO (2026-01-29T00:06:56.806999)
            const inputDate = new Date(date);
            
            // Extraer año, mes y día para crear el rango del día completo
            const year = inputDate.getFullYear();
            const month = String(inputDate.getMonth() + 1).padStart(2, '0');
            const day = String(inputDate.getDate()).padStart(2, '0');
            
            // Crear strings para el rango del día completo (YYYY-MM-DD)
            const dateStart = `${year}-${month}-${day}T00:00:00`;
            const dateEnd = `${year}-${month}-${day}T23:59:59`;
            
            console.log('Fecha recibida:', date);
            console.log('dateStart:', dateStart);
            console.log('dateEnd:', dateEnd);
            
            let query = this.ticketCollection
                .where("createdAt", ">=", dateStart)
                .where("createdAt", "<=", dateEnd);
            
            if(operatorId){
                query = query.where("operatorId", "==", operatorId);
                console.log('Filtrando por operatorId:', operatorId);
            }
            
            const snapshot = await query.get();
            console.log('Documentos encontrados:', snapshot.size);
            if (snapshot.empty) {
                return {
                    success: true,
                    data: [],
                    count: 0
                };
            }
            const datatickets = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    type: data?.type || "professionalClean",
                    ...data,
                    createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
                    printedAt: data.printedAt?.toDate?.() ? data.printedAt.toDate().toISOString() : data.printedAt
                };
            });

            // Convertir a string antes de crear el Set para asegurar unicidad
            const userId: string[] = [...new Set(datatickets.map((ticket:any) => String(ticket.userId)))];
            
            // Buscar usuarios por ID
            const userPromises = userId.map(id => userService.getUserById(Number(id)));
            const usersResults = await Promise.all(userPromises);
            
            // Crear mapa de usuarios
            const usersMap: {[key: string]: any} = {};
            usersResults.forEach((user: any) => {
                if(user && user.id) {
                    const userId = String(user.id);
                    usersMap[userId] = user;
                }
            });
            
            // Mapear tickets con información completa del ticket y usuario
            const ticketsConUsuario = datatickets.map((ticket: any) => {
                const ticketUserId = String(ticket.userId);
                const user = usersMap[ticketUserId];
                return {
                    ...ticket,
                    user: user || null
                };
            });
            
            return {
                success: true,
                data: ticketsConUsuario,
                count: ticketsConUsuario.length
            };
        } catch (error) {
            console.error("Error getting tickets by date:", error);
            return {
                success: false,
                error: error
            };
        }
    }
    async UpdateTicket(ticketId: string, updateData: any) {
        try {
            const ticketRef = this.ticketCollection.doc(ticketId);
            const doc = await ticketRef.get();
            if (!doc.exists) {
                return {
                    success: false,
                    error: "Ticket not found"
                };
            }
            const dataToUpdate = {
                ...updateData,
            };
            await ticketRef.update(dataToUpdate);
            return {
                success: true,
                ticketId: ticketId,
                data: dataToUpdate
            };
        } catch (error) {
            console.error("Error updating ticket:", error);
            return {
                success: false,
                error: error
            };
        }
    }
    async UpdateTicketStatus(ticketId: string, status: StatusTicket) {
        try {
            const ticketRef = this.ticketCollection.doc(ticketId);
            const doc = await ticketRef.get();
            if (!doc.exists) {
                return {
                    success: false,
                    error: "Ticket not found"
                };
            }
            await ticketRef.update({
                status: status,
                updatedAt: new Date()
            });
            return {
                success: true,
                ticketId: ticketId,
                status: status
            };
        } catch (error) {
            console.error("Error updating ticket status:", error);
            return {
                success: false,
                error: error
            };
        }
    }
    async DeleteTicket(ticketId: string) {
        try {
            const ticketRef = this.ticketCollection.doc(ticketId);
            const doc = await ticketRef.get();
            if (!doc.exists) {
                return {
                    success: false,
                    error: "Ticket not found"
                };
            }
            await ticketRef.delete();
            return {
                success: true,
                message: "Ticket deleted successfully",
                ticketId: ticketId
            };
        } catch (error) {
            console.error("Error deleting ticket:", error);
            return {
                success: false,
                error: error
            };
        }
    }
async GetTicket(){
    try {
        const tickets = await this.GetAllTickets();
        
        if(!tickets.success || !tickets.data) {
            return { success: false, error: "No tickets found" };
        }
        
        const datatickets = tickets.data;
        // Convertir a string antes de crear el Set para asegurar unicidad
        const userId: string[] = [...new Set(datatickets.map((ticket:any) => String(ticket.userId)))];
        // Buscar usuarios por ID
        const userPromises = userId.map(id => userService.getUserById(Number(id)));
        const usersResults = await Promise.all(userPromises);
        // Crear mapa de usuarios
        const usersMap: {[key: string]: any} = {};
        usersResults.forEach((user: any) => {
            if(user && user.id) {
                const userId = String(user.id);
                usersMap[userId] = user;
            }
        });
        
        // Mapear tickets con datos específicos de usuario
        const ticketsConUsuario = datatickets.map((ticket: any) => {
            const ticketUserId = String(ticket.userId);
            const user = usersMap[ticketUserId];
            return {
                id: ticket.id,
                price: ticket.price,
                status: ticket.status,
                type: ticket.type,
                operatorId:ticket.operatorId,
                userId: ticket.userId,
                name: user?.name || null,
                lastName: user?.lastName || null,
                phone: user?.phone || null,
                idCard: user?.idCard || null
            };
        });
        return {
            success: true,
            data: ticketsConUsuario
        };
    } catch (error) {
        console.error("Error getting tickets with users:", error);
        return {
            success: false,
            error: error
        };
    }
}
async UpdateProgramOptions(){
    
}
}