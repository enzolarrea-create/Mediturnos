/**
 * Dashboard simple
 */

import { authAPI, turnosAPI, medicosAPI } from './api-simple.js';

let currentUser = null;

// Inicializar
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
  
  const userNameElements = document.querySelectorAll('.user-name');
  const userRoleElements = document.querySelectorAll('.user-role');

  const nombreCompleto = `${currentUser.nombre} ${currentUser.apellido}`;
  userNameElements.forEach(el => el.textContent = nombreCompleto);
  userRoleElements.forEach(el => el.textContent = currentUser.rol);
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
  
  const targetSection = document.getElementById(section);
  if (targetSection) {
    targetSection.classList.add('active');
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    loadSectionData(section);
  }
}

async function loadSectionData(section) {
  try {
    switch (section) {
      case 'dashboard':
        await loadDashboard();
        break;
      case 'appointments':
        await loadTurnos();
        break;
    }
  } catch (error) {
    console.error('Error:', error);
  }
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

window.logout = async () => {
  await authAPI.logout();
  window.location.href = '/landing.html';
};

window.cancelarTurno = async (id) => {
  if (confirm('¿Cancelar este turno?')) {
    try {
      await turnosAPI.cancelar(id);
      await loadTurnos();
      alert('Turno cancelado');
    } catch (error) {
      alert(error.message);
    }
  }
};

