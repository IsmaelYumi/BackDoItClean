import * as dotenv from 'dotenv';

// Cargar variables de entorno primero
dotenv.config();

// Importar después de cargar las variables de entorno
import app from './app';

const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
