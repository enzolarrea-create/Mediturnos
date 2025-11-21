// ============================================
// MÓDULO DE GESTIÓN DE TURNOS
// ============================================

import { CONFIG } from '../config.js';
import { StorageManager } from './storage.js';
import { AuthManager } from './auth.js';

export class TurnosManager {
    static getAll(filters = {}) {
        let turnos = StorageManager.get(CONFIG.STORAGE.TURNOS) || [];
        
        // Filtros
        if (filters.fecha) {
            turnos = turnos.filter(t => t.fecha === filters.fecha);
        }
        if (filters.medicoId) {
            turnos = turnos.filter(t => t.medicoId === parseInt(filters.medicoId));
        }
        if (filters.pacienteId) {
            turnos = turnos.filter(t => t.pacienteId === parseInt(filters.pacienteId));
        }
        if (filters.estado) {
            turnos = turnos.filter(t => t.estado === filters.estado);
        }
        if (filters.desde) {
            turnos = turnos.filter(t => t.fecha >= filters.desde);
        }
        if (filters.hasta) {
            turnos = turnos.filter(t => t.fecha <= filters.hasta);
        }

        // Si es médico, solo sus turnos
        const user = AuthManager.getCurrentUser();
        if (user && user.rol === CONFIG.ROLES.MEDICO && user.medicoId) {
            turnos = turnos.filter(t => t.medicoId === user.medicoId);
        }

        // Si es paciente, solo sus turnos
        if (user && user.rol === CONFIG.ROLES.PACIENTE && user.pacienteId) {
            turnos = turnos.filter(t => t.pacienteId === user.pacienteId);
        }

        return turnos.sort((a, b) => {
            const dateA = new Date(a.fecha + ' ' + a.hora);
            const dateB = new Date(b.fecha + ' ' + b.hora);
            return dateA - dateB;
        });
    }

    static getById(id) {
        const turnos = this.getAll();
        return turnos.find(t => t.id === parseInt(id));
    }

    static create(turnoData) {
        const turnos = StorageManager.get(CONFIG.STORAGE.TURNOS) || [];
        
        // Validar disponibilidad
        const conflicto = turnos.find(t => 
            t.medicoId === turnoData.medicoId &&
            t.fecha === turnoData.fecha &&
            t.hora === turnoData.hora &&
            t.estado !== CONFIG.TURNO_ESTADOS.CANCELADO
        );

        if (conflicto) {
            return { success: false, message: 'El médico ya tiene un turno en esa fecha y hora' };
        }

        const newTurno = {
            id: Date.now(),
            pacienteId: parseInt(turnoData.pacienteId),
            medicoId: parseInt(turnoData.medicoId),
            fecha: turnoData.fecha,
            hora: turnoData.hora,
            estado: turnoData.estado || CONFIG.TURNO_ESTADOS.PENDIENTE,
            motivo: turnoData.motivo || '',
            notas: turnoData.notas || '',
            fechaCreacion: new Date().toISOString(),
            creadoPor: AuthManager.getCurrentUser()?.id || null
        };

        turnos.push(newTurno);
        StorageManager.set(CONFIG.STORAGE.TURNOS, turnos);

        return { success: true, turno: newTurno };
    }

    static update(id, updates) {
        const turnos = StorageManager.get(CONFIG.STORAGE.TURNOS) || [];
        const index = turnos.findIndex(t => t.id === parseInt(id));

        if (index === -1) {
            return { success: false, message: 'Turno no encontrado' };
        }

        // Validar disponibilidad si cambia fecha/hora/médico
        if (updates.fecha || updates.hora || updates.medicoId) {
            const fecha = updates.fecha || turnos[index].fecha;
            const hora = updates.hora || turnos[index].hora;
            const medicoId = updates.medicoId || turnos[index].medicoId;

            const conflicto = turnos.find(t => 
                t.id !== parseInt(id) &&
                t.medicoId === parseInt(medicoId) &&
                t.fecha === fecha &&
                t.hora === hora &&
                t.estado !== CONFIG.TURNO_ESTADOS.CANCELADO
            );

            if (conflicto) {
                return { success: false, message: 'El médico ya tiene un turno en esa fecha y hora' };
            }
        }

        turnos[index] = {
            ...turnos[index],
            ...updates,
            fechaActualizacion: new Date().toISOString(),
            actualizadoPor: AuthManager.getCurrentUser()?.id || null
        };

        StorageManager.set(CONFIG.STORAGE.TURNOS, turnos);
        return { success: true, turno: turnos[index] };
    }

    static cancel(id) {
        return this.update(id, { estado: CONFIG.TURNO_ESTADOS.CANCELADO });
    }

    static getTurnosDelDia(fecha = null) {
        const fechaStr = fecha || new Date().toISOString().split('T')[0];
        return this.getAll({ fecha: fechaStr });
    }

    static getProximosTurnos(limit = 5) {
        const hoy = new Date().toISOString().split('T')[0];
        const turnos = this.getAll({ desde: hoy });
        return turnos
            .filter(t => t.estado !== CONFIG.TURNO_ESTADOS.CANCELADO)
            .slice(0, limit);
    }

    static getEstadisticas(fechaInicio, fechaFin) {
        const turnos = this.getAll({ desde: fechaInicio, hasta: fechaFin });
        
        return {
            total: turnos.length,
            pendientes: turnos.filter(t => t.estado === CONFIG.TURNO_ESTADOS.PENDIENTE).length,
            confirmados: turnos.filter(t => t.estado === CONFIG.TURNO_ESTADOS.CONFIRMADO).length,
            completados: turnos.filter(t => t.estado === CONFIG.TURNO_ESTADOS.COMPLETADO).length,
            cancelados: turnos.filter(t => t.estado === CONFIG.TURNO_ESTADOS.CANCELADO).length,
            noAsistio: turnos.filter(t => t.estado === CONFIG.TURNO_ESTADOS.NO_ASISTIO).length
        };
    }
}

