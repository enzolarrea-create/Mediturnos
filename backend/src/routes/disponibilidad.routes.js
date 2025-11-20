import express from 'express';
import { body } from 'express-validator';
import * as disponibilidadController from '../controllers/disponibilidad.controller.js';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Validaciones
const createDisponibilidadValidation = [
  body('diaSemana').isInt({ min: 0, max: 6 }).withMessage('Día de semana inválido (0-6)'),
  body('horaInicio').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora de inicio inválida'),
  body('horaFin').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora de fin inválida'),
  body('duracionTurno').optional().isInt({ min: 15, max: 120 }).withMessage('Duración inválida (15-120 minutos)')
];

// Rutas
router.get('/medico/:medicoId', disponibilidadController.getDisponibilidadMedico);
router.post('/', requireRole('MEDICO', 'ADMINISTRADOR'), createDisponibilidadValidation, disponibilidadController.createDisponibilidad);
router.put('/:id', requireRole('MEDICO', 'ADMINISTRADOR'), createDisponibilidadValidation, disponibilidadController.updateDisponibilidad);
router.delete('/:id', requireRole('MEDICO', 'ADMINISTRADOR'), disponibilidadController.deleteDisponibilidad);

export default router;

