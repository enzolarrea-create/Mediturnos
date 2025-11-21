// ============================================
// MÓDULO DE GESTIÓN DE MÉDICOS
// ============================================

import { CONFIG } from '../config.js';
import { StorageManager } from './storage.js';
import { TurnosManager } from './turnos.js';

export class MedicosManager {
    static getAll(filters = {}) {
        let medicos = StorageManager.get(CONFIG.STORAGE.MEDICOS) || [];

        if (filters.activo !== undefined) {
            medicos = medicos.filter(m => m.activo === filters.activo);
        }

        if (filters.especialidad) {
            medicos = medicos.filter(m => m.especialidad === filters.especialidad);
        }

        if (filters.search) {
            const search = filters.search.toLowerCase();
            medicos = medicos.filter(m => 
                m.nombre.toLowerCase().includes(search) ||
                m.especialidad.toLowerCase().includes(search) ||
                m.matricula.includes(search)
            );
        }

        return medicos.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }

    static getById(id) {
        const medicos = this.getAll();
        return medicos.find(m => m.id === parseInt(id));
    }

    static create(medicoData) {
        const medicos = StorageManager.get(CONFIG.STORAGE.MEDICOS) || [];

        // Validar matrícula única
        if (medicos.find(m => m.matricula === medicoData.matricula)) {
            return { success: false, message: 'Ya existe un médico con esta matrícula' };
        }

        const newMedico = {
            id: Date.now(),
            nombre: medicoData.nombre,
            especialidad: medicoData.especialidad,
            matricula: medicoData.matricula,
            horario: medicoData.horario || '',
            email: medicoData.email || '',
            telefono: medicoData.telefono || '',
            activo: true,
            disponibilidad: medicoData.disponibilidad || {},
            fechaCreacion: new Date().toISOString()
        };

        medicos.push(newMedico);
        StorageManager.set(CONFIG.STORAGE.MEDICOS, medicos);

        return { success: true, medico: newMedico };
    }

    static update(id, updates) {
        const medicos = StorageManager.get(CONFIG.STORAGE.MEDICOS) || [];
        const index = medicos.findIndex(m => m.id === parseInt(id));

        if (index === -1) {
            return { success: false, message: 'Médico no encontrado' };
        }

        // Validar matrícula única si se cambia
        if (updates.matricula && updates.matricula !== medicos[index].matricula) {
            const existe = medicos.find(m => m.matricula === updates.matricula && m.id !== parseInt(id));
            if (existe) {
                return { success: false, message: 'Ya existe un médico con esta matrícula' };
            }
        }

        medicos[index] = {
            ...medicos[index],
            ...updates,
            fechaActualizacion: new Date().toISOString()
        };

        StorageManager.set(CONFIG.STORAGE.MEDICOS, medicos);
        return { success: true, medico: medicos[index] };
    }

    static delete(id) {
        const medicos = StorageManager.get(CONFIG.STORAGE.MEDICOS) || [];
        const index = medicos.findIndex(m => m.id === parseInt(id));

        if (index === -1) {
            return { success: false, message: 'Médico no encontrado' };
        }

        // Soft delete
        medicos[index].activo = false;
        StorageManager.set(CONFIG.STORAGE.MEDICOS, medicos);

        return { success: true };
    }

    static getDisponibilidad(id, fecha) {
        const turnos = TurnosManager.getAll({ medicoId: id, fecha });
        const medico = this.getById(id);
        
        if (!medico) return { disponible: false };

        const turnosActivos = turnos.filter(t => 
            t.estado !== CONFIG.TURNO_ESTADOS.CANCELADO &&
            t.estado !== CONFIG.TURNO_ESTADOS.COMPLETADO
        );

        return {
            disponible: turnosActivos.length < 20, // Máximo 20 turnos por día
            turnosOcupados: turnosActivos.length,
            turnos: turnosActivos
        };
    }

    static getHorariosDisponibles(id, fecha) {
        const disponibilidad = this.getDisponibilidad(id, fecha);
        const medico = this.getById(id);
        
        if (!medico) return [];

        const horariosOcupados = disponibilidad.turnos.map(t => t.hora);
        return CONFIG.HORARIOS.filter(hora => !horariosOcupados.includes(hora));
    }

    static getEspecialidades() {
        const medicos = this.getAll({ activo: true });
        const especialidades = [...new Set(medicos.map(m => m.especialidad))];
        return especialidades.sort();
    }
}

