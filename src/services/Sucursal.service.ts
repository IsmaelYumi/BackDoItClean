import { db } from '../config/dbconfig.config';

export class Sucursal {
    private collection = db.collection('Sucursales');

    // Obtener el siguiente ID autoincrementable
    private async getNextId(): Promise<number> {
        try {
            const snapshot = await this.collection.get();
            if (snapshot.empty) {
                return 1; // Si no hay sucursales, comenzar con ID 1
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

    // Crear sucursal
    async createSucursal(
        nombre: string,
        numeroMaquinas: number,
        ud: number,
        floorDistribution: string,
        fechaExpiracionLicencia?: Date
    ) {
        if (!nombre) {
            return { mensaje: "Nombre de sucursal es requerido", success: false };
        }

        try {
            // Generar el siguiente ID autoincrementable
            const idSucursal = await this.getNextId();

            const sucursal = {
                idSucursal,
                nombre,
                numeroMaquinas: numeroMaquinas || 0,
                ud: ud || 0.0,
                floorDistribution: floorDistribution || '',
                fechaExpiracionLicencia,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await this.collection.doc(idSucursal.toString()).set(sucursal);
            return { mensaje: "Sucursal creada correctamente", success: true, idSucursal };
        } catch (error) {
            console.error('Error creando sucursal:', error);
            return { mensaje: "Error al crear la sucursal", success: false, error };
        }
    }

    // Obtener sucursal por ID
    async getSucursalById(idSucursal: number) {
        try {
            const doc = await this.collection.doc(idSucursal.toString()).get();
            if (!doc.exists) {
                return { mensaje: "Sucursal no encontrada", success: false, data: null };
            }
            return { mensaje: "Sucursal encontrada", success: true, data: { id: doc.id, ...doc.data() } };
        } catch (error) {
            console.error('Error obteniendo sucursal:', error);
            return { mensaje: "Error al obtener la sucursal", success: false, error };
        }
    }

    // Obtener todas las sucursales
    async getAllSucursales() {
        try {
            const snapshot = await this.collection.get();
            const sucursales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return { mensaje: "Sucursales obtenidas correctamente", success: true, data: sucursales };
        } catch (error) {
            console.error('Error obteniendo sucursales:', error);
            return { mensaje: "Error al obtener las sucursales", success: false, error };
        }
    }
    // Actualizar sucursal
    async updateSucursal(
        idSucursal: number,
        updateData: {
            nombre?: string;
            numeroMaquinas?: number;
            ud?: number;
            floorDistribution?: string;
            fechaExpiracionLicencia?: Date;
        }
    ) {
        try {
            const doc = await this.collection.doc(idSucursal.toString()).get();
            if (!doc.exists) {
                return { mensaje: "Sucursal no encontrada", success: false };
            }

            await this.collection.doc(idSucursal.toString()).update({
                ...updateData,
                updatedAt: new Date()
            });

            return { mensaje: "Sucursal actualizada correctamente", success: true };
        } catch (error) {
            console.error('Error actualizando sucursal:', error);
            return { mensaje: "Error al actualizar la sucursal", success: false, error };
        }
    }

    // Eliminar sucursal
    async deleteSucursal(idSucursal: number) {
        try {
            const doc = await this.collection.doc(idSucursal.toString()).get();
            if (!doc.exists) {
                return { mensaje: "Sucursal no encontrada", success: false };
            }

            await this.collection.doc(idSucursal.toString()).delete();
            return { mensaje: "Sucursal eliminada correctamente", success: true };
        } catch (error) {
            console.error('Error eliminando sucursal:', error);
            return { mensaje: "Error al eliminar la sucursal", success: false, error };
        }
    }

    // Obtener sucursales con licencia próxima a expirar
    async getSucursalesLicenciaProximaExpirar(dias: number = 30) {
        try {
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() + dias);

            const snapshot = await this.collection
                .where('fechaExpiracionLicencia', '<=', fechaLimite)
                .get();

            const sucursales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return { 
                mensaje: "Sucursales con licencia próxima a expirar obtenidas correctamente", 
                success: true, 
                data: sucursales 
            };
        } catch (error) {
            console.error('Error obteniendo sucursales con licencia próxima a expirar:', error);
            return { mensaje: "Error al obtener las sucursales", success: false, error };
        }
    }
}
