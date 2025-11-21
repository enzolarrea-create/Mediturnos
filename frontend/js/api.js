/**
 * Cliente API para MediTurnos
 * Maneja todas las llamadas al backend
 */

const API_BASE_URL = 'http://localhost:3000/api';

// Almacenar token en localStorage
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

/**
 * Función helper para hacer requests
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

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
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Si el token es inválido, redirigir al login
      if (response.status === 401) {
        removeToken();
        if (window.location.pathname !== '/landing.html') {
          window.location.href = '/landing.html';
        }
      }
      throw new Error(data.error || data.message || 'Error en la petición');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ==================== AUTENTICACIÓN ====================

export const authAPI = {
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.token) {
      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },

  logout: () => {
    removeToken();
    localStorage.removeItem('user');
    window.location.href = '/landing.html';
  },

  getMe: async () => {
    return apiRequest('/auth/me');
  },
};

// ==================== TURNOS ====================

export const turnosAPI = {
  listar: async (filtros = {}) => {
    const queryParams = new URLSearchParams(filtros).toString();
    const endpoint = `/turnos${queryParams ? `?${queryParams}` : ''}`;
    return apiRequest(endpoint);
  },

  obtener: async (id) => {
    return apiRequest(`/turnos/${id}`);
  },

  crear: async (turnoData) => {
    return apiRequest('/turnos', {
      method: 'POST',
      body: JSON.stringify(turnoData),
    });
  },

  modificar: async (id, turnoData) => {
    return apiRequest(`/turnos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(turnoData),
    });
  },

  cancelar: async (id) => {
    return apiRequest(`/turnos/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== PACIENTES ====================

export const pacientesAPI = {
  listar: async (filtros = {}) => {
    const queryParams = new URLSearchParams(filtros).toString();
    const endpoint = `/pacientes${queryParams ? `?${queryParams}` : ''}`;
    return apiRequest(endpoint);
  },

  obtener: async (id) => {
    return apiRequest(`/pacientes/${id}`);
  },

  obtenerHistorial: async (id) => {
    return apiRequest(`/pacientes/${id}/historial`);
  },
};

// ==================== MÉDICOS ====================

export const medicosAPI = {
  listar: async (filtros = {}) => {
    const queryParams = new URLSearchParams(filtros).toString();
    const endpoint = `/medicos${queryParams ? `?${queryParams}` : ''}`;
    return apiRequest(endpoint);
  },

  obtener: async (id) => {
    return apiRequest(`/medicos/${id}`);
  },

  crear: async (medicoData) => {
    return apiRequest('/medicos', {
      method: 'POST',
      body: JSON.stringify(medicoData),
    });
  },

  actualizar: async (id, medicoData) => {
    return apiRequest(`/medicos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(medicoData),
    });
  },

  eliminar: async (id) => {
    return apiRequest(`/medicos/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== DISPONIBILIDAD ====================

export const disponibilidadAPI = {
  obtener: async (medicoId) => {
    return apiRequest(`/disponibilidad/${medicoId}`);
  },

  crear: async (disponibilidadData) => {
    return apiRequest('/disponibilidad', {
      method: 'POST',
      body: JSON.stringify(disponibilidadData),
    });
  },

  actualizar: async (id, disponibilidadData) => {
    return apiRequest(`/disponibilidad/${id}`, {
      method: 'PUT',
      body: JSON.stringify(disponibilidadData),
    });
  },

  eliminar: async (id) => {
    return apiRequest(`/disponibilidad/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== ESPECIALIDADES ====================

export const especialidadesAPI = {
  listar: async () => {
    return apiRequest('/especialidades');
  },

  crear: async (especialidadData) => {
    return apiRequest('/especialidades', {
      method: 'POST',
      body: JSON.stringify(especialidadData),
    });
  },

  actualizar: async (id, especialidadData) => {
    return apiRequest(`/especialidades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(especialidadData),
    });
  },
};

// ==================== NOTAS MÉDICAS ====================

export const notasMedicasAPI = {
  crear: async (notaData) => {
    return apiRequest('/notas-medicas', {
      method: 'POST',
      body: JSON.stringify(notaData),
    });
  },

  obtenerPorTurno: async (turnoId) => {
    return apiRequest(`/notas-medicas/turno/${turnoId}`);
  },
};

// ==================== NOTIFICACIONES ====================

export const notificacionesAPI = {
  listar: async (filtros = {}) => {
    const queryParams = new URLSearchParams(filtros).toString();
    const endpoint = `/notificaciones${queryParams ? `?${queryParams}` : ''}`;
    return apiRequest(endpoint);
  },

  marcarComoLeida: async (id) => {
    return apiRequest(`/notificaciones/${id}/leida`, {
      method: 'PUT',
    });
  },

  marcarTodasComoLeidas: async () => {
    return apiRequest('/notificaciones/marcar-todas', {
      method: 'PUT',
    });
  },
};

