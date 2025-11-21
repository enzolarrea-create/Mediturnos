import express from 'express';
import {
  listarMedicos,
  obtenerMedico,
  crearMedico,
  actualizarMedico,
  eliminarMedico
} from '../controllers/medico.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Rutas públicas (para búsqueda de médicos)
router.get('/', listarMedicos);
router.get('/:id', obtenerMedico);

// Rutas protegidas para Admin
router.post('/', authenticate, authorize('ADMINISTRADOR'), crearMedico);
router.put('/:id', authenticate, authorize('ADMINISTRADOR'), actualizarMedico);
router.delete('/:id', authenticate, authorize('ADMINISTRADOR'), eliminarMedico);

export default router;

