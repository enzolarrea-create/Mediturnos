import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

/**
 * Obtener disponibilidad de un médico
 */
export const getDisponibilidadMedico = async (req, res, next) => {
  try {
    const { medicoId } = req.params;

    // Verificar permisos: solo el médico, secretario o admin pueden ver
    if (req.userRole === 'MEDICO' && req.user.medico?.id !== medicoId) {
      return res.status(403).json({ error: 'No tienes permisos para ver esta disponibilidad' });
    }

    const disponibilidad = await prisma.disponibilidad.findMany({
      where: {
        medicoId,
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

/**
 * Crear disponibilidad
 */
export const createDisponibilidad = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { medicoId, diaSemana, horaInicio, horaFin, duracionTurno = 30 } = req.body;

    // Verificar permisos
    if (req.userRole === 'MEDICO' && req.user.medico?.id !== medicoId) {
      return res.status(403).json({ error: 'No tienes permisos para crear esta disponibilidad' });
    }

    // Verificar que la hora de inicio sea menor que la de fin
    const [horaInicioH, horaInicioM] = horaInicio.split(':').map(Number);
    const [horaFinH, horaFinM] = horaFin.split(':').map(Number);
    const inicioMinutos = horaInicioH * 60 + horaInicioM;
    const finMinutos = horaFinH * 60 + horaFinM;

    if (inicioMinutos >= finMinutos) {
      return res.status(400).json({ error: 'La hora de inicio debe ser menor que la hora de fin' });
    }

    const disponibilidad = await prisma.disponibilidad.create({
      data: {
        medicoId,
        diaSemana: parseInt(diaSemana),
        horaInicio,
        horaFin,
        duracionTurno: parseInt(duracionTurno)
      }
    });

    res.status(201).json({
      message: 'Disponibilidad creada exitosamente',
      disponibilidad
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar disponibilidad
 */
export const updateDisponibilidad = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { diaSemana, horaInicio, horaFin, duracionTurno, activa } = req.body;

    // Verificar que existe
    const disponibilidadExistente = await prisma.disponibilidad.findUnique({
      where: { id }
    });

    if (!disponibilidadExistente) {
      return res.status(404).json({ error: 'Disponibilidad no encontrada' });
    }

    // Verificar permisos
    if (req.userRole === 'MEDICO' && req.user.medico?.id !== disponibilidadExistente.medicoId) {
      return res.status(403).json({ error: 'No tienes permisos para editar esta disponibilidad' });
    }

    const dataUpdate = {};
    if (diaSemana !== undefined) dataUpdate.diaSemana = parseInt(diaSemana);
    if (horaInicio) dataUpdate.horaInicio = horaInicio;
    if (horaFin) dataUpdate.horaFin = horaFin;
    if (duracionTurno !== undefined) dataUpdate.duracionTurno = parseInt(duracionTurno);
    if (activa !== undefined) dataUpdate.activa = activa;

    const disponibilidad = await prisma.disponibilidad.update({
      where: { id },
      data: dataUpdate
    });

    res.json({
      message: 'Disponibilidad actualizada exitosamente',
      disponibilidad
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar disponibilidad
 */
export const deleteDisponibilidad = async (req, res, next) => {
  try {
    const { id } = req.params;

    const disponibilidad = await prisma.disponibilidad.findUnique({
      where: { id }
    });

    if (!disponibilidad) {
      return res.status(404).json({ error: 'Disponibilidad no encontrada' });
    }

    // Verificar permisos
    if (req.userRole === 'MEDICO' && req.user.medico?.id !== disponibilidad.medicoId) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar esta disponibilidad' });
    }

    await prisma.disponibilidad.delete({
      where: { id }
    });

    res.json({
      message: 'Disponibilidad eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

