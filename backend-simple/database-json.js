/**
 * Base de datos simple usando JSON
 * No requiere compilación, funciona inmediatamente
 */

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'database.json');

// Inicializar base de datos si no existe
function initDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      usuarios: [],
      especialidades: [
        { id: 1, nombre: 'Cardiología', descripcion: 'Especialidad del corazón' },
        { id: 2, nombre: 'Dermatología', descripcion: 'Especialidad de la piel' },
        { id: 3, nombre: 'Pediatría', descripcion: 'Especialidad de niños' }
      ],
      medicos: [],
      disponibilidad: [],
      turnos: [],
      notas_medicas: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    console.log('✅ Base de datos JSON creada');
  }
}

// Leer base de datos
function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error leyendo DB:', error);
    return null;
  }
}

// Escribir base de datos
function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error escribiendo DB:', error);
    return false;
  }
}

// Funciones helper
const db = {
  // Usuarios
  getUsuario: (id) => {
    const data = readDB();
    return data.usuarios.find(u => u.id === id);
  },
  
  getUsuarioByEmail: (email) => {
    const data = readDB();
    return data.usuarios.find(u => u.email === email);
  },
  
  createUsuario: (usuario) => {
    const data = readDB();
    const newId = data.usuarios.length > 0 
      ? Math.max(...data.usuarios.map(u => u.id)) + 1 
      : 1;
    usuario.id = newId;
    usuario.created_at = new Date().toISOString();
    data.usuarios.push(usuario);
    writeDB(data);
    return usuario;
  },
  
  getUsuariosByRol: (rol) => {
    const data = readDB();
    return data.usuarios.filter(u => u.rol === rol && u.activo !== false);
  },
  
  // Médicos
  getMedicos: () => {
    const data = readDB();
    return data.medicos.map(medico => {
      const usuario = data.usuarios.find(u => u.id === medico.usuario_id);
      return { ...medico, ...usuario };
    }).filter(m => m.activo !== false);
  },
  
  createMedico: (medico) => {
    const data = readDB();
    const newId = data.medicos.length > 0 
      ? Math.max(...data.medicos.map(m => m.id)) + 1 
      : 1;
    medico.id = newId;
    data.medicos.push(medico);
    writeDB(data);
    return medico;
  },
  
  getMedicoByUsuarioId: (usuarioId) => {
    const data = readDB();
    return data.medicos.find(m => m.usuario_id === usuarioId);
  },
  
  // Turnos
  getTurnos: (filtros = {}) => {
    const data = readDB();
    let turnos = data.turnos.map(turno => {
      const paciente = data.usuarios.find(u => u.id === turno.paciente_id);
      const medico = data.medicos.find(m => m.id === turno.medico_id);
      const medicoUsuario = medico ? data.usuarios.find(u => u.id === medico.usuario_id) : null;
      
      return {
        ...turno,
        paciente_nombre: paciente?.nombre,
        paciente_apellido: paciente?.apellido,
        paciente_dni: paciente?.dni,
        medico_nombre: medicoUsuario?.nombre,
        medico_apellido: medicoUsuario?.apellido,
        matricula: medico?.matricula
      };
    });
    
    // Aplicar filtros
    if (filtros.paciente_id) {
      turnos = turnos.filter(t => t.paciente_id === parseInt(filtros.paciente_id));
    }
    if (filtros.medico_id) {
      turnos = turnos.filter(t => t.medico_id === parseInt(filtros.medico_id));
    }
    if (filtros.fecha) {
      turnos = turnos.filter(t => t.fecha === filtros.fecha);
    }
    
    return turnos.sort((a, b) => {
      if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
      return a.hora.localeCompare(b.hora);
    });
  },
  
  createTurno: (turno) => {
    const data = readDB();
    const newId = data.turnos.length > 0 
      ? Math.max(...data.turnos.map(t => t.id)) + 1 
      : 1;
    turno.id = newId;
    turno.created_at = new Date().toISOString();
    data.turnos.push(turno);
    writeDB(data);
    return turno;
  },
  
  updateTurno: (id, updates) => {
    const data = readDB();
    const index = data.turnos.findIndex(t => t.id === id);
    if (index !== -1) {
      data.turnos[index] = { ...data.turnos[index], ...updates };
      writeDB(data);
      return data.turnos[index];
    }
    return null;
  },
  
  deleteTurno: (id) => {
    const data = readDB();
    const index = data.turnos.findIndex(t => t.id === id);
    if (index !== -1) {
      data.turnos.splice(index, 1);
      writeDB(data);
      return true;
    }
    return false;
  },
  
  // Especialidades
  getEspecialidades: () => {
    const data = readDB();
    return data.especialidades;
  },
  
  // Disponibilidad
  getDisponibilidad: (medicoId) => {
    const data = readDB();
    return data.disponibilidad.filter(d => d.medico_id === medicoId && d.activo !== false);
  }
};

// Inicializar al cargar
initDatabase();

// Exportar funciones de lectura/escritura para el seed
db.readDB = readDB;
db.writeDB = writeDB;

module.exports = db;

