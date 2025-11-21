/**
 * Configuración simple de la base de datos SQLite
 * Se crea automáticamente si no existe
 */

const Database = require('better-sqlite3');
const path = require('path');

// Ruta del archivo de base de datos
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Crear tablas si no existen
function initDatabase() {
  // Tabla de usuarios
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      rol TEXT NOT NULL,
      nombre TEXT,
      apellido TEXT,
      dni TEXT,
      telefono TEXT,
      activo INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de especialidades
  db.exec(`
    CREATE TABLE IF NOT EXISTS especialidades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT UNIQUE NOT NULL,
      descripcion TEXT
    )
  `);

  // Tabla de médicos (relación con usuarios)
  db.exec(`
    CREATE TABLE IF NOT EXISTS medicos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      matricula TEXT UNIQUE,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `);

  // Tabla de disponibilidad
  db.exec(`
    CREATE TABLE IF NOT EXISTS disponibilidad (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      medico_id INTEGER NOT NULL,
      dia_semana INTEGER NOT NULL,
      hora_inicio TEXT NOT NULL,
      hora_fin TEXT NOT NULL,
      activo INTEGER DEFAULT 1,
      FOREIGN KEY (medico_id) REFERENCES medicos(id)
    )
  `);

  // Tabla de turnos
  db.exec(`
    CREATE TABLE IF NOT EXISTS turnos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paciente_id INTEGER NOT NULL,
      medico_id INTEGER NOT NULL,
      fecha TEXT NOT NULL,
      hora TEXT NOT NULL,
      estado TEXT DEFAULT 'PENDIENTE',
      motivo_consulta TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (paciente_id) REFERENCES usuarios(id),
      FOREIGN KEY (medico_id) REFERENCES medicos(id)
    )
  `);

  // Tabla de notas médicas
  db.exec(`
    CREATE TABLE IF NOT EXISTS notas_medicas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      turno_id INTEGER NOT NULL,
      medico_id INTEGER NOT NULL,
      contenido TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (turno_id) REFERENCES turnos(id),
      FOREIGN KEY (medico_id) REFERENCES medicos(id)
    )
  `);

  // Insertar especialidades por defecto
  const especialidades = db.prepare('SELECT COUNT(*) as count FROM especialidades').get();
  if (especialidades.count === 0) {
    const insert = db.prepare('INSERT INTO especialidades (nombre, descripcion) VALUES (?, ?)');
    insert.run('Cardiología', 'Especialidad del corazón');
    insert.run('Dermatología', 'Especialidad de la piel');
    insert.run('Pediatría', 'Especialidad de niños');
  }

  console.log('✅ Base de datos inicializada correctamente');
}

// Inicializar al cargar el módulo
initDatabase();

module.exports = db;

