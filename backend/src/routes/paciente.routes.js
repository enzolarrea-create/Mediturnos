import express from 'express';
import {
  listarPacientes,
  obtenerPaciente,
  obtenerHistorial
} from '../controllers/paciente.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas
router.get('/', listarPacientes);
router.get('/:id', obtenerPaciente);
router.get('/:id/historial', obtenerHistorial);

export default router;

