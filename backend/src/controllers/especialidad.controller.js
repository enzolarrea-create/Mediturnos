import { prisma } from '../server.js';

/**
 * Listar especialidades
 */
export const listarEspecialidades = async (req, res, next) => {
  try {
    const especialidades = await prisma.especialidad.findMany({
      where: {
        activa: true
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    res.json({ especialidades });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear especialidad (Solo Admin)
 */
export const crearEspecialidad = async (req, res, next) => {
  try {
    const { nombre, descripcion } = req.body;
    const { rol } = req.user;

    if (rol !== 'ADMINISTRADOR') {
      return res.status(403).json({
        error: 'Solo los administradores pueden crear especialidades'
      });
    }

    if (!nombre) {
      return res.status(400).json({
        error: 'El nombre es requerido'
      });
    }

    const especialidad = await prisma.especialidad.create({
      data: {
        nombre,
        descripcion: descripcion || null
      }
    });

    res.status(201).json({
      message: 'Especialidad creada exitosamente',
      especialidad
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar especialidad (Solo Admin)
 */
export const actualizarEspecialidad = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activa } = req.body;
    const { rol } = req.user;

    if (rol !== 'ADMINISTRADOR') {
      return res.status(403).json({
        error: 'Solo los administradores pueden actualizar especialidades'
      });
    }

    const especialidad = await prisma.especialidad.update({
      where: { id },
      data: {
        ...(nombre && { nombre }),
        ...(descripcion !== undefined && { descripcion }),
        ...(activa !== undefined && { activa })
      }
    });

    res.json({
      message: 'Especialidad actualizada exitosamente',
      especialidad
    });
  } catch (error) {
    next(error);
  }
};

