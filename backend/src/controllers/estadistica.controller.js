import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Obtener estadísticas del dashboard según el rol
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const finHoy = new Date(hoy);
    finHoy.setHours(23, 59, 59, 999);

    let stats = {};

    if (req.userRole === 'ADMINISTRADOR' || req.userRole === 'SECRETARIO') {
      // Estadísticas generales
      const [
        turnosHoy,
        turnosPendientes,
        totalPacientes,
        totalMedicos,
        turnosProximos
      ] = await Promise.all([
        prisma.turno.count({
          where: {
            fecha: {
              gte: hoy,
              lte: finHoy
            },
            estado: {
              notIn: ['CANCELADO']
            }
          }
        }),
        prisma.turno.count({
          where: { estado: 'PENDIENTE' }
        }),
        prisma.paciente.count(),
        prisma.medico.count({
          where: { activo: true }
        }),
        prisma.turno.findMany({
          where: {
            fecha: {
              gte: hoy
            },
            estado: {
              notIn: ['CANCELADO', 'COMPLETADO', 'AUSENTE']
            }
          },
          include: {
            paciente: {
              include: {
                usuario: {
                  select: {
                    nombre: true,
                    apellido: true
                  }
                }
              }
            },
            medico: {
              include: {
                usuario: {
                  select: {
                    nombre: true,
                    apellido: true
                  }
                },
                especialidad: true
              }
            }
          },
          orderBy: [
            { fecha: 'asc' },
            { hora: 'asc' }
          ],
          take: 10
        })
      ]);

      stats = {
        turnosHoy,
        turnosPendientes,
        totalPacientes,
        totalMedicos,
        turnosProximos
      };
    } else if (req.userRole === 'MEDICO') {
      // Estadísticas del médico
      const [
        turnosHoy,
        turnosPendientes,
        turnosProximos
      ] = await Promise.all([
        prisma.turno.count({
          where: {
            medicoId: req.user.medico.id,
            fecha: {
              gte: hoy,
              lte: finHoy
            },
            estado: {
              notIn: ['CANCELADO']
            }
          }
        }),
        prisma.turno.count({
          where: {
            medicoId: req.user.medico.id,
            estado: 'PENDIENTE'
          }
        }),
        prisma.turno.findMany({
          where: {
            medicoId: req.user.medico.id,
            fecha: {
              gte: hoy
            },
            estado: {
              notIn: ['CANCELADO', 'COMPLETADO', 'AUSENTE']
            }
          },
          include: {
            paciente: {
              include: {
                usuario: {
                  select: {
                    nombre: true,
                    apellido: true,
                    telefono: true
                  }
                }
              }
            }
          },
          orderBy: [
            { fecha: 'asc' },
            { hora: 'asc' }
          ],
          take: 10
        })
      ]);

      stats = {
        turnosHoy,
        turnosPendientes,
        turnosProximos
      };
    } else if (req.userRole === 'PACIENTE') {
      // Estadísticas del paciente
      const [
        turnosPendientes,
        turnosProximos
      ] = await Promise.all([
        prisma.turno.count({
          where: {
            pacienteId: req.user.paciente.id,
            estado: 'PENDIENTE'
          }
        }),
        prisma.turno.findMany({
          where: {
            pacienteId: req.user.paciente.id,
            fecha: {
              gte: hoy
            },
            estado: {
              notIn: ['CANCELADO', 'COMPLETADO', 'AUSENTE']
            }
          },
          include: {
            medico: {
              include: {
                usuario: {
                  select: {
                    nombre: true,
                    apellido: true
                  }
                },
                especialidad: true
              }
            }
          },
          orderBy: [
            { fecha: 'asc' },
            { hora: 'asc' }
          ],
          take: 10
        })
      ]);

      stats = {
        turnosPendientes,
        turnosProximos
      };
    }

    res.json(stats);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener estadísticas de turnos
 */
export const getTurnosStats = async (req, res, next) => {
  try {
    const { fechaDesde, fechaHasta } = req.query;

    const where = {};

    if (req.userRole === 'MEDICO') {
      where.medicoId = req.user.medico.id;
    }

    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) {
        where.fecha.gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        const fechaFin = new Date(fechaHasta);
        fechaFin.setHours(23, 59, 59, 999);
        where.fecha.lte = fechaFin;
      }
    }

    const [
      total,
      porEstado,
      porEspecialidad
    ] = await Promise.all([
      prisma.turno.count({ where }),
      prisma.turno.groupBy({
        by: ['estado'],
        where,
        _count: true
      }),
      prisma.turno.groupBy({
        by: ['especialidadId'],
        where,
        _count: true
      })
    ]);

    res.json({
      total,
      porEstado,
      porEspecialidad
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener estadísticas de médicos
 */
export const getMedicosStats = async (req, res, next) => {
  try {
    const [
      totalMedicos,
      medicosActivos,
      medicosPorEspecialidad
    ] = await Promise.all([
      prisma.medico.count(),
      prisma.medico.count({
        where: { activo: true }
      }),
      prisma.medico.groupBy({
        by: ['especialidadId'],
        _count: true
      })
    ]);

    res.json({
      totalMedicos,
      medicosActivos,
      medicosPorEspecialidad
    });
  } catch (error) {
    next(error);
  }
};

