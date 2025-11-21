# 🚀 INSTRUCCIONES FINALES - DEPLOY CON RENDER (GRATIS)

## PASO 1: BORRAR ARCHIVOS VIEJOS

Borra estas carpetas completas:
- backend-simple/
- frontend-simple/
- backend/ (si existe la vieja con Prisma)
- frontend/ (si existe la vieja)

## PASO 2: INSTALAR DEPENDENCIAS DEL BACKEND

```bash
cd backend
npm install
```

## PASO 3: CONFIGURAR RENDER

### 3.1 Crear cuenta en Render
1. Ve a https://render.com
2. Click "Get Started for Free"
3. Crea cuenta con GitHub (NO requiere tarjeta de crédito)
4. Confirma tu email

### 3.2 Crear Base de Datos PostgreSQL
1. En el dashboard de Render, click "New +"
2. Selecciona "PostgreSQL"
3. Configura:
   - **Name**: `mediturnos-db`
   - **Database**: `mediturnos`
   - **User**: (se genera automáticamente)
   - **Region**: Elige la más cercana (ej: `Oregon (US West)`)
   - **PostgreSQL Version**: `16` (o la más reciente)
   - **Plan**: **Free** (gratis, se pausa después de 90 días pero los datos se mantienen)
4. Click "Create Database"
5. Espera 1-2 minutos

### 3.3 Copiar DATABASE_URL
1. Una vez creada la base de datos, click en ella
2. Ve a la sección "Connections"
3. Busca "Internal Database URL" (la que empieza con `postgresql://`)
4. **COPIA COMPLETA** esa URL
5. **YA LA TIENES**: `postgresql://mediturnos_user:v52KrfNlMuNUkiDgjCYRAgUgytWS0UtP@dpg-d4gdg3npm1nc73f92dag-a/mediturnos`
6. También copia la "External Database URL" para ejecutar SQL desde tu computadora

### 3.4 Importar SQL

**YA TIENES LAS URLs, ahora ejecuta el SQL:**

**OPCIÓN 1: DBeaver (Recomendado - Más Fácil)**
1. Descarga DBeaver Community (gratis): https://dbeaver.io/download/
2. Instala y abre DBeaver
3. Click "New Database Connection" → "PostgreSQL"
4. Configura con la **External Database URL**:
   - **Host**: `dpg-d4gdg3npm1nc73f92dag-a.oregon-postgres.render.com`
   - **Port**: `5432`
   - **Database**: `mediturnos`
   - **Username**: `mediturnos_user`
   - **Password**: `v52KrfNlMuNUkiDgjCYRAgUgytWS0UtP`
5. Click "Test Connection" → Debería funcionar
6. Click "Finish"
7. Expande tu conexión → Click derecho en "public" → "SQL Editor" → "New SQL Script"
8. Abre `backend/database.sql` y copia TODO el contenido
9. Pégalo en DBeaver
10. Click "Execute SQL Script" (Ctrl+Enter o el botón ▶)
11. ✅ Deberías ver "Success" - todas las tablas creadas

**OPCIÓN 2: Script init-db.js (Desde tu computadora)**
1. Crea `backend/.env` con:
   ```
   DATABASE_URL=postgresql://mediturnos_user:v52KrfNlMuNUkiDgjCYRAgUgytWS0UtP@dpg-d4gdg3npm1nc73f92dag-a.oregon-postgres.render.com/mediturnos
   ```
2. Ejecuta:
   ```bash
   cd backend
   npm install
   node init-db.js
   ```
3. ✅ Listo

### 3.5 Crear Hash de Contraseña para Admin
En tu terminal local:
```bash
cd backend
node -e "const bcrypt=require('bcryptjs');bcrypt.hash('password123',10).then(console.log)"
```
Copia el hash generado (ejemplo: `$2a$10$...`)

### 3.6 Actualizar database.sql con el hash real
1. Abre `backend/database.sql`
2. Busca la línea del INSERT del admin
3. Reemplaza el hash placeholder con el hash que generaste
4. Guarda el archivo

### 3.7 Desplegar Backend en Render
1. En Render dashboard, click "New +"
2. Selecciona "Web Service"
3. Conecta tu repositorio de GitHub
4. Selecciona tu repositorio
5. Configura:
   - **Name**: `mediturnos-backend`
   - **Region**: La misma que elegiste para la DB
   - **Branch**: `main` (o `master`)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Click "Advanced"
7. Agrega estas **Environment Variables**:
   - `DATABASE_URL` = `postgresql://mediturnos_user:v52KrfNlMuNUkiDgjCYRAgUgytWS0UtP@dpg-d4gdg3npm1nc73f92dag-a/mediturnos`
   - `SESSION_SECRET` = (genera uno: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `FRONTEND_URL` = (déjalo vacío por ahora, lo actualizarás después)
   - `PORT` = `10000` (Render usa el puerto de la variable PORT o 10000)
   - `NODE_ENV` = `production`
8. Click "Create Web Service"
9. Espera 3-5 minutos mientras Render construye y despliega
10. Una vez desplegado, Render te dará una URL (ejemplo: `https://mediturnos-backend.onrender.com`)
11. **COPIA ESA URL**, la necesitarás para el frontend

### 3.8 Verificar que el backend funciona
1. Abre en tu navegador: `https://tu-backend.onrender.com/api/health`
2. Deberías ver: `{"status":"ok","message":"MediTurnos API funcionando"}`

### 3.9 Ejecutar SQL (si no lo hiciste antes)
Si no pudiste ejecutar el SQL antes, ahora puedes:
1. Abre `backend/database.sql`
2. Copia TODO el contenido
3. Usa la "External Database URL" de Render con DBeaver o TablePlus
4. O crea una ruta temporal en tu backend para ejecutar el SQL

**OPCIÓN RÁPIDA**: Crea un archivo `backend/init-db.js`:
```javascript
const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function init() {
  const sql = fs.readFileSync('database.sql', 'utf8');
  await pool.query(sql);
  console.log('✅ Base de datos inicializada');
  process.exit(0);
}

init();
```

Luego en Render, temporalmente cambia el Start Command a: `node init-db.js && npm start`
O ejecuta manualmente desde tu máquina con la External Database URL.

## PASO 4: CONFIGURAR FRONTEND

### 4.1 Actualizar URL del backend
1. Abre `frontend/js/api.js`
2. En la línea 2, reemplaza:
   ```javascript
   const API_BASE_URL = 'https://tu-backend.railway.app/api';
   ```
   Por:
   ```javascript
   const API_BASE_URL = 'https://tu-backend.onrender.com/api';
   ```
   (Reemplaza `tu-backend.onrender.com` con tu URL real de Render)
3. Guarda el archivo

### 4.2 Actualizar CORS en Render
1. En Render, ve a tu servicio backend
2. Click "Environment"
3. Actualiza `FRONTEND_URL` con: `https://tu-app.netlify.app` (lo actualizarás después de desplegar el frontend)

## PASO 5: DESPLEGAR FRONTEND EN NETLIFY

### 5.1 Subir a Netlify
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

### 5.2 Actualizar CORS en Render
1. Vuelve a Render
2. Ve a tu servicio backend → "Environment"
3. Actualiza `FRONTEND_URL` con tu URL de Netlify
4. Render reiniciará automáticamente

## PASO 6: CREAR USUARIOS DE PRUEBA

Usa la External Database URL de Render con DBeaver o ejecuta `backend/seed.sql` manualmente.

O crea usuarios desde la interfaz web registrándote.

## PASO 7: PROBAR

1. Abre tu URL de Netlify
2. Regístrate o inicia sesión
3. Prueba crear turnos

## ⚠️ NOTAS IMPORTANTES SOBRE RENDER GRATIS

- **PostgreSQL Free**: Se pausa después de 90 días, pero los datos se mantienen. Se reactiva automáticamente cuando lo uses.
- **Web Service Free**: Se "duerme" después de 15 minutos de inactividad. La primera petición puede tardar 30-60 segundos en despertarlo.
- **Sin tarjeta de crédito**: El plan gratuito NO requiere tarjeta.
- **Límites**: Suficiente para un proyecto universitario.

## 🔧 SOLUCIÓN RÁPIDA PARA EJECUTAR SQL

Si no puedes ejecutar el SQL directamente:

1. Crea `backend/init-db.js`:
```javascript
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function init() {
  try {
    const sql = fs.readFileSync('./database.sql', 'utf8');
    await pool.query(sql);
    console.log('✅ Base de datos inicializada');
  } catch (error) {
    console.error('Error:', error);
  }
  await pool.end();
  process.exit(0);
}

init();
```

2. En Render, temporalmente cambia "Start Command" a: `node init-db.js`
3. Guarda y espera a que termine
4. Luego cambia de vuelta a: `npm start`

---

**LISTO. Tu proyecto está online y GRATIS.**

