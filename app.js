// ============================================
// MEDITURNOS - Sistema de Gestión de Turnos
// ============================================

// ============================================
// 1. SISTEMA DE REGISTRO Y LOGIN
// ============================================

// Claves de localStorage
const STORAGE_KEYS = {
    USERS: 'mediturnos_users',
    CURRENT_USER: 'mediturnos_current_user',
    TURNOS: 'mediturnos_turnos',
    MEDICOS: 'mediturnos_medicos',
    PACIENTES: 'mediturnos_pacientes'
};

// Inicializar datos si no existen
function initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TURNOS)) {
        localStorage.setItem(STORAGE_KEYS.TURNOS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEDICOS)) {
        // Datos de ejemplo
        const medicosEjemplo = [
            { id: 1, nombre: 'Dr. López', especialidad: 'Cardiología', matricula: '12345', horario: '08:00 - 17:00' },
            { id: 2, nombre: 'Dr. Martínez', especialidad: 'Dermatología', matricula: '23456', horario: '09:00 - 18:00' },
            { id: 3, nombre: 'Dr. García', especialidad: 'Pediatría', matricula: '34567', horario: '08:30 - 16:30' }
        ];
        localStorage.setItem(STORAGE_KEYS.MEDICOS, JSON.stringify(medicosEjemplo));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PACIENTES)) {
        // Datos de ejemplo
        const pacientesEjemplo = [
            { id: 1, nombre: 'María González', dni: '12.345.678', telefono: '(011) 1234-5678', ultimaVisita: '15/11/2024' },
            { id: 2, nombre: 'Carlos Ruiz', dni: '23.456.789', telefono: '(011) 2345-6789', ultimaVisita: '10/11/2024' },
            { id: 3, nombre: 'Ana Silva', dni: '34.567.890', telefono: '(011) 3456-7890', ultimaVisita: '08/11/2024' }
        ];
        localStorage.setItem(STORAGE_KEYS.PACIENTES, JSON.stringify(pacientesEjemplo));
    }
}

// Verificar si el usuario está logueado
function checkAuth() {
    const currentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (currentUser && window.location.pathname.includes('landing.html')) {
        window.location.href = 'iniciado.html';
    }
    if (!currentUser && window.location.pathname.includes('iniciado.html')) {
        window.location.href = 'landing.html';
    }
}

// Funciones de modal (Landing Page)
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('active');
        document.body.classList.add('modal-open');
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}

function openRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.classList.add('active');
        document.body.classList.add('modal-open');
    }
}

function closeRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}

function switchToRegister() {
    closeLoginModal();
    setTimeout(() => openRegisterModal(), 300);
}

function switchToLogin() {
    closeRegisterModal();
    setTimeout(() => openLoginModal(), 300);
}

function scrollToFeatures() {
    const features = document.getElementById('features');
    if (features) {
        features.scrollIntoView({ behavior: 'smooth' });
    }
}

// Manejar login
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        closeLoginModal();
        window.location.href = 'iniciado.html';
    } else {
        alert('Email o contraseña incorrectos');
    }
}

// ============================================
// FORMATEO AUTOMÁTICO DE DNI Y FECHA
// ============================================

/**
 * Formatea el DNI mientras el usuario escribe
 * Formato: xx.xxx.xxx (ej: 12.345.678)
 */
function formatDNI(input) {
    // Guardar posición del cursor
    const cursorPosition = input.selectionStart;
    
    // Obtener solo números
    let value = input.value.replace(/\D/g, '');
    
    // Limitar a 8 dígitos
    if (value.length > 8) {
        value = value.substring(0, 8);
    }
    
    // Aplicar formato: xx.xxx.xxx
    let formatted = '';
    if (value.length > 0) {
        if (value.length <= 2) {
            formatted = value;
        } else if (value.length <= 5) {
            formatted = value.substring(0, 2) + '.' + value.substring(2);
        } else {
            formatted = value.substring(0, 2) + '.' + value.substring(2, 5) + '.' + value.substring(5);
        }
    }
    
    input.value = formatted;
    
    // Restaurar posición del cursor (ajustada por los puntos agregados)
    let newCursorPosition = cursorPosition;
    const beforeCursor = input.value.substring(0, cursorPosition).replace(/\D/g, '').length;
    const formattedBeforeCursor = formatDNIValue(beforeCursor);
    newCursorPosition = formattedBeforeCursor.length;
    
    input.setSelectionRange(newCursorPosition, newCursorPosition);
}

/**
 * Función auxiliar para formatear DNI sin modificar el input
 */
function formatDNIValue(value) {
    const numbers = value.replace(/\D/g, '').substring(0, 8);
    if (numbers.length <= 2) {
        return numbers;
    } else if (numbers.length <= 5) {
        return numbers.substring(0, 2) + '.' + numbers.substring(2);
    } else {
        return numbers.substring(0, 2) + '.' + numbers.substring(2, 5) + '.' + numbers.substring(5);
    }
}

/**
 * Formatea la fecha de nacimiento mientras el usuario escribe
 * Formato: dd/mm/yyyy (ej: 01/06/2005)
 */
function formatFecha(input) {
    // Guardar posición del cursor
    const cursorPosition = input.selectionStart;
    
    // Obtener solo números
    let value = input.value.replace(/\D/g, '');
    
    // Limitar a 8 dígitos (ddmmyyyy)
    if (value.length > 8) {
        value = value.substring(0, 8);
    }
    
    // Aplicar formato: dd/mm/yyyy
    let formatted = '';
    if (value.length > 0) {
        if (value.length <= 2) {
            formatted = value;
        } else if (value.length <= 4) {
            formatted = value.substring(0, 2) + '/' + value.substring(2);
        } else {
            formatted = value.substring(0, 2) + '/' + value.substring(2, 4) + '/' + value.substring(4);
        }
    }
    
    input.value = formatted;
    
    // Restaurar posición del cursor (ajustada por las barras agregadas)
    let newCursorPosition = cursorPosition;
    const beforeCursor = input.value.substring(0, cursorPosition).replace(/\D/g, '').length;
    const formattedBeforeCursor = formatFechaValue(beforeCursor);
    newCursorPosition = formattedBeforeCursor.length;
    
    input.setSelectionRange(newCursorPosition, newCursorPosition);
}

/**
 * Función auxiliar para formatear fecha sin modificar el input
 */
function formatFechaValue(value) {
    const numbers = value.replace(/\D/g, '').substring(0, 8);
    if (numbers.length <= 2) {
        return numbers;
    } else if (numbers.length <= 4) {
        return numbers.substring(0, 2) + '/' + numbers.substring(2);
    } else {
        return numbers.substring(0, 2) + '/' + numbers.substring(2, 4) + '/' + numbers.substring(4);
    }
}

/**
 * Valida que la fecha sea real y válida
 */
function validateFecha(fechaStr) {
    // Formato esperado: dd/mm/yyyy
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = fechaStr.match(regex);
    
    if (!match) {
        return false;
    }
    
    const dia = parseInt(match[1], 10);
    const mes = parseInt(match[2], 10);
    const anio = parseInt(match[3], 10);
    
    // Validar rango de año (1900 - año actual)
    const anioActual = new Date().getFullYear();
    if (anio < 1900 || anio > anioActual) {
        return false;
    }
    
    // Validar mes
    if (mes < 1 || mes > 12) {
        return false;
    }
    
    // Validar día según el mes
    const diasPorMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    // Año bisiesto
    if (mes === 2 && ((anio % 4 === 0 && anio % 100 !== 0) || (anio % 400 === 0))) {
        if (dia < 1 || dia > 29) {
            return false;
        }
    } else {
        if (dia < 1 || dia > diasPorMes[mes - 1]) {
            return false;
        }
    }
    
    // Validar que no sea una fecha futura
    const fecha = new Date(anio, mes - 1, dia);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fecha > hoy) {
        return false;
    }
    
    return true;
}

/**
 * Valida que el DNI tenga el formato correcto
 */
function validateDNI(dniStr) {
    // Formato esperado: xx.xxx.xxx
    const regex = /^\d{2}\.\d{3}\.\d{3}$/;
    return regex.test(dniStr);
}

// Manejar registro
function handleRegister(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('regNombre').value.trim();
    const apellido = document.getElementById('regApellido').value.trim();
    const dni = document.getElementById('regDNI').value.trim();
    const fechaNacimiento = document.getElementById('regFecha').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    // Validar campos vacíos
    if (!nombre || !apellido || !dni || !fechaNacimiento || !email || !password) {
        alert('Por favor completa todos los campos requeridos');
        return;
    }

    // Validar DNI
    if (!validateDNI(dni)) {
        alert('El DNI debe tener el formato: 12.345.678');
        document.getElementById('regDNI').focus();
        return;
    }

    // Validar fecha
    if (!validateFecha(fechaNacimiento)) {
        alert('La fecha de nacimiento no es válida. Verifica que sea una fecha real y no sea futura.');
        document.getElementById('regFecha').focus();
        return;
    }

    // Validar contraseñas
    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        document.getElementById('regConfirmPassword').focus();
        return;
    }

    if (password.length < 8) {
        alert('La contraseña debe tener al menos 8 caracteres');
        document.getElementById('regPassword').focus();
        return;
    }

    // Validar formato de contraseña (al menos 1 mayúscula y 1 número)
    const passwordRegex = /(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
        alert('La contraseña debe contener al menos una mayúscula y un número');
        document.getElementById('regPassword').focus();
        return;
    }

    // Validar email único
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    
    if (users.find(u => u.email.toLowerCase() === email)) {
        alert('Este email ya está registrado');
        document.getElementById('regEmail').focus();
        return;
    }

    // Crear nuevo usuario
    const newUser = {
        id: Date.now(),
        nombre,
        apellido,
        dni,
        fechaNacimiento,
        email,
        password
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    
    alert('Registro exitoso');
    closeRegisterModal();
    window.location.href = 'iniciado.html';
}

// Cerrar sesión
function logout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        window.location.href = 'landing.html';
    }
}

// ============================================
// 2. NAVEGACIÓN ENTRE SECCIONES
// ============================================

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.getAttribute('data-section');
            
            // Remover active de todos
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(sec => sec.classList.remove('active'));
            
            // Activar el seleccionado
            item.classList.add('active');
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Actualizar título
                const pageTitle = document.querySelector('.page-title');
                if (pageTitle) {
                    const titles = {
                        dashboard: 'Dashboard',
                        appointments: 'Turnos',
                        patients: 'Pacientes',
                        doctors: 'Médicos',
                        schedule: 'Horarios',
                        reports: 'Reportes'
                    };
                    pageTitle.textContent = titles[sectionId] || 'Dashboard';
                }

                // Cargar datos según la sección
                if (sectionId === 'dashboard') {
                    updateDashboard();
                } else if (sectionId === 'appointments') {
                    renderAppointments();
                } else if (sectionId === 'patients') {
                    renderPatients();
                } else if (sectionId === 'doctors') {
                    renderDoctors();
                }
            }
        });
    });
}

// ============================================
// 3. SISTEMA DE TURNOS (CRUD)
// ============================================

// Obtener todos los turnos
function getTurnos() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TURNOS) || '[]');
}

// Guardar turnos
function saveTurnos(turnos) {
    localStorage.setItem(STORAGE_KEYS.TURNOS, JSON.stringify(turnos));
}

// Crear turno
function createTurno(turnoData) {
    const turnos = getTurnos();
    const newTurno = {
        id: Date.now(),
        pacienteId: turnoData.pacienteId,
        medicoId: turnoData.medicoId,
        fecha: turnoData.fecha,
        hora: turnoData.hora,
        estado: 'pendiente',
        motivo: turnoData.motivo || ''
    };
    turnos.push(newTurno);
    saveTurnos(turnos);
    return newTurno;
}

// Actualizar turno
function updateTurno(id, updates) {
    const turnos = getTurnos();
    const index = turnos.findIndex(t => t.id === id);
    if (index !== -1) {
        turnos[index] = { ...turnos[index], ...updates };
        saveTurnos(turnos);
        return turnos[index];
    }
    return null;
}

// Cancelar turno
function cancelTurno(id) {
    return updateTurno(id, { estado: 'cancelado' });
}

// Obtener turnos filtrados
function getFilteredTurnos(filters = {}) {
    let turnos = getTurnos();
    
    if (filters.fecha) {
        turnos = turnos.filter(t => t.fecha === filters.fecha);
    }
    if (filters.medicoId) {
        turnos = turnos.filter(t => t.medicoId === parseInt(filters.medicoId));
    }
    if (filters.estado) {
        turnos = turnos.filter(t => t.estado === filters.estado);
    }
    
    return turnos;
}

// Renderizar tabla de turnos
function renderAppointments() {
    const turnos = getTurnos();
    const medicos = getMedicos();
    const pacientes = getPacientes();
    const tbody = document.querySelector('#appointments tbody');
    
    if (!tbody) return;

    if (turnos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No hay turnos registrados</td></tr>';
        return;
    }

    tbody.innerHTML = turnos.map(turno => {
        const paciente = pacientes.find(p => p.id === turno.pacienteId);
        const medico = medicos.find(m => m.id === turno.medicoId);
        
        return `
            <tr>
                <td>${turno.hora}</td>
                <td>${paciente ? paciente.nombre : 'N/A'}</td>
                <td>${medico ? medico.nombre : 'N/A'}</td>
                <td>${medico ? medico.especialidad : 'N/A'}</td>
                <td><span class="status-badge ${turno.estado}">${turno.estado}</span></td>
                <td>
                    <button class="btn-icon" title="Editar" onclick="editTurno(${turno.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" title="Cancelar" onclick="cancelTurnoAction(${turno.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Cancelar turno (acción)
function cancelTurnoAction(id) {
    if (confirm('¿Estás seguro de cancelar este turno?')) {
        cancelTurno(id);
        renderAppointments();
        updateDashboard();
        alert('Turno cancelado');
    }
}

// Editar turno
function editTurno(id) {
    const turnos = getTurnos();
    const turno = turnos.find(t => t.id === id);
    if (!turno) return;

    openAppointmentModal(turno);
}

// ============================================
// 4. SISTEMA DE MÉDICOS
// ============================================

function getMedicos() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MEDICOS) || '[]');
}

function saveMedicos(medicos) {
    localStorage.setItem(STORAGE_KEYS.MEDICOS, JSON.stringify(medicos));
}

function createMedico(medicoData) {
    const medicos = getMedicos();
    const newMedico = {
        id: Date.now(),
        nombre: medicoData.nombre,
        especialidad: medicoData.especialidad,
        matricula: medicoData.matricula,
        horario: medicoData.horario
    };
    medicos.push(newMedico);
    saveMedicos(medicos);
    return newMedico;
}

function updateMedico(id, updates) {
    const medicos = getMedicos();
    const index = medicos.findIndex(m => m.id === id);
    if (index !== -1) {
        medicos[index] = { ...medicos[index], ...updates };
        saveMedicos(medicos);
        return medicos[index];
    }
    return null;
}

function getMedicoDisponibilidad(medicoId) {
    const turnos = getTurnos();
    const hoy = new Date().toISOString().split('T')[0];
    const turnosHoy = turnos.filter(t => 
        t.medicoId === medicoId && 
        t.fecha === hoy && 
        t.estado !== 'cancelado'
    );
    
    const horaActual = new Date().getHours();
    const turnosActivos = turnosHoy.filter(t => {
        const horaTurno = parseInt(t.hora.split(':')[0]);
        return horaTurno >= horaActual;
    });
    
    return turnosActivos.length > 0 ? 'ocupado' : 'disponible';
}

function renderDoctors() {
    const medicos = getMedicos();
    const grid = document.querySelector('.doctors-grid');
    
    if (!grid) return;

    if (medicos.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 2rem;">No hay médicos registrados</p>';
        return;
    }

    grid.innerHTML = medicos.map(medico => {
        const disponibilidad = getMedicoDisponibilidad(medico.id);
        
        return `
            <div class="doctor-card">
                <div class="doctor-avatar">
                    <i class="fas fa-user-md"></i>
                </div>
                <div class="doctor-info">
                    <h3>${medico.nombre}</h3>
                    <p>${medico.especialidad}</p>
                    <p>Matrícula: ${medico.matricula}</p>
                    <p>Horario: ${medico.horario}</p>
                </div>
                <div class="doctor-status">
                    <span class="status-indicator ${disponibilidad}"></span>
                    <span>${disponibilidad === 'disponible' ? 'Disponible' : 'Ocupado'}</span>
                </div>
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button class="btn-secondary" onclick="editMedico(${medico.id})" style="flex: 1;">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function editMedico(id) {
    const medicos = getMedicos();
    const medico = medicos.find(m => m.id === id);
    if (!medico) return;

    const nombre = prompt('Nombre:', medico.nombre);
    if (nombre === null) return;
    
    const especialidad = prompt('Especialidad:', medico.especialidad);
    if (especialidad === null) return;
    
    const matricula = prompt('Matrícula:', medico.matricula);
    if (matricula === null) return;
    
    const horario = prompt('Horario:', medico.horario);
    if (horario === null) return;

    updateMedico(id, { nombre, especialidad, matricula, horario });
    renderDoctors();
    updateDashboard();
    alert('Médico actualizado');
}

function openAddMedicoModal() {
    const nombre = prompt('Nombre del médico:');
    if (!nombre) return;
    
    const especialidad = prompt('Especialidad:');
    if (!especialidad) return;
    
    const matricula = prompt('Matrícula:');
    if (!matricula) return;
    
    const horario = prompt('Horario (ej: 08:00 - 17:00):');
    if (!horario) return;

    createMedico({ nombre, especialidad, matricula, horario });
    renderDoctors();
    updateDashboard();
    alert('Médico agregado');
}

// ============================================
// 5. SISTEMA DE PACIENTES
// ============================================

function getPacientes() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PACIENTES) || '[]');
}

function savePacientes(pacientes) {
    localStorage.setItem(STORAGE_KEYS.PACIENTES, JSON.stringify(pacientes));
}

function createPaciente(pacienteData) {
    const pacientes = getPacientes();
    const newPaciente = {
        id: Date.now(),
        nombre: pacienteData.nombre,
        dni: pacienteData.dni,
        telefono: pacienteData.telefono,
        ultimaVisita: pacienteData.ultimaVisita || new Date().toLocaleDateString('es-AR')
    };
    pacientes.push(newPaciente);
    savePacientes(pacientes);
    return newPaciente;
}

function updatePaciente(id, updates) {
    const pacientes = getPacientes();
    const index = pacientes.findIndex(p => p.id === id);
    if (index !== -1) {
        pacientes[index] = { ...pacientes[index], ...updates };
        savePacientes(pacientes);
        return pacientes[index];
    }
    return null;
}

function renderPatients() {
    const pacientes = getPacientes();
    const grid = document.querySelector('.patients-grid');
    
    if (!grid) return;

    if (pacientes.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 2rem;">No hay pacientes registrados</p>';
        return;
    }

    grid.innerHTML = pacientes.map(paciente => {
        return `
            <div class="patient-card">
                <div class="patient-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="patient-info">
                    <h3>${paciente.nombre}</h3>
                    <p>DNI: ${paciente.dni}</p>
                    <p>Teléfono: ${paciente.telefono}</p>
                    <p>Última visita: ${paciente.ultimaVisita}</p>
                </div>
                <div class="patient-actions">
                    <button class="btn-icon" title="Ver historial" onclick="verHistorial(${paciente.id})">
                        <i class="fas fa-history"></i>
                    </button>
                    <button class="btn-icon" title="Editar" onclick="editPaciente(${paciente.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" title="Nuevo turno" onclick="nuevoTurnoPaciente(${paciente.id})">
                        <i class="fas fa-calendar-plus"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function editPaciente(id) {
    const pacientes = getPacientes();
    const paciente = pacientes.find(p => p.id === id);
    if (!paciente) return;

    const nombre = prompt('Nombre:', paciente.nombre);
    if (nombre === null) return;
    
    const dni = prompt('DNI:', paciente.dni);
    if (dni === null) return;
    
    const telefono = prompt('Teléfono:', paciente.telefono);
    if (telefono === null) return;

    updatePaciente(id, { nombre, dni, telefono });
    renderPatients();
    updateDashboard();
    alert('Paciente actualizado');
}

function verHistorial(id) {
    const turnos = getTurnos();
    const paciente = getPacientes().find(p => p.id === id);
    const medicos = getMedicos();
    
    const historial = turnos
        .filter(t => t.pacienteId === id)
        .sort((a, b) => new Date(b.fecha + ' ' + b.hora) - new Date(a.fecha + ' ' + a.hora));
    
    if (historial.length === 0) {
        alert('No hay historial de turnos para este paciente');
        return;
    }

    let mensaje = `Historial de ${paciente.nombre}:\n\n`;
    historial.forEach(t => {
        const medico = medicos.find(m => m.id === t.medicoId);
        mensaje += `${t.fecha} ${t.hora} - ${medico ? medico.nombre : 'N/A'} - ${t.estado}\n`;
    });
    
    alert(mensaje);
}

function nuevoTurnoPaciente(pacienteId) {
    openAppointmentModal(null, pacienteId);
}

function openAddPacienteModal() {
    const nombre = prompt('Nombre del paciente:');
    if (!nombre) return;
    
    const dni = prompt('DNI:');
    if (!dni) return;
    
    const telefono = prompt('Teléfono:');
    if (!telefono) return;

    createPaciente({ nombre, dni, telefono });
    renderPatients();
    updateDashboard();
    alert('Paciente agregado');
}

// ============================================
// 6. MODAL DE TURNOS
// ============================================

function openAppointmentModal(turno = null, pacienteIdPreseleccionado = null) {
    const modal = document.getElementById('appointmentModal');
    if (!modal) return;

    const form = modal.querySelector('.appointment-form');
    const modalTitle = modal.querySelector('.modal-header h3');
    
    if (turno) {
        modalTitle.textContent = 'Editar Turno';
    } else {
        modalTitle.textContent = 'Nuevo Turno';
    }

    // Limpiar formulario
    form.reset();

    // Cargar pacientes
    const pacientes = getPacientes();
    const pacienteSelect = form.querySelector('select:first-of-type');
    if (pacienteSelect) {
        pacienteSelect.innerHTML = '<option value="">Seleccionar paciente</option>' +
            pacientes.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
        
        if (pacienteIdPreseleccionado) {
            pacienteSelect.value = pacienteIdPreseleccionado;
        } else if (turno) {
            pacienteSelect.value = turno.pacienteId;
        }
    }

    // Cargar médicos
    const medicos = getMedicos();
    const medicoSelect = form.querySelectorAll('select')[1];
    if (medicoSelect) {
        medicoSelect.innerHTML = '<option value="">Seleccionar médico</option>' +
            medicos.map(m => `<option value="${m.id}">${m.nombre} - ${m.especialidad}</option>`).join('');
        
        if (turno) {
            medicoSelect.value = turno.medicoId;
        }
    }

    // Cargar datos del turno si existe
    if (turno) {
        const fechaInput = form.querySelector('input[type="date"]');
        if (fechaInput) fechaInput.value = turno.fecha;
        
        const horaSelect = form.querySelector('#timeSelect');
        if (horaSelect) horaSelect.value = turno.hora;
        
        const motivoTextarea = form.querySelector('textarea');
        if (motivoTextarea) motivoTextarea.value = turno.motivo || '';
    } else {
        // Fecha por defecto: hoy
        const fechaInput = form.querySelector('input[type="date"]');
        if (fechaInput) {
            fechaInput.value = new Date().toISOString().split('T')[0];
        }
    }

    // Guardar ID del turno para edición
    form.dataset.turnoId = turno ? turno.id : '';

    modal.classList.add('active');
    document.body.classList.add('modal-open');
}

function closeAppointmentModal() {
    const modal = document.getElementById('appointmentModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}

function saveAppointment() {
    const modal = document.getElementById('appointmentModal');
    if (!modal) return;

    const form = modal.querySelector('.appointment-form');
    if (!form) return;

    const selects = form.querySelectorAll('select');
    const pacienteSelect = selects[0];
    const medicoSelect = selects[1];
    const fechaInput = form.querySelector('input[type="date"]');
    const horaSelect = form.querySelector('#timeSelect');
    const motivoTextarea = form.querySelector('textarea');

    if (!pacienteSelect || !medicoSelect || !fechaInput || !horaSelect) {
        alert('Error: No se encontraron todos los campos del formulario');
        return;
    }

    const pacienteId = parseInt(pacienteSelect.value);
    const medicoId = parseInt(medicoSelect.value);
    const fecha = fechaInput.value;
    const hora = horaSelect.value;
    const motivo = motivoTextarea ? motivoTextarea.value : '';

    // Validaciones
    if (!pacienteId || !medicoId || !fecha || !hora) {
        alert('Por favor completa todos los campos requeridos');
        return;
    }

    // Verificar disponibilidad
    const turnos = getTurnos();
    const conflicto = turnos.find(t => 
        t.medicoId === medicoId && 
        t.fecha === fecha && 
        t.hora === hora && 
        t.estado !== 'cancelado' &&
        (!form.dataset.turnoId || t.id !== parseInt(form.dataset.turnoId))
    );

    if (conflicto) {
        alert('El médico ya tiene un turno en esa fecha y hora');
        return;
    }

    const turnoId = form.dataset.turnoId;
    
    if (turnoId) {
        // Editar
        updateTurno(parseInt(turnoId), {
            pacienteId,
            medicoId,
            fecha,
            hora,
            motivo
        });
        alert('Turno actualizado');
    } else {
        // Crear
        createTurno({
            pacienteId,
            medicoId,
            fecha,
            hora,
            motivo
        });
        alert('Turno creado');
    }

    closeAppointmentModal();
    renderAppointments();
    updateDashboard();
}

// ============================================
// 7. DASHBOARD DINÁMICO
// ============================================

function updateDashboard() {
    const turnos = getTurnos();
    const pacientes = getPacientes();
    const medicos = getMedicos();
    
    const hoy = new Date().toISOString().split('T')[0];
    const turnosHoy = turnos.filter(t => t.fecha === hoy && t.estado !== 'cancelado');

    // Actualizar estadísticas
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length >= 3) {
        statNumbers[0].textContent = turnosHoy.length;
        statNumbers[1].textContent = pacientes.length;
        statNumbers[2].textContent = medicos.length;
    }

    // Actualizar próximos turnos
    const proximosTurnos = turnos
        .filter(t => new Date(t.fecha + ' ' + t.hora) >= new Date() && t.estado !== 'cancelado')
        .sort((a, b) => new Date(a.fecha + ' ' + a.hora) - new Date(b.fecha + ' ' + b.hora))
        .slice(0, 3);

    const appointmentsList = document.querySelector('.appointments-list');
    if (appointmentsList) {
        if (proximosTurnos.length === 0) {
            appointmentsList.innerHTML = '<p style="text-align: center; padding: 1rem; color: var(--text-secondary);">No hay turnos próximos</p>';
        } else {
            appointmentsList.innerHTML = proximosTurnos.map(turno => {
                const paciente = pacientes.find(p => p.id === turno.pacienteId);
                const medico = medicos.find(m => m.id === turno.medicoId);
                
                return `
                    <div class="appointment-item">
                        <div class="appointment-time">${turno.hora}</div>
                        <div class="appointment-info">
                            <span class="patient-name">${paciente ? paciente.nombre : 'N/A'}</span>
                            <span class="doctor-name">${medico ? medico.nombre : 'N/A'}</span>
                        </div>
                        <div class="appointment-status ${turno.estado}">${turno.estado}</div>
                    </div>
                `;
            }).join('');
        }
    }

    // Actualizar mini calendario
    updateMiniCalendar();
}

function updateMiniCalendar() {
    const calendarGrid = document.querySelector('.mini-calendar .calendar-grid');
    if (!calendarGrid) return;

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Días de la semana
    const weekDays = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    let html = weekDays.map(day => `<div class="calendar-day">${day}</div>`).join('');

    // Espacios vacíos al inicio
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-date"></div>';
    }

    // Días del mes
    const turnos = getTurnos();
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const turnosDia = turnos.filter(t => t.fecha === dateStr && t.estado !== 'cancelado');
        const isToday = day === today.getDate() && month === today.getMonth();
        
        html += `<div class="calendar-date ${isToday ? 'today' : ''}" data-date="${dateStr}">
            ${day} ${turnosDia.length > 0 ? `<span style="font-size: 0.7em; color: var(--primary-color);">(${turnosDia.length})</span>` : ''}
        </div>`;
    }

    calendarGrid.innerHTML = html;

    // Actualizar mes/año
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthSpan = document.querySelector('.mini-calendar .calendar-month');
    if (monthSpan) {
        monthSpan.textContent = `${monthNames[month]} ${year}`;
    }
}

// ============================================
// 8. FILTROS DE TURNOS
// ============================================

function initFilters() {
    const filterInputs = document.querySelectorAll('.filters-bar input, .filters-bar select');
    
    filterInputs.forEach(input => {
        input.addEventListener('change', () => {
            const fecha = document.querySelector('.filters-bar input[type="date"]')?.value || '';
            const medicoSelect = document.querySelectorAll('.filters-bar select')[0];
            const estadoSelect = document.querySelectorAll('.filters-bar select')[1];
            
            const filters = {
                fecha: fecha || undefined,
                medicoId: medicoSelect?.value || undefined,
                estado: estadoSelect?.value || undefined
            };

            renderFilteredAppointments(filters);
        });
    });

    // Cargar médicos en el filtro
    const medicoFilter = document.querySelectorAll('.filters-bar select')[0];
    if (medicoFilter) {
        const medicos = getMedicos();
        medicoFilter.innerHTML = '<option value="">Todos los médicos</option>' +
            medicos.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
    }
}

function renderFilteredAppointments(filters) {
    const turnos = getFilteredTurnos(filters);
    const medicos = getMedicos();
    const pacientes = getPacientes();
    const tbody = document.querySelector('#appointments tbody');
    
    if (!tbody) return;

    if (turnos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No se encontraron turnos</td></tr>';
        return;
    }

    tbody.innerHTML = turnos.map(turno => {
        const paciente = pacientes.find(p => p.id === turno.pacienteId);
        const medico = medicos.find(m => m.id === turno.medicoId);
        
        return `
            <tr>
                <td>${turno.hora}</td>
                <td>${paciente ? paciente.nombre : 'N/A'}</td>
                <td>${medico ? medico.nombre : 'N/A'}</td>
                <td>${medico ? medico.especialidad : 'N/A'}</td>
                <td><span class="status-badge ${turno.estado}">${turno.estado}</span></td>
                <td>
                    <button class="btn-icon" title="Editar" onclick="editTurno(${turno.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" title="Cancelar" onclick="cancelTurnoAction(${turno.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// ============================================
// 9. INICIALIZACIÓN
// ============================================

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    initStorage();
    checkAuth();

    // Si estamos en landing.html
    if (document.getElementById('loginModal')) {
        // Event listeners para modales
        const loginForm = document.querySelector('.login-form');
        if (loginForm && !loginForm.onsubmit) {
            loginForm.addEventListener('submit', handleLogin);
        }

        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegister);
        }

        // Formateo automático de DNI
        const dniInput = document.getElementById('regDNI');
        if (dniInput) {
            dniInput.addEventListener('input', (e) => {
                formatDNI(e.target);
            });
            
            // Prevenir pegar texto no numérico
            dniInput.addEventListener('paste', (e) => {
                e.preventDefault();
                const paste = (e.clipboardData || window.clipboardData).getData('text');
                const numbers = paste.replace(/\D/g, '').substring(0, 8);
                e.target.value = '';
                e.target.focus();
                // Simular escritura para aplicar formato
                numbers.split('').forEach((char, index) => {
                    setTimeout(() => {
                        e.target.value += char;
                        formatDNI(e.target);
                    }, index * 10);
                });
            });
        }

        // Formateo automático de Fecha
        const fechaInput = document.getElementById('regFecha');
        if (fechaInput) {
            fechaInput.addEventListener('input', (e) => {
                formatFecha(e.target);
            });
            
            // Validar fecha al perder el foco
            fechaInput.addEventListener('blur', (e) => {
                const fecha = e.target.value.trim();
                if (fecha && !validateFecha(fecha)) {
                    e.target.style.borderColor = 'var(--error)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                } else {
                    e.target.style.borderColor = '';
                    e.target.style.boxShadow = '';
                }
            });
            
            // Prevenir pegar texto no numérico
            fechaInput.addEventListener('paste', (e) => {
                e.preventDefault();
                const paste = (e.clipboardData || window.clipboardData).getData('text');
                const numbers = paste.replace(/\D/g, '').substring(0, 8);
                e.target.value = '';
                e.target.focus();
                // Simular escritura para aplicar formato
                numbers.split('').forEach((char, index) => {
                    setTimeout(() => {
                        e.target.value += char;
                        formatFecha(e.target);
                    }, index * 10);
                });
            });
        }

        // Cerrar modales al hacer clic fuera
        document.getElementById('loginModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'loginModal') closeLoginModal();
        });

        document.getElementById('registerModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'registerModal') closeRegisterModal();
        });
    }

    // Si estamos en iniciado.html
    if (document.querySelector('.app-container')) {
        initNavigation();
        updateDashboard();
        renderAppointments();
        renderPatients();
        renderDoctors();
        initFilters();

        // Botones de nuevo turno
        document.getElementById('newAppointmentBtn')?.addEventListener('click', () => openAppointmentModal());
        document.getElementById('addAppointmentBtn')?.addEventListener('click', () => openAppointmentModal());

        // Botones del modal de turnos
        document.getElementById('saveAppointment')?.addEventListener('click', saveAppointment);
        document.getElementById('cancelAppointment')?.addEventListener('click', closeAppointmentModal);
        document.querySelector('.modal-close')?.addEventListener('click', closeAppointmentModal);

        // Cerrar modal al hacer clic fuera
        document.getElementById('appointmentModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'appointmentModal') closeAppointmentModal();
        });

        // Botón nuevo paciente
        const nuevoPacienteBtn = document.querySelector('#patients .btn-primary');
        if (nuevoPacienteBtn && !nuevoPacienteBtn.onclick) {
            nuevoPacienteBtn.addEventListener('click', openAddPacienteModal);
        }

        // Botón nuevo médico
        const nuevoMedicoBtn = document.querySelector('#doctors .btn-primary');
        if (nuevoMedicoBtn && !nuevoMedicoBtn.onclick) {
            nuevoMedicoBtn.addEventListener('click', openAddMedicoModal);
        }

        // Toggle sidebar en móvil
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }

        // Actualizar nombre de usuario
        const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || '{}');
        const userName = document.querySelector('.user-name');
        if (userName && currentUser.nombre) {
            userName.textContent = currentUser.nombre + ' ' + (currentUser.apellido || '');
        }
    }
});

// Exportar funciones globales necesarias
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.openRegisterModal = openRegisterModal;
window.closeRegisterModal = closeRegisterModal;
window.switchToRegister = switchToRegister;
window.switchToLogin = switchToLogin;
window.scrollToFeatures = scrollToFeatures;
window.handleLogin = handleLogin;
window.logout = logout;
window.editTurno = editTurno;
window.cancelTurnoAction = cancelTurnoAction;
window.editMedico = editMedico;
window.editPaciente = editPaciente;
window.verHistorial = verHistorial;
window.nuevoTurnoPaciente = nuevoTurnoPaciente;
window.openAddPacienteModal = openAddPacienteModal;
window.openAddMedicoModal = openAddMedicoModal;

