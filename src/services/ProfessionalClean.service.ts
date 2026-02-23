import { db } from '../config/dbconfig.config';

export class professionalCleans {
    private collection = db.collection('professionalCleans')
    // Obtener el siguiente ID autoincrementable
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

    // Obtener el siguiente código autoincrementable
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
    async createProfessionalClean(
        name: string,
        price: number,
        description: string,
        category: string,
        imageUrl: string,
        isVisible: boolean,
        programGroups?: any[]
    ) {
        if (!name) {
            return { mensaje: "Nombre es requerido", success: false }
        }
        try {
            // Verificar si ya existe un professional clean con el mismo nombre
            const existingSnapshot = await this.collection.where('name', '==', name).get();
            if (!existingSnapshot.empty) {
                return { mensaje: "Ya existe un professional clean con ese nombre", success: false };
            }
            
            // Generar el siguiente ID y código autoincrementables
            const id = await this.getNextId();
            const code = await this.getNextCode();
            const professionalClean = {
                id,
                code,
                name,
                price,
                description: description || '',
                category: category || 'ProfessionalClean',
                imageUrl: imageUrl || '',
                isVisible,
                programGroups: programGroups || [],
                createdAt: new Date(),
                updatedAt: new Date()
            }
            await this.collection.doc(id.toString()).set(professionalClean)
            return { mensaje: "Professional clean registrado correctamente", success: true, id }
        } catch (error) {
            console.error('Error creando professional clean:', error);
            return { mensaje: "Error al registrar el professional clean", success: false, error }
        }
    }
    async getProfessionalCleanById(id: number) {
        try {
            const doc = await this.collection.doc(id.toString()).get();
            if (!doc.exists) {
                return { mensaje: "Professional clean no encontrado", success: false, data: null };
            }
            return { mensaje: "Professional clean encontrado", success: true, data: { id: doc.id, ...doc.data() } };
        } catch (error) {
            console.error('Error obteniendo professional clean:', error);
            throw error;
        }
    }
    async getAllProfessionalCleans() {
        try {
            const snapshot = await this.collection.get();
            const professionalCleans = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return {
                mensaje: professionalCleans.length > 0 ? "Professional cleans obtenidos correctamente" : "No hay professional cleans registrados",
                success: true,
                data: professionalCleans,
                count: professionalCleans.length
            };
        } catch (error) {
            console.error('Error obteniendo professional cleans:', error);
            return { mensaje: "Error al obtener los professional cleans", success: false, error };
        }
    }
    async DeleteProfessionalClean(id: number) {
        try {
            const doc = await this.collection.doc(id.toString()).get();
            if (!doc.exists) {
                return { mensaje: "Professional clean no encontrado", success: false };
            }
            await this.collection.doc(id.toString()).delete();
            return { mensaje: "Professional clean eliminado correctamente", success: true };
        } catch (error) {
            return { mensaje: "Error al eliminar el professional clean", success: false };
        }
    }
    async updateProfessionalClean(
        id: number,
        updateData: {
            code?: number;
            name?: string;
            price?: number;
            description?: string;
            category?: string;
            imageUrl?: string;
            isVisible?: boolean;
            programGroups?: any[];
        }
    ) {
        try {
            const docRef = this.collection.doc(id.toString());
            const doc = await docRef.get();
            
            if (!doc.exists) {
                return { mensaje: "Professional clean no encontrado", success: false };
            }
            
            // Si se está actualizando el nombre, verificar que no exista otro con ese nombre
            if (updateData.name) {
                const existingSnapshot = await this.collection
                    .where('name', '==', updateData.name)
                    .get();
                
                if (!existingSnapshot.empty && existingSnapshot.docs[0].id !== id.toString()) {
                    return { mensaje: "Ya existe un professional clean con ese nombre", success: false };
                }
            }
            
            const dataToUpdate = {
                ...updateData,
            };
            
            await docRef.update(dataToUpdate);
            
            return { 
                mensaje: "Professional clean actualizado correctamente", 
                success: true,
                data: { id, ...dataToUpdate }
            };
        } catch (error) {
            console.error('Error actualizando professional clean:', error);
            return { mensaje: "Error al actualizar el professional clean", success: false, error };
        }
    }
    async createMultipleProfessionalCleans(professionalCleans: Array<{
        name: string;
        price: number;
        description: string;
        category: string;
        imageUrl: string;
        isVisible: boolean;
        programGroups?: any[];
    }>) {
        const results = {
            success: [] as number[],
            failed: [] as { name: string; reason: string }[]
        };
        for (const professionalCleanData of professionalCleans) {
            try {
                // Validar campos requeridos
                if (!professionalCleanData.name || !professionalCleanData.price) {
                    results.failed.push({
                        name: professionalCleanData.name ?? 'sin nombre',
                        reason: 'Nombre y precio son requeridos'
                    });
                    continue;
                }
                
                // Verificar si ya existe un professional clean con el mismo nombre
                const existingSnapshot = await this.collection.where('name', '==', professionalCleanData.name).get();
                if (!existingSnapshot.empty) {
                    results.failed.push({
                        name: professionalCleanData.name,
                        reason: 'Ya existe un professional clean con ese nombre'
                    });
                    continue;
                }
                
                // Generar el siguiente ID y código autoincrementables
                const id = await this.getNextId();
                const code = await this.getNextCode();
                const professionalClean = {
                    id,
                    code,
                    name: professionalCleanData.name,
                    price: professionalCleanData.price,
                    description: professionalCleanData.description || '',
                    category: professionalCleanData.category || 'ProfessionalClean',
                    imageUrl: professionalCleanData.imageUrl || '',
                    isVisible: professionalCleanData.isVisible,
                    programGroups: professionalCleanData.programGroups || [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                await this.collection.doc(id.toString()).set(professionalClean);
                results.success.push(id);
            } catch (error) {
                results.failed.push({
                    name: professionalCleanData.name,
                    reason: 'Error al crear el professional clean'
                });
            }
        }
        return {
            mensaje: `Procesados ${professionalCleans.length} professional cleans: ${results.success.length} exitosos, ${results.failed.length} fallidos`,
            success: results.failed.length === 0,
            createdCount: results.success.length,
            failedCount: results.failed.length,
            createdIds: results.success,
            failures: results.failed
        };
    }
}
