import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Validaciones
const registerValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula y un número'),
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
  body('apellido').trim().notEmpty().withMessage('El apellido es requerido'),
  body('dni').trim().notEmpty().withMessage('El DNI es requerido'),
  body('fechaNacimiento').isISO8601().withMessage('Fecha de nacimiento inválida'),
  body('rol').isIn(['PACIENTE', 'MEDICO', 'SECRETARIO', 'ADMINISTRADOR'])
    .withMessage('Rol inválido')
];

const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida')
];

// Rutas públicas
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);

// Rutas protegidas
router.get('/me', authenticateToken, authController.getCurrentUser);
router.put('/me', authenticateToken, authController.updateProfile);
router.put('/change-password', authenticateToken, authController.changePassword);

export default router;

