import express from 'express';
import { body } from 'express-validator';
import * as pacienteController from '../controllers/paciente.controller.js';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Validaciones
const updatePacienteValidation = [
  body('contactoEmergencia').optional().trim(),
  body('telefonoEmergencia').optional().trim(),
  body('obraSocial').optional().trim(),
  body('numeroAfiliado').optional().trim(),
  body('alergias').optional().trim(),
  body('medicamentos').optional().trim()
];

// Rutas
router.get('/', requireRole('ADMINISTRADOR', 'SECRETARIO', 'MEDICO'), pacienteController.getPacientes);
router.get('/me', pacienteController.getMiPerfil);
router.get('/:id', requireRole('ADMINISTRADOR', 'SECRETARIO', 'MEDICO'), pacienteController.getPacienteById);
router.put('/me', updatePacienteValidation, pacienteController.updateMiPerfil);
router.get('/:id/turnos', requireRole('ADMINISTRADOR', 'SECRETARIO', 'MEDICO'), pacienteController.getTurnosPaciente);
router.get('/:id/historial', requireRole('ADMINISTRADOR', 'MEDICO'), pacienteController.getHistorialPaciente);

export default router;

