import express from 'express';
import * as estadisticaController from '../controllers/estadistica.controller.js';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas
router.get('/dashboard', estadisticaController.getDashboardStats);
router.get('/turnos', requireRole('ADMINISTRADOR', 'SECRETARIO', 'MEDICO'), estadisticaController.getTurnosStats);
router.get('/medicos', requireRole('ADMINISTRADOR', 'SECRETARIO'), estadisticaController.getMedicosStats);

export default router;

