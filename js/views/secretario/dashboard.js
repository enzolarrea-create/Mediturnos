import { AuthManager } from '../../modules/auth.js';
import { TurnosManager } from '../../modules/turnos.js';
import { PacientesManager } from '../../modules/pacientes.js';
import { MedicosManager } from '../../modules/medicos.js';
import { NotificationManager } from '../../modules/notifications.js';
import { CONFIG } from '../../config.js';

class SecretarioDashboard {
    constructor() {
        if (!AuthManager.hasRole(CONFIG.ROLES.SECRETARIO)) {
            window.location.href = '../../landing.html';
            return;
        }
        this.init();
    }

    init() {
        this.setupNavigation();
        this.loadDashboard();
        document.getElementById('newAppointmentBtn')?.addEventListener('click', () => this.openAppointmentModal());
        document.getElementById('addAppointmentBtn2')?.addEventListener('click', () => this.openAppointmentModal());
        document.getElementById('addPacienteBtn')?.addEventListener('click', async () => {
            if (!window.ModalManager) {
                const { ModalManager } = await import('../../components/modals.js');
                window.ModalManager = ModalManager;
            }
            await window.ModalManager.openPacienteModal();
        });
    }

    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
                item.classList.add('active');
                const section = document.getElementById(item.getAttribute('data-section'));
                if (section) {
                    section.classList.add('active');
                    const sectionId = item.getAttribute('data-section');
                    if (sectionId === 'dashboard') this.loadDashboard();
                    else if (sectionId === 'turnos') this.loadTurnos();
                    else if (sectionId === 'pacientes') this.loadPacientes();
                    else if (sectionId === 'calendario') this.loadCalendario();
                }
            });
        });
    }

    loadDashboard() {
        const hoy = new Date().toISOString().split('T')[0];
        const turnosHoy = TurnosManager.getTurnosDelDia(hoy);
        const pacientes = PacientesManager.getAll({ activo: true });

        document.getElementById('stats-grid').innerHTML = `
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
                <div class="stat-content">
                    <h3>Turnos Hoy</h3>
                    <span class="stat-number">${turnosHoy.length}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-user-injured"></i></div>
                <div class="stat-content">
                    <h3>Pacientes</h3>
                    <span class="stat-number">${pacientes.length}</span>
                </div>
            </div>
        `;

        const turnosHoyDiv = document.getElementById('turnos-hoy');
        if (turnosHoy.length === 0) {
            turnosHoyDiv.innerHTML = '<p class="text-center">No hay turnos programados para hoy</p>';
        } else {
            turnosHoyDiv.innerHTML = turnosHoy.map(t => {
                const paciente = PacientesManager.getById(t.pacienteId);
                const medico = MedicosManager.getById(t.medicoId);
                return `<div style="padding: var(--spacing-md); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between;">
                    <div><strong>${t.hora}</strong> - ${paciente ? paciente.nombre + ' ' + paciente.apellido : 'N/A'} - ${medico ? medico.nombre : 'N/A'}</div>
                    <span class="badge badge-${t.estado === 'confirmado' ? 'success' : 'warning'}">${t.estado}</span>
                </div>`;
            }).join('');
        }
    }

    loadTurnos() {
        const turnos = TurnosManager.getAll();
        const table = document.getElementById('turnos-table');
        if (!table) return;
        
        if (turnos.length === 0) {
            table.innerHTML = '<p class="text-center">No hay turnos</p>';
            return;
        }

        table.innerHTML = turnos.map(t => {
            const paciente = PacientesManager.getById(t.pacienteId);
            const medico = MedicosManager.getById(t.medicoId);
            return `<div class="card" style="margin-bottom: var(--spacing-md);">
                <div class="card-body">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>${t.fecha} ${t.hora}</strong><br>
                            ${paciente ? paciente.nombre + ' ' + paciente.apellido : 'N/A'} - ${medico ? medico.nombre : 'N/A'}
                        </div>
                        <div>
                            <span class="badge badge-${t.estado === 'confirmado' ? 'success' : 'warning'}">${t.estado}</span>
                            <button class="btn-icon" onclick="editTurno(${t.id})"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon" onclick="cancelTurno(${t.id})"><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    loadPacientes() {
        const pacientes = PacientesManager.getAll({ activo: true });
        const list = document.getElementById('pacientes-list');
        if (!list) return;
        
        list.innerHTML = `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--spacing-lg);">
            ${pacientes.map(p => `
                <div class="card">
                    <div class="card-body">
                        <h4>${p.nombre} ${p.apellido}</h4>
                        <p>DNI: ${p.dni}</p>
                        <p>Tel: ${p.telefono}</p>
                        <button class="btn-primary btn-sm" onclick="nuevoTurnoPaciente(${p.id})">
                            <i class="fas fa-calendar-plus"></i> Nuevo Turno
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>`;
    }

    async openAppointmentModal() {
        // Asegurar que ModalManager esté disponible
        if (!window.ModalManager) {
            const { ModalManager } = await import('../../components/modals.js');
            window.ModalManager = ModalManager;
        }
        await window.ModalManager.openTurnoModal();
    }

    loadCalendario() {
        const container = document.getElementById('calendar-view');
        if (!container) return;

        // Limpiar contenido previo
        container.innerHTML = '';

        // Obtener todos los turnos
        const turnos = TurnosManager.getAll();

        // Mapear estados a colores
        const estadoColors = {
            [CONFIG.TURNO_ESTADOS.PENDIENTE]: '#fbbf24',   // amarillo
            [CONFIG.TURNO_ESTADOS.CONFIRMADO]: '#22c55e', // verde
            [CONFIG.TURNO_ESTADOS.EN_CURSO]: '#3b82f6',   // azul
            [CONFIG.TURNO_ESTADOS.COMPLETADO]: '#6b7280', // gris
            [CONFIG.TURNO_ESTADOS.CANCELADO]: '#ef4444',  // rojo
            [CONFIG.TURNO_ESTADOS.NO_ASISTIO]: '#a855f7'  // violeta
        };

        const events = turnos.map(t => {
            const paciente = PacientesManager.getById(t.pacienteId);
            const medico = MedicosManager.getById(t.medicoId);

            const titleParts = [];
            if (paciente) titleParts.push(`${paciente.nombre} ${paciente.apellido}`);
            if (medico) titleParts.push(medico.nombre);

            const title = titleParts.join(' - ') || 'Turno';

            // Construir fecha-hora en formato ISO simple
            const start = `${t.fecha}T${t.hora}:00`;

            // Normalizar clase de estado para usar en CSS (en_curso, no_asistio, etc.)
            const estadoClass = (t.estado || '').toString().toLowerCase().replace(/\s+/g, '_');

            return {
                id: String(t.id),
                title: title,
                start: start,
                extendedProps: {
                    estado: t.estado,
                    pacienteNombre: paciente ? `${paciente.nombre} ${paciente.apellido}` : 'N/A',
                    medicoNombre: medico ? medico.nombre : 'N/A',
                    motivo: t.motivo || '',
                    estadoClass
                },
                backgroundColor: estadoColors[t.estado] || '#0ea5e9',
                borderColor: estadoColors[t.estado] || '#0ea5e9',
                classNames: estadoClass ? [`estado-${estadoClass}`] : []
            };
        });

        // Crear calendario FullCalendar (usa objeto global FullCalendar)
        const calendar = new FullCalendar.Calendar(container, {
            initialView: 'timeGridWeek',
            locale: 'es',
            slotMinTime: '08:00:00',
            slotMaxTime: '19:00:00',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
            },
            buttonText: {
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                day: 'Día',
                list: 'Lista'
            },
            events,
            eventClick: (info) => {
                const e = info.event;
                const props = e.extendedProps || {};
                const detalle = `
Paciente: ${props.pacienteNombre}
Médico: ${props.medicoNombre}
Fecha y hora: ${e.start.toLocaleString()}
Estado: ${props.estado}
Motivo: ${props.motivo || 'Sin especificar'}
                `.trim();
                NotificationManager.info(detalle.replace(/\n/g, '<br>'));
            }
        });

        calendar.render();
    }
}

window.logout = async function() {
    if (!window.ModalManager) {
        const { ModalManager } = await import('../../components/modals.js');
        window.ModalManager = ModalManager;
    }
    await window.ModalManager.confirm(
        'Cerrar Sesión',
        '¿Estás seguro de que deseas cerrar sesión?',
        () => {
            AuthManager.logout();
            window.location.href = '../../landing.html';
        }
    );
};

window.editTurno = async function(id) {
    const turno = TurnosManager.getById(id);
    if (!turno) {
        NotificationManager.error('Turno no encontrado');
        return;
    }
    if (!window.ModalManager) {
        const { ModalManager } = await import('../../components/modals.js');
        window.ModalManager = ModalManager;
    }
    await window.ModalManager.openTurnoModal(turno);
};

window.cancelTurno = async function(id) {
    if (!window.ModalManager) {
        const { ModalManager } = await import('../../components/modals.js');
        window.ModalManager = ModalManager;
    }
    await window.ModalManager.confirm(
        'Cancelar Turno',
        '¿Estás seguro de que deseas cancelar este turno?',
        () => {
            const result = TurnosManager.cancel(id);
            if (result.success) {
                NotificationManager.success('Turno cancelado exitosamente');
                if (window.dashboard) {
                    window.dashboard.loadTurnos();
                    window.dashboard.loadDashboard();
                    window.dashboard.loadCalendario && window.dashboard.loadCalendario();
                } else {
                    new SecretarioDashboard().loadTurnos();
                }
            }
        }
    );
};

window.nuevoTurnoPaciente = async function(id) {
    if (!window.ModalManager) {
        const { ModalManager } = await import('../../components/modals.js');
        window.ModalManager = ModalManager;
    }
    await window.ModalManager.openTurnoModal(null, id);
};

const secretarioDashboard = new SecretarioDashboard();
window.dashboard = secretarioDashboard; // Hacer disponible globalmente

