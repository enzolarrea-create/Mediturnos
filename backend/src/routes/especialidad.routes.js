import express from 'express';
import {
  listarEspecialidades,
  crearEspecialidad,
  actualizarEspecialidad
} from '../controllers/especialidad.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Ruta pública
router.get('/', listarEspecialidades);

// Rutas protegidas para Admin
router.post('/', authenticate, authorize('ADMINISTRADOR'), crearEspecialidad);
router.put('/:id', authenticate, authorize('ADMINISTRADOR'), actualizarEspecialidad);

export default router;

