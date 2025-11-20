import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

/**
 * Obtener todos los turnos (con filtros)
 */
export const getTurnos = async (req, res, next) => {
  try {
    const {
      pacienteId,
      medicoId,
      especialidadId,
      fecha,
      estado,
      fechaDesde,
      fechaHasta,
      page = 1,
      limit = 20
    } = req.query;

    const where = {};

    // Filtros según rol
    if (req.userRole === 'PACIENTE') {
      where.pacienteId = req.user.paciente?.id;
    } else if (req.userRole === 'MEDICO') {
      where.medicoId = req.user.medico?.id;
    } else {
      // Secretario y Administrador pueden ver todos
      if (pacienteId) where.pacienteId = pacienteId;
      if (medicoId) where.medicoId = medicoId;
    }

    if (especialidadId) where.especialidadId = especialidadId;
    if (estado) where.estado = estado;

    // Filtro por fecha
    if (fecha) {
      const fechaInicio = new Date(fecha);
      fechaInicio.setHours(0, 0, 0, 0);
      const fechaFin = new Date(fecha);
      fechaFin.setHours(23, 59, 59, 999);
      where.fecha = {
        gte: fechaInicio,
        lte: fechaFin
      };
    } else if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) {
        where.fecha.gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        const fechaFin = new Date(fechaHasta);
        fechaFin.setHours(23, 59, 59, 999);
        where.fecha.lte = fechaFin;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [turnos, total] = await Promise.all([
      prisma.turno.findMany({
        where,
        include: {
          paciente: {
            include: {
              usuario: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                  email: true,
                  telefono: true
                }
              }
            }
          },
          medico: {
            include: {
              usuario: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true
                }
              },
              especialidad: true
            }
          },
          especialidad: true
        },
        orderBy: [
          { fecha: 'asc' },
          { hora: 'asc' }
        ],
        skip,
        take: parseInt(limit)
      }),
      prisma.turno.count({ where })
    ]);

    res.json({
      turnos,
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
 * Obtener un turno por ID
 */
export const getTurnoById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const turno = await prisma.turno.findUnique({
      where: { id },
      include: {
        paciente: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
                telefono: true,
                direccion: true
              }
            }
          }
        },
        medico: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellido: true
              }
            },
            especialidad: true
          }
        },
        especialidad: true,
        creadoPor: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        }
      }
    });

    if (!turno) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    // Verificar permisos
    if (req.userRole === 'PACIENTE' && turno.pacienteId !== req.user.paciente?.id) {
      return res.status(403).json({ error: 'No tienes permisos para ver este turno' });
    }
    if (req.userRole === 'MEDICO' && turno.medicoId !== req.user.medico?.id) {
      return res.status(403).json({ error: 'No tienes permisos para ver este turno' });
    }

    res.json(turno);
  } catch (error) {
    next(error);
  }
};

/**
 * Crear nuevo turno
 */
export const createTurno = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      pacienteId,
      medicoId,
      especialidadId,
      fecha,
      hora,
      duracion = 30,
      motivoConsulta,
      observaciones
    } = req.body;

    // Verificar disponibilidad del médico
    const fechaTurno = new Date(`${fecha}T${hora}`);
    const fechaFin = new Date(fechaTurno);
    fechaFin.setMinutes(fechaFin.getMinutes() + duracion);

    // Verificar si hay conflicto con otro turno
    const turnoExistente = await prisma.turno.findFirst({
      where: {
        medicoId,
        fecha: {
          gte: fechaTurno,
          lt: fechaFin
        },
        estado: {
          notIn: ['CANCELADO', 'AUSENTE']
        }
      }
    });

    if (turnoExistente) {
      return res.status(409).json({
        error: 'Conflicto de horario',
        message: 'El médico ya tiene un turno en ese horario'
      });
    }

    // Si es paciente, usar su propio ID
    const pacienteIdFinal = req.userRole === 'PACIENTE' 
      ? req.user.paciente.id 
      : pacienteId;

    if (!pacienteIdFinal) {
      return res.status(400).json({ error: 'ID de paciente requerido' });
    }

    const turno = await prisma.turno.create({
      data: {
        pacienteId: pacienteIdFinal,
        medicoId,
        especialidadId,
        fecha: fechaTurno,
        hora,
        duracion,
        motivoConsulta,
        observaciones,
        estado: 'PENDIENTE',
        creadoPorId: req.userId
      },
      include: {
        paciente: {
          include: {
            usuario: {
              select: {
                nombre: true,
                apellido: true,
                email: true
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
        },
        especialidad: true
      }
    });

    // Crear notificación para el paciente y médico
    await Promise.all([
      prisma.notificacion.create({
        data: {
          usuarioId: turno.paciente.usuario.id,
          tipo: 'TURNO_CREADO',
          titulo: 'Turno creado',
          mensaje: `Tu turno con ${turno.medico.usuario.nombre} ${turno.medico.usuario.apellido} ha sido creado para el ${fechaTurno.toLocaleDateString()} a las ${hora}`
        }
      }),
      prisma.notificacion.create({
        data: {
          usuarioId: turno.medico.usuario.id,
          tipo: 'TURNO_CREADO',
          titulo: 'Nuevo turno',
          mensaje: `Tienes un nuevo turno con ${turno.paciente.usuario.nombre} ${turno.paciente.usuario.apellido} el ${fechaTurno.toLocaleDateString()} a las ${hora}`
        }
      })
    ]);

    res.status(201).json({
      message: 'Turno creado exitosamente',
      turno
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar turno
 */
export const updateTurno = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      fecha,
      hora,
      duracion,
      motivoConsulta,
      observaciones,
      estado
    } = req.body;

    // Verificar que el turno existe
    const turnoExistente = await prisma.turno.findUnique({
      where: { id },
      include: {
        paciente: true,
        medico: true
      }
    });

    if (!turnoExistente) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    // Verificar permisos
    const puedeEditar = 
      req.userRole === 'ADMINISTRADOR' ||
      req.userRole === 'SECRETARIO' ||
      (req.userRole === 'MEDICO' && turnoExistente.medicoId === req.user.medico?.id) ||
      (req.userRole === 'PACIENTE' && turnoExistente.pacienteId === req.user.paciente?.id && estado === 'CANCELADO');

    if (!puedeEditar) {
      return res.status(403).json({ error: 'No tienes permisos para editar este turno' });
    }

    // Si se cambia fecha/hora, verificar disponibilidad
    if (fecha || hora) {
      const nuevaFecha = fecha ? new Date(`${fecha}T${hora || turnoExistente.hora}`) : turnoExistente.fecha;
      const nuevaHora = hora || turnoExistente.hora;
      const nuevaDuracion = duracion || turnoExistente.duracion;

      const fechaInicio = new Date(`${nuevaFecha.toISOString().split('T')[0]}T${nuevaHora}`);
      const fechaFin = new Date(fechaInicio);
      fechaFin.setMinutes(fechaFin.getMinutes() + nuevaDuracion);

      const turnoConflicto = await prisma.turno.findFirst({
        where: {
          medicoId: turnoExistente.medicoId,
          id: { not: id },
          fecha: {
            gte: fechaInicio,
            lt: fechaFin
          },
          estado: {
            notIn: ['CANCELADO', 'AUSENTE']
          }
        }
      });

      if (turnoConflicto) {
        return res.status(409).json({
          error: 'Conflicto de horario',
          message: 'El médico ya tiene un turno en ese horario'
        });
      }
    }

    const dataUpdate = {};
    if (fecha && hora) {
      dataUpdate.fecha = new Date(`${fecha}T${hora}`);
      dataUpdate.hora = hora;
    }
    if (duracion) dataUpdate.duracion = duracion;
    if (motivoConsulta !== undefined) dataUpdate.motivoConsulta = motivoConsulta;
    if (observaciones !== undefined) dataUpdate.observaciones = observaciones;
    if (estado) dataUpdate.estado = estado;

    const turno = await prisma.turno.update({
      where: { id },
      data: dataUpdate,
      include: {
        paciente: {
          include: {
            usuario: {
              select: {
                nombre: true,
                apellido: true,
                email: true
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
        },
        especialidad: true
      }
    });

    // Crear notificación si cambió el estado
    if (estado && estado !== turnoExistente.estado) {
      await Promise.all([
        prisma.notificacion.create({
          data: {
            usuarioId: turno.paciente.usuario.id,
            tipo: `TURNO_${estado}`,
            titulo: `Turno ${estado.toLowerCase()}`,
            mensaje: `Tu turno ha sido ${estado.toLowerCase()}`
          }
        }),
        prisma.notificacion.create({
          data: {
            usuarioId: turno.medico.usuario.id,
            tipo: `TURNO_${estado}`,
            titulo: `Turno ${estado.toLowerCase()}`,
            mensaje: `El turno ha sido ${estado.toLowerCase()}`
          }
        })
      ]);
    }

    res.json({
      message: 'Turno actualizado exitosamente',
      turno
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar turno (cancelar)
 */
export const deleteTurno = async (req, res, next) => {
  try {
    const { id } = req.params;

    const turno = await prisma.turno.findUnique({
      where: { id },
      include: {
        paciente: {
          include: {
            usuario: true
          }
        },
        medico: {
          include: {
            usuario: true
          }
        }
      }
    });

    if (!turno) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    // Verificar permisos
    const puedeEliminar = 
      req.userRole === 'ADMINISTRADOR' ||
      req.userRole === 'SECRETARIO' ||
      (req.userRole === 'MEDICO' && turno.medicoId === req.user.medico?.id) ||
      (req.userRole === 'PACIENTE' && turno.pacienteId === req.user.paciente?.id);

    if (!puedeEliminar) {
      return res.status(403).json({ error: 'No tienes permisos para cancelar este turno' });
    }

    // En lugar de eliminar, cambiar estado a CANCELADO
    const turnoCancelado = await prisma.turno.update({
      where: { id },
      data: { estado: 'CANCELADO' },
      include: {
        paciente: {
          include: {
            usuario: true
          }
        },
        medico: {
          include: {
            usuario: true
          }
        }
      }
    });

    // Crear notificaciones
    await Promise.all([
      prisma.notificacion.create({
        data: {
          usuarioId: turnoCancelado.paciente.usuario.id,
          tipo: 'TURNO_CANCELADO',
          titulo: 'Turno cancelado',
          mensaje: 'Tu turno ha sido cancelado'
        }
      }),
      prisma.notificacion.create({
        data: {
          usuarioId: turnoCancelado.medico.usuario.id,
          tipo: 'TURNO_CANCELADO',
          titulo: 'Turno cancelado',
          mensaje: 'Un turno ha sido cancelado'
        }
      })
    ]);

    res.json({
      message: 'Turno cancelado exitosamente',
      turno: turnoCancelado
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener turnos disponibles para un médico en una fecha
 */
export const getTurnosDisponibles = async (req, res, next) => {
  try {
    const { medicoId, fecha } = req.query;

    if (!medicoId || !fecha) {
      return res.status(400).json({ error: 'medicoId y fecha son requeridos' });
    }

    // Obtener disponibilidad del médico
    const fechaObj = new Date(fecha);
    const diaSemana = fechaObj.getDay();

    const disponibilidad = await prisma.disponibilidad.findMany({
      where: {
        medicoId,
        diaSemana,
        activa: true
      }
    });

    if (disponibilidad.length === 0) {
      return res.json({ turnosDisponibles: [] });
    }

    // Obtener turnos ya ocupados
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59, 999);

    const turnosOcupados = await prisma.turno.findMany({
      where: {
        medicoId,
        fecha: {
          gte: fechaInicio,
          lte: fechaFin
        },
        estado: {
          notIn: ['CANCELADO', 'AUSENTE']
        }
      },
      select: {
        hora: true,
        duracion: true
      }
    });

    // Generar horarios disponibles
    const turnosDisponibles = [];
    
    disponibilidad.forEach(disp => {
      const [horaInicio, minutoInicio] = disp.horaInicio.split(':').map(Number);
      const [horaFin, minutoFin] = disp.horaFin.split(':').map(Number);
      
      let horaActual = horaInicio * 60 + minutoInicio;
      const horaFinMinutos = horaFin * 60 + minutoFin;

      while (horaActual + disp.duracionTurno <= horaFinMinutos) {
        const horaStr = `${Math.floor(horaActual / 60).toString().padStart(2, '0')}:${(horaActual % 60).toString().padStart(2, '0')}`;
        
        // Verificar si está ocupado
        const estaOcupado = turnosOcupados.some(turno => {
          const [turnoHora, turnoMinuto] = turno.hora.split(':').map(Number);
          const turnoInicio = turnoHora * 60 + turnoMinuto;
          const turnoFin = turnoInicio + turno.duracion;
          
          return horaActual < turnoFin && (horaActual + disp.duracionTurno) > turnoInicio;
        });

        if (!estaOcupado) {
          turnosDisponibles.push({
            hora: horaStr,
            duracion: disp.duracionTurno
          });
        }

        horaActual += disp.duracionTurno;
      }
    });

    res.json({ turnosDisponibles });
  } catch (error) {
    next(error);
  }
};

