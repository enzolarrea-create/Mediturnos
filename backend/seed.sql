-- Script para crear usuarios de prueba
-- Ejecutar en Railway Query Editor después de importar database.sql

-- Generar hash de password123 primero:
-- node -e "const bcrypt=require('bcryptjs');bcrypt.hash('password123',10).then(console.log)"
-- Reemplaza el hash abajo con el que generes

-- Crear médico
INSERT INTO usuarios (email, password, rol, nombre, apellido, dni, telefono)
VALUES ('dr.lopez@mediturnos.com', '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'MEDICO', 'Juan', 'López', '11111111', '123456789')
ON CONFLICT (email) DO NOTHING;

-- Obtener ID del médico y crear registro en tabla medicos
INSERT INTO medicos (usuario_id, matricula)
SELECT id, '12345' FROM usuarios WHERE email = 'dr.lopez@mediturnos.com'
ON CONFLICT (matricula) DO NOTHING;

-- Crear secretario
INSERT INTO usuarios (email, password, rol, nombre, apellido, dni)
VALUES ('secretario@mediturnos.com', '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJq', 'SECRETARIO', 'María', 'Secretaria', '33333333')
ON CONFLICT (email) DO NOTHING;

-- Crear paciente de prueba
INSERT INTO usuarios (email, password, rol, nombre, apellido, dni, telefono)
VALUES ('maria@example.com', '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJq', 'PACIENTE', 'María', 'González', '12345678', '111111111')
ON CONFLICT (email) DO NOTHING;

