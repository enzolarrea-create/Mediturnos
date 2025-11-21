import { prisma } from '../server.js';

/**
 * Listar pacientes (Secretario y Admin)
 */
export const listarPacientes = async (req, res, next) => {
  try {
    const { search, dni } = req.query;
    const { rol } = req.user;

    // Solo Secretario y Admin pueden ver todos los pacientes
    if (rol !== 'SECRETARIO' && rol !== 'ADMINISTRADOR') {
      return res.status(403).json({
        error: 'No tienes permisos para ver la lista de pacientes'
      });
    }

    const where = {};

    if (dni) {
      where.dni = dni;
    } else if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido: { contains: search, mode: 'insensitive' } },
        { dni: { contains: search } }
      ];
    }

    const pacientes = await prisma.paciente.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            activo: true
          }
        }
      },
      orderBy: [
        { apellido: 'asc' },
        { nombre: 'asc' }
      ]
    });

    res.json({ pacientes });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener un paciente específico
 */
export const obtenerPaciente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rol, id: userId } = req.user;

    const paciente = await prisma.paciente.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            activo: true
          }
        }
      }
    });

    if (!paciente) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    // Verificar permisos
    if (rol === 'PACIENTE') {
      const pacienteUsuario = await prisma.paciente.findUnique({
        where: { usuarioId: userId }
      });
      if (paciente.id !== pacienteUsuario?.id) {
        return res.status(403).json({
          error: 'Solo puedes ver tu propia información'
        });
      }
    }

    res.json({ paciente });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener historial de turnos de un paciente
 */
export const obtenerHistorial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rol, id: userId } = req.user;

    // Verificar permisos
    if (rol === 'PACIENTE') {
      const pacienteUsuario = await prisma.paciente.findUnique({
        where: { usuarioId: userId }
      });
      if (paciente?.id !== pacienteUsuario?.id) {
        return res.status(403).json({
          error: 'Solo puedes ver tu propio historial'
        });
      }
    }

    const paciente = await prisma.paciente.findUnique({
      where: { id }
    });

    if (!paciente) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    const turnos = await prisma.turno.findMany({
      where: { pacienteId: id },
      include: {
        medico: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            matricula: true,
            especialidades: {
              include: {
                especialidad: {
                  select: {
                    nombre: true
                  }
                }
              }
            }
          }
        },
        notasMedicas: {
          select: {
            id: true,
            contenido: true,
            fecha: true,
            medico: {
              select: {
                nombre: true,
                apellido: true
              }
            }
          },
          orderBy: {
            fecha: 'desc'
          }
        }
      },
      orderBy: [
        { fecha: 'desc' },
        { hora: 'desc' }
      ]
    });

    res.json({
      paciente: {
        id: paciente.id,
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        dni: paciente.dni
      },
      turnos
    });
  } catch (error) {
    next(error);
  }
};

