import {db}from '../config/dbconfig.config';
export enum TypeDiscount{
    PERCENTAGE='Percentage',
    VALUE='valor'
}
export class discounts {
        private collection = db.collection('discounts')
        private async getNextCode(): Promise<number> {
        try {
            const snapshot = await this.collection.get();
            if (snapshot.empty) {
                return 1; // Si no hay professional cleans, comenzar con código 1
            }
            // Obtener el máximo código desde los documentos
            const maxCode = snapshot.docs.reduce((max, doc) => {
                const data = doc.data();
                const code = data.code || 0;
                return code > max ? code : max;
            }, 0);
            return maxCode + 1;
        } catch (error) {
            console.error('Error obteniendo siguiente código:', error);
            return 1;
        }
    }
    private async getNextId(): Promise<number> {
        try {
            const snapshot = await this.collection.get();
            if (snapshot.empty) {
                return 1; // Si no hay professional cleans, comenzar con ID 1
            }
            // Obtener el máximo ID desde los doc.id
            const maxId = snapshot.docs.reduce((max, doc) => {
                const docId = parseInt(doc.id, 10);
                return !isNaN(docId) && docId > max ? docId : max;
            }, 0);
            return maxId + 1;
        } catch (error) {
            console.error('Error obteniendo siguiente ID:', error);
            return 1;
        }
    }
    async createDiscount(name: string, value: number, type: TypeDiscount, isVisible: boolean, isEnable: boolean) {
        try {
            const id = await this.getNextId();
            const code = await this.getNextCode();
            
            const discountData = {
                code,
                name,
                value,
                type,
                isVisible,
                isEnable,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await this.collection.doc(id.toString()).set(discountData);
            
            return {
                success: true,
                message: 'Descuento creado exitosamente',
                data: { id, ...discountData }
            };
        } catch (error) {
            console.error('Error creando descuento:', error);
            throw error;
        }
    }

    async getAllDiscounts() {
        try {
            const snapshot = await this.collection.get();
            
            if (snapshot.empty) {
                return {
                    success: true,
                    message: 'No hay descuentos registrados',
                    data: []
                };
            }

            const discounts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return {
                success: true,
                message: 'Descuentos obtenidos exitosamente',
                data: discounts
            };
        } catch (error) {
            console.error('Error obteniendo descuentos:', error);
            throw error;
        }
    }

    async getDiscountById(id: string) {
        try {
            const doc = await this.collection.doc(id).get();
            
            if (!doc.exists) {
                return {
                    success: false,
                    message: 'Descuento no encontrado',
                    data: null
                };
            }

            return {
                success: true,
                message: 'Descuento obtenido exitosamente',
                data: { id: doc.id, ...doc.data() }
            };
        } catch (error) {
            console.error('Error obteniendo descuento:', error);
            throw error;
        }
    }

    async getActiveDiscounts() {
        try {
            const snapshot = await this.collection.where('isEnable', '==', true).get();
            
            if (snapshot.empty) {
                return {
                    success: true,
                    message: 'No hay descuentos activos',
                    data: []
                };
            }

            const discounts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return {
                success: true,
                message: 'Descuentos activos obtenidos exitosamente',
                data: discounts
            };
        } catch (error) {
            console.error('Error obteniendo descuentos activos:', error);
            throw error;
        }
    }

    async updateDiscount(id: string, updateData: {
        name?: string;
        value?: number;
        type?: TypeDiscount;
        isVisible?: boolean;
        isEnable?: boolean;
    }) {
        try {
            const doc = await this.collection.doc(id).get();
            
            if (!doc.exists) {
                return {
                    success: false,
                    message: 'Descuento no encontrado',
                    data: null
                };
            }

            const updatedData = {
                ...updateData,
                updatedAt: new Date().toISOString()
            };

            await this.collection.doc(id).update(updatedData);

            const updatedDoc = await this.collection.doc(id).get();

            return {
                success: true,
                message: 'Descuento actualizado exitosamente',
                data: { id: updatedDoc.id, ...updatedDoc.data() }
            };
        } catch (error) {
            console.error('Error actualizando descuento:', error);
            throw error;
        }
    }

    async deleteDiscount(id: string) {
        try {
            const doc = await this.collection.doc(id).get();
            
            if (!doc.exists) {
                return {
                    success: false,
                    message: 'Descuento no encontrado',
                    data: null
                };
            }

            await this.collection.doc(id).delete();

            return {
                success: true,
                message: 'Descuento eliminado exitosamente',
                data: { id }
            };
        } catch (error) {
            console.error('Error eliminando descuento:', error);
            throw error;
        }
    }

    async toggleDiscountStatus(id: string) {
        try {
            const doc = await this.collection.doc(id).get();
            
            if (!doc.exists) {
                return {
                    success: false,
                    message: 'Descuento no encontrado',
                    data: null
                };
            }

            const currentStatus = doc.data()?.isEnable || false;
            
            await this.collection.doc(id).update({
                isEnable: !currentStatus,
                updatedAt: new Date().toISOString()
            });

            return {
                success: true,
                message: `Descuento ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`,
                data: { id, isEnable: !currentStatus }
            };
        } catch (error) {
            console.error('Error cambiando estado del descuento:', error);
            throw error;
        }
    }
}