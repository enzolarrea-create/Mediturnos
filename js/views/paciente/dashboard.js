import { AuthManager } from '../../modules/auth.js';
import { TurnosManager } from '../../modules/turnos.js';
import { PacientesManager } from '../../modules/pacientes.js';
import { MedicosManager } from '../../modules/medicos.js';
import { NotificationManager } from '../../modules/notifications.js';
import { CONFIG } from '../../config.js';

class PacienteDashboard {
    constructor() {
        if (!AuthManager.hasRole(CONFIG.ROLES.PACIENTE)) {
            window.location.href = '../../landing.html';
            return;
        }
        this.user = AuthManager.getCurrentUser();
        this.paciente = this.user.pacienteId ? PacientesManager.getById(this.user.pacienteId) : null;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.loadDashboard();
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
                    else if (sectionId === 'reservar') this.loadReservar();
                    else if (sectionId === 'historial') this.loadHistorial();
                    else if (sectionId === 'perfil') this.loadPerfil();
                }
            });
        });
    }

    loadDashboard() {
        if (!this.paciente) return;

        const proximos = TurnosManager.getProximosTurnos(5).filter(t => t.pacienteId === this.paciente.id);
        const div = document.getElementById('proximos-turnos');
        if (!div) return;

        if (proximos.length === 0) {
            div.innerHTML = '<p class="text-center">No tienes turnos próximos</p>';
        } else {
            div.innerHTML = proximos.map(t => {
                const medico = MedicosManager.getById(t.medicoId);
                return `<div style="padding: var(--spacing-md); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between;">
                    <div>
                        <strong>${t.fecha} ${t.hora}</strong><br>
                        ${medico ? medico.nombre + ' - ' + medico.especialidad : 'N/A'}
                    </div>
                    <div>
                        <span class="badge badge-${t.estado === 'confirmado' ? 'success' : 'warning'}">${t.estado}</span>
                        <button class="btn-icon" onclick="cancelarTurno(${t.id})"><i class="fas fa-times"></i></button>
                    </div>
                </div>`;
            }).join('');
        }
    }

    loadTurnos() {
        if (!this.paciente) return;
        const turnos = TurnosManager.getAll({ pacienteId: this.paciente.id });
        const div = document.getElementById('mis-turnos');
        if (!div) return;
        
        div.innerHTML = turnos.map(t => {
            const medico = MedicosManager.getById(t.medicoId);
            return `<div class="card" style="margin-bottom: var(--spacing-md);">
                <div class="card-body">
                    <div style="display: flex; justify-content: space-between;">
                        <div>
                            <strong>${t.fecha} ${t.hora}</strong><br>
                            ${medico ? medico.nombre + ' - ' + medico.especialidad : 'N/A'}
                        </div>
                        <div>
                            <span class="badge badge-${t.estado === 'confirmado' ? 'success' : 'warning'}">${t.estado}</span>
                            ${t.estado !== 'cancelado' && t.estado !== 'completado' ? 
                                `<button class="btn-icon" onclick="cancelarTurno(${t.id})"><i class="fas fa-times"></i></button>` : ''}
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    async loadReservar() {
        const medicos = MedicosManager.getAll({ activo: true });
        const content = document.getElementById('reservar-content');
        if (!content) return;
        
        const hoy = new Date().toISOString().split('T')[0];
        
        content.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <form id="reservarForm">
                        <div class="form-group">
                            <label>Médico / Especialidad *</label>
                            <select name="medicoId" class="form-control" required id="reservarMedicoSelect">
                                <option value="">Seleccionar médico</option>
                                ${medicos.map(m => `<option value="${m.id}">${m.nombre} - ${m.especialidad}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Fecha *</label>
                                <input type="date" name="fecha" class="form-control" required 
                                    id="reservarFechaInput" min="${hoy}">
                            </div>
                            <div class="form-group">
                                <label>Hora *</label>
                                <select name="hora" class="form-control" required id="reservarHoraSelect">
                                    <option value="">Seleccionar hora</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Motivo de consulta</label>
                            <textarea name="motivo" class="form-control" rows="3" placeholder="Describir el motivo de la consulta..."></textarea>
                        </div>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-calendar-plus"></i> Reservar Turno
                        </button>
                    </form>
                </div>
            </div>
        `;

        // Actualizar horarios disponibles cuando cambia médico o fecha
        const medicoSelect = document.getElementById('reservarMedicoSelect');
        const fechaInput = document.getElementById('reservarFechaInput');
        const horaSelect = document.getElementById('reservarHoraSelect');

        const updateHorariosDisponibles = async () => {
            const medicoId = medicoSelect.value;
            const fecha = fechaInput.value;

            if (!medicoId || !fecha) {
                horaSelect.innerHTML = '<option value="">Seleccionar hora</option>';
                return;
            }

            const horariosDisponibles = MedicosManager.getHorariosDisponibles(parseInt(medicoId), fecha);
            
            horaSelect.innerHTML = '<option value="">Seleccionar hora</option>' +
                CONFIG.HORARIOS.map(h => {
                    const disponible = horariosDisponibles.includes(h);
                    return `<option value="${h}" ${!disponible ? 'disabled' : ''}>
                        ${h} ${!disponible ? '(Ocupado)' : ''}
                    </option>`;
                }).join('');
        };

        medicoSelect?.addEventListener('change', updateHorariosDisponibles);
        fechaInput?.addEventListener('change', updateHorariosDisponibles);

        const form = document.getElementById('reservarForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.reservarTurno(e.target);
            });
        }
    }

    async reservarTurno(form) {
        if (!this.paciente) return;

        const formData = new FormData(form);
        const turnoData = {
            pacienteId: this.paciente.id,
            medicoId: parseInt(formData.get('medicoId')),
            fecha: formData.get('fecha'),
            hora: formData.get('hora'),
            motivo: formData.get('motivo') || '',
            estado: 'pendiente'
        };

        // Validación
        if (!turnoData.medicoId || !turnoData.fecha || !turnoData.hora) {
            NotificationManager.error('Por favor completa todos los campos requeridos');
            return;
        }

        const result = TurnosManager.create(turnoData);
        if (result.success) {
            NotificationManager.success('Turno reservado exitosamente');
            form.reset();
            this.loadDashboard();
            this.loadTurnos();
        } else {
            NotificationManager.error(result.message || 'Error al reservar el turno');
        }
    }

    loadHistorial() {
        if (!this.paciente) return;
        const historial = PacientesManager.getHistorial(this.paciente.id);
        const content = document.getElementById('historial-content');
        if (!content) return;
        
        if (historial.length === 0) {
            content.innerHTML = '<p class="text-center">No hay historial disponible</p>';
        } else {
            content.innerHTML = historial.map(t => {
                const medico = MedicosManager.getById(t.medicoId);
                return `<div class="card" style="margin-bottom: var(--spacing-md);">
                    <div class="card-body">
                        <strong>${t.fecha} ${t.hora}</strong> - ${medico ? medico.nombre : 'N/A'}<br>
                        <span class="badge badge-${t.estado === 'completado' ? 'success' : 'warning'}">${t.estado}</span>
                    </div>
                </div>`;
            }).join('');
        }
    }

    loadPerfil() {
        if (!this.paciente) return;
        const content = document.getElementById('perfil-content');
        if (!content) return;
        
        content.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h4>Datos Personales</h4>
                    <p><strong>Nombre:</strong> ${this.paciente.nombre} ${this.paciente.apellido}</p>
                    <p><strong>DNI:</strong> ${this.paciente.dni}</p>
                    <p><strong>Teléfono:</strong> ${this.paciente.telefono}</p>
                    <p><strong>Email:</strong> ${this.user.email}</p>
                    <button class="btn-primary" onclick="editarPerfil()">
                        <i class="fas fa-edit"></i> Editar Perfil
                    </button>
                </div>
            </div>
        `;
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

window.irAReservar = () => {
    document.querySelector('[data-section="reservar"]').click();
};

window.cancelarTurno = async function(id) {
    if (!window.ModalManager) {
        const { ModalManager } = await import('../../components/modals.js');
        window.ModalManager = ModalManager;
    }
    await window.ModalManager.confirm(
        'Cancelar Turno',
        '¿Estás seguro de que deseas cancelar este turno? Esta acción no se puede deshacer.',
        () => {
            const result = TurnosManager.cancel(id);
            if (result.success) {
                NotificationManager.success('Turno cancelado exitosamente');
                if (window.dashboard) {
                    window.dashboard.loadDashboard();
                    window.dashboard.loadTurnos();
                } else {
                    new PacienteDashboard().loadDashboard();
                    new PacienteDashboard().loadTurnos();
                }
            } else {
                NotificationManager.error(result.message || 'Error al cancelar el turno');
            }
        }
    );
};

window.editarPerfil = async function() {
    if (!window.ModalManager) {
        const { ModalManager } = await import('../../components/modals.js');
        window.ModalManager = ModalManager;
    }
    const { PacientesManager } = await import('../../modules/pacientes.js');
    
    const user = AuthManager.getCurrentUser();
    if (!user || !user.pacienteId) {
        NotificationManager.error('No se encontró información del paciente');
        return;
    }
    
    const paciente = PacientesManager.getById(user.pacienteId);
    if (!paciente) {
        NotificationManager.error('Paciente no encontrado');
        return;
    }
    
    await window.ModalManager.openPacienteModal(paciente);
};

const pacienteDashboard = new PacienteDashboard();
window.dashboard = pacienteDashboard; // Hacer disponible globalmente

