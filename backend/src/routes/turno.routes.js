import express from 'express';
import { body, query } from 'express-validator';
import * as turnoController from '../controllers/turno.controller.js';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Validaciones
const createTurnoValidation = [
  body('medicoId').notEmpty().withMessage('ID de médico es requerido'),
  body('especialidadId').notEmpty().withMessage('ID de especialidad es requerido'),
  body('fecha').isISO8601().withMessage('Fecha inválida'),
  body('hora').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora inválida (formato HH:mm)')
];

const updateTurnoValidation = [
  body('estado').optional().isIn(['PENDIENTE', 'CONFIRMADO', 'CANCELADO', 'COMPLETADO', 'AUSENTE'])
    .withMessage('Estado inválido'),
  body('fecha').optional().isISO8601().withMessage('Fecha inválida'),
  body('hora').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora inválida')
];

// Rutas
router.get('/', turnoController.getTurnos);
router.get('/disponibles', 
  [
    query('medicoId').notEmpty().withMessage('medicoId es requerido'),
    query('fecha').isISO8601().withMessage('Fecha inválida')
  ],
  turnoController.getTurnosDisponibles
);
router.get('/:id', turnoController.getTurnoById);
router.post('/', createTurnoValidation, turnoController.createTurno);
router.put('/:id', updateTurnoValidation, turnoController.updateTurno);
router.delete('/:id', turnoController.deleteTurno);

export default router;

