# 🚀 INSTRUCCIONES FINALES - DEPLOY COMPLETO (USAR RENDER)

**⚠️ IMPORTANTE**: Estas instrucciones son para Railway. Si prefieres Render (100% gratis), usa `INSTRUCCIONES_RENDER.md` en su lugar.

## PASO 1: BORRAR ARCHIVOS VIEJOS

Borra estas carpetas completas:
- backend-simple/
- frontend-simple/
- backend/ (si existe la vieja)
- frontend/ (si existe la vieja)

## PASO 2: INSTALAR DEPENDENCIAS DEL BACKEND

```bash
cd backend
npm install
```

## PASO 3: CONFIGURAR RAILWAY

### 3.1 Crear cuenta en Railway
1. Ve a https://railway.app
2. Crea cuenta con GitHub

### 3.2 Crear proyecto
1. Click "New Project"
2. Selecciona "Empty Project"

### 3.3 Agregar PostgreSQL
1. Click "+ New"
2. Selecciona "Database" → "Add PostgreSQL"
3. Espera a que se cree (1-2 minutos)

### 3.4 Copiar DATABASE_URL
1. Click en la base de datos PostgreSQL
2. Ve a la pestaña "Variables"
3. Copia el valor de `DATABASE_URL`
4. Guárdalo, lo necesitarás

### 3.5 Importar SQL
1. En Railway, click en PostgreSQL
2. Ve a la pestaña "Query"
3. Abre el archivo `backend/database.sql`
4. Copia TODO el contenido
5. Pégalo en el Query Editor de Railway
6. Click "Run"

### 3.6 Crear usuario admin con contraseña
Ejecuta esto en el Query Editor de Railway:

```sql
UPDATE usuarios 
SET password = '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJq' 
WHERE email = 'admin@mediturnos.com';
```

O mejor, genera un hash nuevo:
1. En tu terminal local: `node -e "const bcrypt=require('bcryptjs');bcrypt.hash('password123',10).then(console.log)"`
2. Copia el hash generado
3. Ejecuta: `UPDATE usuarios SET password = 'TU_HASH_AQUI' WHERE email = 'admin@mediturnos.com';`

### 3.7 Desplegar Backend
1. En Railway, click "+ New"
2. Selecciona "GitHub Repo"
3. Conecta tu repositorio
4. Selecciona la carpeta `backend`
5. Railway detectará Node.js automáticamente
6. Ve a "Settings" → "Root Directory" → pon: `backend`
7. Ve a "Variables" y agrega:
   - `DATABASE_URL` = (la que copiaste del PostgreSQL)
   - `SESSION_SECRET` = (genera uno: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `FRONTEND_URL` = (por ahora déjalo vacío, lo actualizarás después)
   - `PORT` = `3000`
8. Railway desplegará automáticamente
9. Espera a que termine (2-3 minutos)
10. Click en el servicio → "Settings" → "Generate Domain"
11. Copia la URL (ejemplo: `https://mediturnos-backend.railway.app`)

## PASO 4: CONFIGURAR FRONTEND

### 4.1 Actualizar URL del backend
1. Abre `frontend/js/api.js`
2. Reemplaza `https://tu-backend.railway.app` con tu URL real de Railway
3. Guarda el archivo

### 4.2 Actualizar CORS en Railway
1. En Railway, ve a tu servicio backend
2. "Variables"
3. Agrega/actualiza `FRONTEND_URL` con: `https://tu-app.netlify.app` (lo actualizarás después de desplegar)

## PASO 5: DESPLEGAR FRONTEND EN NETLIFY

### 5.1 Preparar archivo de configuración
Crea `netlify.toml` en la raíz del proyecto:

```toml
[build]
  publish = "."
  command = "echo 'No build needed'"

[[redirects]]
  from = "/*"
  to = "/landing.html"
  status = 200
```

### 5.2 Subir a Netlify
1. Ve a https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Conecta con GitHub
4. Selecciona tu repositorio
5. Configuración:
   - Base directory: (dejar vacío)
   - Build command: (dejar vacío)
   - Publish directory: `.`
6. Click "Deploy site"
7. Espera 1-2 minutos
8. Copia la URL (ejemplo: `https://mediturnos.netlify.app`)

### 5.3 Actualizar CORS
1. Vuelve a Railway
2. Actualiza `FRONTEND_URL` con tu URL de Netlify
3. Reinicia el servicio (Settings → Restart)

## PASO 6: CREAR USUARIOS DE PRUEBA

En Railway Query Editor, ejecuta:

```sql
-- Crear médico
INSERT INTO usuarios (email, password, rol, nombre, apellido, dni, telefono)
VALUES ('dr.lopez@mediturnos.com', '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'MEDICO', 'Juan', 'López', '11111111', '123456789')
ON CONFLICT (email) DO NOTHING
RETURNING id;

-- Obtener el ID del usuario médico y crear el médico
-- (Reemplaza USER_ID con el ID que te devolvió)
INSERT INTO medicos (usuario_id, matricula) VALUES (USER_ID, '12345');
```

O mejor, genera los hashes:
```bash
node -e "const bcrypt=require('bcryptjs');bcrypt.hash('password123',10).then(console.log)"
```

## PASO 7: PROBAR

1. Abre tu URL de Netlify
2. Registrarte o iniciar sesión
3. Probar crear turnos

## CREDENCIALES DE PRUEBA

Después de crear los usuarios:
- Admin: `admin@mediturnos.com` / `password123`
- Médico: `dr.lopez@mediturnos.com` / `password123`

---

**LISTO. Tu proyecto está online y funcionando.**

