import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Obtener todos los médicos
 */
export const getMedicos = async (req, res, next) => {
  try {
    const { especialidadId, activo, search, page = 1, limit = 20 } = req.query;

    const where = {};

    if (especialidadId) where.especialidadId = especialidadId;
    if (activo !== undefined) where.activo = activo === 'true';

    if (search) {
      where.usuario = {
        OR: [
          { nombre: { contains: search, mode: 'insensitive' } },
          { apellido: { contains: search, mode: 'insensitive' } },
          { matricula: { contains: search } }
        ]
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [medicos, total] = await Promise.all([
      prisma.medico.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
              telefono: true
            }
          },
          especialidad: true
        },
        orderBy: {
          usuario: {
            apellido: 'asc'
          }
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.medico.count({ where })
    ]);

    res.json({
      medicos,
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
 * Obtener perfil del médico actual
 */
export const getMiPerfil = async (req, res, next) => {
  try {
    if (req.userRole !== 'MEDICO') {
      return res.status(403).json({ error: 'Solo los médicos pueden acceder a esta ruta' });
    }

    const medico = await prisma.medico.findUnique({
      where: { usuarioId: req.userId },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            nombre: true,
            apellido: true,
            dni: true,
            telefono: true,
            direccion: true
          }
        },
        especialidad: true
      }
    });

    if (!medico) {
      return res.status(404).json({ error: 'Perfil de médico no encontrado' });
    }

    res.json(medico);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener médico por ID
 */
export const getMedicoById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const medico = await prisma.medico.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true
          }
        },
        especialidad: true
      }
    });

    if (!medico) {
      return res.status(404).json({ error: 'Médico no encontrado' });
    }

    res.json(medico);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener turnos de un médico
 */
export const getTurnosMedico = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado, fecha, fechaDesde, fechaHasta } = req.query;

    const where = { medicoId: id };

    if (estado) where.estado = estado;

    if (fecha) {
      const fechaInicio = new Date(fecha);
      fechaInicio.setHours(0, 0, 0, 0);
      const fechaFin = new Date(fecha);
      fechaFin.setHours(23, 59, 59, 999);
      where.fecha = {
        gte: fechaInicio,
        lte: fechaFin
      };
    } else if (fechaDesde || fechaHasta) {
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

    const turnos = await prisma.turno.findMany({
      where,
      include: {
        paciente: {
          include: {
            usuario: {
              select: {
                nombre: true,
                apellido: true,
                email: true,
                telefono: true
              }
            }
          }
        },
        especialidad: true
      },
      orderBy: [
        { fecha: 'asc' },
        { hora: 'asc' }
      ]
    });

    res.json({ turnos });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener disponibilidad de un médico
 */
export const getDisponibilidadMedico = async (req, res, next) => {
  try {
    const { id } = req.params;

    const disponibilidad = await prisma.disponibilidad.findMany({
      where: {
        medicoId: id,
        activa: true
      },
      orderBy: [
        { diaSemana: 'asc' },
        { horaInicio: 'asc' }
      ]
    });

    res.json({ disponibilidad });
  } catch (error) {
    next(error);
  }
};

