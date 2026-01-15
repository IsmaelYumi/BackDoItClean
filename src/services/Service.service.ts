import { db } from '../config/dbconfig.config';
import { Device, DeviceStatus } from './Device.service'; 
export enum PaymentType {
    CASH = 'Cash',
    DEBIT_CREDIT_CARD = 'Debit/Credit Card',
    PHONE_PAY = 'Phone Pay'
}

export enum ServiceType {
    AUTO_SERVICE = 'AutoService',
    ORDER = 'Order',
    DRY_CLEANING = 'Dry Cleaning'
}

export enum DeviceTypeCart {
    WASHER = 'lavadora',
    DRYER = 'secadora'
}

interface CartItem {
    deviceType: DeviceTypeCart;
    deviceCode?: string;
    deviceName?: string;
    quantity?: number;
}

export class ServiceSales {
    private collection = db.collection('Service');

    // Crear nota de venta/servicio
    async createService(
        IdCliente: string,
        Fecha: Date,
        CartList: CartItem[],
        PaymentType: PaymentType,
        ServiceType: ServiceType,
        IdUser: string,
        Total: number
    ) {
        // Validar campos requeridos
        if (!IdCliente || !Fecha || !CartList || CartList.length === 0 || !PaymentType || !ServiceType || !IdUser || Total === undefined) {
            return {
                mensaje: "Todos los campos son requeridos y el carrito no puede estar vacío",
                success: false
            };
        }
        const Servicio = `Servicio_${Math.random().toString(36).substring(2, 15)}`

        try {
            // Crear el documento de servicio
            const service = {
                IdCliente,
                Fecha: Fecha instanceof Date ? Fecha : new Date(Fecha),
                CartList,
                PaymentType,
                Sucursal: 1, // Constante
                ServiceType,
                IdUser,
                Total,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Generar ID único para el servicio
            const serviceRef = await this.collection.doc(Servicio).set(service);

            return {
                mensaje: "Servicio registrado correctamente",
                success: true,
                serviceId: Servicio,
                total: Total
            };
        } catch (error) {
            console.error('Error creando servicio:', error);
            return {
                mensaje: "Error al registrar el servicio",
                success: false,
                error
            };
        }
    }

    // Obtener servicio por ID
    async getServiceById(serviceId: string) {
        try {
            const doc = await this.collection.doc(serviceId).get();
            if (!doc.exists) {
                return {
                    mensaje: "Servicio no encontrado",
                    success: false,
                    data: null
                };
            }
            return {
                mensaje: "Servicio encontrado",
                success: true,
                data: { id: doc.id, ...doc.data() }
            };
        } catch (error) {
            console.error('Error obteniendo servicio:', error);
            return {
                mensaje: "Error al obtener el servicio",
                success: false,
                error
            };
        }
    }

    // Obtener servicios por cliente
    async getServicesByClient(IdCliente: string) {
        try {
            const snapshot = await this.collection.where('IdCliente', '==', IdCliente).get();
            const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return {
                mensaje: "Servicios obtenidos correctamente",
                success: true,
                data: services
            };
        } catch (error) {
            console.error('Error obteniendo servicios por cliente:', error);
            return {
                mensaje: "Error al obtener los servicios",
                success: false,
                error
            };
        }
    }

    // Obtener servicios por operario
    async getServicesByUser(IdUser: string) {
        try {
            const snapshot = await this.collection.where('IdUser', '==', IdUser).get();
            const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return {
                mensaje: "Servicios obtenidos correctamente",
                success: true,
                data: services
            };
        } catch (error) {
            console.error('Error obteniendo servicios por usuario:', error);
            return {
                mensaje: "Error al obtener los servicios",
                success: false,
                error
            };
        }
    }

    // Obtener todos los servicios
    async getAllServices() {
        try {
            const snapshot = await this.collection.get();
            const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return {
                mensaje: "Servicios obtenidos correctamente",
                success: true,
                data: services
            };
        } catch (error) {
            console.error('Error obteniendo servicios:', error);
            return {
                mensaje: "Error al obtener los servicios",
                success: false,
                error
            };
        }
    }

    // Obtener servicios por tipo
    async getServicesByType(serviceType: ServiceType) {
        try {
            const snapshot = await this.collection.where('ServiceType', '==', serviceType).get();
            const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return {
                mensaje: "Servicios obtenidos correctamente",
                success: true,
                data: services
            };
        } catch (error) {
            console.error('Error obteniendo servicios por tipo:', error);
            return {
                mensaje: "Error al obtener los servicios",
                success: false,
                error
            };
        }
    }

    // Obtener servicios por rango de fechas
    async getServicesByDateRange(startDate: Date, endDate: Date) {
        try {
            const snapshot = await this.collection
                .where('Fecha', '>=', startDate)
                .where('Fecha', '<=', endDate)
                .get();
            const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return {
                mensaje: "Servicios obtenidos correctamente",
                success: true,
                data: services
            };
        } catch (error) {
            console.error('Error obteniendo servicios por rango de fechas:', error);
            return {
                mensaje: "Error al obtener los servicios",
                success: false,
                error
            };
        }
    }

    // Validar transacción y actualizar estado del dispositivo
    async validateAndUpdateDeviceStatus(
        transactionId: string,
        deviceCode: string
    ) {
        try {
            // Buscar la transacción/servicio
            const doc = await this.collection.doc(transactionId).get();
            let serviceData: any = null; 
            if (!doc) {
                return {
                    mensaje: "Transacción no encontrada",
                    success: false
                };
            }   
            serviceData= doc.data();

            const cartList = serviceData.CartList as CartItem[];

            // Validar que el dispositivo esté en el CartList
            const deviceInCart = cartList.find(
                item => item.deviceCode === deviceCode
            );

            if (!deviceInCart) {
                return {
                    mensaje: `El dispositivo ${deviceCode} no está registrado en esta transacción`,
                    success: false
                };
            }

            // Actualizar el estado del dispositivo en la colección Devices
            const devicesCollection = db.collection('Devices');
            const deviceDoc = await devicesCollection.doc(deviceCode).get();

            if (!deviceDoc.exists) {
                return {
                    mensaje: `Dispositivo ${deviceCode} no encontrado en la base de datos`,
                    success: false
                };
            }

            await devicesCollection.doc(deviceCode).update({
                status: DeviceStatus.OFFLINE,
                updatedAt: new Date()
            });

            return {
                mensaje: "Estado del dispositivo actualizado correctamente",
                success: true,
                transactionId,
                deviceCode,
                deviceType: deviceInCart.deviceType,
            };
        } catch (error) {
            console.error('Error validando y actualizando dispositivo:', error);
            return {
                mensaje: "Error al validar y actualizar el dispositivo",
                success: false,
                error
            };
        }
    }
}

export default new ServiceSales();