import express from 'express';
import { body } from 'express-validator';
import * as especialidadController from '../controllers/especialidad.controller.js';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Validaciones
const createEspecialidadValidation = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido')
];

// Rutas públicas (autenticadas)
router.get('/', especialidadController.getEspecialidades);
router.get('/:id', especialidadController.getEspecialidadById);

// Rutas de administración
router.post('/', requireRole('ADMINISTRADOR'), createEspecialidadValidation, especialidadController.createEspecialidad);
router.put('/:id', requireRole('ADMINISTRADOR'), createEspecialidadValidation, especialidadController.updateEspecialidad);
router.delete('/:id', requireRole('ADMINISTRADOR'), especialidadController.deleteEspecialidad);

export default router;

