/**
 * Manejo de autenticación en el frontend
 */

import { authAPI, redirectByRole, isAuthenticated } from './api.js';

/**
 * Manejar login
 */
export async function handleLogin(event) {
  event.preventDefault();
  
  const form = event.target;
  const email = form.querySelector('#email').value;
  const password = form.querySelector('#password').value;
  const errorContainer = form.querySelector('.error-message');
  const submitButton = form.querySelector('button[type="submit"]');

  // Validación básica
  if (!email || !password) {
    showError(errorContainer, 'Por favor completa todos los campos');
    return;
  }

  // Deshabilitar botón y mostrar loading
  submitButton.disabled = true;
  submitButton.textContent = 'Iniciando sesión...';

  try {
    const response = await authAPI.login(email, password);
    
    // Éxito - redirigir según rol
    showSuccess('Login exitoso. Redirigiendo...');
    setTimeout(() => {
      redirectByRole();
    }, 1000);
    
  } catch (error) {
    showError(errorContainer, error.message || 'Error al iniciar sesión');
    submitButton.disabled = false;
    submitButton.textContent = 'Iniciar Sesión';
  }
}

/**
 * Manejar registro
 */
export async function handleRegister(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  
  // Validar contraseñas
  if (data.password !== data.confirmPassword) {
    showError(form.querySelector('.error-message'), 'Las contraseñas no coinciden');
    return;
  }

  // Validar formato de contraseña
  if (!/(?=.*[A-Z])(?=.*\d).{8,32}/.test(data.password)) {
    showError(form.querySelector('.error-message'), 
      'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número');
    return;
  }

  // Preparar datos para el backend
  const registerData = {
    email: data.email,
    password: data.password,
    nombre: data.nombre,
    apellido: data.apellido,
    dni: data.dni,
    fechaNacimiento: formatDateForAPI(data.fecha_de_nacimiento),
    telefono: data.telefono || null,
    direccion: data.direccion || null,
    rol: data.rol || 'PACIENTE',
    // Datos específicos por rol
    ...(data.rol === 'MEDICO' && {
      matricula: data.matricula,
      especialidadId: data.especialidadId
    }),
    ...(data.rol === 'PACIENTE' && {
      contactoEmergencia: data.contactoEmergencia || null,
      telefonoEmergencia: data.telefonoEmergencia || null,
      obraSocial: data.obraSocial || null,
      numeroAfiliado: data.numeroAfiliado || null
    })
  };

  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Registrando...';

  try {
    const response = await authAPI.register(registerData);
    
    showSuccess('Registro exitoso. Redirigiendo...');
    setTimeout(() => {
      redirectByRole();
    }, 1000);
    
  } catch (error) {
    showError(form.querySelector('.error-message'), 
      error.message || 'Error al registrar usuario');
    submitButton.disabled = false;
    submitButton.textContent = 'Crear Cuenta';
  }
}

/**
 * Verificar autenticación y redirigir si es necesario
 */
export function checkAuth() {
  if (isAuthenticated()) {
    // Si está en página de login/registro, redirigir al dashboard
    if (window.location.pathname.includes('login.html') || 
        window.location.pathname.includes('register.html')) {
      redirectByRole();
    }
  } else {
    // Si no está autenticado y está en dashboard, redirigir a login
    if (window.location.pathname.includes('dashboard')) {
      window.location.href = '/login.html';
    }
  }
}

/**
 * Cerrar sesión
 */
export async function handleLogout() {
  try {
    await authAPI.logout();
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    // Aún así, limpiar localStorage y redirigir
    localStorage.clear();
    window.location.href = '/index.html';
  }
}

/**
 * Formatear fecha para API (de DD/MM/YYYY a YYYY-MM-DD)
 */
function formatDateForAPI(dateString) {
  if (!dateString) return null;
  
  // Si ya está en formato YYYY-MM-DD, retornar
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Si está en formato DD/MM/YYYY, convertir
  const parts = dateString.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  
  return dateString;
}

/**
 * Mostrar error
 */
function showError(container, message) {
  if (!container) {
    // Crear contenedor si no existe
    container = document.createElement('div');
    container.className = 'error-message';
    const form = document.querySelector('form');
    if (form) {
      form.insertBefore(container, form.firstChild);
    }
  }
  
  container.textContent = message;
  container.style.display = 'block';
  container.style.color = '#ef4444';
  container.style.padding = '10px';
  container.style.marginBottom = '10px';
  container.style.borderRadius = '4px';
  container.style.backgroundColor = '#fee2e2';
  
  // Ocultar después de 5 segundos
  setTimeout(() => {
    container.style.display = 'none';
  }, 5000);
}

/**
 * Mostrar mensaje de éxito
 */
function showSuccess(message) {
  const container = document.createElement('div');
  container.className = 'success-message';
  container.textContent = message;
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 10000;
  `;
  
  document.body.appendChild(container);
  
  setTimeout(() => {
    container.remove();
  }, 3000);
}

// Verificar autenticación al cargar la página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAuth);
} else {
  checkAuth();
}

