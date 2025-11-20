import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Obtener todos los usuarios (solo administradores)
 */
export const getUsuarios = async (req, res, next) => {
  try {
    const { search, activo, rol, page = 1, limit = 20 } = req.query;

    const where = {};

    if (activo !== undefined) {
      where.activo = activo === 'true';
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { dni: { contains: search } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        include: {
          paciente: true,
          medico: {
            include: {
              especialidad: true
            }
          },
          secretario: true,
          administrador: true
        },
        orderBy: {
          apellido: 'asc'
        },
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido: true,
          dni: true,
          telefono: true,
          activo: true,
          createdAt: true,
          paciente: true,
          medico: {
            include: {
              especialidad: true
            }
          },
          secretario: true,
          administrador: true
        }
      }),
      prisma.usuario.count({ where })
    ]);

    // Filtrar por rol si se especifica
    let usuariosFiltrados = usuarios;
    if (rol) {
      usuariosFiltrados = usuarios.filter(u => {
        if (rol === 'PACIENTE') return !!u.paciente;
        if (rol === 'MEDICO') return !!u.medico;
        if (rol === 'SECRETARIO') return !!u.secretario;
        if (rol === 'ADMINISTRADOR') return !!u.administrador;
        return false;
      });
    }

    res.json({
      usuarios: usuariosFiltrados,
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
 * Obtener usuario por ID
 */
export const getUsuarioById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        paciente: true,
        medico: {
          include: {
            especialidad: true
          }
        },
        secretario: true,
        administrador: true
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        dni: true,
        fechaNacimiento: true,
        telefono: true,
        direccion: true,
        activo: true,
        createdAt: true,
        paciente: true,
        medico: {
          include: {
            especialidad: true
          }
        },
        secretario: true,
        administrador: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    next(error);
  }
};

/**
 * Activar usuario
 */
export const activateUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.update({
      where: { id },
      data: { activo: true },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        activo: true
      }
    });

    res.json({
      message: 'Usuario activado exitosamente',
      usuario
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Desactivar usuario
 */
export const deactivateUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.update({
      where: { id },
      data: { activo: false },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        activo: true
      }
    });

    res.json({
      message: 'Usuario desactivado exitosamente',
      usuario
    });
  } catch (error) {
    next(error);
  }
};

