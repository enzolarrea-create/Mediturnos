# ✅ EJECUTAR SQL EN DBEAVER - INSTRUCCIONES EXACTAS

## PASO A PASO:

### 1. Abre DBeaver
- Conecta a tu base de datos de Render (si no lo hiciste, usa la External URL)

### 2. Abre el SQL Editor
- Click derecho en tu base de datos → "SQL Editor" → "New SQL Script"
- O usa el botón "SQL Editor" en la barra superior

### 3. Abre el archivo correcto
- Abre `backend/database-completo.sql` (NO uses `database.sql`)
- Este archivo tiene todo en el orden correcto

### 4. Copia TODO el contenido
- Selecciona TODO (Ctrl+A)
- Copia (Ctrl+C)

### 5. Pégalo en DBeaver
- Pega en el editor SQL de DBeaver (Ctrl+V)

### 6. EJECUTA CORRECTAMENTE
- **IMPORTANTE**: Selecciona TODO el texto en DBeaver (Ctrl+A)
- Click en el botón **"Execute SQL Script"** (icono ▶▶ con dos flechas)
- O usa el atajo: **Ctrl+Alt+X**
- **NO uses** "Execute SQL Statement" (Ctrl+Enter) - ese solo ejecuta una línea

### 7. Verifica
- Deberías ver mensajes de éxito para cada CREATE TABLE
- Si hay errores, compártelos

### 8. Confirma que funcionó
- En DBeaver, expande: Tu DB → "Schemas" → "public" → "Tables"
- Deberías ver 6 tablas:
  - usuarios
  - especialidades
  - medicos
  - disponibilidad
  - turnos
  - notas_medicas

---

## SI SIGUE FALLANDO:

Ejecuta cada bloque por separado, en este orden exacto:

**Bloque 1:**
```sql
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
```

**Bloque 2:**
```sql
CREATE TABLE IF NOT EXISTS especialidades (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT
);
```

**Bloque 3:**
```sql
CREATE TABLE IF NOT EXISTS medicos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  matricula VARCHAR(50) UNIQUE
);
```

**Bloque 4:**
```sql
CREATE TABLE IF NOT EXISTS disponibilidad (
  id SERIAL PRIMARY KEY,
  medico_id INTEGER REFERENCES medicos(id),
  dia_semana INTEGER NOT NULL,
  hora_inicio VARCHAR(10) NOT NULL,
  hora_fin VARCHAR(10) NOT NULL,
  activo BOOLEAN DEFAULT true
);
```

**Bloque 5:**
```sql
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
```

**Bloque 6:**
```sql
CREATE TABLE IF NOT EXISTS notas_medicas (
  id SERIAL PRIMARY KEY,
  turno_id INTEGER REFERENCES turnos(id),
  medico_id INTEGER REFERENCES medicos(id),
  contenido TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Bloque 7 - Datos:**
```sql
INSERT INTO especialidades (nombre, descripcion) VALUES
  ('Cardiología', 'Especialidad del corazón'),
  ('Dermatología', 'Especialidad de la piel'),
  ('Pediatría', 'Especialidad de niños')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO usuarios (email, password, rol, nombre, apellido, dni) VALUES
  ('admin@mediturnos.com', '$2a$10$qYbARb6fWQNorfUZBqJg5uraykvQOuGdGjkK/ywOB1Hk0sw7lfHTO', 'ADMINISTRADOR', 'Admin', 'Sistema', '00000000')
ON CONFLICT (email) DO NOTHING;
```

---

**Ejecuta cada bloque con "Execute SQL Script" (Ctrl+Alt+X), no con Ctrl+Enter**

