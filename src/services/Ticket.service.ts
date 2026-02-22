import { db } from "../config/dbconfig.config";
import { UserService } from "../services/user.service";
const userService = new UserService();
export enum StatusTicket {
  OPEN = "open",
  CLOSE = "close",
  NULLLED = "nulled",
  TOPAY = "toPay",
}
export enum PaymentType {
  CASH = "cash",
  CARD= "card",
  APPLEPAY="Apple Pay",
  KAKAOPAY="Kakao Pay"

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
      throw error;
    }
  }

  private async calculatePaymentStatus(
    price: number,
    paidAmount: number,
    changeAmount: number,
    userId: string
  ): Promise<{
    status: StatusTicket;
    cashToAdd: number;
    creditUsed: number;
    valueToPay: number;
  }> {
    const restante = Number(paidAmount) - Number(price);
    const cashToAdd = restante - Number(changeAmount);
    const creditUserResult = await userService.getUserCredit(Number(userId));
    const creditUser = creditUserResult.credit || 0;

    let status = StatusTicket.CLOSE;
    let creditUsed = 0;
    let valueToPay = 0;

    // Si el cashToAdd es negativo, significa que el cliente no pagó lo suficiente para cubrir el precio del ticket
    if (cashToAdd < 0) {
      // Si el crédito del usuario más el monto pagado cubre el precio, el ticket se cierra normalmente
      if (creditUser + cashToAdd >= 0) {
        status = StatusTicket.CLOSE;
        creditUsed = cashToAdd * -1; // Convertir a positivo para mostrar cuánto crédito se usó
      }
      // Si el crédito del usuario más el monto pagado aún no cubre el precio, el ticket queda en estado "toPay"
      // y se muestra cuánto falta por pagar
      else {
        status = StatusTicket.TOPAY;
        // Mostrar cuánto crédito se usó y cuánto falta por pagar después de usar el crédito
        if (creditUser > 0) {
          creditUsed = creditUser; // Mostrar cuánto crédito se usó
          valueToPay = (cashToAdd + creditUser) * -1; // Mostrar cuánto falta por pagar después de usar el crédito
        }
        // Si el usuario no tiene crédito, simplemente mostrar cuánto falta por pagar
        else {
          valueToPay = cashToAdd * -1; // Convertir a positivo para mostrar cuánto falta por pagar
        }
      }
    }

    return { status, cashToAdd, creditUsed, valueToPay };
  }

  private buildTicketResponse(ticketData: any) {
    return {
      id: ticketData.id,
      status: ticketData.status,
      paidAmount: ticketData.paidAmount,
      createdAt: ticketData.createdAt,
      updatedAt: ticketData.updatedAt,
      valueToPay: ticketData.valueToPay,
      creditUsed: ticketData.creditUsed,
      type: ticketData.type,
    };
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
        const paymentResult = await this.calculatePaymentStatus(price, paidAmount, changeAmount, user);
        ticketData.status = paymentResult.status;
        ticketData.creditUsed = paymentResult.creditUsed;
        ticketData.valueToPay = paymentResult.valueToPay;

        const cashResult = await userService.updateCash(user, paymentResult.cashToAdd);

        await ticketRef.set(ticketData);

        if (cashResult.success === true) {
          return {
            success: true,
            data: this.buildTicketResponse(ticketData),
            cashUpdated: cashResult,
          };
        } else {
          return {
            success: false,
            message: "Error en la creación del ticket",
          };
        }
      } else {
        return {
          success: false,
          error:
            "ERROR TICKET, NO ES POSIBLE CREAR TICKETS DIFERENTES A OPEN o CLOSE",
        };
      }



    } catch (error) {
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

      let query = this.ticketCollection
        .where("createdAt", ">=", dateStart)
        .where("createdAt", "<=", dateEnd);

      if (operatorId) {
        query = query.where("operatorId", "==", operatorId);
      }

      const snapshot = await query.get();
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
      return {
        success: false,
        error: error,
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
        var cashToAdd = 0;

        if (oldStatus === StatusTicket.OPEN && newStatus === StatusTicket.CLOSE) {
          // Validar si se paga el monto completo del ticket usando el PaidAmount y el credit
          const paymentResult = await this.calculatePaymentStatus(price, paidAmount, changeAmount, userId);
          
          dataToUpdate.status = paymentResult.status;
          dataToUpdate.creditUsed = paymentResult.creditUsed;
          dataToUpdate.valueToPay = paymentResult.valueToPay;
          cashToAdd = paymentResult.cashToAdd;
        }

        else if (oldStatus === StatusTicket.TOPAY && newStatus === StatusTicket.CLOSE) {
          // Yo debería tener un "ValueToPay" en el ticket, 
          // y el cliente me está pagando ese monto,
          //  entonces se cierra el ticket y se actualiza el cash del usuario con ese monto que se estaba debiendo

          if (paidAmount == currentData?.valueToPay) {
            dataToUpdate.status = StatusTicket.CLOSE;
            dataToUpdate.paidAmount = Number(paidAmount) + Number(currentData?.paidAmount);
            dataToUpdate.recoveredAmount=currentData?.valueToPay
            dataToUpdate.valueToPay = 0;
            cashToAdd = paidAmount; // El monto que se estaba debiendo es lo que se va a agregar al cash del usuario, convirtiendo a positivo
          }
        }

        await ticketRef.update(dataToUpdate);

        const cashResult = await userService.updateCash(userId, cashToAdd);
        if (cashResult.success === true) {
          return {
            success: true,
            data: this.buildTicketResponse(dataToUpdate),
            cashUpdated: cashResult,
          };
        } else {
          return {
            success: false,
            message: "Error en la actualizacion del usuario",
          };
        }

      }

      return {
        success: true,
        data: this.buildTicketResponse(dataToUpdate),
      };
    } catch (error) {
      return {
        success: false,
        error: error,
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
          createdAt:ticket.createdAt,
          updatedAt:ticket.updatedAt,
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
      return {
        success: false,
        error: error,
      };
    }
  }
  async CierreCaja(operatorId: string, startDate: string, endDate: string) {
    try {
      if (!operatorId) {
        return { success: false, message: "Se necesita el operatorId" };
      }
      if (!endDate || !startDate) {
        return { success: false, message: "Se necesita fecha de inicio y de final" };
      }
      
      // Query simple solo por operatorId
      let snapshot;
      if(operatorId!="0"){
        snapshot = await this.ticketCollection
          .where("operatorId", "==", operatorId)
          .get();
      }
      else{
        snapshot = await this.ticketCollection.get();
      }
      // Filtrar fechas y status en memoria (sin índices)
      const tickets = snapshot.docs
        .map((doc) => doc.data())
        .filter((ticket: any) => {
          const ticketDate = ticket.createdAt;
          return (ticketDate >= startDate && 
                 ticketDate <= endDate || ticket.updatedAt >= startDate && 
                   ticket.updatedAt <= endDate)&& 
                 ticket.status !== "open";
        });
        //tickets con la ifnroamcion cargada del usuario y filtrada por operator(Esto esta mal pero asi lo quiere jhonston)
        const ticketWithUser= await this.GetTicket();
          if (!ticketWithUser.success || !ticketWithUser.data) {
        return { success: false, message: "Error al obtener usuarios de tickets" };
      }
        const ticketsfiltrados= ticketWithUser.data.filter((ticket: any)=>{
            if(operatorId != "0"){
              return (ticket.createdAt >= startDate && 
                   ticket.createdAt <= endDate ||
                   ticket.updatedAt >= startDate && 
                   ticket.updatedAt <= endDate) &&
                   ticket.operatorId == operatorId &&
                   ticket.status !== "open";
            } else {
              return ticket.createdAt >= startDate && 
                   ticket.createdAt <= endDate && 
                   ticket.status !== "open";
            }

        })
      const resumen = tickets.reduce((acc: any, ticket: any) => {
        // Contar tickets por estado
        if (!acc.ticketsPorEstado) {
          acc.ticketsPorEstado = {};
        }
        if (!acc.ticketsPorEstado[ticket.status]) {
          acc.ticketsPorEstado[ticket.status] = 0;
        }
        acc.ticketsPorEstado[ticket.status] += 1;
        // Sumar total de ventas terjetas
        if(!acc.totalVentasTarjetas){
          acc.totalVentasTarjetas=0
        }
        let valorTarjeta = ticket.paymentType==PaymentType.CARD?ticket.paidAmount:0
        acc.totalVentasTarjetas+=valorTarjeta
        // Sumar total de ventas cash
        if(!acc.totalVentasCash){
          acc.totalVentasCash=0;
        }
        if(ticket.recoveredAmount){
          acc.totalVentasCash += ticket.recoveredAmount || 0;
        }else{
          let valorCash = ticket.paymentType==PaymentType.CASH?(ticket.paidAmount-(ticket.changeAmount ||0)):0
        acc.totalVentasCash+=valorCash
        }
        return acc;
      }, {});
      return {
        success: true,
        message: "Cierre de caja exitoso",
        operatorId,
        totalTickets: ticketsfiltrados.length,
        ticketsPorEstado: resumen.ticketsPorEstado,
        totalVentas:parseFloat(resumen.totalVentasTarjetas.toFixed(2))+parseFloat(resumen.totalVentasCash.toFixed(2)),
        totalVentasTarjetas: parseFloat(resumen.totalVentasTarjetas.toFixed(2)),
        totalVentasCash: parseFloat(resumen.totalVentasCash.toFixed(2)),
        tickets:ticketsfiltrados
      };
    } catch (error) {
      return {
        success: false,
        error: error,
      };
    }
  }
     
}
