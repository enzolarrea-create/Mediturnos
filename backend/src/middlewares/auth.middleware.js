import { verifyToken, extractToken } from '../utils/jwt.js';
import { prisma } from '../server.js';

/**
 * Middleware para verificar autenticación
 */
export const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({ 
        error: 'No se proporcionó token de autenticación' 
      });
    }

    const decoded = verifyToken(token);
    
    // Verificar que el usuario existe y está activo
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        rol: true,
        activo: true
      }
    });

    if (!usuario || !usuario.activo) {
      return res.status(401).json({ 
        error: 'Usuario no encontrado o inactivo' 
      });
    }

    // Agregar información del usuario al request
    req.user = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol
    };

    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Token inválido o expirado',
      message: error.message 
    });
  }
};

/**
 * Middleware para verificar roles específicos
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Usuario no autenticado' 
      });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ 
        error: 'No tienes permisos para realizar esta acción',
        requiredRoles: roles,
        yourRole: req.user.rol
      });
    }

    next();
  };
};

