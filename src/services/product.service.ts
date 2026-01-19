import { db } from '../config/dbconfig.config';

export class productos{
    private collection= db.collection('products')
    async createProduct(
        id: number,
        code: number,
        name: string,
        price: number,
        description: string,
        category: string,
        imageUrl: string,
        isVisible: boolean,
        programGroups?: any[]
    ){
        if(!name || !price || !code){
            return{mensaje: "Nombre, precio y código son requeridos", success: false}
        }
        try{
            const productDoc = await this.collection.doc(id.toString()).get();
            if (productDoc.exists) {
                return { mensaje: "Ya existe un producto con ese ID", success: false };
            }
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

        for (const productData of products) {
            try {
                // Validar campos requeridos
                if (!productData.name || !productData.price || !productData.code) {
                    results.failed.push({
                        id: productData.id ?? 'sin ID',
                        reason: 'Nombre, precio y código son requeridos'
                    });
                    continue;
                }

                // Verificar si ya existe
                const productDoc = await this.collection.doc(productData.id.toString()).get();
                if (productDoc.exists) {
                    results.failed.push({
                        id: productData.id,
                        reason: 'Ya existe un producto con ese ID'
                    });
                    continue;
                }

                const product = {
                    id: productData.id,
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

                await this.collection.doc(productData.id.toString()).set(product);
                results.success.push(productData.id);
            } catch (error) {
                results.failed.push({
                    id: productData.id,
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