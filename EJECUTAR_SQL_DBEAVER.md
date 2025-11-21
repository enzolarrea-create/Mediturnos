# 📊 CÓMO EJECUTAR SQL EN DBEAVER - PASO A PASO

## ⚠️ IMPORTANTE: Ejecutar Statement por Statement

DBeaver a veces tiene problemas ejecutando múltiples statements a la vez. Sigue estos pasos:

### MÉTODO 1: Ejecutar Todo el Script (Recomendado)

1. En DBeaver, abre tu conexión a Render
2. Click derecho en tu base de datos → "SQL Editor" → "New SQL Script"
3. Abre `backend/database.sql`
4. **COPIA TODO** el contenido
5. Pégalo en DBeaver
6. **IMPORTANTE**: Selecciona TODO el texto (Ctrl+A)
7. Click en el botón "Execute SQL Script" (o Ctrl+Alt+X)
   - NO uses "Execute SQL Statement" (Ctrl+Enter) - ese ejecuta solo una línea
   - Usa "Execute SQL Script" que ejecuta todo

### MÉTODO 2: Si el Método 1 No Funciona

Ejecuta cada bloque por separado:

**Bloque 1 - Crear tablas:**
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

CREATE TABLE IF NOT EXISTS especialidades (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT
);

CREATE TABLE IF NOT EXISTS medicos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  matricula VARCHAR(50) UNIQUE
);

CREATE TABLE IF NOT EXISTS disponibilidad (
  id SERIAL PRIMARY KEY,
  medico_id INTEGER REFERENCES medicos(id),
  dia_semana INTEGER NOT NULL,
  hora_inicio VARCHAR(10) NOT NULL,
  hora_fin VARCHAR(10) NOT NULL,
  activo BOOLEAN DEFAULT true
);

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

CREATE TABLE IF NOT EXISTS notas_medicas (
  id SERIAL PRIMARY KEY,
  turno_id INTEGER REFERENCES turnos(id),
  medico_id INTEGER REFERENCES medicos(id),
  contenido TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Bloque 2 - Insertar datos:**
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

### MÉTODO 3: Verificar que las Tablas Existen

Después de ejecutar, verifica:

1. En DBeaver, expande tu base de datos
2. Expande "Schemas" → "public" → "Tables"
3. Deberías ver:
   - usuarios
   - especialidades
   - medicos
   - disponibilidad
   - turnos
   - notas_medicas

Si no ves las tablas, ejecuta de nuevo el Bloque 1.

### MÉTODO 4: Si Nada Funciona - Usar init-db.js

1. Crea `backend/.env`:
   ```
   DATABASE_URL=postgresql://mediturnos_user:v52KrfNlMuNUkiDgjCYRAgUgytWS0UtP@dpg-d4gdg3npm1nc73f92dag-a.oregon-postgres.render.com/mediturnos
   ```

2. Ejecuta:
   ```bash
   cd backend
   npm install
   node init-db.js
   ```

---

**Recomendación**: Usa el MÉTODO 1 primero. Si falla, usa el MÉTODO 2 ejecutando bloque por bloque.

