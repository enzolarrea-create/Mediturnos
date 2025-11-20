import express from 'express';
import { body } from 'express-validator';
import * as notaMedicaController from '../controllers/notaMedica.controller.js';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Validaciones
const createNotaMedicaValidation = [
  body('pacienteId').notEmpty().withMessage('ID de paciente es requerido'),
  body('diagnostico').optional().trim(),
  body('tratamiento').optional().trim(),
  body('observaciones').optional().trim()
];

// Rutas
router.get('/paciente/:pacienteId', requireRole('MEDICO', 'ADMINISTRADOR'), notaMedicaController.getNotasPaciente);
router.get('/:id', requireRole('MEDICO', 'ADMINISTRADOR', 'PACIENTE'), notaMedicaController.getNotaById);
router.post('/', requireRole('MEDICO', 'ADMINISTRADOR'), createNotaMedicaValidation, notaMedicaController.createNotaMedica);
router.put('/:id', requireRole('MEDICO', 'ADMINISTRADOR'), notaMedicaController.updateNotaMedica);
router.delete('/:id', requireRole('MEDICO', 'ADMINISTRADOR'), notaMedicaController.deleteNotaMedica);

export default router;

