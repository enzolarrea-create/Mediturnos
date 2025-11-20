import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

/**
 * Obtener todos los pacientes (solo para roles autorizados)
 */
export const getPacientes = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    const where = {};

    if (search) {
      where.usuario = {
        OR: [
          { nombre: { contains: search, mode: 'insensitive' } },
          { apellido: { contains: search, mode: 'insensitive' } },
          { dni: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [pacientes, total] = await Promise.all([
      prisma.paciente.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
              dni: true,
              telefono: true,
              direccion: true,
              fechaNacimiento: true
            }
          }
        },
        orderBy: {
          usuario: {
            apellido: 'asc'
          }
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.paciente.count({ where })
    ]);

    res.json({
      pacientes,
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
 * Obtener perfil del paciente actual
 */
export const getMiPerfil = async (req, res, next) => {
  try {
    if (req.userRole !== 'PACIENTE') {
      return res.status(403).json({ error: 'Solo los pacientes pueden acceder a esta ruta' });
    }

    const paciente = await prisma.paciente.findUnique({
      where: { usuarioId: req.userId },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            nombre: true,
            apellido: true,
            dni: true,
            fechaNacimiento: true,
            telefono: true,
            direccion: true,
            createdAt: true
          }
        }
      }
    });

    if (!paciente) {
      return res.status(404).json({ error: 'Perfil de paciente no encontrado' });
    }

    res.json(paciente);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener paciente por ID
 */
export const getPacienteById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const paciente = await prisma.paciente.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            nombre: true,
            apellido: true,
            dni: true,
            fechaNacimiento: true,
            telefono: true,
            direccion: true
          }
        }
      }
    });

    if (!paciente) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    res.json(paciente);
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar perfil del paciente actual
 */
export const updateMiPerfil = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.userRole !== 'PACIENTE') {
      return res.status(403).json({ error: 'Solo los pacientes pueden actualizar su perfil' });
    }

    const {
      contactoEmergencia,
      telefonoEmergencia,
      obraSocial,
      numeroAfiliado,
      alergias,
      medicamentos
    } = req.body;

    const paciente = await prisma.paciente.update({
      where: { usuarioId: req.userId },
      data: {
        ...(contactoEmergencia !== undefined && { contactoEmergencia }),
        ...(telefonoEmergencia !== undefined && { telefonoEmergencia }),
        ...(obraSocial !== undefined && { obraSocial }),
        ...(numeroAfiliado !== undefined && { numeroAfiliado }),
        ...(alergias !== undefined && { alergias }),
        ...(medicamentos !== undefined && { medicamentos })
      },
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
        }
      }
    });

    res.json({
      message: 'Perfil actualizado exitosamente',
      paciente
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener turnos de un paciente
 */
export const getTurnosPaciente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado, fechaDesde, fechaHasta } = req.query;

    const where = { pacienteId: id };

    if (estado) where.estado = estado;

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

    const turnos = await prisma.turno.findMany({
      where,
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
        },
        especialidad: true
      },
      orderBy: [
        { fecha: 'desc' },
        { hora: 'desc' }
      ]
    });

    res.json({ turnos });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener historial médico de un paciente
 */
export const getHistorialPaciente = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [notasMedicas, turnos] = await Promise.all([
      prisma.notaMedica.findMany({
        where: { pacienteId: id },
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
        orderBy: { fecha: 'desc' }
      }),
      prisma.turno.findMany({
        where: { 
          pacienteId: id,
          estado: 'COMPLETADO'
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
          },
          especialidad: true
        },
        orderBy: { fecha: 'desc' }
      })
    ]);

    res.json({
      notasMedicas,
      turnosCompletados: turnos
    });
  } catch (error) {
    next(error);
  }
};

