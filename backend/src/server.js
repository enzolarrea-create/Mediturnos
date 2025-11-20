import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import usuarioRoutes from './routes/usuario.routes.js';
import pacienteRoutes from './routes/paciente.routes.js';
import medicoRoutes from './routes/medico.routes.js';
import turnoRoutes from './routes/turno.routes.js';
import especialidadRoutes from './routes/especialidad.routes.js';
import disponibilidadRoutes from './routes/disponibilidad.routes.js';
import notaMedicaRoutes from './routes/notaMedica.routes.js';
import notificacionRoutes from './routes/notificacion.routes.js';
import estadisticaRoutes from './routes/estadistica.routes.js';

// Importar middlewares
import { errorHandler } from './middlewares/errorHandler.middleware.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middlewares globales
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/medicos', medicoRoutes);
app.use('/api/turnos', turnoRoutes);
app.use('/api/especialidades', especialidadRoutes);
app.use('/api/disponibilidades', disponibilidadRoutes);
app.use('/api/notas-medicas', notaMedicaRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/estadisticas', estadisticaRoutes);

// Ruta 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.path 
  });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;

