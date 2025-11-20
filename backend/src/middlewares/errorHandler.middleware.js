/**
 * Middleware centralizado para manejo de errores
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Errores de Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Conflicto de datos',
      message: 'Ya existe un registro con estos datos únicos',
      field: err.meta?.target
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Recurso no encontrado',
      message: 'El registro solicitado no existe'
    });
  }

  // Errores de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      message: err.message,
      details: err.errors
    });
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido',
      message: 'El token de autenticación no es válido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expirado',
      message: 'El token de autenticación ha expirado'
    });
  }

  // Error genérico
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    error: 'Error del servidor',
    message: process.env.NODE_ENV === 'production' 
      ? 'Ha ocurrido un error' 
      : message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

