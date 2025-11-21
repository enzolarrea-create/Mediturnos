/**
 * Script simple para poblar la base de datos con datos de ejemplo
 * Ejecutar: node seed.js
 */

const db = require('./database');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('🌱 Iniciando seed...');

  // Limpiar datos existentes
  db.prepare('DELETE FROM turnos').run();
  db.prepare('DELETE FROM notas_medicas').run();
  db.prepare('DELETE FROM disponibilidad').run();
  db.prepare('DELETE FROM medicos').run();
  db.prepare('DELETE FROM usuarios WHERE rol != "ADMINISTRADOR"').run();

  const password = await bcrypt.hash('password123', 10);

  // Crear administrador
  const adminId = db.prepare(`
    INSERT INTO usuarios (email, password, rol, nombre, apellido, dni)
    VALUES (?, ?, 'ADMINISTRADOR', 'Admin', 'Sistema', '00000000')
  `).run('admin@mediturnos.com', password).lastInsertRowid;

  // Crear médico 1
  const medico1Id = db.prepare(`
    INSERT INTO usuarios (email, password, rol, nombre, apellido, dni, telefono)
    VALUES (?, ?, 'MEDICO', 'Juan', 'López', '11111111', '123456789')
  `).run('dr.lopez@mediturnos.com', password).lastInsertRowid;

  const medico1 = db.prepare(`
    INSERT INTO medicos (usuario_id, matricula) VALUES (?, ?)
  `).run(medico1Id, '12345').lastInsertRowid;

  // Crear médico 2
  const medico2Id = db.prepare(`
    INSERT INTO usuarios (email, password, rol, nombre, apellido, dni, telefono)
    VALUES (?, ?, 'MEDICO', 'Carlos', 'Martínez', '22222222', '234567890')
  `).run('dr.martinez@mediturnos.com', password).lastInsertRowid;

  const medico2 = db.prepare(`
    INSERT INTO medicos (usuario_id, matricula) VALUES (?, ?)
  `).run(medico2Id, '23456').lastInsertRowid;

  // Crear secretario
  const secretarioId = db.prepare(`
    INSERT INTO usuarios (email, password, rol, nombre, apellido, dni)
    VALUES (?, ?, 'SECRETARIO', 'María', 'Secretaria', '33333333')
  `).run('secretario@mediturnos.com', password).lastInsertRowid;

  // Crear pacientes
  const paciente1Id = db.prepare(`
    INSERT INTO usuarios (email, password, rol, nombre, apellido, dni, telefono)
    VALUES (?, ?, 'PACIENTE', 'María', 'González', '12345678', '111111111')
  `).run('maria@example.com', password).lastInsertRowid;

  const paciente2Id = db.prepare(`
    INSERT INTO usuarios (email, password, rol, nombre, apellido, dni, telefono)
    VALUES (?, ?, 'PACIENTE', 'Carlos', 'Ruiz', '23456789', '222222222')
  `).run('carlos@example.com', password).lastInsertRowid;

  // Crear disponibilidades
  for (let dia = 1; dia <= 5; dia++) {
    db.prepare(`
      INSERT INTO disponibilidad (medico_id, dia_semana, hora_inicio, hora_fin)
      VALUES (?, ?, ?, ?)
    `).run(medico1, dia, '08:00', '17:00');

    db.prepare(`
      INSERT INTO disponibilidad (medico_id, dia_semana, hora_inicio, hora_fin)
      VALUES (?, ?, ?, ?)
    `).run(medico2, dia, '09:00', '18:00');
  }

  // Crear turnos de ejemplo
  const hoy = new Date();
  const mañana = new Date(hoy);
  mañana.setDate(hoy.getDate() + 1);

  db.prepare(`
    INSERT INTO turnos (paciente_id, medico_id, fecha, hora, estado, motivo_consulta)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(paciente1Id, medico1, mañana.toISOString().split('T')[0], '09:00', 'CONFIRMADO', 'Control de rutina');

  db.prepare(`
    INSERT INTO turnos (paciente_id, medico_id, fecha, hora, estado, motivo_consulta)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(paciente2Id, medico2, mañana.toISOString().split('T')[0], '10:30', 'PENDIENTE', 'Consulta general');

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

