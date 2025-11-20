import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

/**
 * Obtener todas las especialidades
 */
export const getEspecialidades = async (req, res, next) => {
  try {
    const { activa } = req.query;

    const where = {};
    if (activa !== undefined) {
      where.activa = activa === 'true';
    }

    const especialidades = await prisma.especialidad.findMany({
      where,
      include: {
        _count: {
          select: {
            medicos: true,
            turnos: true
          }
        }
      },
      orderBy: { nombre: 'asc' }
    });

    res.json({ especialidades });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener especialidad por ID
 */
export const getEspecialidadById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const especialidad = await prisma.especialidad.findUnique({
      where: { id },
      include: {
        medicos: {
          include: {
            usuario: {
              select: {
                nombre: true,
                apellido: true
              }
            }
          }
        },
        _count: {
          select: {
            turnos: true
          }
        }
      }
    });

    if (!especialidad) {
      return res.status(404).json({ error: 'Especialidad no encontrada' });
    }

    res.json(especialidad);
  } catch (error) {
    next(error);
  }
};

/**
 * Crear especialidad
 */
export const createEspecialidad = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, descripcion } = req.body;

    const especialidad = await prisma.especialidad.create({
      data: {
        nombre,
        descripcion
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
 * Actualizar especialidad
 */
export const updateEspecialidad = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { nombre, descripcion, activa } = req.body;

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

/**
 * Eliminar especialidad (soft delete)
 */
export const deleteEspecialidad = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar si hay médicos o turnos asociados
    const especialidad = await prisma.especialidad.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            medicos: true,
            turnos: true
          }
        }
      }
    });

    if (!especialidad) {
      return res.status(404).json({ error: 'Especialidad no encontrada' });
    }

    if (especialidad._count.medicos > 0 || especialidad._count.turnos > 0) {
      // Soft delete: desactivar en lugar de eliminar
      const especialidadDesactivada = await prisma.especialidad.update({
        where: { id },
        data: { activa: false }
      });

      return res.json({
        message: 'Especialidad desactivada (tiene médicos o turnos asociados)',
        especialidad: especialidadDesactivada
      });
    }

    // Si no tiene relaciones, eliminar físicamente
    await prisma.especialidad.delete({
      where: { id }
    });

    res.json({
      message: 'Especialidad eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

