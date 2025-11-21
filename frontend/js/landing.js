import { handleRegister, handleLogin } from './auth.js';

window.openLoginModal = () => {
  document.getElementById('loginModal').classList.add('active');
  document.body.classList.add('modal-open');
};

window.closeLoginModal = () => {
  document.getElementById('loginModal').classList.remove('active');
  document.body.classList.remove('modal-open');
};

window.openRegisterModal = () => {
  document.getElementById('registerModal').classList.add('active');
  document.body.classList.add('modal-open');
};

window.closeRegisterModal = () => {
  document.getElementById('registerModal').classList.remove('active');
  document.body.classList.remove('modal-open');
};

window.switchToRegister = () => {
  closeLoginModal();
  setTimeout(openRegisterModal, 300);
};

window.switchToLogin = () => {
  closeRegisterModal();
  setTimeout(openLoginModal, 300);
};

window.handleLogin = async function(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    alert('Completa todos los campos');
    return;
  }

  const result = await handleLogin(email, password);
  if (result.success) {
    alert('Login exitoso');
    window.location.href = '/iniciado.html';
  } else {
    alert(result.error || 'Error al iniciar sesión');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = {
        nombre: document.getElementById('regNombre').value,
        apellido: document.getElementById('regApellido').value,
        dni: document.getElementById('regDNI').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value,
      };

      if (formData.password !== document.getElementById('regConfirmPassword').value) {
        alert('Las contraseñas no coinciden');
        return;
      }

      const result = await handleRegister(formData);
      if (result.success) {
        alert('Cuenta creada');
        window.location.href = '/iniciado.html';
      } else {
        alert(result.error || 'Error al crear cuenta');
      }
    });
  }
});
