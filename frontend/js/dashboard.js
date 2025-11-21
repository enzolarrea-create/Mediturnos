import { authAPI, turnosAPI } from './api.js';
import { handleLogout } from './auth.js';

let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await authAPI.getMe();
    currentUser = response.user;
    updateUserInfo();
    await loadDashboard();
    setupNavigation();
  } catch (error) {
    window.location.href = '/landing.html';
  }
});

function updateUserInfo() {
  if (!currentUser) return;
  const nombreCompleto = `${currentUser.nombre} ${currentUser.apellido}`;
  document.querySelectorAll('.user-name').forEach(el => el.textContent = nombreCompleto);
  document.querySelectorAll('.user-role').forEach(el => el.textContent = currentUser.rol);
}

function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const section = item.getAttribute('data-section');
      switchSection(section);
    });
  });
}

function switchSection(section) {
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
  
  const target = document.getElementById(section);
  if (target) {
    target.classList.add('active');
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    loadSectionData(section);
  }
}

async function loadSectionData(section) {
  if (section === 'dashboard') await loadDashboard();
  if (section === 'appointments') await loadTurnos();
}

async function loadDashboard() {
  try {
    const hoy = new Date().toISOString().split('T')[0];
    const response = await turnosAPI.listar({ fecha: hoy });
    updateProximosTurnos(response.turnos || []);
  } catch (error) {
    console.error('Error:', error);
  }
}

function updateProximosTurnos(turnos) {
  const list = document.querySelector('.appointments-list');
  if (!list) return;
  list.innerHTML = '';
  if (turnos.length === 0) {
    list.innerHTML = '<p style="text-align: center; padding: 20px;">No hay turnos hoy</p>';
    return;
  }
  turnos.slice(0, 5).forEach(turno => {
    const item = document.createElement('div');
    item.className = 'appointment-item';
    item.innerHTML = `
      <div class="appointment-time">${turno.hora}</div>
      <div class="appointment-info">
        <span class="patient-name">${turno.paciente_nombre} ${turno.paciente_apellido}</span>
        <span class="doctor-name">${turno.medico_nombre} ${turno.medico_apellido}</span>
      </div>
      <div class="appointment-status ${turno.estado.toLowerCase()}">${turno.estado}</div>
    `;
    list.appendChild(item);
  });
}

async function loadTurnos() {
  try {
    const response = await turnosAPI.listar();
    updateTurnosTable(response.turnos || []);
  } catch (error) {
    console.error('Error:', error);
  }
}

function updateTurnosTable(turnos) {
  const tbody = document.querySelector('.appointments-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  turnos.forEach(turno => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${turno.hora}</td>
      <td>${turno.paciente_nombre} ${turno.paciente_apellido}</td>
      <td>${turno.medico_nombre} ${turno.medico_apellido}</td>
      <td>N/A</td>
      <td><span class="status-badge ${turno.estado.toLowerCase()}">${turno.estado}</span></td>
      <td>
        <button class="btn-icon" onclick="cancelarTurno(${turno.id})">
          <i class="fas fa-times"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

window.logout = handleLogout;
window.cancelarTurno = async (id) => {
  if (confirm('¿Cancelar turno?')) {
    try {
      await turnosAPI.cancelar(id);
      await loadTurnos();
      alert('Turno cancelado');
    } catch (error) {
      alert(error.message);
    }
  }
};
