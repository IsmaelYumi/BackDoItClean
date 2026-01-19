import { db } from '../config/dbconfig.config';

export class professionalCleans {
    private collection = db.collection('professionalCleans')
    
    async createProfessionalClean(
        id: number,
        code: number,
        name: string,
        price: number,
        description: string,
        category: string,
        imageUrl: string,
        isVisible: boolean,
        programGroups?: any[]
    ) {
        if (!name || !price || !code) {
            return { mensaje: "Nombre, precio y código son requeridos", success: false }
        }
        try {
            const professionalCleanDoc = await this.collection.doc(id.toString()).get();
            if (professionalCleanDoc.exists) {
                return { mensaje: "Ya existe un professional clean con ese ID", success: false };
            }
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
    
    async createMultipleProfessionalCleans(professionalCleans: Array<{
        id: number;
        code: number;
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
            failed: [] as { id: number | string; reason: string }[]
        };

        for (const professionalCleanData of professionalCleans) {
            try {
                // Validar campos requeridos
                if (!professionalCleanData.name || !professionalCleanData.price || !professionalCleanData.code) {
                    results.failed.push({
                        id: professionalCleanData.id ?? 'sin ID',
                        reason: 'Nombre, precio y código son requeridos'
                    });
                    continue;
                }

                // Verificar si ya existe
                const professionalCleanDoc = await this.collection.doc(professionalCleanData.id.toString()).get();
                if (professionalCleanDoc.exists) {
                    results.failed.push({
                        id: professionalCleanData.id,
                        reason: 'Ya existe un professional clean con ese ID'
                    });
                    continue;
                }

                const professionalClean = {
                    id: professionalCleanData.id,
                    code: professionalCleanData.code,
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

                await this.collection.doc(professionalCleanData.id.toString()).set(professionalClean);
                results.success.push(professionalCleanData.id);
            } catch (error) {
                results.failed.push({
                    id: professionalCleanData.id,
                    reason: 'Error al crear el professional clean'
                });
            }
        }

        return {
            mensaje: `Procesados ${professionalCleans.length} professional cleans: ${results.success.length} exitosos, ${results.failed.length} fallidos`,
            success: results.failed.length === 0,
            createdCount: results.success.length,
            failedCount: results.failed.length,
            createdCodes: results.success,
            failures: results.failed
        };
    }
}
