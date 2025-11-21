/**
 * Cliente API simple para MediTurnos
 */

const API_BASE_URL = 'http://localhost:3000/api';

// Función helper para hacer requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    credentials: 'include', // Importante para las sesiones
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('No se pudo conectar al servidor. Verifica que el backend esté corriendo en http://localhost:3000');
    }
    throw error;
  }
}

// Autenticación
export const authAPI = {
  register: (userData) => apiRequest('/auth/register', { method: 'POST', body: userData }),
  login: (email, password) => apiRequest('/auth/login', { method: 'POST', body: { email, password } }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  getMe: () => apiRequest('/auth/me'),
};

// Turnos
export const turnosAPI = {
  listar: (filtros = {}) => {
    const query = new URLSearchParams(filtros).toString();
    return apiRequest(`/turnos${query ? `?${query}` : ''}`);
  },
  crear: (turnoData) => apiRequest('/turnos', { method: 'POST', body: turnoData }),
  cancelar: (id) => apiRequest(`/turnos/${id}`, { method: 'DELETE' }),
};

// Médicos
export const medicosAPI = {
  listar: () => apiRequest('/medicos'),
};

// Pacientes
export const pacientesAPI = {
  listar: () => apiRequest('/pacientes'),
};

// Especialidades
export const especialidadesAPI = {
  listar: () => apiRequest('/especialidades'),
};

