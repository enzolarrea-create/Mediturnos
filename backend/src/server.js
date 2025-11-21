import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import turnoRoutes from './routes/turno.routes.js';
import pacienteRoutes from './routes/paciente.routes.js';
import medicoRoutes from './routes/medico.routes.js';
import disponibilidadRoutes from './routes/disponibilidad.routes.js';
import especialidadRoutes from './routes/especialidad.routes.js';
import notificacionRoutes from './routes/notificacion.routes.js';
import notaMedicaRoutes from './routes/notaMedica.routes.js';

// Importar middleware de manejo de errores
import { errorHandler } from './middlewares/errorHandler.middleware.js';

// Cargar variables de entorno
dotenv.config();

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;

// Inicializar Prisma
export const prisma = new PrismaClient();

// Middlewares globales
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5500',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'MediTurnos API está funcionando',
    timestamp: new Date().toISOString()
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/turnos', turnoRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/medicos', medicoRoutes);
app.use('/api/disponibilidad', disponibilidadRoutes);
app.use('/api/especialidades', especialidadRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/notas-medicas', notaMedicaRoutes);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

