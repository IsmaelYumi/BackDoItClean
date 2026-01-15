import express, { Application } from 'express';
import deviceRoutes from './routes/device.routes';
import productRoutes from './routes/product.routes';
import serviceRoutes from './routes/service.routes';

const app: Application = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.get('/', (req, res) => {
  res.json({ message: 'DoItClean API - Backend funcionando' });
});

// Rutas de la API
app.use('/api', deviceRoutes);
app.use('/api', productRoutes);
app.use('/api', serviceRoutes);

export default app;
