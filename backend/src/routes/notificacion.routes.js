import express from 'express';
import {
  obtenerNotificaciones,
  marcarComoLeida,
  marcarTodasComoLeidas
} from '../controllers/notificacion.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas
router.get('/', obtenerNotificaciones);
router.put('/:id/leida', marcarComoLeida);
router.put('/marcar-todas', marcarTodasComoLeidas);

export default router;

