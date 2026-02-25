import { db } from '../config/dbconfig.config';

export class SessionService {
  private collection = db.collection('sessions');
  
  // Obtener el siguiente ID autoincrementable
  private async getNextId(): Promise<number> {
    try {
      const snapshot = await this.collection.get();
      if (snapshot.empty) {
        return 1;
      }
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
  
  // Crear sesión
  async createSession(operator: number, startDate: string, endDate: string) {
    try {
      const id = await this.getNextId();
      
      await this.collection.doc(id.toString()).set({
        operator,
        startDate,
        endDate,
        createdAt: new Date()
      });
      
      return { success: true, id };
    } catch (error) {
      console.error('Error creando sesión:', error);
      return { success: false, error };
    }
  }
  
  // Obtener sesión por ID
  async getSessionById(sessionId: number) {
    try {
      const doc = await this.collection.doc(sessionId.toString()).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error obteniendo sesión:', error);
      throw error;
    }
  }
  
  // Obtener todas las sesiones
  async getAllSessions() {
    try {
      const snapshot = await this.collection.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error obteniendo sesiones:', error);
      throw error;
    }
  }
  
  // Obtener sesiones por operador
  async getSessionsByOperator(operator: number) {
    try {
      const snapshot = await this.collection.where('operator', '==', operator).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error obteniendo sesiones del operador:', error);
      throw error;
    }
  }
}

export default new SessionService();
