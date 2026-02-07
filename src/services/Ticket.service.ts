import { userInfo } from "node:os";
import { db } from "../config/dbconfig.config";
import { getAllTickets } from "../controllers/Ticket.controller";
import { UserService } from "../services/user.service";
import admin from "firebase-admin";
const userService = new UserService();
export enum StatusTicket {
  OPEN = "open",
  CLOSE = "close",
  NULLLED = "nulled",
  TOPAY = "toPay",
}
export enum PaymentType {
  CASH = "cash",
  TRANSFER = "Transfer",
}
export class Ticket {
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
  async CreateTicket(
    price: number,
    status: StatusTicket,
    user: string,
    paymentType: PaymentType,
    cartList: any[],
    dueAt: string,
    operatorId: string,
    changeAmount: number,
    paidAmount: number,
    type: string,
    printedAt?: string,
    createdAt?: string,
    updatedAt?: string,
  ) {
    try {
      const nextId = await this.getNextId();
      const ticketRef = this.ticketCollection.doc(nextId.toString());
      const ticketData = {
        id: nextId,
        price: price,
        status: status,
        userId: user,
        paymentType: paymentType,
        cartList: cartList,
        printedAt: printedAt,
        dueAt: dueAt,
        createdAt: createdAt,
        updatedAt: updatedAt,
        operatorId: operatorId,
        paidAmount: paidAmount || 0,
        changeAmount: changeAmount || 0,
        valueToPay: 0,
        creditUsed: 0,
        type: type,
      };

      if (status === StatusTicket.OPEN) {
        await ticketRef.set(ticketData);

        // Si el estado es "open", retornar éxito sin actualizar el cash
        return {
          success: true,
          ticketId: nextId,
          cashUpdated: null,
        };
      } else if (status === StatusTicket.CLOSE) {
        // Validar si se paga el monto completo del ticket usando el PaidAmount y el credit
        const restante = Number(paidAmount) - Number(price);
        const cashToAdd = restante - Number(changeAmount);
        const creditUserResult = await userService.getUserCredit(Number(user));
        const creditUser = creditUserResult.credit || 0;
        console.log("Actualizando cash del usuario:", {
          user,
          cashToAdd,
          restante,
          changeAmount,
        });

        // Si el cashToAdd es negativo, significa que el cliente no pagó lo suficiente para cubrir el precio del ticket
        if (cashToAdd < 0) {
          // Si el crédito del usuario más el monto pagado cubre el precio, el ticket se cierra normalmente
          if (creditUser + cashToAdd >= 0) {
            ticketData.status = StatusTicket.CLOSE;
            ticketData.creditUsed = cashToAdd * -1; // Convertir a positivo para mostrar cuánto crédito se usó
          }
          // Si el crédito del usuario más el monto pagado aún no cubre el precio, el ticket queda en estado "toPay" 
          // y se muestra cuánto falta por pagar
          else {
            ticketData.status = StatusTicket.TOPAY;

            // Mostrar cuánto crédito se usó y cuánto falta por pagar después de usar el crédito
            if (creditUser > 0) {
              ticketData.creditUsed = creditUser; // Mostrar cuánto crédito se usó
              ticketData.valueToPay = (cashToAdd + creditUser) * -1; // Mostrar cuánto falta por pagar después de usar el crédito
            }
            // Si el usuario no tiene crédito, simplemente mostrar cuánto falta por pagar
            else {
              ticketData.valueToPay = cashToAdd * -1; // Convertir a positivo para mostrar cuánto falta por pagar
            }
          }
        }
        const cashResult = await userService.updateCash(user, cashToAdd);

        await ticketRef.set(ticketData);

        if (cashResult.success === true) {
          return {
            success: true,
            ticketId: nextId,
            cashUpdated: cashResult,
          };
        } else {
          return {
            success: false,
            message: "Error en la creación del ticket",
          };
        }
      } else {
        console.error("Error creating ticket:");
        return {
          success: false,
          error:
            "ERROR TICKET, NO ES POSIBLE CREAR TICKETS DIFERENTES A OPEN o CLOSE",
        };
      }

      //   // Crear el ticket
      //   // Solo actualizar el cash del usuario si el estado NO es "open"
      //   if (status !== StatusTicket.OPEN) {
      //     const restante = Number(paidAmount) - Number(price);
      //     const creditUserResult = await userService.getUserCredit(Number(user));
      //     const creditUser = creditUserResult.credit || 0;
      //     const cashToAdd = restante - Number(changeAmount);
      //     console.log("Actualizando cash del usuario:", {
      //       user,
      //       cashToAdd,
      //       restante,
      //       changeAmount,
      //     });
      //     if (creditUser + paidAmount < price) {
      //       ticketData.status = StatusTicket.TOPAY;
      //       ticketData.valueToPay = price - paidAmount;
      //     }
      //     const cashResult = await userService.updateCash(user, cashToAdd);

      //     if (cashResult.success === true) {
      //       return {
      //         success: true,
      //         ticketId: nextId,
      //         cashUpdated: cashResult,
      //       };
      //     } else {
      //       return {
      //         success: false,
      //         message: "Error en la actualizacion del usuario",
      //       };
      //     }
      //   }
      //   await ticketRef.set(ticketData);

      //   // Si el estado es "open", retornar éxito sin actualizar el cash
      //   return {
      //     success: true,
      //     ticketId: nextId,
      //     cashUpdated: null,
      //   };
    } catch (error) {
      console.error("Error creating ticket:", error);
      return {
        success: false,
        error: error,
      };
    }
  }
  async GetAllTickets() {
    try {
      const snapshot = await this.ticketCollection.get();
      const tickets = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data?.type || "professionalClean",
          ...data,
          createdAt: data.createdAt?.toDate?.()
            ? data.createdAt.toDate().toISOString()
            : data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()
            ? data.updatedAt.toDate().toISOString()
            : data.updatedAt,
          printedAt: data.printedAt?.toDate?.()
            ? data.printedAt.toDate().toISOString()
            : data.printedAt,
        };
      });
      return {
        success: true,
        data: tickets,
      };
    } catch (error) {
      console.error("Error getting tickets:", error);
      return {
        success: false,
        error: error,
      };
    }
  }
  async GetTicketById(ticketId: string) {
    try {
      const doc = await this.ticketCollection.doc(ticketId).get();
      if (!doc.exists) {
        return {
          success: false,
          error: "Ticket not found",
        };
      }
      const data = doc.data();
      return {
        success: true,
        data: {
          id: doc.id,
          ...data,
          type: data?.type || "professionalClean",
        },
      };
    } catch (error) {
      console.error("Error getting ticket:", error);
      return {
        success: false,
        error: error,
      };
    }
  }
  async GetTicketsByUser(userId: string) {
    try {
      const snapshot = await this.ticketCollection
        .where("userId", "==", userId)
        .get();
      const tickets = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return {
        success: true,
        data: tickets,
      };
    } catch (error) {
      console.error("Error getting tickets by user:", error);
      return {
        success: false,
        error: error,
      };
    }
  }
  async GetTicketsByDate(date: string, operatorId?: string) {
    try {
      // Parsear la fecha en formato ISO (2026-01-29T00:06:56.806999)
      const inputDate = new Date(date);

      // Extraer año, mes y día para crear el rango del día completo
      const year = inputDate.getFullYear();
      const month = String(inputDate.getMonth() + 1).padStart(2, "0");
      const day = String(inputDate.getDate()).padStart(2, "0");

      // Crear strings para el rango del día completo (YYYY-MM-DD)
      const dateStart = `${year}-${month}-${day}T00:00:00`;
      const dateEnd = `${year}-${month}-${day}T23:59:59`;

      console.log("Fecha recibida:", date);
      console.log("dateStart:", dateStart);
      console.log("dateEnd:", dateEnd);

      let query = this.ticketCollection
        .where("createdAt", ">=", dateStart)
        .where("createdAt", "<=", dateEnd);

      if (operatorId) {
        query = query.where("operatorId", "==", operatorId);
        console.log("Filtrando por operatorId:", operatorId);
      }

      const snapshot = await query.get();
      console.log("Documentos encontrados:", snapshot.size);
      if (snapshot.empty) {
        return {
          success: true,
          data: [],
          count: 0,
        };
      }
      const datatickets = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data?.type || "professionalClean",
          ...data,
          createdAt: data.createdAt?.toDate?.()
            ? data.createdAt.toDate().toISOString()
            : data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()
            ? data.updatedAt.toDate().toISOString()
            : data.updatedAt,
          printedAt: data.printedAt?.toDate?.()
            ? data.printedAt.toDate().toISOString()
            : data.printedAt,
        };
      });

      // Convertir a string antes de crear el Set para asegurar unicidad
      const userId: string[] = [
        ...new Set(datatickets.map((ticket: any) => String(ticket.userId))),
      ];

      // Buscar usuarios por ID
      const userPromises = userId.map((id) =>
        userService.getUserById(Number(id)),
      );
      const usersResults = await Promise.all(userPromises);

      // Crear mapa de usuarios
      const usersMap: { [key: string]: any } = {};
      usersResults.forEach((user: any) => {
        if (user && user.id) {
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
          user: user || null,
        };
      });

      return {
        success: true,
        data: ticketsConUsuario,
        count: ticketsConUsuario.length,
      };
    } catch (error) {
      console.error("Error getting tickets by date:", error);
      return {
        success: false,
        error: error,
      };
    }
  }
  async UpdateTicket(ticketId: string, updateData: any) {
    var logMessage = '';
    try {
      const ticketRef = this.ticketCollection.doc(ticketId);
      const doc = await ticketRef.get();
      if (!doc.exists) {
        return {
          success: false,
          error: "Ticket not found",
        };
      }

      const currentData = doc.data();
      const oldStatus = currentData?.status;
      const newStatus = updateData.status || oldStatus;

      // Actualizar el ticket
      const dataToUpdate = {
        ...updateData,
      };
      await ticketRef.update(dataToUpdate);

      if (updateData.status !== StatusTicket.OPEN) {

        const price =
          updateData.price !== undefined
            ? updateData.price
            : currentData?.price;
        const paidAmount =
          updateData.paidAmount !== undefined
            ? updateData.paidAmount
            : currentData?.paidAmount || 0;
        const changeAmount =
          updateData.changeAmount !== undefined
            ? updateData.changeAmount
            : currentData?.changeAmount || 0;

        const creditUsed =
          updateData.creditUsed !== undefined
            ? updateData.creditUsed
            : currentData?.creditUsed || 0;


        const userId = currentData?.userId;
        // Validar si se paga el monto completo del ticket usando el PaidAmount y el credit
        const restante = Number(paidAmount) - Number(price);
        var cashToAdd = restante - Number(changeAmount);
        const creditUserResult = await userService.getUserCredit(Number(userId));
        const creditUser = creditUserResult.credit || 0;

        console.log("Actualizando cash en UpdateTicket:", {
          userId,
          cashToAdd,
          oldStatus,
          newStatus,
        });



        if (oldStatus === StatusTicket.OPEN && newStatus === StatusTicket.CLOSE) {

          // Si el cashToAdd es negativo, significa que el cliente no pagó lo suficiente para cubrir el precio del ticket
          if (cashToAdd < 0) {
            // Si el crédito del usuario más el monto pagado cubre el precio, el ticket se cierra normalmente
            if (creditUser + cashToAdd >= 0) {
              dataToUpdate.status = StatusTicket.CLOSE;
              dataToUpdate.creditUsed = cashToAdd * -1; // Convertir a positivo para mostrar cuánto crédito se usó
              logMessage += ' 1';
            }
            // Si el crédito del usuario más el monto pagado aún no cubre el precio, el ticket queda en estado "toPay" 
            // y se muestra cuánto falta por pagar
            else {
              dataToUpdate.status = StatusTicket.TOPAY;
              logMessage += ' 2';
              // Mostrar cuánto crédito se usó y cuánto falta por pagar después de usar el crédito
              if (creditUser > 0) {
                dataToUpdate.creditUsed = creditUser; // Mostrar cuánto crédito se usó
                dataToUpdate.valueToPay = (cashToAdd + creditUser) * -1; // Mostrar cuánto falta por pagar después de usar el crédito
              }
              // Si el usuario no tiene crédito, simplemente mostrar cuánto falta por pagar
              else {
                dataToUpdate.valueToPay = cashToAdd * -1; // Convertir a positivo para mostrar cuánto falta por pagar
              }
            }
          }
        }

        else if (oldStatus === StatusTicket.TOPAY && newStatus === StatusTicket.CLOSE) {
          // Yo debería tener un "ValueToPay" en el ticket, 
          // y el cliente me está pagando ese monto,
          //  entonces se cierra el ticket y se actualiza el cash del usuario con ese monto que se estaba debiendo

          logMessage += ' 3';
          if (paidAmount == currentData?.valueToPay) {

            logMessage += ' 4';
            dataToUpdate.status = StatusTicket.CLOSE;
            dataToUpdate.paidAmount = Number(paidAmount) + Number(currentData?.paidAmount) + Number(creditUsed);
            dataToUpdate.valueToPay = 0;

            cashToAdd = paidAmount; // El monto que se estaba debiendo es lo que se va a agregar al cash del usuario, convirtiendo a positivo

          }

        }


        logMessage += ' 5';

        await ticketRef.update(dataToUpdate);

        logMessage += ' 6';
        const cashResult = await userService.updateCash(userId, cashToAdd);
        if (cashResult.success === true) {

          logMessage += ' 7';
          return {
            success: true,
            ticketId: ticketId,
            data: dataToUpdate,
            cashUpdated: cashResult,
            message:
              logMessage
          };
        } else {

          logMessage += ' 8';
          return {
            success: false,
            message: "Error en la actualizacion del usuario" + logMessage,
          };
        }

      }

      logMessage += ' 9';
      return {
        success: true,
        ticketId: ticketId,
        data: dataToUpdate,
        message:
          logMessage
      };
    } catch (error) {

      logMessage += ' 10';


      console.error("Error updating ticket:", error);
      return {
        success: false,
        error: error,
        message:
          logMessage
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
          error: "Ticket not found",
        };
      }
      await ticketRef.update({
        status: status,
        updatedAt: new Date(),
      });
      return {
        success: true,
        ticketId: ticketId,
        status: status,
      };
    } catch (error) {
      console.error("Error updating ticket status:", error);
      return {
        success: false,
        error: error,
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
          error: "Ticket not found",
        };
      }
      await ticketRef.delete();
      return {
        success: true,
        message: "Ticket deleted successfully",
        ticketId: ticketId,
      };
    } catch (error) {
      console.error("Error deleting ticket:", error);
      return {
        success: false,
        error: error,
      };
    }
  }
  async GetTicket() {
    try {
      const tickets = await this.GetAllTickets();

      if (!tickets.success || !tickets.data) {
        return { success: false, error: "No tickets found" };
      }

      const datatickets = tickets.data;
      // Convertir a string antes de crear el Set para asegurar unicidad
      const userId: string[] = [
        ...new Set(datatickets.map((ticket: any) => String(ticket.userId))),
      ];
      // Buscar usuarios por ID
      const userPromises = userId.map((id) =>
        userService.getUserById(Number(id)),
      );
      const usersResults = await Promise.all(userPromises);
      // Crear mapa de usuarios
      const usersMap: { [key: string]: any } = {};
      usersResults.forEach((user: any) => {
        if (user && user.id) {
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
          operatorId: ticket.operatorId,
          userId: ticket.userId,
          name: user?.name || null,
          lastName: user?.lastName || null,
          phone: user?.phone || null,
          idCard: user?.idCard || null,
        };
      });
      return {
        success: true,
        data: ticketsConUsuario,
      };
    } catch (error) {
      console.error("Error getting tickets with users:", error);
      return {
        success: false,
        error: error,
      };
    }
  }
  async UpdateProgramOptions() { }
}
