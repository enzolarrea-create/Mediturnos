/**
 * Utilidades generales del frontend
 */

// Formatear fecha para mostrar
export const formatFecha = (fecha) => {
  if (!fecha) return '';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Formatear fecha y hora
export const formatFechaHora = (fecha, hora) => {
  const fechaStr = formatFecha(fecha);
  return `${fechaStr} ${hora}`;
};

// Formatear DNI
export const formatDNI = (dni) => {
  if (!dni) return '';
  // Si ya tiene formato, retornarlo
  if (dni.includes('.')) return dni;
  // Formatear: 12345678 -> 12.345.678
  return dni.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Formatear estado de turno
export const formatEstadoTurno = (estado) => {
  const estados = {
    PENDIENTE: 'Pendiente',
    CONFIRMADO: 'Confirmado',
    CANCELADO: 'Cancelado',
    AUSENTE: 'Ausente',
    COMPLETADO: 'Completado',
  };
  return estados[estado] || estado;
};

// Obtener clase CSS para estado
export const getEstadoClass = (estado) => {
  const clases = {
    PENDIENTE: 'pendiente',
    CONFIRMADO: 'confirmado',
    CANCELADO: 'cancelado',
    AUSENTE: 'ausente',
    COMPLETADO: 'completado',
  };
  return clases[estado] || '';
};

// Mostrar notificación toast
export const showToast = (message, type = 'info') => {
  // Crear elemento toast si no existe
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bgColor = {
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  }[type] || '#3b82f6';

  toast.style.cssText = `
    background: ${bgColor};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    animation: slideIn 0.3s ease-out;
    min-width: 250px;
  `;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  // Remover después de 3 segundos
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
};

// Agregar estilos de animación si no existen
if (!document.getElementById('toast-styles')) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// Validar email
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validar DNI (formato argentino)
export const isValidDNI = (dni) => {
  const dniClean = dni.replace(/\./g, '');
  return /^\d{7,8}$/.test(dniClean);
};

// Validar fecha (formato dd/mm/yyyy)
export const isValidDate = (dateStr) => {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return false;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  const date = new Date(year, month - 1, day);
  return (
    date.getDate() === day &&
    date.getMonth() === month - 1 &&
    date.getFullYear() === year
  );
};

// Formatear nombre completo
export const formatNombreCompleto = (nombre, apellido) => {
  return `${nombre} ${apellido}`.trim();
};

// Obtener nombre del día de la semana
export const getDiaSemana = (diaNum) => {
  const dias = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ];
  return dias[diaNum] || '';
};

