import { prisma } from '../server.js';

/**
 * Obtener disponibilidad de un médico
 */
export const obtenerDisponibilidad = async (req, res, next) => {
  try {
    const { medicoId } = req.params;

    const disponibilidades = await prisma.disponibilidad.findMany({
      where: {
        medicoId,
        activo: true
      },
      orderBy: [
        { diaSemana: 'asc' },
        { horaInicio: 'asc' }
      ]
    });

    res.json({ disponibilidades });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear disponibilidad (Médico)
 */
export const crearDisponibilidad = async (req, res, next) => {
  try {
    const { medicoId, diaSemana, horaInicio, horaFin } = req.body;
    const { rol, id: userId } = req.user;

    // Verificar que el médico existe
    const medico = await prisma.medico.findUnique({
      where: { id: medicoId }
    });

    if (!medico) {
      return res.status(404).json({ error: 'Médico no encontrado' });
    }

    // Solo el médico puede gestionar su propia disponibilidad
    if (rol === 'MEDICO' && medico.usuarioId !== userId) {
      return res.status(403).json({
        error: 'Solo puedes gestionar tu propia disponibilidad'
      });
    }

    // Validaciones
    if (diaSemana < 0 || diaSemana > 6) {
      return res.status(400).json({
        error: 'Día de la semana debe estar entre 0 (Domingo) y 6 (Sábado)'
      });
    }

    if (!horaInicio || !horaFin) {
      return res.status(400).json({
        error: 'Hora de inicio y fin son requeridas'
      });
    }

    // Verificar formato de hora (HH:MM)
    const horaRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!horaRegex.test(horaInicio) || !horaRegex.test(horaFin)) {
      return res.status(400).json({
        error: 'Formato de hora inválido. Use HH:MM (ej: 09:00)'
      });
    }

    // Verificar que horaInicio < horaFin
    const [hInicio, mInicio] = horaInicio.split(':').map(Number);
    const [hFin, mFin] = horaFin.split(':').map(Number);
    const minutosInicio = hInicio * 60 + mInicio;
    const minutosFin = hFin * 60 + mFin;

    if (minutosInicio >= minutosFin) {
      return res.status(400).json({
        error: 'La hora de inicio debe ser menor que la hora de fin'
      });
    }

    // Verificar si ya existe una disponibilidad para ese día
    const existe = await prisma.disponibilidad.findFirst({
      where: {
        medicoId,
        diaSemana,
        activo: true
      }
    });

    if (existe) {
      return res.status(409).json({
        error: 'Ya existe una disponibilidad para ese día. Actualícela en lugar de crear una nueva.'
      });
    }

    const disponibilidad = await prisma.disponibilidad.create({
      data: {
        medicoId,
        diaSemana,
        horaInicio,
        horaFin,
        activo: true
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
 * Actualizar disponibilidad (Médico)
 */
export const actualizarDisponibilidad = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { diaSemana, horaInicio, horaFin, activo } = req.body;
    const { rol, id: userId } = req.user;

    const disponibilidad = await prisma.disponibilidad.findUnique({
      where: { id },
      include: { medico: true }
    });

    if (!disponibilidad) {
      return res.status(404).json({ error: 'Disponibilidad no encontrada' });
    }

    // Solo el médico puede gestionar su propia disponibilidad
    if (rol === 'MEDICO' && disponibilidad.medico.usuarioId !== userId) {
      return res.status(403).json({
        error: 'Solo puedes gestionar tu propia disponibilidad'
      });
    }

    // Validaciones si se actualizan horas
    if (horaInicio || horaFin) {
      const horaInicioFinal = horaInicio || disponibilidad.horaInicio;
      const horaFinFinal = horaFin || disponibilidad.horaFin;

      const horaRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (!horaRegex.test(horaInicioFinal) || !horaRegex.test(horaFinFinal)) {
        return res.status(400).json({
          error: 'Formato de hora inválido. Use HH:MM (ej: 09:00)'
        });
      }

      const [hInicio, mInicio] = horaInicioFinal.split(':').map(Number);
      const [hFin, mFin] = horaFinFinal.split(':').map(Number);
      const minutosInicio = hInicio * 60 + mInicio;
      const minutosFin = hFin * 60 + mFin;

      if (minutosInicio >= minutosFin) {
        return res.status(400).json({
          error: 'La hora de inicio debe ser menor que la hora de fin'
        });
      }
    }

    const disponibilidadActualizada = await prisma.disponibilidad.update({
      where: { id },
      data: {
        ...(diaSemana !== undefined && { diaSemana }),
        ...(horaInicio && { horaInicio }),
        ...(horaFin && { horaFin }),
        ...(activo !== undefined && { activo })
      }
    });

    res.json({
      message: 'Disponibilidad actualizada exitosamente',
      disponibilidad: disponibilidadActualizada
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar disponibilidad (Médico)
 */
export const eliminarDisponibilidad = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rol, id: userId } = req.user;

    const disponibilidad = await prisma.disponibilidad.findUnique({
      where: { id },
      include: { medico: true }
    });

    if (!disponibilidad) {
      return res.status(404).json({ error: 'Disponibilidad no encontrada' });
    }

    // Solo el médico puede gestionar su propia disponibilidad
    if (rol === 'MEDICO' && disponibilidad.medico.usuarioId !== userId) {
      return res.status(403).json({
        error: 'Solo puedes gestionar tu propia disponibilidad'
      });
    }

    // Soft delete
    await prisma.disponibilidad.update({
      where: { id },
      data: { activo: false }
    });

    res.json({ message: 'Disponibilidad eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
};

