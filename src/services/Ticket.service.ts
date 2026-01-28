import {db} from '../config/dbconfig.config';
import { getAllTickets } from '../controllers/Ticket.controller';
import { UserService } from "../services/user.service";
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
    async CreateTicket(price: number, status:StatusTicket,user: string, paymentType: PaymentType, cartList: any[], dueAt: string, operatorId:string, changeAmount: number, paidAmount: number, printedAt?:string) {
        try {
            const nextId = await this.getNextId();
            const ticketRef = this.ticketCollection.doc(nextId.toString());
            const currentDate = new Date();
            const ticketData = {
                id: nextId,
                price: price,
                status:  status,
                userId: user,
                paymentType: paymentType,
                cartList: cartList,
                printedAt: printedAt || currentDate,
                dueAt:dueAt,
                createdAt: currentDate,
                updatedAt: currentDate, 
                operatorId:operatorId,
                paidAmount: paidAmount || 0,
                changeAmount: changeAmount || 0
            };
            // Crear el ticket
            await ticketRef.set(ticketData);
            const restante=Number(paidAmount)-Number(price)
            const cashToAdd = restante - Number(changeAmount);
            // Actualizar el cash del usuario (convertir a number)
            console.log('paidAmount:', paidAmount, 'changeAmount:', changeAmount, 'cashToAdd:', cashToAdd);
            const cashResult = await userService.updateCash(user, cashToAdd);
            if(cashResult.success==true){
                 return {
                success: true,
                ticketId: nextId,
                cashUpdated: cashResult
            }
   
            }else{
                return {
                success: false,
                message: "Eoor en al actualizacion del usuario"
            }}
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
                    type:"professionalClean",
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
            return {
                success: true,
                data: {
                    id: doc.id,
                    ...doc.data()
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
                updatedAt: new Date()
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
}