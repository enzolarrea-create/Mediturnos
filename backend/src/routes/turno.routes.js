import express from 'express';
import {
  listarTurnos,
  obtenerTurno,
  crearTurno,
  modificarTurno,
  cancelarTurno
} from '../controllers/turno.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas
router.get('/', listarTurnos);
router.get('/:id', obtenerTurno);
router.post('/', crearTurno);
router.put('/:id', modificarTurno);
router.delete('/:id', cancelarTurno);

export default router;

