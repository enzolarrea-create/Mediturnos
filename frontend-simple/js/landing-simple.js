/**
 * Script simple para la landing page
 */

import { authAPI } from './api-simple.js';

// Funciones para modales
window.openLoginModal = function() {
  document.getElementById('loginModal').classList.add('active');
  document.body.classList.add('modal-open');
};

window.closeLoginModal = function() {
  document.getElementById('loginModal').classList.remove('active');
  document.body.classList.remove('modal-open');
};

window.openRegisterModal = function() {
  document.getElementById('registerModal').classList.add('active');
  document.body.classList.add('modal-open');
};

window.closeRegisterModal = function() {
  document.getElementById('registerModal').classList.remove('active');
  document.body.classList.remove('modal-open');
};

window.switchToRegister = function() {
  closeLoginModal();
  setTimeout(openRegisterModal, 300);
};

window.switchToLogin = function() {
  closeRegisterModal();
  setTimeout(openLoginModal, 300);
};

// Manejar login
window.handleLogin = async function(event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    alert('Por favor completa todos los campos');
    return;
  }

  try {
    const result = await authAPI.login(email, password);
    alert('Inicio de sesión exitoso');
    window.location.href = '/iniciado.html';
  } catch (error) {
    console.error('Error de login:', error);
    alert(error.message || 'Error al iniciar sesión. Verifica que el backend esté corriendo en http://localhost:3000');
  }
};

// Manejar registro
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  
  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = {
        nombre: document.getElementById('regNombre').value,
        apellido: document.getElementById('regApellido').value,
        dni: document.getElementById('regDNI').value.replace(/\./g, ''),
        fecha_de_nacimiento: document.getElementById('regFecha').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value,
      };

      if (formData.password !== document.getElementById('regConfirmPassword').value) {
        alert('Las contraseñas no coinciden');
        return;
      }

      try {
        await authAPI.register(formData);
        alert('Cuenta creada exitosamente');
        window.location.href = '/iniciado.html';
      } catch (error) {
        alert(error.message || 'Error al crear la cuenta');
      }
    });
  }

  // Cerrar modales al hacer clic fuera
  document.querySelectorAll('.login-modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
      }
    });
  });
});

