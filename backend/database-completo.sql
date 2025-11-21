-- ============================================
-- SCRIPT COMPLETO PARA EJECUTAR EN DBEAVER
-- Ejecuta TODO este archivo de una vez
-- ============================================

-- 1. Crear tabla usuarios (primero, sin dependencias)
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

-- 2. Crear tabla especialidades (sin dependencias)
CREATE TABLE IF NOT EXISTS especialidades (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT
);

-- 3. Crear tabla medicos (depende de usuarios)
CREATE TABLE IF NOT EXISTS medicos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  matricula VARCHAR(50) UNIQUE
);

-- 4. Crear tabla disponibilidad (depende de medicos)
CREATE TABLE IF NOT EXISTS disponibilidad (
  id SERIAL PRIMARY KEY,
  medico_id INTEGER REFERENCES medicos(id),
  dia_semana INTEGER NOT NULL,
  hora_inicio VARCHAR(10) NOT NULL,
  hora_fin VARCHAR(10) NOT NULL,
  activo BOOLEAN DEFAULT true
);

-- 5. Crear tabla turnos (depende de usuarios y medicos)
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

-- 6. Crear tabla notas_medicas (depende de turnos y medicos)
CREATE TABLE IF NOT EXISTS notas_medicas (
  id SERIAL PRIMARY KEY,
  turno_id INTEGER REFERENCES turnos(id),
  medico_id INTEGER REFERENCES medicos(id),
  contenido TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Insertar especialidades
INSERT INTO especialidades (nombre, descripcion) VALUES
  ('Cardiología', 'Especialidad del corazón'),
  ('Dermatología', 'Especialidad de la piel'),
  ('Pediatría', 'Especialidad de niños')
ON CONFLICT (nombre) DO NOTHING;

-- 8. Insertar usuario admin (password: password123)
INSERT INTO usuarios (email, password, rol, nombre, apellido, dni) VALUES
  ('admin@mediturnos.com', '$2a$10$qYbARb6fWQNorfUZBqJg5uraykvQOuGdGjkK/ywOB1Hk0sw7lfHTO', 'ADMINISTRADOR', 'Admin', 'Sistema', '00000000')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

