// ============================================
// MÓDULO DE GESTIÓN DE PACIENTES
// ============================================

import { CONFIG } from '../config.js';
import { StorageManager } from './storage.js';
import { TurnosManager } from './turnos.js';

export class PacientesManager {
    static getAll(filters = {}) {
        let pacientes = StorageManager.get(CONFIG.STORAGE.PACIENTES) || [];

        if (filters.activo !== undefined) {
            pacientes = pacientes.filter(p => p.activo === filters.activo);
        }

        if (filters.search) {
            const search = filters.search.toLowerCase();
            pacientes = pacientes.filter(p => 
                p.nombre.toLowerCase().includes(search) ||
                p.apellido.toLowerCase().includes(search) ||
                p.dni.includes(search) ||
                p.email?.toLowerCase().includes(search)
            );
        }

        return pacientes.sort((a, b) => {
            const nameA = `${a.nombre} ${a.apellido}`.toLowerCase();
            const nameB = `${b.nombre} ${b.apellido}`.toLowerCase();
            return nameA.localeCompare(nameB);
        });
    }

    static getById(id) {
        const pacientes = this.getAll();
        return pacientes.find(p => p.id === parseInt(id));
    }

    static create(pacienteData) {
        const pacientes = StorageManager.get(CONFIG.STORAGE.PACIENTES) || [];

        // Validar DNI único
        if (pacienteData.dni && pacientes.find(p => p.dni === pacienteData.dni)) {
            return { success: false, message: 'Ya existe un paciente con este DNI' };
        }

        const newPaciente = {
            id: Date.now(),
            nombre: pacienteData.nombre,
            apellido: pacienteData.apellido,
            dni: pacienteData.dni || '',
            telefono: pacienteData.telefono || '',
            email: pacienteData.email || '',
            fechaNacimiento: pacienteData.fechaNacimiento || '',
            direccion: pacienteData.direccion || '',
            ultimaVisita: null,
            activo: true,
            fechaCreacion: new Date().toISOString()
        };

        pacientes.push(newPaciente);
        StorageManager.set(CONFIG.STORAGE.PACIENTES, pacientes);

        return { success: true, paciente: newPaciente };
    }

    static update(id, updates) {
        const pacientes = StorageManager.get(CONFIG.STORAGE.PACIENTES) || [];
        const index = pacientes.findIndex(p => p.id === parseInt(id));

        if (index === -1) {
            return { success: false, message: 'Paciente no encontrado' };
        }

        // Validar DNI único si se cambia
        if (updates.dni && updates.dni !== pacientes[index].dni) {
            const existe = pacientes.find(p => p.dni === updates.dni && p.id !== parseInt(id));
            if (existe) {
                return { success: false, message: 'Ya existe un paciente con este DNI' };
            }
        }

        pacientes[index] = {
            ...pacientes[index],
            ...updates,
            fechaActualizacion: new Date().toISOString()
        };

        StorageManager.set(CONFIG.STORAGE.PACIENTES, pacientes);
        return { success: true, paciente: pacientes[index] };
    }

    static delete(id) {
        const pacientes = StorageManager.get(CONFIG.STORAGE.PACIENTES) || [];
        const index = pacientes.findIndex(p => p.id === parseInt(id));

        if (index === -1) {
            return { success: false, message: 'Paciente no encontrado' };
        }

        // Soft delete
        pacientes[index].activo = false;
        StorageManager.set(CONFIG.STORAGE.PACIENTES, pacientes);

        return { success: true };
    }

    static getHistorial(id) {
        const turnos = TurnosManager.getAll({ pacienteId: id });
        return turnos.sort((a, b) => {
            const dateA = new Date(a.fecha + ' ' + a.hora);
            const dateB = new Date(b.fecha + ' ' + b.hora);
            return dateB - dateA;
        });
    }

    static updateUltimaVisita(id) {
        const pacientes = StorageManager.get(CONFIG.STORAGE.PACIENTES) || [];
        const index = pacientes.findIndex(p => p.id === parseInt(id));

        if (index !== -1) {
            pacientes[index].ultimaVisita = new Date().toISOString().split('T')[0];
            StorageManager.set(CONFIG.STORAGE.PACIENTES, pacientes);
        }
    }
}

