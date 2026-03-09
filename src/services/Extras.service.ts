import { db } from '../config/dbconfig.config';

type ExtraInput = {
    imageUrl?: string;
    code?: number;
    name: string;
    price: number;
    category?: string;
    isEnable: boolean;
    isVisible: boolean;
    isPercentage: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
};

type ExtraUpdateInput = {
    imageUrl?: string;
    code?: number;
    name?: string;
    price?: number;
    category?: string;
    isEnable?: boolean;
    isVisible?: boolean;
    isPercentage?: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
};

export class Extras {
    private collection = db.collection('extras')

    private formatDate(value?: string | Date): string {
        if (!value) {
            return new Date().toISOString();
        }

        const date = value instanceof Date ? value : new Date(value);
        return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    }

    private async getNextCode(): Promise<number> {
        try {
            const snapshot = await this.collection.get();
            if (snapshot.empty) {
                return 1; // Si no hay extras, comenzar con código 1
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
                return 1; // Si no hay extras, comenzar con ID 1
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
    async createExtra(extraInput: ExtraInput) {
        const {
            imageUrl,
            code,
            name,
            price,
            category,
            isEnable,
            isVisible,
            isPercentage,
            createdAt,
            updatedAt
        } = extraInput;

        if (!name || price === undefined || price === null) {
            return {
                success: false,
                message: 'Nombre y precio son requeridos',
                data: null
            };
        }

        try {
            const id = await this.getNextId();
            const extraCode = code ?? await this.getNextCode();

            const extraData = {
                imageUrl: imageUrl || '',
                code: extraCode,
                name,
                price,
                category: category || '',
                isEnable,
                isVisible,
                isPercentage,
                createdAt: this.formatDate(createdAt),
                updatedAt: this.formatDate(updatedAt)
            };
            await this.collection.doc(id.toString()).set(extraData);

            return {
                success: true,
                message: 'Extra creado exitosamente',
                data: { id, ...extraData }
            };
        } catch (error) {
            console.error('Error creando extra:', error);
            throw error;
        }
    }

    async getAllExtras() {
        try {
            const snapshot = await this.collection.get();

            if (snapshot.empty) {
                return {
                    success: true,
                    message: 'No hay extras registrados',
                    data: []
                };
            }

            const extras = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return {
                success: true,
                message: 'Extras obtenidos exitosamente',
                data: extras
            };
        } catch (error) {
            console.error('Error obteniendo extras:', error);
            throw error;
        }
    }

    async getExtraById(id: string) {
        try {
            const doc = await this.collection.doc(id).get();

            if (!doc.exists) {
                return {
                    success: false,
                    message: 'Extra no encontrado',
                    data: null
                };
            }

            return {
                success: true,
                message: 'Extra obtenido exitosamente',
                data: { id: doc.id, ...doc.data() }
            };
        } catch (error) {
            console.error('Error obteniendo extra:', error);
            throw error;
        }
    }

    async getActiveExtras() {
        try {
            const snapshot = await this.collection.where('isEnable', '==', true).get();

            if (snapshot.empty) {
                return {
                    success: true,
                    message: 'No hay extras activos',
                    data: []
                };
            }

            const extras = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return {
                success: true,
                message: 'Extras activos obtenidos exitosamente',
                data: extras
            };
        } catch (error) {
            console.error('Error obteniendo extras activos:', error);
            throw error;
        }
    }

    async updateExtra(id: string, updateData: ExtraUpdateInput) {
        try {
            const doc = await this.collection.doc(id).get();

            if (!doc.exists) {
                return {
                    success: false,
                    message: 'Extra no encontrado',
                    data: null
                };
            }

            const updatedData = {
                ...updateData,
                updatedAt: this.formatDate(updateData.updatedAt)
            };

            await this.collection.doc(id).update(updatedData);

            const updatedDoc = await this.collection.doc(id).get();

            return {
                success: true,
                message: 'Extra actualizado exitosamente',
                data: { id: updatedDoc.id, ...updatedDoc.data() }
            };
        } catch (error) {
            console.error('Error actualizando extra:', error);
            throw error;
        }
    }

    async deleteExtra(id: string) {
        try {
            const doc = await this.collection.doc(id).get();

            if (!doc.exists) {
                return {
                    success: false,
                    message: 'Extra no encontrado',
                    data: null
                };
            }

            await this.collection.doc(id).delete();

            return {
                success: true,
                message: 'Extra eliminado exitosamente',
                data: { id }
            };
        } catch (error) {
            console.error('Error eliminando extra:', error);
            throw error;
        }
    }

    async toggleExtraStatus(id: string) {
        try {
            const doc = await this.collection.doc(id).get();

            if (!doc.exists) {
                return {
                    success: false,
                    message: 'Extra no encontrado',
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
                message: `Extra ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`,
                data: { id, isEnable: !currentStatus }
            };
        } catch (error) {
            console.error('Error cambiando estado del extra:', error);
            throw error;
        }
    }
}