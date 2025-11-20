import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Obtener notificaciones del usuario actual
 */
export const getNotificaciones = async (req, res, next) => {
  try {
    const { leida, page = 1, limit = 20 } = req.query;

    const where = { usuarioId: req.userId };

    if (leida !== undefined) {
      where.leida = leida === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notificaciones, total] = await Promise.all([
      prisma.notificacion.findMany({
        where,
        orderBy: { fecha: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.notificacion.count({ where })
    ]);

    res.json({
      notificaciones,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener conteo de notificaciones no leídas
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await prisma.notificacion.count({
      where: {
        usuarioId: req.userId,
        leida: false
      }
    });

    res.json({ count });
  } catch (error) {
    next(error);
  }
};

/**
 * Marcar notificación como leída
 */
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notificacion = await prisma.notificacion.findUnique({
      where: { id }
    });

    if (!notificacion) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    // Verificar que pertenece al usuario
    if (notificacion.usuarioId !== req.userId) {
      return res.status(403).json({ error: 'No tienes permisos para esta notificación' });
    }

    const notificacionActualizada = await prisma.notificacion.update({
      where: { id },
      data: { leida: true }
    });

    res.json({
      message: 'Notificación marcada como leída',
      notificacion: notificacionActualizada
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Marcar todas las notificaciones como leídas
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    await prisma.notificacion.updateMany({
      where: {
        usuarioId: req.userId,
        leida: false
      },
      data: {
        leida: true
      }
    });

    res.json({
      message: 'Todas las notificaciones han sido marcadas como leídas'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar notificación
 */
export const deleteNotificacion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notificacion = await prisma.notificacion.findUnique({
      where: { id }
    });

    if (!notificacion) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    // Verificar que pertenece al usuario
    if (notificacion.usuarioId !== req.userId) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar esta notificación' });
    }

    await prisma.notificacion.delete({
      where: { id }
    });

    res.json({
      message: 'Notificación eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

