import { db } from '../config/dbconfig.config';

export class productos{
    private collection= db.collection('products')
    
    // Obtener el siguiente ID autoincrementable
    private async getNextId(): Promise<number> {
        try {
            const snapshot = await this.collection.get();
            if (snapshot.empty) {
                return 1; // Si no hay productos, comenzar con ID 1
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
    
    async createProduct(
        code: number,
        name: string,
        price: number,
        description: string,
        category: string,
        imageUrl: string,
        isVisible: number,
        programGroups?: any[]
    ){
        if(!name || !price || !code){
            return{mensaje: "Nombre, precio y código son requeridos", success: false}
        }
        try{
            // Generar el siguiente ID autoincrementable
            const id = await this.getNextId();
            
            const product={
                id,
                code,
                name,
                price,
                description: description || '',
                category: category || '',
                imageUrl: imageUrl || '',
                isVisible,
                programGroups: programGroups || [],
                createdAt: new Date(),
                updatedAt: new Date()
            }
            await this.collection.doc(id.toString()).set(product)
            return{mensaje:"Producto registrado correctamente", success: true, id}
        }catch(error){
            console.error('Error creando producto:', error);
            return{mensaje:"Error al registrar el producto", success:false, error}
        }
    }
    async getProductById(id: number) {
        try {
            const doc = await this.collection.doc(id.toString()).get();
        if (!doc.exists) {
            return { mensaje: "Producto no encontrado", success: false, data: null };
        }
        return { mensaje: "Producto encontrado", success: true, data: { id: doc.id, ...doc.data() } };
        } catch (error) {
            console.error('Error obteniendo producto:', error);
            throw error;
        }
    }
    
    async getAllProducts() {
        try {
            const snapshot = await this.collection.get();
            const products = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return {
                mensaje: products.length > 0 ? "Productos obtenidos correctamente" : "No hay productos registrados",
                success: true,
                data: products,
                count: products.length
            };
        } catch (error) {
            console.error('Error obteniendo productos:', error);
            return { mensaje: "Error al obtener los productos", success: false, error };
        }
    }
    async DeleteProduct(id:number){
      try {
        const doc = await this.collection.doc(id.toString()).get();
        if (!doc.exists) {
            return { mensaje: "Producto no encontrado", success: false };
        }
        await this.collection.doc(id.toString()).delete();
        return { mensaje: "Producto eliminado correctamente", success: true };
    } catch (error) {
        return { mensaje: "Error al eliminar el producto", success: false };
    }
    }
    async createMultipleProducts(products: Array<{
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
            failed: [] as { code: number | string; reason: string }[]
        };

        for (const productData of products) {
            try {
                // Validar campos requeridos
                if (!productData.name || !productData.price || !productData.code) {
                    results.failed.push({
                        code: productData.code ?? 'sin código',
                        reason: 'Nombre, precio y código son requeridos'
                    });
                    continue;
                }

                // Generar el siguiente ID autoincrementable
                const id = await this.getNextId();

                const product = {
                    id,
                    code: productData.code,
                    name: productData.name,
                    price: productData.price,
                    description: productData.description || '',
                    category: productData.category || '',
                    imageUrl: productData.imageUrl || '',
                    isVisible: productData.isVisible,
                    programGroups: productData.programGroups || [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                await this.collection.doc(id.toString()).set(product);
                results.success.push(id);
            } catch (error) {
                results.failed.push({
                    code: productData.code,
                    reason: 'Error al crear el producto'
                });
            }
        }

        return {
            mensaje: `Procesados ${products.length} productos: ${results.success.length} exitosos, ${results.failed.length} fallidos`,
            success: results.failed.length === 0,
            createdCount: results.success.length,
            failedCount: results.failed.length,
            createdCodes: results.success,
            failures: results.failed
        };
    }
}