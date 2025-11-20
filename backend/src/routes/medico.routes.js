import express from 'express';
import * as medicoController from '../controllers/medico.controller.js';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas
router.get('/', requireRole('ADMINISTRADOR', 'SECRETARIO'), medicoController.getMedicos);
router.get('/me', requireRole('MEDICO'), medicoController.getMiPerfil);
router.get('/:id', requireRole('ADMINISTRADOR', 'SECRETARIO', 'MEDICO'), medicoController.getMedicoById);
router.get('/:id/turnos', requireRole('ADMINISTRADOR', 'SECRETARIO', 'MEDICO'), medicoController.getTurnosMedico);
router.get('/:id/disponibilidad', requireRole('ADMINISTRADOR', 'SECRETARIO', 'MEDICO'), medicoController.getDisponibilidadMedico);

export default router;

