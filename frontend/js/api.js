/**
 * Cliente API para Mediturnos
 * Maneja todas las comunicaciones con el backend
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Obtener token de autenticación del localStorage
 */
function getAuthToken() {
  return localStorage.getItem('authToken');
}

/**
 * Realizar petición HTTP con autenticación
 */
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Si la respuesta no es exitosa, lanzar error
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: 'Error desconocido',
        message: `Error ${response.status}: ${response.statusText}`
      }));
      throw new Error(errorData.message || errorData.error || 'Error en la petición');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en API request:', error);
    throw error;
  }
}

/**
 * API de Autenticación
 */
export const authAPI = {
  async register(userData) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async login(email, password) {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Guardar token
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  async logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
  },

  async getCurrentUser() {
    return apiRequest('/auth/me');
  },

  async updateProfile(data) {
    return apiRequest('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async changePassword(currentPassword, newPassword) {
    return apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

/**
 * API de Turnos
 */
export const turnosAPI = {
  async getAll(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/turnos?${queryParams}`);
  },

  async getById(id) {
    return apiRequest(`/turnos/${id}`);
  },

  async create(turnoData) {
    return apiRequest('/turnos', {
      method: 'POST',
      body: JSON.stringify(turnoData),
    });
  },

  async update(id, turnoData) {
    return apiRequest(`/turnos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(turnoData),
    });
  },

  async cancel(id) {
    return apiRequest(`/turnos/${id}`, {
      method: 'DELETE',
    });
  },

  async getDisponibles(medicoId, fecha) {
    return apiRequest(`/turnos/disponibles?medicoId=${medicoId}&fecha=${fecha}`);
  },
};

/**
 * API de Pacientes
 */
export const pacientesAPI = {
  async getAll(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/pacientes?${queryParams}`);
  },

  async getById(id) {
    return apiRequest(`/pacientes/${id}`);
  },

  async getMiPerfil() {
    return apiRequest('/pacientes/me');
  },

  async updateMiPerfil(data) {
    return apiRequest('/pacientes/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getTurnos(id, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/pacientes/${id}/turnos?${queryParams}`);
  },

  async getHistorial(id) {
    return apiRequest(`/pacientes/${id}/historial`);
  },
};

/**
 * API de Médicos
 */
export const medicosAPI = {
  async getAll(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/medicos?${queryParams}`);
  },

  async getById(id) {
    return apiRequest(`/medicos/${id}`);
  },

  async getMiPerfil() {
    return apiRequest('/medicos/me');
  },

  async getTurnos(id, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/medicos/${id}/turnos?${queryParams}`);
  },

  async getDisponibilidad(id) {
    return apiRequest(`/medicos/${id}/disponibilidad`);
  },
};

/**
 * API de Especialidades
 */
export const especialidadesAPI = {
  async getAll(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/especialidades?${queryParams}`);
  },

  async getById(id) {
    return apiRequest(`/especialidades/${id}`);
  },

  async create(data) {
    return apiRequest('/especialidades', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id, data) {
    return apiRequest(`/especialidades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id) {
    return apiRequest(`/especialidades/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * API de Disponibilidades
 */
export const disponibilidadesAPI = {
  async getByMedico(medicoId) {
    return apiRequest(`/disponibilidades/medico/${medicoId}`);
  },

  async create(data) {
    return apiRequest('/disponibilidades', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id, data) {
    return apiRequest(`/disponibilidades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id) {
    return apiRequest(`/disponibilidades/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * API de Notificaciones
 */
export const notificacionesAPI = {
  async getAll(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/notificaciones?${queryParams}`);
  },

  async getUnreadCount() {
    return apiRequest('/notificaciones/unread-count');
  },

  async markAsRead(id) {
    return apiRequest(`/notificaciones/${id}/read`, {
      method: 'PUT',
    });
  },

  async markAllAsRead() {
    return apiRequest('/notificaciones/read-all', {
      method: 'PUT',
    });
  },

  async delete(id) {
    return apiRequest(`/notificaciones/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * API de Estadísticas
 */
export const estadisticasAPI = {
  async getDashboard() {
    return apiRequest('/estadisticas/dashboard');
  },

  async getTurnos(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/estadisticas/turnos?${queryParams}`);
  },

  async getMedicos() {
    return apiRequest('/estadisticas/medicos');
  },
};

/**
 * Verificar si el usuario está autenticado
 */
export function isAuthenticated() {
  return !!getAuthToken();
}

/**
 * Obtener información del usuario actual
 */
export function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Obtener rol del usuario actual
 */
export function getCurrentUserRole() {
  const user = getCurrentUser();
  return user ? user.rol : null;
}

/**
 * Redirigir según el rol del usuario
 */
export function redirectByRole() {
  const role = getCurrentUserRole();
  const roleMap = {
    'PACIENTE': '/dashboard/paciente.html',
    'MEDICO': '/dashboard/medico.html',
    'SECRETARIO': '/dashboard/secretario.html',
    'ADMINISTRADOR': '/dashboard/administrador.html',
  };
  
  const redirectPath = roleMap[role];
  if (redirectPath) {
    window.location.href = redirectPath;
  } else {
    window.location.href = '/index.html';
  }
}

