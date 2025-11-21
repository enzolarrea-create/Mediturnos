/**
 * Seed simple para poblar la base de datos JSON
 * Ejecutar: node seed-json.js
 */

const db = require('./database-json');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'database.json');

function readDB() {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

async function seed() {
  console.log('🌱 Iniciando seed...');

  // Limpiar datos existentes (excepto especialidades)
  const data = readDB();
  data.usuarios = [];
  data.medicos = [];
  data.disponibilidad = [];
  data.turnos = [];
  data.notas_medicas = [];
  writeDB(data);

  const password = await bcrypt.hash('password123', 10);

  // Crear administrador
  const admin = db.createUsuario({
    email: 'admin@mediturnos.com',
    password,
    rol: 'ADMINISTRADOR',
    nombre: 'Admin',
    apellido: 'Sistema',
    dni: '00000000',
    activo: true
  });

  // Crear médico 1
  const medico1User = db.createUsuario({
    email: 'dr.lopez@mediturnos.com',
    password,
    rol: 'MEDICO',
    nombre: 'Juan',
    apellido: 'López',
    dni: '11111111',
    telefono: '123456789',
    activo: true
  });

  const medico1 = db.createMedico({
    usuario_id: medico1User.id,
    matricula: '12345'
  });

  // Crear médico 2
  const medico2User = db.createUsuario({
    email: 'dr.martinez@mediturnos.com',
    password,
    rol: 'MEDICO',
    nombre: 'Carlos',
    apellido: 'Martínez',
    dni: '22222222',
    telefono: '234567890',
    activo: true
  });

  const medico2 = db.createMedico({
    usuario_id: medico2User.id,
    matricula: '23456'
  });

  // Crear secretario
  db.createUsuario({
    email: 'secretario@mediturnos.com',
    password,
    rol: 'SECRETARIO',
    nombre: 'María',
    apellido: 'Secretaria',
    dni: '33333333',
    activo: true
  });

  // Crear pacientes
  const paciente1 = db.createUsuario({
    email: 'maria@example.com',
    password,
    rol: 'PACIENTE',
    nombre: 'María',
    apellido: 'González',
    dni: '12345678',
    telefono: '111111111',
    activo: true
  });

  const paciente2 = db.createUsuario({
    email: 'carlos@example.com',
    password,
    rol: 'PACIENTE',
    nombre: 'Carlos',
    apellido: 'Ruiz',
    dni: '23456789',
    telefono: '222222222',
    activo: true
  });

  // Crear turnos de ejemplo
  const mañana = new Date();
  mañana.setDate(mañana.getDate() + 1);
  const fechaMañana = mañana.toISOString().split('T')[0];

  db.createTurno({
    paciente_id: paciente1.id,
    medico_id: medico1.id,
    fecha: fechaMañana,
    hora: '09:00',
    estado: 'CONFIRMADO',
    motivo_consulta: 'Control de rutina'
  });

  db.createTurno({
    paciente_id: paciente2.id,
    medico_id: medico2.id,
    fecha: fechaMañana,
    hora: '10:30',
    estado: 'PENDIENTE',
    motivo_consulta: 'Consulta general'
  });

  console.log('✅ Seed completado!');
  console.log('\n📧 Credenciales de prueba:');
  console.log('Admin: admin@mediturnos.com / password123');
  console.log('Médico 1: dr.lopez@mediturnos.com / password123');
  console.log('Médico 2: dr.martinez@mediturnos.com / password123');
  console.log('Secretario: secretario@mediturnos.com / password123');
  console.log('Paciente 1: maria@example.com / password123');
  console.log('Paciente 2: carlos@example.com / password123');
}

seed().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

