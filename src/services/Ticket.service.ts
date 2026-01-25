import {db} from '../config/dbconfig.config';
export enum StatusTicket{
    OPEN="open",
    CLOSE="close",
    NULLLED="nulled"
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
    async CreateTicket(price: Number, status:StatusTicket,user: string, paymentType: PaymentType, cartList: any[], dueAt: string, createdAt:string, updatedAt:string,printedAt?:string) {
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
                printedAt: printedAt || createdAt,
                createdAt: createdAt ,
                updatedAt: updatedAt
            };
            await ticketRef.set(ticketData);
            return {
                success: true,
                ticketId: nextId
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
            const tickets = snapshot.docs.map(doc => ({
                id: doc.id,
                type:"professionalClean",
                ...doc.data()
            }));
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
}