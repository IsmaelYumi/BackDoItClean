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
      const snapshot = await this.collection.get();
      if (snapshot.empty) {
        return 1; // Si no hay usuarios, comenzar con ID 1
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
  // Crear usuario
  async createUser(name: string, lastName:string, email:string, phone:string, idCard:string, role:UserRole, password?:string, rating?:number, profileURL?:string) {
    try {
      // Si el rol es CLIENT o no se proporciona password, usar un valor por defecto
      let validPassword = password || "null";
      if(role==UserRole.CLIENT){
        validPassword="null";
      }
      if(!name|| !phone){
        return {success :false, id:0}
      }
      // Generar el siguiente ID autoincrementable
      const id = await this.getNextId();
      // Encriptar la contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(validPassword, saltRounds);
      await this.collection.doc(id.toString()).set({
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
      // Campos permitidos para actualizar
      const allowedFields = ['name', 'lastName', 'email', 'password', 'phone', 'idCard', 'role', 'rating', 'profileImageUrl'];
      
      // Filtrar solo los campos permitidos que vienen en userData
      const updateData: any = { updatedAt: new Date() };
      
      for (const field of allowedFields) {
        if (userData[field] != undefined) {
          // Si es password, encriptarlo
          if (field === 'password' && userData[field]) {
            const saltRounds = 10;
            updateData[field] = await bcrypt.hash(userData[field], saltRounds);
          } else {
            updateData[field] = userData[field];
          }
        }
      }
      console.log(updateData)
      await this.collection.doc(userId.toString()).update(updateData);
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
