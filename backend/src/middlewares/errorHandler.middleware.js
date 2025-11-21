/**
 * Middleware para manejo centralizado de errores
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      message: err.message,
      details: err.errors
    });
  }

  // Error de Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Conflicto',
      message: 'Ya existe un registro con estos datos únicos'
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'No encontrado',
      message: 'El registro solicitado no existe'
    });
  }

  // Error de autenticación
  if (err.message?.includes('Token') || err.message?.includes('token')) {
    return res.status(401).json({
      error: 'Error de autenticación',
      message: err.message
    });
  }

  // Error genérico
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

