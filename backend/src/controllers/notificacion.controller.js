import { prisma } from '../server.js';

/**
 * Obtener notificaciones del usuario actual
 */
export const obtenerNotificaciones = async (req, res, next) => {
  try {
    const { leida } = req.query;
    const { id: userId } = req.user;

    const where = { usuarioId: userId };

    if (leida !== undefined) {
      where.leida = leida === 'true';
    }

    const notificaciones = await prisma.notificacion.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limitar a las últimas 50
    });

    res.json({ notificaciones });
  } catch (error) {
    next(error);
  }
};

/**
 * Marcar notificación como leída
 */
export const marcarComoLeida = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    const notificacion = await prisma.notificacion.findUnique({
      where: { id }
    });

    if (!notificacion) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    if (notificacion.usuarioId !== userId) {
      return res.status(403).json({
        error: 'No tienes permisos para modificar esta notificación'
      });
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
export const marcarTodasComoLeidas = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    await prisma.notificacion.updateMany({
      where: {
        usuarioId: userId,
        leida: false
      },
      data: {
        leida: true
      }
    });

    res.json({ message: 'Todas las notificaciones fueron marcadas como leídas' });
  } catch (error) {
    next(error);
  }
};

