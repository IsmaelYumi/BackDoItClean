import * as dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno según el entorno
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env.development';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

console.log(`🔧 Ambiente: ${process.env.NODE_ENV || 'development'}`);
console.log(`📁 Archivo de configuración: ${envFile}`);

// Importar después de cargar las variables de entorno
import app from './app';

const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
