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
    async createDiscount( name:string, isPercentage:boolean, isVisible:boolean, isEnable:boolean){
        
    }

    }