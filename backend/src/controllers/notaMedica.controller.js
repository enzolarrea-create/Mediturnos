import { prisma } from '../server.js';

/**
 * Crear nota médica (Solo Médico)
 */
export const crearNotaMedica = async (req, res, next) => {
  try {
    const { turnoId, contenido } = req.body;
    const { rol, id: userId } = req.user;

    if (rol !== 'MEDICO') {
      return res.status(403).json({
        error: 'Solo los médicos pueden crear notas médicas'
      });
    }

    if (!turnoId || !contenido) {
      return res.status(400).json({
        error: 'Turno ID y contenido son requeridos'
      });
    }

    // Verificar que el turno existe y pertenece al médico
    const turno = await prisma.turno.findUnique({
      where: { id: turnoId },
      include: { medico: true }
    });

    if (!turno) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    const medico = await prisma.medico.findUnique({
      where: { usuarioId: userId }
    });

    if (turno.medicoId !== medico?.id) {
      return res.status(403).json({
        error: 'Solo puedes agregar notas a tus propios turnos'
      });
    }

    const notaMedica = await prisma.notaMedica.create({
      data: {
        turnoId,
        medicoId: medico.id,
        contenido
      },
      include: {
        medico: {
          select: {
            nombre: true,
            apellido: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Nota médica creada exitosamente',
      notaMedica
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener notas médicas de un turno
 */
export const obtenerNotasMedicas = async (req, res, next) => {
  try {
    const { turnoId } = req.params;
    const { rol, id: userId } = req.user;

    // Verificar que el turno existe
    const turno = await prisma.turno.findUnique({
      where: { id: turnoId },
      include: {
        paciente: {
          include: { usuario: true }
        },
        medico: {
          include: { usuario: true }
        }
      }
    });

    if (!turno) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    // Verificar permisos
    if (rol === 'PACIENTE') {
      const paciente = await prisma.paciente.findUnique({
        where: { usuarioId: userId }
      });
      if (turno.pacienteId !== paciente?.id) {
        return res.status(403).json({
          error: 'Solo puedes ver notas de tus propios turnos'
        });
      }
    }

    if (rol === 'MEDICO') {
      const medico = await prisma.medico.findUnique({
        where: { usuarioId: userId }
      });
      if (turno.medicoId !== medico?.id) {
        return res.status(403).json({
          error: 'Solo puedes ver notas de tus propios turnos'
        });
      }
    }

    const notasMedicas = await prisma.notaMedica.findMany({
      where: { turnoId },
      include: {
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
    });

    res.json({ notasMedicas });
  } catch (error) {
    next(error);
  }
};

