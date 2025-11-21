/**
 * Script principal del dashboard
 */

import { authAPI, turnosAPI, pacientesAPI, medicosAPI, notificacionesAPI } from './api.js';
import { getCurrentUser, formatRol, handleLogout } from './auth.js';
import { formatFecha, formatFechaHora, formatEstadoTurno, getEstadoClass, showToast } from './utils.js';

let currentUser = null;
let currentSection = 'dashboard';

// Inicializar dashboard
document.addEventListener('DOMContentLoaded', async () => {
  // Verificar autenticación
  if (!localStorage.getItem('token')) {
    window.location.href = '/landing.html';
    return;
  }

  try {
    // Obtener información del usuario
    const response = await authAPI.getMe();
    currentUser = response.user;
    
    // Actualizar UI con información del usuario
    updateUserInfo();
    
    // Cargar datos iniciales
    await loadDashboard();
    
    // Configurar navegación
    setupNavigation();
    
    // Configurar eventos
    setupEvents();
  } catch (error) {
    console.error('Error al cargar dashboard:', error);
    showToast('Error al cargar el dashboard', 'error');
    setTimeout(() => {
      handleLogout();
    }, 2000);
  }
});

// Actualizar información del usuario en la UI
function updateUserInfo() {
  if (!currentUser) return;

  // Actualizar sidebar
  const userNameElements = document.querySelectorAll('.user-name');
  const userRoleElements = document.querySelectorAll('.user-role');

  let nombreCompleto = '';
  if (currentUser.paciente) {
    nombreCompleto = `${currentUser.paciente.nombre} ${currentUser.paciente.apellido}`;
  } else if (currentUser.medico) {
    nombreCompleto = `Dr. ${currentUser.medico.nombre} ${currentUser.medico.apellido}`;
  } else if (currentUser.secretario) {
    nombreCompleto = `${currentUser.secretario.nombre} ${currentUser.secretario.apellido}`;
  } else {
    nombreCompleto = 'Administrador';
  }

  userNameElements.forEach(el => {
    if (el) el.textContent = nombreCompleto;
  });

  userRoleElements.forEach(el => {
    if (el) el.textContent = formatRol(currentUser.rol);
  });

  // Mostrar/ocultar secciones según el rol
  updateNavigationByRole();
}

// Actualizar navegación según el rol
function updateNavigationByRole() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    const section = item.getAttribute('data-section');
    
    // Ocultar secciones según el rol
    if (currentUser.rol === 'PACIENTE') {
      if (['doctors', 'schedule', 'reports'].includes(section)) {
        item.style.display = 'none';
      }
    } else if (currentUser.rol === 'MEDICO') {
      if (['doctors', 'reports'].includes(section)) {
        item.style.display = 'none';
      }
    } else if (currentUser.rol === 'SECRETARIO') {
      if (['reports'].includes(section)) {
        item.style.display = 'none';
      }
    }
  });
}

// Configurar navegación
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const section = item.getAttribute('data-section');
      switchSection(section);
    });
  });
}

// Cambiar de sección
function switchSection(section) {
  // Actualizar navegación
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-section') === section) {
      item.classList.add('active');
    }
  });

  // Ocultar todas las secciones
  document.querySelectorAll('.content-section').forEach(sec => {
    sec.classList.remove('active');
  });

  // Mostrar sección seleccionada
  const targetSection = document.getElementById(section);
  if (targetSection) {
    targetSection.classList.add('active');
    currentSection = section;

    // Cargar datos de la sección
    loadSectionData(section);
  }

  // Actualizar título de la página
  const pageTitle = document.querySelector('.page-title');
  if (pageTitle) {
    const titles = {
      dashboard: 'Dashboard',
      appointments: 'Turnos',
      patients: 'Pacientes',
      doctors: 'Médicos',
      schedule: 'Horarios',
      reports: 'Reportes',
    };
    pageTitle.textContent = titles[section] || 'Dashboard';
  }
}

// Cargar datos de una sección
async function loadSectionData(section) {
  try {
    switch (section) {
      case 'dashboard':
        await loadDashboard();
        break;
      case 'appointments':
        await loadTurnos();
        break;
      case 'patients':
        await loadPacientes();
        break;
      case 'doctors':
        await loadMedicos();
        break;
      case 'schedule':
        await loadHorarios();
        break;
      case 'reports':
        await loadReportes();
        break;
    }
  } catch (error) {
    console.error(`Error al cargar sección ${section}:`, error);
    showToast('Error al cargar los datos', 'error');
  }
}

// Cargar dashboard
async function loadDashboard() {
  try {
    // Cargar turnos del día
    const hoy = new Date().toISOString().split('T')[0];
    const turnosResponse = await turnosAPI.listar({ fecha: hoy });
    
    // Actualizar estadísticas
    updateStats(turnosResponse.turnos || []);
    
    // Actualizar lista de próximos turnos
    updateProximosTurnos(turnosResponse.turnos || []);
  } catch (error) {
    console.error('Error al cargar dashboard:', error);
  }
}

// Actualizar estadísticas
function updateStats(turnos) {
  const stats = {
    hoy: turnos.filter(t => t.estado !== 'CANCELADO').length,
    pacientes: 0, // Se puede calcular si se carga la lista de pacientes
    medicos: 0, // Se puede calcular si se carga la lista de médicos
  };

  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers[0]) statNumbers[0].textContent = stats.hoy;
  // Las otras estadísticas se pueden actualizar cuando se carguen los datos completos
}

// Actualizar próximos turnos
function updateProximosTurnos(turnos) {
  const appointmentsList = document.querySelector('.appointments-list');
  if (!appointmentsList) return;

  appointmentsList.innerHTML = '';

  if (turnos.length === 0) {
    appointmentsList.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">No hay turnos programados para hoy</p>';
    return;
  }

  turnos.slice(0, 5).forEach(turno => {
    const item = document.createElement('div');
    item.className = 'appointment-item';
    item.innerHTML = `
      <div class="appointment-time">${turno.hora}</div>
      <div class="appointment-info">
        <span class="patient-name">${turno.paciente.nombre} ${turno.paciente.apellido}</span>
        <span class="doctor-name">${turno.medico.nombre} ${turno.medico.apellido}</span>
      </div>
      <div class="appointment-status ${getEstadoClass(turno.estado)}">${formatEstadoTurno(turno.estado)}</div>
    `;
    appointmentsList.appendChild(item);
  });
}

// Cargar turnos
async function loadTurnos() {
  try {
    const response = await turnosAPI.listar();
    const turnos = response.turnos || [];
    
    // Actualizar tabla de turnos
    updateTurnosTable(turnos);
  } catch (error) {
    console.error('Error al cargar turnos:', error);
    showToast('Error al cargar los turnos', 'error');
  }
}

// Actualizar tabla de turnos
function updateTurnosTable(turnos) {
  const tbody = document.querySelector('.appointments-table tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (turnos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--text-muted);">No hay turnos registrados</td></tr>';
    return;
  }

  turnos.forEach(turno => {
    const row = document.createElement('tr');
    const especialidad = turno.medico.especialidades?.[0]?.especialidad?.nombre || 'N/A';
    
    row.innerHTML = `
      <td>${turno.hora}</td>
      <td>${turno.paciente.nombre} ${turno.paciente.apellido}</td>
      <td>${turno.medico.nombre} ${turno.medico.apellido}</td>
      <td>${especialidad}</td>
      <td><span class="status-badge ${getEstadoClass(turno.estado)}">${formatEstadoTurno(turno.estado)}</span></td>
      <td>
        <button class="btn-icon" title="Editar" onclick="editarTurno('${turno.id}')">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-icon" title="Cancelar" onclick="cancelarTurno('${turno.id}')">
          <i class="fas fa-times"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Cargar pacientes
async function loadPacientes() {
  try {
    if (currentUser.rol !== 'SECRETARIO' && currentUser.rol !== 'ADMINISTRADOR') {
      return;
    }

    const response = await pacientesAPI.listar();
    const pacientes = response.pacientes || [];
    
    updatePacientesGrid(pacientes);
  } catch (error) {
    console.error('Error al cargar pacientes:', error);
    showToast('Error al cargar los pacientes', 'error');
  }
}

// Actualizar grid de pacientes
function updatePacientesGrid(pacientes) {
  const grid = document.querySelector('.patients-grid');
  if (!grid) return;

  grid.innerHTML = '';

  if (pacientes.length === 0) {
    grid.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">No hay pacientes registrados</p>';
    return;
  }

  pacientes.forEach(paciente => {
    const card = document.createElement('div');
    card.className = 'patient-card';
    card.innerHTML = `
      <div class="patient-avatar">
        <i class="fas fa-user"></i>
      </div>
      <div class="patient-info">
        <h3>${paciente.nombre} ${paciente.apellido}</h3>
        <p>DNI: ${paciente.dni}</p>
        <p>Teléfono: ${paciente.telefono || 'N/A'}</p>
      </div>
      <div class="patient-actions">
        <button class="btn-icon" title="Ver historial" onclick="verHistorial('${paciente.id}')">
          <i class="fas fa-history"></i>
        </button>
        <button class="btn-icon" title="Editar">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-icon" title="Nuevo turno" onclick="nuevoTurnoPaciente('${paciente.id}')">
          <i class="fas fa-calendar-plus"></i>
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Cargar médicos
async function loadMedicos() {
  try {
    const response = await medicosAPI.listar();
    const medicos = response.medicos || [];
    
    updateMedicosGrid(medicos);
  } catch (error) {
    console.error('Error al cargar médicos:', error);
    showToast('Error al cargar los médicos', 'error');
  }
}

// Actualizar grid de médicos
function updateMedicosGrid(medicos) {
  const grid = document.querySelector('.doctors-grid');
  if (!grid) return;

  grid.innerHTML = '';

  if (medicos.length === 0) {
    grid.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">No hay médicos registrados</p>';
    return;
  }

  medicos.forEach(medico => {
    const especialidades = medico.especialidades?.map(e => e.especialidad.nombre).join(', ') || 'Sin especialidad';
    
    const card = document.createElement('div');
    card.className = 'doctor-card';
    card.innerHTML = `
      <div class="doctor-avatar">
        <i class="fas fa-user-md"></i>
      </div>
      <div class="doctor-info">
        <h3>Dr. ${medico.nombre} ${medico.apellido}</h3>
        <p>${especialidades}</p>
        <p>Matrícula: ${medico.matricula}</p>
        <p>Teléfono: ${medico.telefono || 'N/A'}</p>
      </div>
      <div class="doctor-status">
        <span class="status-indicator ${medico.activo ? 'disponible' : 'fuera-linea'}"></span>
        <span>${medico.activo ? 'Disponible' : 'Inactivo'}</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Cargar horarios
async function loadHorarios() {
  // Implementar según necesidad
  showToast('Funcionalidad de horarios en desarrollo', 'info');
}

// Cargar reportes
async function loadReportes() {
  // Implementar según necesidad
  showToast('Funcionalidad de reportes en desarrollo', 'info');
}

// Configurar eventos
function setupEvents() {
  // Botón de logout
  const logoutButtons = document.querySelectorAll('.btn-logout, [onclick="logout()"]');
  logoutButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        handleLogout();
      }
    });
  });

  // Botón de nuevo turno
  const newAppointmentBtns = document.querySelectorAll('#newAppointmentBtn, #addAppointmentBtn');
  newAppointmentBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      openAppointmentModal();
    });
  });
}

// Funciones globales para usar en onclick
window.logout = handleLogout;
window.cancelarTurno = async (id) => {
  if (confirm('¿Estás seguro de que deseas cancelar este turno?')) {
    try {
      await turnosAPI.cancelar(id);
      showToast('Turno cancelado exitosamente', 'success');
      await loadTurnos();
    } catch (error) {
      showToast(error.message || 'Error al cancelar el turno', 'error');
    }
  }
};

window.editarTurno = (id) => {
  showToast('Funcionalidad de edición en desarrollo', 'info');
};

window.verHistorial = (pacienteId) => {
  showToast('Funcionalidad de historial en desarrollo', 'info');
};

window.nuevoTurnoPaciente = (pacienteId) => {
  showToast('Funcionalidad de nuevo turno en desarrollo', 'info');
};

function openAppointmentModal() {
  const modal = document.getElementById('appointmentModal');
  if (modal) {
    modal.classList.add('active');
    document.body.classList.add('modal-open');
  }
}

