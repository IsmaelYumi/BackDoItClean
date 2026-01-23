import {db} from '../config/dbconfig.config';
export enum StatusDryCleaning{
    OPEN="open",
    CLOSE="close",
    NULLLED="nulled"
}
export enum PaymentType{
    CASH="cash",
    TRANSFER="Transfer"
}
export class DryCleaning{
    private dryCleaningCollection = db.collection("DryCleaning");
    async CreateDryCleaning(price: Number, user: string, paymentType: PaymentType, cartList: any[]) {
        try {
            const dryCleanRef = this.dryCleaningCollection.doc();
            const currentDate = new Date();
            
            const dryCleanData = {
                price: price,
                status:  StatusDryCleaning.OPEN,
                userId: user,
                paymentType: paymentType,
                cartList: cartList,
                createdAt: currentDate,
                updatedAt: currentDate
            };
            await dryCleanRef.set(dryCleanData);
            return {
                success: true,
                dryCleaningId: dryCleanRef.id
            };
        } catch (error) {
            console.error("Error creating dry cleaning:", error);
            return {
                success: false,
                error: error
            };
        }
    }
    async GetAllDryCleanings() {
        try {
            const snapshot = await this.dryCleaningCollection.get();
            const dryCleanings = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return {
                success: true,
                data: dryCleanings
            };
        } catch (error) {
            console.error("Error getting dry cleanings:", error);
            return {
                success: false,
                error: error
            };
        }
    }
    async GetDryCleaningById(dryCleaningId: string) {
        try {
            const doc = await this.dryCleaningCollection.doc(dryCleaningId).get();
            
            if (!doc.exists) {
                return {
                    success: false,
                    error: "Dry cleaning not found"
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
            console.error("Error getting dry cleaning:", error);
            return {
                success: false,
                error: error
            };
        }
    }
    async GetDryCleaningsByUser(userId: string) {
        try {
            const snapshot = await this.dryCleaningCollection.where("userId", "==", userId).get();
            const dryCleanings = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return {
                success: true,
                data: dryCleanings
            };
        } catch (error) {
            console.error("Error getting dry cleanings by user:", error);
            return {
                success: false,
                error: error
            };
        }
    }
    async UpdateDryCleaning(dryCleaningId: string, updateData: any) {
        try {
            const dryCleaningRef = this.dryCleaningCollection.doc(dryCleaningId);
            const doc = await dryCleaningRef.get();
            if (!doc.exists) {
                return {
                    success: false,
                    error: "Dry cleaning not found"
                };
            }
            const dataToUpdate = {
                ...updateData,
                updatedAt: new Date()
            };
            await dryCleaningRef.update(dataToUpdate);
            return {
                success: true,
                dryCleaningId: dryCleaningId,
                data: dataToUpdate
            };
        } catch (error) {
            console.error("Error updating dry cleaning:", error);
            return {
                success: false,
                error: error
            };
        }
    }
    async UpdateDryCleaningStatus(dryCleaningId: string, status: StatusDryCleaning) {
        try {
            const dryCleaningRef = this.dryCleaningCollection.doc(dryCleaningId);
            const doc = await dryCleaningRef.get();
            if (!doc.exists) {
                return {
                    success: false,
                    error: "Dry cleaning not found"
                };
            }
            await dryCleaningRef.update({
                status: status,
                updatedAt: new Date()
            });
            return {
                success: true,
                dryCleaningId: dryCleaningId,
                status: status
            };
        } catch (error) {
            console.error("Error updating dry cleaning status:", error);
            return {
                success: false,
                error: error
            };
        }
    }
    async DeleteDryCleaning(dryCleaningId: string) {
        try {
            const dryCleaningRef = this.dryCleaningCollection.doc(dryCleaningId);
            const doc = await dryCleaningRef.get();
            if (!doc.exists) {
                return {
                    success: false,
                    error: "Dry cleaning not found"
                };
            }
            await dryCleaningRef.delete();
            return {
                success: true,
                message: "Dry cleaning deleted successfully",
                dryCleaningId: dryCleaningId
            };
        } catch (error) {
            console.error("Error deleting dry cleaning:", error);
            return {
                success: false,
                error: error
            };
        }
    }
}