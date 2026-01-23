import express, { Application } from 'express';
import deviceRoutes from './routes/device.routes';
import productRoutes from './routes/product.routes';
import professionalCleanRoutes from './routes/professionalClean.routes';
import serviceRoutes from './routes/service.routes';
import userRoutes from './routes/user.routes';
import sucursalRoutes from './routes/sucursal.routes';
import ticketRoutes from './routes/ticket.routes';


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
app.use('/api', professionalCleanRoutes);
app.use('/api', serviceRoutes);
app.use('/api', userRoutes);
app.use('/api', sucursalRoutes);
app.use('/api', ticketRoutes);

export default app;
