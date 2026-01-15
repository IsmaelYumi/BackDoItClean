import admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

// Inicializar Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});

console.log('✅ Firebase Admin inicializado correctamente');

// Exportar instancias de Firebase
export const db = admin.firestore();

