import { authAPI } from './api.js';

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const handleRegister = async (formData) => {
  try {
    const userData = {
      email: formData.email,
      password: formData.password,
      nombre: formData.nombre,
      apellido: formData.apellido,
      dni: formData.dni.replace(/\./g, ''),
      telefono: formData.telefono || null,
    };

    const response = await authAPI.register(userData);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const handleLogin = async (email, password) => {
  try {
    const response = await authAPI.login(email, password);
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return { success: true, user: response.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const handleLogout = () => {
  authAPI.logout();
  localStorage.removeItem('user');
  window.location.href = '/landing.html';
};
