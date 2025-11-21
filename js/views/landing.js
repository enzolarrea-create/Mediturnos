// ============================================
// VISTA LANDING - LOGIN Y REGISTRO
// ============================================

import { AuthManager } from '../modules/auth.js';
import { NotificationManager } from '../modules/notifications.js';
import { Router } from '../modules/router.js';
import { StorageManager } from '../modules/storage.js';
import { FormValidator } from '../components/form.js';

class LandingView {
    constructor() {
        // Asegurar inicialización de storage antes de todo
        StorageManager.init();
        this.init();
    }

    init() {
        this.setupModals();
        this.setupForms();
        this.setupNavigation();
    }

    setupModals() {
        // Funciones globales para modales
        window.openLoginModal = () => {
            const modal = document.getElementById('loginModal');
            if (modal) {
                modal.classList.add('active');
                document.body.classList.add('modal-open');
            }
        };

        window.closeLoginModal = () => {
            const modal = document.getElementById('loginModal');
            if (modal) {
                modal.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
        };

        window.openRegisterModal = () => {
            const modal = document.getElementById('registerModal');
            if (modal) {
                modal.classList.add('active');
                document.body.classList.add('modal-open');
            }
        };

        window.closeRegisterModal = () => {
            const modal = document.getElementById('registerModal');
            if (modal) {
                modal.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
        };

        window.switchToRegister = () => {
            this.closeLoginModal();
            setTimeout(() => this.openRegisterModal(), 300);
        };

        window.switchToLogin = () => {
            this.closeRegisterModal();
            setTimeout(() => this.openLoginModal(), 300);
        };

        // Cerrar modales al hacer clic fuera
        document.getElementById('loginModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'loginModal') this.closeLoginModal();
        });

        document.getElementById('registerModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'registerModal') this.closeRegisterModal();
        });
    }

    setupForms() {
        // Formulario de login
        const loginForm = document.querySelector('#loginModal form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(e.target);
            });
        }

        // Formulario de registro
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister(e.target);
            });
        }
    }

    async handleLogin(form) {
        const emailInput = form.querySelector('[name="email"]');
        const passwordInput = form.querySelector('[name="password"]');
        
        if (!emailInput || !passwordInput) {
            NotificationManager.error('Error: No se encontraron los campos del formulario');
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            NotificationManager.error('Por favor completa todos los campos');
            return;
        }

        // Asegurar inicialización antes del login
        StorageManager.init();

        const result = AuthManager.login(email, password);

        if (result.success) {
            NotificationManager.success('Inicio de sesión exitoso');
            setTimeout(() => {
                Router.redirectByRole(result.user.rol);
            }, 500);
        } else {
            NotificationManager.error(result.message || 'Error al iniciar sesión');
            // Mostrar ayuda adicional
            console.error('Error de login. Usuarios disponibles:', StorageManager.get('mediturnos_users'));
        }
    }

    async handleRegister(form) {
        const formData = new FormData(form);
        const userData = {
            nombre: formData.get('nombre'),
            apellido: formData.get('apellido'),
            dni: formData.get('dni'),
            fechaNacimiento: formData.get('fecha_de_nacimiento'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            rol: 'paciente' // Por defecto paciente
        };

        // Validaciones básicas
        if (userData.password !== userData.confirmPassword) {
            NotificationManager.error('Las contraseñas no coinciden');
            return;
        }

        if (userData.password.length < 8) {
            NotificationManager.error('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        const result = AuthManager.register(userData);

        if (result.success) {
            NotificationManager.success('Registro exitoso. Redirigiendo...');
            setTimeout(() => {
                Router.redirectByRole(result.user.rol);
            }, 1000);
        } else {
            NotificationManager.error(result.message || 'Error al registrar');
        }
    }

    setupNavigation() {
        window.scrollToFeatures = () => {
            const features = document.getElementById('features');
            if (features) {
                features.scrollIntoView({ behavior: 'smooth' });
            }
        };
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new LandingView();
        // Cargar utilidades de debug
        import('../utils/debug.js').then(() => {
            console.log('Utilidades de debug cargadas. Usa checkStorage() o reinitStorage() en la consola.');
        });
    });
} else {
    new LandingView();
    // Cargar utilidades de debug
    import('../utils/debug.js').then(() => {
        console.log('Utilidades de debug cargadas. Usa checkStorage() o reinitStorage() en la consola.');
    });
}

