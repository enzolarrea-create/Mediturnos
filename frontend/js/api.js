// CONFIGURAR ESTA URL CON TU LINK DE RENDER
const API_BASE_URL = 'https://tu-backend.onrender.com/api';

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    credentials: 'include',
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
      throw new Error(data.error || `Error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    if (error.message.includes('Failed to fetch')) {
      throw new Error('No se pudo conectar al servidor');
    }
    throw error;
  }
}

export const authAPI = {
  register: (userData) => apiRequest('/auth/register', { method: 'POST', body: userData }),
  login: (email, password) => apiRequest('/auth/login', { method: 'POST', body: { email, password } }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  getMe: () => apiRequest('/auth/me'),
};

export const turnosAPI = {
  listar: (filtros = {}) => {
    const query = new URLSearchParams(filtros).toString();
    return apiRequest(`/turnos${query ? `?${query}` : ''}`);
  },
  crear: (turnoData) => apiRequest('/turnos', { method: 'POST', body: turnoData }),
  cancelar: (id) => apiRequest(`/turnos/${id}`, { method: 'DELETE' }),
};

export const medicosAPI = {
  listar: () => apiRequest('/medicos'),
};

export const pacientesAPI = {
  listar: () => apiRequest('/pacientes'),
};

export const especialidadesAPI = {
  listar: () => apiRequest('/especialidades'),
};
