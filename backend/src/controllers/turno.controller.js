import { prisma } from '../server.js';

/**
 * Listar turnos (con filtros según rol)
 */
export const listarTurnos = async (req, res, next) => {
  try {
    const { fecha, medicoId, pacienteId, estado } = req.query;
    const { rol, id } = req.user;

    // Construir filtros según el rol
    const where = {};

    // Paciente solo ve sus propios turnos
    if (rol === 'PACIENTE') {
      const paciente = await prisma.paciente.findUnique({
        where: { usuarioId: id }
      });
      if (paciente) {
        where.pacienteId = paciente.id;
      } else {
        return res.json({ turnos: [] });
      }
    }

    // Médico solo ve sus propios turnos
    if (rol === 'MEDICO') {
      const medico = await prisma.medico.findUnique({
        where: { usuarioId: id }
      });
      if (medico) {
        where.medicoId = medico.id;
      } else {
        return res.json({ turnos: [] });
      }
    }

    // Secretario y Admin pueden ver todos o filtrar
    if (medicoId) where.medicoId = medicoId;
    if (pacienteId) where.pacienteId = pacienteId;
    if (estado) where.estado = estado;
    if (fecha) {
      const fechaInicio = new Date(fecha);
      fechaInicio.setHours(0, 0, 0, 0);
      const fechaFin = new Date(fecha);
      fechaFin.setHours(23, 59, 59, 999);
      where.fecha = {
        gte: fechaInicio,
        lte: fechaFin
      };
    }

    const turnos = await prisma.turno.findMany({
      where,
      include: {
        paciente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            telefono: true
          }
        },
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
            fecha: true
          },
          orderBy: {
            fecha: 'desc'
          }
        }
      },
      orderBy: [
        { fecha: 'asc' },
        { hora: 'asc' }
      ]
    });

    res.json({ turnos });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener un turno específico
 */
export const obtenerTurno = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rol, id: userId } = req.user;

    const turno = await prisma.turno.findUnique({
      where: { id },
      include: {
        paciente: {
          include: {
            usuario: {
              select: {
                email: true
              }
            }
          }
        },
        medico: {
          include: {
            especialidades: {
              include: {
                especialidad: true
              }
            }
          }
        },
        notasMedicas: {
          orderBy: {
            fecha: 'desc'
          }
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
        return res.status(403).json({ error: 'No tienes permisos para ver este turno' });
      }
    }

    if (rol === 'MEDICO') {
      const medico = await prisma.medico.findUnique({
        where: { usuarioId: userId }
      });
      if (turno.medicoId !== medico?.id) {
        return res.status(403).json({ error: 'No tienes permisos para ver este turno' });
      }
    }

    res.json({ turno });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear un nuevo turno
 */
export const crearTurno = async (req, res, next) => {
  try {
    const { pacienteId, medicoId, fecha, hora, motivoConsulta } = req.body;
    const { rol, id: userId } = req.user;

    // Validaciones
    if (!pacienteId || !medicoId || !fecha || !hora) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        required: ['pacienteId', 'medicoId', 'fecha', 'hora']
      });
    }

    // Si es paciente, solo puede crear turnos para sí mismo
    if (rol === 'PACIENTE') {
      const paciente = await prisma.paciente.findUnique({
        where: { usuarioId: userId }
      });
      if (paciente?.id !== pacienteId) {
        return res.status(403).json({
          error: 'Solo puedes crear turnos para ti mismo'
        });
      }
    }

    // Verificar que el médico existe y está activo
    const medico = await prisma.medico.findUnique({
      where: { id: medicoId },
      include: { usuario: true }
    });

    if (!medico || !medico.activo || !medico.usuario.activo) {
      return res.status(404).json({ error: 'Médico no encontrado o inactivo' });
    }

    // Verificar disponibilidad (simplificado - se puede mejorar)
    const fechaTurno = new Date(fecha);
    const diaSemana = fechaTurno.getDay();

    const disponibilidad = await prisma.disponibilidad.findFirst({
      where: {
        medicoId,
        diaSemana,
        activo: true,
        horaInicio: { lte: hora },
        horaFin: { gte: hora }
      }
    });

    if (!disponibilidad && rol === 'PACIENTE') {
      return res.status(400).json({
        error: 'El médico no tiene disponibilidad en ese horario'
      });
    }

    // Verificar que no haya otro turno en el mismo horario
    const turnoExistente = await prisma.turno.findFirst({
      where: {
        medicoId,
        fecha: fechaTurno,
        hora,
        estado: {
          notIn: ['CANCELADO', 'AUSENTE']
        }
      }
    });

    if (turnoExistente) {
      return res.status(409).json({
        error: 'Ya existe un turno en ese horario'
      });
    }

    // Crear turno
    const turno = await prisma.turno.create({
      data: {
        pacienteId,
        medicoId,
        fecha: fechaTurno,
        hora,
        motivoConsulta: motivoConsulta || null,
        estado: 'PENDIENTE'
      },
      include: {
        paciente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            telefono: true
          }
        },
        medico: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            matricula: true
          }
        }
      }
    });

    // Crear notificación para el médico
    await prisma.notificacion.create({
      data: {
        usuarioId: medico.usuarioId,
        tipo: 'TURNO_CREADO',
        mensaje: `Nuevo turno con ${turno.paciente.nombre} ${turno.paciente.apellido} el ${fecha} a las ${hora}`
      }
    });

    res.status(201).json({
      message: 'Turno creado exitosamente',
      turno
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Modificar un turno
 */
export const modificarTurno = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fecha, hora, estado, motivoConsulta, observaciones } = req.body;
    const { rol } = req.user;

    // Solo Secretario, Médico y Admin pueden modificar
    if (rol === 'PACIENTE') {
      return res.status(403).json({
        error: 'No tienes permisos para modificar turnos'
      });
    }

    const turno = await prisma.turno.findUnique({
      where: { id }
    });

    if (!turno) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    // Verificar disponibilidad si se cambia fecha/hora
    if (fecha || hora) {
      const nuevaFecha = fecha ? new Date(fecha) : turno.fecha;
      const nuevaHora = hora || turno.hora;
      const diaSemana = nuevaFecha.getDay();

      const disponibilidad = await prisma.disponibilidad.findFirst({
        where: {
          medicoId: turno.medicoId,
          diaSemana,
          activo: true,
          horaInicio: { lte: nuevaHora },
          horaFin: { gte: nuevaHora }
        }
      });

      if (!disponibilidad) {
        return res.status(400).json({
          error: 'El médico no tiene disponibilidad en ese horario'
        });
      }

      // Verificar conflicto con otro turno
      const conflicto = await prisma.turno.findFirst({
        where: {
          medicoId: turno.medicoId,
          fecha: nuevaFecha,
          hora: nuevaHora,
          id: { not: id },
          estado: {
            notIn: ['CANCELADO', 'AUSENTE']
          }
        }
      });

      if (conflicto) {
        return res.status(409).json({
          error: 'Ya existe otro turno en ese horario'
        });
      }
    }

    const turnoActualizado = await prisma.turno.update({
      where: { id },
      data: {
        ...(fecha && { fecha: new Date(fecha) }),
        ...(hora && { hora }),
        ...(estado && { estado }),
        ...(motivoConsulta !== undefined && { motivoConsulta }),
        ...(observaciones !== undefined && { observaciones })
      },
      include: {
        paciente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            telefono: true
          }
        },
        medico: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        }
      }
    });

    // Crear notificaciones según el cambio
    if (estado === 'CANCELADO') {
      const paciente = await prisma.paciente.findUnique({
        where: { id: turno.pacienteId },
        include: { usuario: true }
      });
      const medico = await prisma.medico.findUnique({
        where: { id: turno.medicoId },
        include: { usuario: true }
      });

      if (paciente) {
        await prisma.notificacion.create({
          data: {
            usuarioId: paciente.usuarioId,
            tipo: 'TURNO_CANCELADO',
            mensaje: `Tu turno del ${turno.fecha.toLocaleDateString()} a las ${turno.hora} ha sido cancelado`
          }
        });
      }

      if (medico) {
        await prisma.notificacion.create({
          data: {
            usuarioId: medico.usuarioId,
            tipo: 'TURNO_CANCELADO',
            mensaje: `Turno cancelado con ${turnoActualizado.paciente.nombre} ${turnoActualizado.paciente.apellido}`
          }
        });
      }
    }

    res.json({
      message: 'Turno actualizado exitosamente',
      turno: turnoActualizado
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancelar un turno
 */
export const cancelarTurno = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rol, id: userId } = req.user;

    const turno = await prisma.turno.findUnique({
      where: { id },
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
          error: 'Solo puedes cancelar tus propios turnos'
        });
      }
    }

    if (turno.estado === 'CANCELADO') {
      return res.status(400).json({ error: 'El turno ya está cancelado' });
    }

    const turnoCancelado = await prisma.turno.update({
      where: { id },
      data: { estado: 'CANCELADO' },
      include: {
        paciente: {
          select: {
            nombre: true,
            apellido: true
          }
        },
        medico: {
          select: {
            nombre: true,
            apellido: true
          }
        }
      }
    });

    // Notificar al médico
    if (turno.medico) {
      await prisma.notificacion.create({
        data: {
          usuarioId: turno.medico.usuarioId,
          tipo: 'TURNO_CANCELADO',
          mensaje: `Turno cancelado con ${turnoCancelado.paciente.nombre} ${turnoCancelado.paciente.apellido}`
        }
      });
    }

    res.json({
      message: 'Turno cancelado exitosamente',
      turno: turnoCancelado
    });
  } catch (error) {
    next(error);
  }
};

