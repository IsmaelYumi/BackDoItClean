// Ejemplo de uso de Firebase Firestore en un servici
import { db } from '../config/dbconfig.config';
import * as bcrypt from 'bcrypt';
export enum  UserRole{
  ADMIN=1,
  MANAGER=2,
  OPERATOR=3,
  CLIENT=4,
  SUPERADMIN=5,
}
export class UserService {
  private collection = db.collection('users');

  // Crear usuario
  async createUser(userId: string, name: string, lastname:string, email:string, password:string, phone:string, idcard:string, rol:string, rating?:number, profileURL?:string) {
    try {
      // Encriptar la contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      await this.collection.doc(userId).set({
        name,
        lastname,
        email,
        password: hashedPassword,
        phone,
        idcard,
        rol,
        rating: rating || 0,
        profileURL: profileURL || '',
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

  // Login de usuario
  async loginUser(email: string, password: string) {
    try {
      // Buscar usuario por email
      const snapshot = await this.collection.where('email', '==', email).limit(1).get();
      if (snapshot.empty) {
        return { success: false, message: 'Usuario no encontrado' };
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, userData.password);
      
      if (!isPasswordValid) {
        return { success: false, message: 'Contraseña incorrecta' };
      }

      // Retornar información del usuario sin la contraseña
      const { password: _, ...userInfo } = userData;
      return { 
        user: { 
          id: userDoc.id, 
          ...userInfo 
        } 
      };
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }
}

export default new UserService();
