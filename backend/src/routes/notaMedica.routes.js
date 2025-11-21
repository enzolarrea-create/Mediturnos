import express from 'express';
import {
  crearNotaMedica,
  obtenerNotasMedicas
} from '../controllers/notaMedica.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas
router.post('/', crearNotaMedica);
router.get('/turno/:turnoId', obtenerNotasMedicas);

export default router;

