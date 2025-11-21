import bcrypt from 'bcryptjs';
import { prisma } from '../server.js';

/**
 * Listar médicos
 */
export const listarMedicos = async (req, res, next) => {
  try {
    const { search, especialidadId } = req.query;

    const where = {
      activo: true,
      usuario: {
        activo: true
      }
    };

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido: { contains: search, mode: 'insensitive' } },
        { matricula: { contains: search } }
      ];
    }

    if (especialidadId) {
      where.especialidades = {
        some: {
          especialidadId
        }
      };
    }

    const medicos = await prisma.medico.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            email: true
          }
        },
        especialidades: {
          include: {
            especialidad: {
              select: {
                id: true,
                nombre: true
              }
            }
          }
        }
      },
      orderBy: [
        { apellido: 'asc' },
        { nombre: 'asc' }
      ]
    });

    res.json({ medicos });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener un médico específico
 */
export const obtenerMedico = async (req, res, next) => {
  try {
    const { id } = req.params;

    const medico = await prisma.medico.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            activo: true
          }
        },
        especialidades: {
          include: {
            especialidad: {
              select: {
                id: true,
                nombre: true,
                descripcion: true
              }
            }
          }
        },
        disponibilidades: {
          where: {
            activo: true
          },
          orderBy: [
            { diaSemana: 'asc' },
            { horaInicio: 'asc' }
          ]
        }
      }
    });

    if (!medico) {
      return res.status(404).json({ error: 'Médico no encontrado' });
    }

    res.json({ medico });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear un nuevo médico (Solo Admin)
 */
export const crearMedico = async (req, res, next) => {
  try {
    const { email, password, nombre, apellido, matricula, telefono, especialidades } = req.body;
    const { rol } = req.user;

    if (rol !== 'ADMINISTRADOR') {
      return res.status(403).json({
        error: 'Solo los administradores pueden crear médicos'
      });
    }

    if (!email || !password || !nombre || !apellido || !matricula) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        required: ['email', 'password', 'nombre', 'apellido', 'matricula']
      });
    }

    // Verificar email único
    const emailExists = await prisma.usuario.findUnique({
      where: { email }
    });

    if (emailExists) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // Verificar matrícula única
    const matriculaExists = await prisma.medico.findUnique({
      where: { matricula }
    });

    if (matriculaExists) {
      return res.status(409).json({ error: 'La matrícula ya está registrada' });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario y médico en transacción
    const result = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          email,
          password: hashedPassword,
          rol: 'MEDICO'
        }
      });

      const medico = await tx.medico.create({
        data: {
          usuarioId: usuario.id,
          nombre,
          apellido,
          matricula,
          telefono: telefono || null
        }
      });

      // Asignar especialidades si se proporcionaron
      if (especialidades && especialidades.length > 0) {
        await tx.medicoEspecialidad.createMany({
          data: especialidades.map(especialidadId => ({
            medicoId: medico.id,
            especialidadId
          }))
        });
      }

      return { usuario, medico };
    });

    const medicoCompleto = await prisma.medico.findUnique({
      where: { id: result.medico.id },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            rol: true
          }
        },
        especialidades: {
          include: {
            especialidad: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Médico creado exitosamente',
      medico: medicoCompleto
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar un médico (Solo Admin)
 */
export const actualizarMedico = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, telefono, activo, especialidades } = req.body;
    const { rol } = req.user;

    if (rol !== 'ADMINISTRADOR') {
      return res.status(403).json({
        error: 'Solo los administradores pueden actualizar médicos'
      });
    }

    const medico = await prisma.medico.findUnique({
      where: { id }
    });

    if (!medico) {
      return res.status(404).json({ error: 'Médico no encontrado' });
    }

    // Actualizar datos básicos
    const medicoActualizado = await prisma.medico.update({
      where: { id },
      data: {
        ...(nombre && { nombre }),
        ...(apellido && { apellido }),
        ...(telefono !== undefined && { telefono }),
        ...(activo !== undefined && { activo })
      },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            activo: true
          }
        },
        especialidades: {
          include: {
            especialidad: true
          }
        }
      }
    });

    // Actualizar especialidades si se proporcionaron
    if (especialidades) {
      // Eliminar especialidades actuales
      await prisma.medicoEspecialidad.deleteMany({
        where: { medicoId: id }
      });

      // Agregar nuevas especialidades
      if (especialidades.length > 0) {
        await prisma.medicoEspecialidad.createMany({
          data: especialidades.map(especialidadId => ({
            medicoId: id,
            especialidadId
          }))
        });
      }

      // Recargar con especialidades actualizadas
      const medicoConEspecialidades = await prisma.medico.findUnique({
        where: { id },
        include: {
          usuario: {
            select: {
              id: true,
              email: true,
              activo: true
            }
          },
          especialidades: {
            include: {
              especialidad: true
            }
          }
        }
      });

      return res.json({
        message: 'Médico actualizado exitosamente',
        medico: medicoConEspecialidades
      });
    }

    res.json({
      message: 'Médico actualizado exitosamente',
      medico: medicoActualizado
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar un médico (Solo Admin) - Soft delete
 */
export const eliminarMedico = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rol } = req.user;

    if (rol !== 'ADMINISTRADOR') {
      return res.status(403).json({
        error: 'Solo los administradores pueden eliminar médicos'
      });
    }

    const medico = await prisma.medico.findUnique({
      where: { id },
      include: { usuario: true }
    });

    if (!medico) {
      return res.status(404).json({ error: 'Médico no encontrado' });
    }

    // Soft delete: desactivar médico y usuario
    await prisma.$transaction([
      prisma.medico.update({
        where: { id },
        data: { activo: false }
      }),
      prisma.usuario.update({
        where: { id: medico.usuarioId },
        data: { activo: false }
      })
    ]);

    res.json({ message: 'Médico eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

