/**
 * Lógica de autenticación del frontend
 */

import { authAPI } from './api.js';

// Verificar si el usuario está autenticado
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Obtener usuario actual
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Manejar registro
export const handleRegister = async (formData) => {
  try {
    // Convertir fecha de formato dd/mm/yyyy a yyyy-mm-dd
    const fechaParts = formData.fecha_de_nacimiento.split('/');
    const fechaNacimiento = `${fechaParts[2]}-${fechaParts[1]}-${fechaParts[0]}`;

    const userData = {
      email: formData.email,
      password: formData.password,
      nombre: formData.nombre,
      apellido: formData.apellido,
      dni: formData.dni.replace(/\./g, ''), // Remover puntos del DNI
      fechaNacimiento,
      telefono: formData.telefono || null,
      direccion: formData.direccion || null,
    };

    const response = await authAPI.register(userData);
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return { success: true, user: response.user };
    }
    
    return { success: false, error: 'Error en el registro' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Manejar login
export const handleLogin = async (email, password) => {
  try {
    const response = await authAPI.login(email, password);
    return { success: true, user: response.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Manejar logout
export const handleLogout = () => {
  authAPI.logout();
};

// Formatear rol para mostrar
export const formatRol = (rol) => {
  const roles = {
    PACIENTE: 'Paciente',
    MEDICO: 'Médico',
    SECRETARIO: 'Secretario',
    ADMINISTRADOR: 'Administrador',
  };
  return roles[rol] || rol;
};

