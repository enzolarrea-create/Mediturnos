import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

/**
 * Obtener notas médicas de un paciente
 */
export const getNotasPaciente = async (req, res, next) => {
  try {
    const { pacienteId } = req.params;

    // Verificar permisos: pacientes solo pueden ver sus propias notas
    if (req.userRole === 'PACIENTE' && req.user.paciente?.id !== pacienteId) {
      return res.status(403).json({ error: 'No tienes permisos para ver estas notas' });
    }

    const notas = await prisma.notaMedica.findMany({
      where: { pacienteId },
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
    });

    res.json({ notas });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener nota médica por ID
 */
export const getNotaById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const nota = await prisma.notaMedica.findUnique({
      where: { id },
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
      }
    });

    if (!nota) {
      return res.status(404).json({ error: 'Nota médica no encontrada' });
    }

    // Verificar permisos
    if (req.userRole === 'PACIENTE' && nota.pacienteId !== req.user.paciente?.id) {
      return res.status(403).json({ error: 'No tienes permisos para ver esta nota' });
    }

    res.json(nota);
  } catch (error) {
    next(error);
  }
};

/**
 * Crear nota médica
 */
export const createNotaMedica = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      pacienteId,
      turnoId,
      diagnostico,
      tratamiento,
      observaciones,
      archivos
    } = req.body;

    // Si es médico, usar su propio ID
    const medicoId = req.userRole === 'MEDICO' 
      ? req.user.medico.id 
      : req.body.medicoId;

    if (!medicoId) {
      return res.status(400).json({ error: 'ID de médico requerido' });
    }

    const nota = await prisma.notaMedica.create({
      data: {
        pacienteId,
        medicoId,
        turnoId,
        diagnostico,
        tratamiento,
        observaciones,
        archivos: archivos ? JSON.stringify(archivos) : null
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
      }
    });

    res.status(201).json({
      message: 'Nota médica creada exitosamente',
      nota
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar nota médica
 */
export const updateNotaMedica = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { diagnostico, tratamiento, observaciones, archivos } = req.body;

    const notaExistente = await prisma.notaMedica.findUnique({
      where: { id }
    });

    if (!notaExistente) {
      return res.status(404).json({ error: 'Nota médica no encontrada' });
    }

    // Verificar permisos: solo el médico que la creó o admin puede editarla
    if (req.userRole === 'MEDICO' && notaExistente.medicoId !== req.user.medico?.id) {
      return res.status(403).json({ error: 'No tienes permisos para editar esta nota' });
    }

    const nota = await prisma.notaMedica.update({
      where: { id },
      data: {
        ...(diagnostico !== undefined && { diagnostico }),
        ...(tratamiento !== undefined && { tratamiento }),
        ...(observaciones !== undefined && { observaciones }),
        ...(archivos !== undefined && { archivos: archivos ? JSON.stringify(archivos) : null })
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
      }
    });

    res.json({
      message: 'Nota médica actualizada exitosamente',
      nota
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar nota médica
 */
export const deleteNotaMedica = async (req, res, next) => {
  try {
    const { id } = req.params;

    const nota = await prisma.notaMedica.findUnique({
      where: { id }
    });

    if (!nota) {
      return res.status(404).json({ error: 'Nota médica no encontrada' });
    }

    // Verificar permisos
    if (req.userRole === 'MEDICO' && nota.medicoId !== req.user.medico?.id) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar esta nota' });
    }

    await prisma.notaMedica.delete({
      where: { id }
    });

    res.json({
      message: 'Nota médica eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

