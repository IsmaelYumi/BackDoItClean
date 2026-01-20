// Ejemplo de uso de Firebase Firestore en un servici
import { db } from '../config/dbconfig.config';
import * as bcrypt from 'bcrypt';
export enum  UserRole{
  ADMIN=1,
  MANAGER=2,
  OPERATOR=3,
  CLIENT=4,
  SUPERADMIN=5,
  GUEST=6
}
export class UserService {
  private collection = db.collection('users');
  // Obtener el siguiente ID autoincrementable
  private async getNextId(): Promise<number> {
    try {
      const snapshot = await this.collection.orderBy('id', 'desc').limit(1).get();
      if (snapshot.empty) {
        return 1; // Si no hay usuarios, comenzar con ID 1
      }
      const lastUser = snapshot.docs[0].data();
      return (lastUser.id || 0) + 1;
    } catch (error) {
      console.error('Error obteniendo siguiente ID:', error);
      return 1;
    }
  }
  // Crear usuario
  async createUser(name: string, lastName:string, email:string, phone:string, idCard:string, role:UserRole,password:string, rating?:number, profileURL?:string,) {
    try {
      if(role==UserRole.CLIENT){
        password="null";
      }
      // Generar el siguiente ID autoincrementable
      const id = await this.getNextId();
      // Encriptar la contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      await this.collection.doc(id.toString()).set({
        id,
        name,
        lastName,
        email,
        password: hashedPassword,
        phone,
        idCard,
        role,
        rating: rating || 0,
        profileImageUrl: profileURL || '',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { success: true, id };
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw error;
    }
  }
  // Obtener usuario por ID
  async getUserById(userId: number) {
    try {
      const doc = await this.collection.doc(userId.toString()).get();
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
      const snapshot = await this.collection.where("role","==",UserRole.CLIENT).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      throw error;
    }
  }
  // Actualizar usuario
  async updateUser(userId: number, userData: any) {
    try {
      await this.collection.doc(userId.toString()).update({
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
  async deleteUser(userId: number) {
    try {
      await this.collection.doc(userId.toString()).delete();
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
        success:true,
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
