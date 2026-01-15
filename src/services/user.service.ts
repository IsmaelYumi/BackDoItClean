// Ejemplo de uso de Firebase Firestore en un servici
import { db } from '../config/dbconfig.config';
export class UserService {
  private collection = db.collection('users');
  // Crear usuario
  async createUser(userId: string, userData: any) {
    try {
      await this.collection.doc(userId).set({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { success: true, userId };
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw error;
    }
  }
  // Obtener usuario por ID
  async getUserById(userId: string) {
    try {
      const doc = await this.collection.doc(userId).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      throw error;
    }
  }
  // Obtener todos los usuarios
  async getAllUsers() {
    try {
      const snapshot = await this.collection.where("rol","==","client").get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      throw error;
    }
  }
  // Actualizar usuario
  async updateUser(userId: string, userData: any) {
    try {
      await this.collection.doc(userId).update({
        ...userData,
        updatedAt: new Date()
      });
      return { success: true, userId };
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  }

  // Eliminar usuario
  async deleteUser(userId: string) {
    try {
      await this.collection.doc(userId).delete();
      return { success: true, userId };
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw error;
    }
  }
}

export default new UserService();
