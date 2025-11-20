import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware para verificar el token JWT
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Token de autenticación requerido' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Obtener usuario completo con sus relaciones
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.userId },
      include: {
        paciente: true,
        medico: true,
        secretario: true,
        administrador: true
      }
    });

    if (!usuario || !usuario.activo) {
      return res.status(401).json({ 
        error: 'Usuario no válido o inactivo' 
      });
    }

    // Agregar información del usuario al request
    req.user = usuario;
    req.userId = usuario.id;
    
    // Determinar el rol del usuario
    if (usuario.administrador) {
      req.userRole = 'ADMINISTRADOR';
    } else if (usuario.medico) {
      req.userRole = 'MEDICO';
    } else if (usuario.secretario) {
      req.userRole = 'SECRETARIO';
    } else if (usuario.paciente) {
      req.userRole = 'PACIENTE';
    } else {
      req.userRole = 'SIN_ROL';
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    next(error);
  }
};

/**
 * Middleware para verificar que el usuario tenga un rol específico
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Autenticación requerida' });
    }

    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ 
        error: 'No tienes permisos para acceder a este recurso',
        requiredRoles: roles,
        yourRole: req.userRole
      });
    }

    next();
  };
};

/**
 * Middleware para verificar que el usuario sea el propietario del recurso o tenga rol adecuado
 */
export const requireOwnershipOrRole = (resourceUserIdField = 'userId', ...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Autenticación requerida' });
      }

      // Si tiene un rol permitido, puede acceder
      if (allowedRoles.length > 0 && allowedRoles.includes(req.userRole)) {
        return next();
      }

      // Si es el propietario, puede acceder
      const resourceId = req.params.id || req.body[resourceUserIdField];
      if (resourceId && resourceId === req.userId) {
        return next();
      }

      return res.status(403).json({ 
        error: 'No tienes permisos para acceder a este recurso' 
      });
    } catch (error) {
      next(error);
    }
  };
};

