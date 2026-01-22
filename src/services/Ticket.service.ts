import {db} from '../config/dbconfig.config';
export enum TypeTicket{
    DRYCLEAN="DryClean",
}
export enum StatusTicket{
    OPEN="open",
    CLOSE="close"
}
export enum PaymentType{
    CASH="cash",
    TRANSFER="Transfer"
}
export class Ticket{
    private coleccion= db.collection("Tickets")
    private DryCollecion=db.collection("DryCleaning");
    async CrarTickect(price:Number, status:boolean, user:string, PaymentType:PaymentType, cartList:any[] ){
        try {
            // Filtrar items de tipo professionalCleans
            const dryCleanItems = cartList.filter(item => 
                item.type === "professionalCleans" || item.type === "professionaCleans"
            );

            const dryCleanRefs: string[] = [];
            const ticketRef = this.coleccion.doc();
            const currentDate = new Date();
            // Ejecutar transacción
            await db.runTransaction(async (transaction) => {
                // 1. Primero insertar items de DryCleaning
                if (dryCleanItems.length > 0) {
                    for (const item of dryCleanItems) {
                        const dryRef = this.DryCollecion.doc();
                        const dryCleanData = {
                            ...item,
                            ticketId: ticketRef.id,
                            userId: user,
                            createdAt: currentDate,
                            updatedAt: currentDate
                        };
                        
                        transaction.set(dryRef, dryCleanData);
                        dryCleanRefs.push(dryRef.id);
                    }
                }

                // 2. Luego crear el ticket
                const ticketData = {
                    price: price,
                    status: status ? StatusTicket.OPEN : StatusTicket.CLOSE,
                    user: user,
                    paymentType: PaymentType,
                    cartList: cartList,
                    createdAt: currentDate,
                    updatedAt: currentDate,
                    type: TypeTicket.DRYCLEAN,
                    dryCleanIds: dryCleanRefs
                };

                transaction.set(ticketRef, ticketData);
            });
            
            return {
                success: true,
                ticketId: ticketRef.id,
                dryCleanIds: dryCleanRefs
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
            const snapshot = await this.coleccion.get();
            const tickets = snapshot.docs.map(doc => ({
                id: doc.id,
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
            const doc = await this.coleccion.doc(ticketId).get();
            
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
            const snapshot = await this.coleccion.where("user", "==", userId).get();
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
            const ticketRef = this.coleccion.doc(ticketId);
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
            const ticketRef = this.coleccion.doc(ticketId);
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
            const ticketRef = this.coleccion.doc(ticketId);
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