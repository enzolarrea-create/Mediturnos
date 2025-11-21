-- Crear tablas para MediTurnos
-- Ejecutar este script completo en DBeaver

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL,
  nombre VARCHAR(100),
  apellido VARCHAR(100),
  dni VARCHAR(20),
  telefono VARCHAR(50),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de especialidades
CREATE TABLE IF NOT EXISTS especialidades (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT
);

-- Tabla de médicos
CREATE TABLE IF NOT EXISTS medicos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  matricula VARCHAR(50) UNIQUE
);

-- Tabla de disponibilidad
CREATE TABLE IF NOT EXISTS disponibilidad (
  id SERIAL PRIMARY KEY,
  medico_id INTEGER REFERENCES medicos(id),
  dia_semana INTEGER NOT NULL,
  hora_inicio VARCHAR(10) NOT NULL,
  hora_fin VARCHAR(10) NOT NULL,
  activo BOOLEAN DEFAULT true
);

-- Tabla de turnos
CREATE TABLE IF NOT EXISTS turnos (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER REFERENCES usuarios(id),
  medico_id INTEGER REFERENCES medicos(id),
  fecha DATE NOT NULL,
  hora VARCHAR(10) NOT NULL,
  estado VARCHAR(50) DEFAULT 'PENDIENTE',
  motivo_consulta TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de notas médicas
CREATE TABLE IF NOT EXISTS notas_medicas (
  id SERIAL PRIMARY KEY,
  turno_id INTEGER REFERENCES turnos(id),
  medico_id INTEGER REFERENCES medicos(id),
  contenido TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar especialidades
INSERT INTO especialidades (nombre, descripcion) VALUES
  ('Cardiología', 'Especialidad del corazón'),
  ('Dermatología', 'Especialidad de la piel'),
  ('Pediatría', 'Especialidad de niños')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar usuario admin (password: password123)
-- Hash: $2a$10$qYbARb6fWQNorfUZBqJg5uraykvQOuGdGjkK/ywOB1Hk0sw7lfHTO
INSERT INTO usuarios (email, password, rol, nombre, apellido, dni) VALUES
  ('admin@mediturnos.com', '$2a$10$qYbARb6fWQNorfUZBqJg5uraykvQOuGdGjkK/ywOB1Hk0sw7lfHTO', 'ADMINISTRADOR', 'Admin', 'Sistema', '00000000')
ON CONFLICT (email) DO NOTHING;
