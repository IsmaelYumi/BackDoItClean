import { db } from '../config/dbconfig.config';
export class productos{
    private collection= db.collection('prodcuts')
    async createProduct(id:number ,Nombre:string, precio:number,categoria:string,imagenUrl:string ,codigo:string,isVisible:number, descripccion?:string,){
        if(!Nombre ||!precio){
            return{mensaje: "No puedes registrar un producto sin su nombre y sin cantidad"}
        }
        try{
            const productDoc = await this.collection.doc(isVisible.toString()).get();
            if (productDoc.exists) {
                return { mensaje: "Ya existe un producto con ese código", success: false };
            }
            const product={
            name:Nombre,
            precio: precio,
            descripccion:descripccion || null,
            category:categoria,
            imaegURL:imagenUrl,
            code:codigo,
            inVisible:isVisible,
            }
            await this.collection.doc(id.toString()).set(product)
            return{mensaje:"Producto registrado correctamente", codigo}
        }catch(error){
            return{mensaje:"Error al registrar el prodcuto", success:false}
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
        Nombre: string;
        precio: number;
        categoria: string;
        imagenUrl: string;
        codigo: string;
        isVisible: number;
        descripccion?: string;
    }>) {
        const results = {
            success: [] as string[],
            failed: [] as { codigo: string; reason: string }[]
        };

        for (const productData of products) {
            try {
                // Validar campos requeridos
                if (!productData.Nombre || !productData.precio) {
                    results.failed.push({
                        codigo: productData.codigo || 'sin código',
                        reason: 'No puedes registrar un producto sin su nombre y sin precio'
                    });
                    continue;
                }

                // Verificar si ya existe
                const productDoc = await this.collection.doc(productData.id.toString()).get();
                if (productDoc.exists) {
                    results.failed.push({
                        codigo: productData.codigo,
                        reason: 'Ya existe un producto con ese ID'
                    });
                    continue;
                }

                const product = {
                    name: productData.Nombre,
                    precio: productData.precio,
                    descripccion: productData.descripccion || null,
                    category: productData.categoria,
                    imaegURL: productData.imagenUrl,
                    code: productData.codigo,
                    inVisible: productData.isVisible,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                await this.collection.doc(productData.id.toString()).set(product);
                results.success.push(productData.codigo);
            } catch (error) {
                results.failed.push({
                    codigo: productData.codigo,
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