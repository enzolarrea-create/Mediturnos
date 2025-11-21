import express from 'express';
import {
  obtenerDisponibilidad,
  crearDisponibilidad,
  actualizarDisponibilidad,
  eliminarDisponibilidad
} from '../controllers/disponibilidad.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Ruta pública para obtener disponibilidad
router.get('/:medicoId', obtenerDisponibilidad);

// Rutas protegidas
router.use(authenticate);
router.post('/', crearDisponibilidad);
router.put('/:id', actualizarDisponibilidad);
router.delete('/:id', eliminarDisponibilidad);

export default router;

