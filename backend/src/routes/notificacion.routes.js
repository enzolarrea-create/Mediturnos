import express from 'express';
import * as notificacionController from '../controllers/notificacion.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas
router.get('/', notificacionController.getNotificaciones);
router.get('/unread-count', notificacionController.getUnreadCount);
router.put('/:id/read', notificacionController.markAsRead);
router.put('/read-all', notificacionController.markAllAsRead);
router.delete('/:id', notificacionController.deleteNotificacion);

export default router;

