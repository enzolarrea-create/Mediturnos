import express from 'express';
import * as usuarioController from '../controllers/usuario.controller.js';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de administración
router.get('/', requireRole('ADMINISTRADOR'), usuarioController.getUsuarios);
router.get('/:id', requireRole('ADMINISTRADOR'), usuarioController.getUsuarioById);
router.put('/:id/activate', requireRole('ADMINISTRADOR'), usuarioController.activateUsuario);
router.put('/:id/deactivate', requireRole('ADMINISTRADOR'), usuarioController.deactivateUsuario);

export default router;

