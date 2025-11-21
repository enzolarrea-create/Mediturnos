/**
 * Script para la landing page
 */

import { handleRegister, handleLogin } from './auth.js';
import { showToast } from './utils.js';

// Funciones para abrir/cerrar modales
window.openLoginModal = function() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.classList.add('active');
    document.body.classList.add('modal-open');
  }
};

window.closeLoginModal = function() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
};

window.openRegisterModal = function() {
  const modal = document.getElementById('registerModal');
  if (modal) {
    modal.classList.add('active');
    document.body.classList.add('modal-open');
  }
};

window.closeRegisterModal = function() {
  const modal = document.getElementById('registerModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
};

window.switchToRegister = function() {
  closeLoginModal();
  setTimeout(() => {
    openRegisterModal();
  }, 300);
};

window.switchToLogin = function() {
  closeRegisterModal();
  setTimeout(() => {
    openLoginModal();
  }, 300);
};

window.scrollToFeatures = function() {
  const featuresSection = document.getElementById('features');
  if (featuresSection) {
    featuresSection.scrollIntoView({ behavior: 'smooth' });
  }
};

// Manejar login
window.handleLogin = async function(event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showToast('Por favor completa todos los campos', 'error');
    return;
  }

  const submitBtn = event.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';

  try {
    const result = await handleLogin(email, password);
    
    if (result.success) {
      showToast('Inicio de sesión exitoso', 'success');
      setTimeout(() => {
        window.location.href = '/iniciado.html';
      }, 1000);
    } else {
      showToast(result.error || 'Error al iniciar sesión', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  } catch (error) {
    showToast(error.message || 'Error al iniciar sesión', 'error');
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
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
        dni: document.getElementById('regDNI').value,
        fecha_de_nacimiento: document.getElementById('regFecha').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value,
        confirmPassword: document.getElementById('regConfirmPassword').value,
      };

      // Validaciones
      if (formData.password !== formData.confirmPassword) {
        showToast('Las contraseñas no coinciden', 'error');
        return;
      }

      if (formData.password.length < 8) {
        showToast('La contraseña debe tener al menos 8 caracteres', 'error');
        return;
      }

      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando cuenta...';

      try {
        const result = await handleRegister(formData);
        
        if (result.success) {
          showToast('Cuenta creada exitosamente', 'success');
          setTimeout(() => {
            window.location.href = '/iniciado.html';
          }, 1000);
        } else {
          showToast(result.error || 'Error al crear la cuenta', 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      } catch (error) {
        showToast(error.message || 'Error al crear la cuenta', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // Formatear DNI automáticamente
  const dniInput = document.getElementById('regDNI');
  if (dniInput) {
    dniInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\./g, '');
      if (value.length > 8) value = value.substring(0, 8);
      if (value.length > 2) {
        value = value.substring(0, 2) + '.' + value.substring(2);
      }
      if (value.length > 6) {
        value = value.substring(0, 6) + '.' + value.substring(6);
      }
      e.target.value = value;
    });
  }

  // Formatear fecha automáticamente
  const fechaInput = document.getElementById('regFecha');
  if (fechaInput) {
    fechaInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2);
      }
      if (value.length > 5) {
        value = value.substring(0, 5) + '/' + value.substring(5, 9);
      }
      e.target.value = value;
    });
  }

  // Cerrar modales al hacer clic fuera
  const modals = document.querySelectorAll('.login-modal');
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
      }
    });
  });
});

