import { db } from '../config/dbconfig.config';
import { Sucursal } from './Sucursal.service';

export enum DeviceType {
    WASHER = 'washer',
    DRYER = 'dryer'
}
export enum DeviceStatus {
    ONLINE = 'online',
    OFFLINE = 'offline',
    MAINTENANCE = 'maintenance'
}
export class Device {
    private collection = db.collection('Devices');
    private sucursalService = new Sucursal();

    // Crear dispositivo
    async createDevice(
        id: number,
        idSucursal:number,
        code: number,
        type: DeviceType,
        name: string,
        price: number,
        brand: string,
        description: string,
        label: string,
        model: string,
        category: string,
        capacityKg: number,
        isVisible: boolean,
        status: DeviceStatus,
        programGroups?: any[],
        error?: string,
        imageUrl?: string
    ) {
        if (!name || !price || !code || !idSucursal) {
            return { mensaje: "Nombre, precio, código e idSucursal son requeridos", success: false };
        }

        try {
            // Verificar si ya existe un dispositivo con ese código
            const deviceDoc = await this.collection.doc(id.toString()).get();
            if (deviceDoc.exists) {
                return { mensaje: "Ya existe un dispositivo con ese código", success: false };
            }
            const device = {
                id,
                idSucursal,
                code,
                type,
                name,
                description,
                brand,
                label,
                model,
                category,
                capacityKg,
                imageUrl: imageUrl || '',
                price,
                isVisible,
                status,
                programGroups: programGroups || [],
                error: error || null,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await this.collection.doc(id.toString()).set(device);
            return { mensaje: "Dispositivo creado correctamente", success: true, code };
        } catch (error) {
            console.error('Error creando dispositivo:', error);
            return { mensaje: "Error al crear el dispositivo", success: false, error };
        }
    }
    
    // Obtener dispositivo por ID
    async getDeviceById(id: number) {
        try {
            const doc = await this.collection.doc(id.toString()).get();
            if (!doc.exists) {
                return { mensaje: "Dispositivo no encontrado", success: false, data: null };
            }
            return { mensaje: "Dispositivo encontrado", success: true, data: { id: doc.id, ...doc.data() } };
        } catch (error) {
            console.error('Error obteniendo dispositivo:', error);
            return { mensaje: "Error al obtener el dispositivo", success: false, error };
        }
    }

    // Obtener dispositivo por código
    async getDeviceByCode(code: string) {
        try {
            const doc = await this.collection.doc(code).get();
            if (!doc.exists) {
                return { mensaje: "Dispositivo no encontrado", success: false, data: null };
            }
            return { mensaje: "Dispositivo encontrado", success: true, data: { id: doc.id, ...doc.data() } };
        } catch (error) {
            console.error('Error obteniendo dispositivo:', error);
            return { mensaje: "Error al obtener el dispositivo", success: false, error };
        }
    }

    // Obtener todos los dispositivos
    async getAllDevices() {
        try {
            const snapshot = await this.collection.get();
            const devices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return { mensaje: "Dispositivos obtenidos correctamente", success: true, data: devices };
        } catch (error) {
            console.error('Error obteniendo dispositivos:', error);
            return { mensaje: "Error al obtener los dispositivos", success: false, error };
        }
    }

    // Obtener dispositivos por tipo
    async getDevicesByType(type: DeviceType) {
        try {
            const snapshot = await this.collection.where('type', '==', type).get();
            const devices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return { mensaje: "Dispositivos obtenidos correctamente", success: true, data: devices };
        } catch (error) {
            console.error('Error obteniendo dispositivos por tipo:', error);
            return { mensaje: "Error al obtener los dispositivos", success: false, error };
        }
    }

    // Obtener dispositivos por estado
    async getDevicesByStatus(status: DeviceStatus) {
        try {
            const snapshot = await this.collection.where('status', '==', status).get();
            const devices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return { mensaje: "Dispositivos obtenidos correctamente", success: true, data: devices };
        } catch (error) {
            console.error('Error obteniendo dispositivos por estado:', error);
            return { mensaje: "Error al obtener los dispositivos", success: false, error };
        }
    }

    // Actualizar dispositivo
    async updateDevice(
        code: string,
        updateData: {
            name?: string;
            description?: string;
            brand?: string;
            label?: string;
            model?: string;
            category?: string;
            capacityKg?: number;
            price?: number;
            isVisible?: boolean;
            status?: DeviceStatus;
            type?: DeviceType;
            error?: string;
            imageUrl?: string;
            programGroups?: any[];
        }
    ) {
        try {
            const doc = await this.collection.doc(code).get();
            if (!doc.exists) {
                return { mensaje: "Dispositivo no encontrado", success: false };
            }

            await this.collection.doc(code).update({
                ...updateData,
                updatedAt: new Date()
            });

            return { mensaje: "Dispositivo actualizado correctamente", success: true, code };
        } catch (error) {
            console.error('Error actualizando dispositivo:', error);
            return { mensaje: "Error al actualizar el dispositivo", success: false, error };
        }
    }

    // Eliminar dispositivo
    async deleteDevice(code: string) {
        try {
            const doc = await this.collection.doc(code).get();
            if (!doc.exists) {
                return { mensaje: "Dispositivo no encontrado", success: false };
            }

            await this.collection.doc(code).delete();
            return { mensaje: "Dispositivo eliminado correctamente", success: true, code };
        } catch (error) {
            console.error('Error eliminando dispositivo:', error);
            return { mensaje: "Error al eliminar el dispositivo", success: false, error };
        }
    }

    // Crear múltiples dispositivos
    async createMultipleDevices(devices: Array<{
        id: number;
        code: number;
        type: DeviceType;
        name: string;
        price: number;
        brand: string;
        description: string;
        label: string;
        model: string;
        category: string;
        capacityKg: number;
        isVisible: boolean;
        status: DeviceStatus;
        error?: string;
        imageUrl?: string;
    }>) {
        const results = {
            success: [] as number[],
            failed: [] as { code: number | string; reason: string }[]
        };

        for (const deviceData of devices) {
            try {
                // Validar campos requeridos
                if (!deviceData.name || !deviceData.price || !deviceData.code) {
                    results.failed.push({
                        code: deviceData.code ?? 'sin código',
                        reason: 'Nombre, precio y código son requeridos'
                    });
                    continue;
                }

                // Verificar si ya existe
                const deviceDoc = await this.collection.doc(deviceData.id.toString()).get();
                if (deviceDoc.exists) {
                    results.failed.push({
                        code: deviceData.code,
                        reason: 'Ya existe un dispositivo con ese código'
                    });
                    continue;
                }
                const device = {
                    id: deviceData.id,
                    code: deviceData.code,
                    type: deviceData.type,
                    name: deviceData.name,
                    description: deviceData.description,
                    brand: deviceData.brand,
                    label: deviceData.label,
                    model: deviceData.model,
                    category: deviceData.category,
                    capacityKg: deviceData.capacityKg,
                    imageUrl: deviceData.imageUrl || '',
                    price: deviceData.price,
                    isVisible: deviceData.isVisible,
                    status: deviceData.status,
                    error: deviceData.error || null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                await this.collection.doc(deviceData.id.toString()).set(device);
                results.success.push(deviceData.code);
            } catch (error) {
                results.failed.push({
                    code: deviceData.code,
                    reason: 'Error al crear el dispositivo'
                });
            }
        }
        return {
            mensaje: `Procesados ${devices.length} dispositivos: ${results.success.length} exitosos, ${results.failed.length} fallidos`,
            success: results.failed.length === 0,
            createdCount: results.success.length,
            failedCount: results.failed.length,
            createdCodes: results.success,
            failures: results.failed
        };
    }

    // Obtener dispositivos por sucursal con floor distribution
    async getDevicesBySucursal(idSucursal: number) {
        try {
            // Obtener la sucursal para obtener el floor distribution
            const sucursalResult = await this.sucursalService.getSucursalById(idSucursal);
            
            if (!sucursalResult.success || !sucursalResult.data) {
                return { mensaje: "Sucursal no encontrada", success: false, data: null };
            }

            const sucursalData: any = sucursalResult.data;

            // Obtener dispositivos de la sucursal
            const snapshot = await this.collection.where('idSucursal', '==', idSucursal).get();
            
            // Mapear solo los campos requeridos
            const devices = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: data.id,
                    code: data.code,
                    type: data.type,
                    label: data.label,
                    isVisible: data.isVisible,
                    status: data.status,
                    imageUrl: data.imageUrl
                };
            });

            return {
                mensaje: "Dispositivos de la sucursal obtenidos correctamente",
                success: true,
                data: {
                    floorDistribution: sucursalData.floorDistribution,
                    devices: devices
                }
            };
        } catch (error) {
            console.error('Error obteniendo dispositivos por sucursal:', error);
            return { mensaje: "Error al obtener los dispositivos de la sucursal", success: false, error };
        }
    }

    // Obtener todos los datos de dispositivos por sucursal
    async getAllDeviceDataBySucursal(idSucursal: number) {
        try {
            // Obtener dispositivos de la sucursal con todos sus datos
            const snapshot = await this.collection.where('idSucursal', '==', idSucursal).get();
            
            const devices = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return {
                mensaje: "Dispositivos de la sucursal obtenidos correctamente",
                success: true,
                data: devices
            };
        } catch (error) {
            console.error('Error obteniendo todos los datos de dispositivos por sucursal:', error);
            return { mensaje: "Error al obtener los dispositivos de la sucursal", success: false, error };
        }
    }
}

export default new Device();