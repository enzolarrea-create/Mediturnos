# 🚀 Guía Completa de Despliegue - Mediturnos

Esta guía te llevará paso a paso desde el código local hasta tener el sistema completamente funcional en producción.

---

## 📋 ÍNDICE

1. [Preparación del Backend para Producción](#1-preparación-del-backend-para-producción)
2. [Crear Base de Datos en la Nube](#2-crear-base-de-datos-en-la-nube)
3. [Desplegar Backend en Railway](#3-desplegar-backend-en-railway)
4. [Integrar Frontend con Backend Desplegado](#4-integrar-frontend-con-backend-desplegado)
5. [Desplegar Frontend en Vercel](#5-desplegar-frontend-en-vercel)
6. [Pruebas Finales](#6-pruebas-finales)
7. [Solución de Problemas Comunes](#7-solución-de-problemas-comunes)

---

## 1. PREPARACIÓN DEL BACKEND PARA PRODUCCIÓN

### 1.1 Validar schema.prisma

**Paso 1.1.1**: Abre el archivo `backend/prisma/schema.prisma` y verifica que tenga esta estructura al inicio:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

✅ **Verificación**: Asegúrate de que dice `provider = "postgresql"` (no SQLite ni MySQL).

### 1.2 Crear archivo de migración inicial

**Paso 1.2.1**: Abre una terminal en la carpeta `backend`:

```bash
cd backend
```

**Paso 1.2.2**: Genera el cliente de Prisma (si no lo has hecho):

```bash
npm run prisma:generate
```

**Paso 1.2.3**: Crea la migración inicial (esto creará los archivos de migración):

```bash
npx prisma migrate dev --name init
```

✅ **Resultado esperado**: Deberías ver un mensaje como "Migration `init` applied successfully" y se creará una carpeta `prisma/migrations/`.

### 1.3 Configurar package.json para producción

**Paso 1.3.1**: Abre `backend/package.json` y verifica que tenga estos scripts:

```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:seed": "node prisma/seed.js",
    "postinstall": "prisma generate"
  }
}
```

✅ **Importante**: El script `postinstall` es crucial - se ejecuta automáticamente después de `npm install` en producción.

**Paso 1.3.2**: Si no existe, agrega el script `postinstall`:

```bash
# En la terminal, dentro de backend/
```

O edita manualmente `package.json` y agrega:
```json
"postinstall": "prisma generate"
```

### 1.4 Crear archivo .env de producción (localmente)

**Paso 1.4.1**: Crea un archivo `.env.production` en la carpeta `backend/`:

```bash
# En backend/
touch .env.production
```

**Paso 1.4.2**: Abre `.env.production` y coloca esto (lo completaremos después):

```env
DATABASE_URL=""
JWT_SECRET=""
NODE_ENV=production
PORT=3000
FRONTEND_URL=""
```

**Nota**: Por ahora déjalo así, lo completaremos cuando tengamos las URLs reales.

### 1.5 Verificar que el servidor funciona localmente

**Paso 1.5.1**: Asegúrate de tener un `.env` local funcionando (para pruebas):

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/mediturnos?schema=public"
JWT_SECRET="clave_secreta_local_12345"
NODE_ENV=development
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

**Paso 1.5.2**: Prueba que el servidor inicia:

```bash
npm run dev
```

✅ **Verificación**: Deberías ver "🚀 Servidor corriendo en puerto 3000"

**Paso 1.5.3**: Prueba el endpoint de health:

Abre en el navegador: `http://localhost:3000/health`

✅ **Resultado esperado**: Deberías ver un JSON con `{"status":"OK",...}`

---

## 2. CREAR BASE DE DATOS EN LA NUBE

Vamos a usar **Railway** porque es gratuito y fácil de usar. Alternativamente puedes usar **Render** o **Supabase**.

### 2.1 Crear cuenta en Railway

**Paso 2.1.1**: Ve a https://railway.app

**Paso 2.1.2**: Haz clic en "Login" y elige "Sign up with GitHub" (recomendado) o crea cuenta con email.

**Paso 2.1.3**: Confirma tu email si es necesario.

### 2.2 Crear proyecto en Railway

**Paso 2.2.1**: Una vez dentro de Railway, haz clic en "New Project"

**Paso 2.2.2**: Selecciona "Empty Project" (Proyecto vacío)

**Paso 2.2.3**: Dale un nombre al proyecto, por ejemplo: "mediturnos-db"

### 2.3 Crear base de datos PostgreSQL

**Paso 2.3.1**: En tu proyecto, haz clic en "+ New" o "Add Service"

**Paso 2.3.2**: Selecciona "Database" → "Add PostgreSQL"

**Paso 2.3.3**: Railway creará automáticamente una base de datos PostgreSQL.

✅ **Espera**: Puede tardar 1-2 minutos en crearse.

### 2.4 Obtener DATABASE_URL

**Paso 2.4.1**: Una vez creada la base de datos, haz clic en el servicio "PostgreSQL"

**Paso 2.4.2**: Ve a la pestaña "Variables" o "Connect"

**Paso 2.4.3**: Busca la variable `DATABASE_URL` o `POSTGRES_URL`

**Paso 2.4.4**: Haz clic en el ícono de "copiar" o selecciona y copia toda la URL.

✅ **Formato esperado**: Algo como:
```
postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

**⚠️ IMPORTANTE**: Guarda esta URL en un lugar seguro (notas, documento de texto). La necesitarás en los siguientes pasos.

### 2.5 Verificar conexión (Opcional pero recomendado)

**Paso 2.5.1**: En Railway, ve a la pestaña "Data" o "Query" del servicio PostgreSQL

**Paso 2.5.2**: Deberías ver una interfaz para ejecutar queries SQL

✅ **Verificación**: Si puedes ver esta interfaz, la base de datos está funcionando.

---

## 3. DESPLEGAR BACKEND EN RAILWAY

### 3.1 Preparar repositorio Git

**Paso 3.1.1**: Asegúrate de que tu proyecto esté en GitHub:

```bash
# En la raíz del proyecto (no en backend/)
git init  # Si no tienes git inicializado
git add .
git commit -m "Initial commit - Backend ready for deployment"
```

**Paso 3.1.2**: Crea un repositorio en GitHub (si no lo tienes):

- Ve a https://github.com/new
- Crea un repositorio (puede ser privado)
- Sigue las instrucciones para conectar tu repositorio local

**Paso 3.1.3**: Sube tu código:

```bash
git remote add origin https://github.com/tu-usuario/tu-repo.git
git branch -M main
git push -u origin main
```

### 3.2 Crear servicio de backend en Railway

**Paso 3.2.1**: En Railway, dentro de tu proyecto, haz clic en "+ New" o "Add Service"

**Paso 3.2.2**: Selecciona "GitHub Repo"

**Paso 3.2.3**: Autoriza Railway a acceder a tu GitHub si es necesario

**Paso 3.2.4**: Selecciona tu repositorio de GitHub

**Paso 3.2.5**: Railway detectará automáticamente que es un proyecto Node.js

### 3.3 Configurar el servicio de backend

**Paso 3.3.1**: Una vez creado el servicio, haz clic en él para abrir la configuración

**Paso 3.3.2**: Ve a la pestaña "Settings"

**Paso 3.3.3**: En "Root Directory", escribe: `backend`

✅ **Importante**: Esto le dice a Railway que el código está en la carpeta `backend/`

**Paso 3.3.4**: En "Build Command", deja vacío (Railway lo detectará automáticamente)

**Paso 3.3.5**: En "Start Command", escribe: `npm start`

### 3.4 Configurar variables de entorno en Railway

**Paso 3.4.1**: En el servicio de backend, ve a la pestaña "Variables"

**Paso 3.4.2**: Haz clic en "+ New Variable" y agrega cada una:

**Variable 1: DATABASE_URL**
- **Nombre**: `DATABASE_URL`
- **Valor**: Pega la URL que copiaste en el paso 2.4.4
- Haz clic en "Add"

**Variable 2: JWT_SECRET**
- **Nombre**: `JWT_SECRET`
- **Valor**: Genera una clave segura. Puedes usar:
  ```bash
  # En tu terminal local:
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
  O usa un generador online: https://randomkeygen.com/
- **Ejemplo de valor**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6...` (debe ser largo y aleatorio)
- Haz clic en "Add"

**Variable 3: NODE_ENV**
- **Nombre**: `NODE_ENV`
- **Valor**: `production`
- Haz clic en "Add"

**Variable 4: PORT**
- **Nombre**: `PORT`
- **Valor**: `3000` (o déjalo vacío, Railway asignará uno automáticamente)
- Haz clic en "Add"

**Variable 5: FRONTEND_URL**
- **Nombre**: `FRONTEND_URL`
- **Valor**: Por ahora déjalo como `https://tu-frontend.vercel.app` (lo actualizaremos después)
- Haz clic en "Add"

✅ **Verificación**: Deberías ver 5 variables en la lista.

### 3.5 Ejecutar migraciones Prisma en Railway

**Paso 3.5.1**: En Railway, ve a la pestaña "Deployments" del servicio de backend

**Paso 3.5.2**: Espera a que el primer deploy termine (puede tardar 2-5 minutos)

✅ **Indicador**: Verás un check verde cuando termine

**Paso 3.5.3**: Una vez que el deploy termine, haz clic en los "..." (tres puntos) del deployment más reciente

**Paso 3.5.4**: Selecciona "Open in Shell" o "Open Terminal"

**Paso 3.5.5**: En la terminal que se abre, ejecuta:

```bash
npx prisma migrate deploy
```

✅ **Resultado esperado**: Deberías ver:
```
Applying migration `20240101000000_init`
Migration applied successfully
```

**Paso 3.5.6**: (Opcional) Ejecuta el seed para datos de prueba:

```bash
npm run prisma:seed
```

✅ **Resultado esperado**: Deberías ver mensajes de éxito como "✅ Especialidades creadas", etc.

### 3.6 Obtener URL pública del backend

**Paso 3.6.1**: En Railway, en el servicio de backend, ve a la pestaña "Settings"

**Paso 3.6.2**: Busca la sección "Networking" o "Domains"

**Paso 3.6.3**: Haz clic en "Generate Domain" o busca el dominio que Railway asignó automáticamente

✅ **Formato esperado**: Algo como `https://tu-backend-production.up.railway.app`

**Paso 3.6.4**: Copia esta URL completa

**⚠️ IMPORTANTE**: Guarda esta URL. La necesitarás para el frontend.

**Paso 3.6.5**: Prueba que funciona:

Abre en el navegador: `https://tu-backend-production.up.railway.app/health`

✅ **Resultado esperado**: Deberías ver:
```json
{
  "status": "OK",
  "timestamp": "...",
  "environment": "production"
}
```

### 3.7 Verificar que las tablas se crearon

**Paso 3.7.1**: En Railway, ve al servicio de PostgreSQL

**Paso 3.7.2**: Ve a la pestaña "Data" o "Query"

**Paso 3.7.3**: Ejecuta esta query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

✅ **Resultado esperado**: Deberías ver una lista de tablas como:
- usuarios
- pacientes
- medicos
- turnos
- especialidades
- etc.

---

## 4. INTEGRAR FRONTEND CON BACKEND DESPLEGADO

### 4.1 Actualizar API_BASE_URL en el frontend

**Paso 4.1.1**: Abre el archivo `frontend/js/api.js`

**Paso 4.1.2**: Busca esta línea (debe estar al inicio del archivo):

```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

**Paso 4.1.3**: Reemplázala con la URL de tu backend en Railway:

```javascript
const API_BASE_URL = 'https://tu-backend-production.up.railway.app/api';
```

✅ **Importante**: 
- Debe empezar con `https://`
- Debe terminar con `/api`
- No debe tener barra final después de `/api`

**Ejemplo completo**:
```javascript
const API_BASE_URL = 'https://mediturnos-backend-production.up.railway.app/api';
```

### 4.2 Verificar que las llamadas fetch() están correctas

**Paso 4.2.1**: Abre `frontend/js/api.js` y verifica que todas las funciones usen `apiRequest`

**Paso 4.2.2**: Busca cualquier llamada directa a `fetch()` que no use `apiRequest`

✅ **Verificación**: Todas las llamadas deberían pasar por la función `apiRequest` que ya maneja la autenticación.

### 4.3 Probar login desde el frontend (localmente)

**Paso 4.3.1**: Abre `frontend/js/api.js` y verifica que `API_BASE_URL` apunte a tu backend de Railway

**Paso 4.3.2**: Abre `landing.html` o `login.html` en tu navegador local

**Paso 4.3.3**: Intenta hacer login con las credenciales del seed:

- **Email**: `admin@mediturnos.com`
- **Password**: `Password123`

**Paso 4.3.4**: Abre la consola del navegador (F12 → Console)

**Paso 4.3.5**: Intenta hacer login y observa si hay errores

✅ **Si funciona**: Deberías ser redirigido al dashboard según tu rol.

❌ **Si hay error CORS**: Ver sección 7.1

❌ **Si hay error 401/403**: Ver sección 7.2

### 4.4 Verificar errores CORS

**Paso 4.4.1**: Si ves errores de CORS en la consola del navegador, vuelve a Railway

**Paso 4.4.2**: En el servicio de backend, ve a Variables

**Paso 4.4.3**: Verifica que `FRONTEND_URL` esté configurada. Por ahora pon:

```
FRONTEND_URL=https://localhost:5173
```

(La actualizaremos cuando tengamos la URL de Vercel)

**Paso 4.4.4**: Verifica en `backend/src/server.js` que el CORS esté configurado:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

✅ **Si el código ya está así, está correcto**.

---

## 5. DESPLEGAR FRONTEND EN VERCEL

### 5.1 Preparar el frontend

**Paso 5.1.1**: Asegúrate de que `frontend/js/api.js` tenga la URL correcta del backend (paso 4.1)

**Paso 5.1.2**: Crea un archivo `vercel.json` en la raíz del proyecto (no en frontend/):

```json
{
  "buildCommand": "echo 'No build needed'",
  "outputDirectory": "frontend",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Paso 5.1.3**: Si no existe, crea un `package.json` en la raíz del proyecto:

```json
{
  "name": "mediturnos",
  "version": "1.0.0",
  "description": "Sistema de gestión de turnos médicos"
}
```

### 5.2 Crear cuenta en Vercel

**Paso 5.2.1**: Ve a https://vercel.com

**Paso 5.2.2**: Haz clic en "Sign Up" y elige "Continue with GitHub"

**Paso 5.2.3**: Autoriza Vercel a acceder a tu GitHub

### 5.3 Importar proyecto en Vercel

**Paso 5.3.1**: En el dashboard de Vercel, haz clic en "Add New..." → "Project"

**Paso 5.3.2**: Selecciona tu repositorio de GitHub

**Paso 5.3.3**: Vercel detectará automáticamente la configuración

### 5.4 Configurar proyecto en Vercel

**Paso 5.4.1**: En "Framework Preset", selecciona "Other" o déjalo en "Auto"

**Paso 5.4.2**: En "Root Directory", escribe: `frontend`

✅ **Importante**: Esto le dice a Vercel que el código del frontend está en la carpeta `frontend/`

**Paso 5.4.3**: En "Build Command", déjalo vacío o escribe: `echo 'No build needed'`

**Paso 5.4.4**: En "Output Directory", escribe: `.` (punto)

**Paso 5.4.5**: En "Install Command", déjalo vacío

### 5.5 Configurar variables de entorno en Vercel (si es necesario)

**Paso 5.5.1**: En la configuración del proyecto, ve a "Environment Variables"

**Paso 5.5.2**: Por ahora no necesitas variables aquí, pero si en el futuro necesitas alguna, agrégala aquí.

### 5.6 Desplegar

**Paso 5.6.1**: Haz clic en "Deploy"

**Paso 5.6.2**: Espera 1-2 minutos mientras Vercel despliega

✅ **Indicador**: Verás un check verde cuando termine

### 5.7 Obtener URL pública del frontend

**Paso 5.7.1**: Una vez desplegado, verás una URL como: `https://tu-proyecto.vercel.app`

**Paso 5.7.2**: Copia esta URL completa

**⚠️ IMPORTANTE**: Guarda esta URL.

### 5.8 Actualizar FRONTEND_URL en Railway

**Paso 5.8.1**: Vuelve a Railway → Servicio de backend → Variables

**Paso 5.8.2**: Edita la variable `FRONTEND_URL`

**Paso 5.8.3**: Cambia el valor a la URL de Vercel (sin barra final):

```
https://tu-proyecto.vercel.app
```

**Paso 5.8.4**: Guarda los cambios

**Paso 5.8.5**: Railway redeployará automáticamente (o haz clic en "Redeploy")

---

## 6. PRUEBAS FINALES

### 6.1 Probar login por cada rol

**Paso 6.1.1**: Abre la URL de Vercel en el navegador

**Paso 6.1.2**: Haz clic en "Iniciar Sesión"

**Paso 6.1.3**: Prueba con cada usuario del seed:

**Usuario Administrador:**
- Email: `admin@mediturnos.com`
- Password: `Password123`
- ✅ Deberías ver el dashboard de administrador

**Usuario Médico:**
- Email: `medico1@mediturnos.com`
- Password: `Password123`
- ✅ Deberías ver el dashboard de médico

**Usuario Secretario:**
- Email: `secretario@mediturnos.com`
- Password: `Password123`
- ✅ Deberías ver el dashboard de secretario

**Usuario Paciente:**
- Email: `paciente1@mediturnos.com`
- Password: `Password123`
- ✅ Deberías ver el dashboard de paciente

### 6.2 Probar registro de nuevo usuario

**Paso 6.2.1**: En la página de login, haz clic en "Registrarse"

**Paso 6.2.2**: Completa el formulario con datos nuevos

**Paso 6.2.3**: Selecciona rol "Paciente"

**Paso 6.2.4**: Haz clic en "Crear Cuenta"

✅ **Resultado esperado**: Deberías ser redirigido al dashboard de paciente

### 6.3 Probar crear turnos (como paciente)

**Paso 6.3.1**: Inicia sesión como paciente

**Paso 6.3.2**: Busca la opción "Nuevo Turno" o "Crear Turno"

**Paso 6.3.3**: Completa el formulario:
- Selecciona un médico
- Selecciona una fecha
- Selecciona una hora disponible

**Paso 6.3.4**: Haz clic en "Guardar"

✅ **Resultado esperado**: Deberías ver el turno creado en tu lista de turnos

### 6.4 Probar cancelar turnos

**Paso 6.4.1**: En tu lista de turnos, busca un turno con estado "PENDIENTE" o "CONFIRMADO"

**Paso 6.4.2**: Haz clic en "Cancelar" o el botón de eliminar

**Paso 6.4.3**: Confirma la cancelación

✅ **Resultado esperado**: El turno debería cambiar a estado "CANCELADO"

### 6.5 Probar ver historial (como paciente)

**Paso 6.5.1**: Como paciente, busca la opción "Historial" o "Historial Médico"

**Paso 6.5.2**: Deberías ver tus turnos completados y notas médicas (si las hay)

✅ **Resultado esperado**: Lista de turnos y notas médicas

### 6.6 Probar panel del médico

**Paso 6.6.1**: Inicia sesión como médico

**Paso 6.6.2**: Verifica que puedas ver:
- ✅ Tus turnos del día
- ✅ Tu disponibilidad
- ✅ Opción de crear notas médicas

**Paso 6.6.3**: Intenta crear una nota médica para un paciente que tenga un turno contigo

✅ **Resultado esperado**: La nota médica se crea exitosamente

### 6.7 Probar panel del secretario

**Paso 6.7.1**: Inicia sesión como secretario

**Paso 6.7.2**: Verifica que puedas ver:
- ✅ Todos los turnos
- ✅ Lista de pacientes
- ✅ Lista de médicos
- ✅ Opción de crear turnos para cualquier paciente

**Paso 6.7.3**: Intenta crear un turno para un paciente

✅ **Resultado esperado**: El turno se crea exitosamente

### 6.8 Probar panel del administrador

**Paso 6.8.1**: Inicia sesión como administrador

**Paso 6.8.2**: Verifica que puedas ver:
- ✅ Gestión de usuarios
- ✅ Gestión de especialidades
- ✅ Estadísticas generales
- ✅ Opción de activar/desactivar usuarios

**Paso 6.8.3**: Intenta crear una nueva especialidad

✅ **Resultado esperado**: La especialidad se crea exitosamente

### 6.9 Validar permisos

**Paso 6.9.1**: Como paciente, intenta acceder directamente a una URL de administrador:
```
https://tu-frontend.vercel.app/dashboard/administrador.html
```

✅ **Resultado esperado**: Deberías ser redirigido o ver un error de permisos

**Paso 6.9.2**: Como médico, intenta ver todos los pacientes (no solo los que tienen turnos contigo)

✅ **Resultado esperado**: Solo deberías ver pacientes con turnos asignados a ti

---

## 7. SOLUCIÓN DE PROBLEMAS COMUNES

### 7.1 Error CORS

**Síntoma**: En la consola del navegador ves:
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Solución**:

1. Ve a Railway → Servicio backend → Variables
2. Verifica que `FRONTEND_URL` tenga exactamente la URL de Vercel (sin barra final)
3. Ejemplo correcto: `https://tu-proyecto.vercel.app`
4. Ejemplo incorrecto: `https://tu-proyecto.vercel.app/`
5. Guarda y espera a que redeploye
6. Limpia la caché del navegador (Ctrl+Shift+Delete)

### 7.2 Error 401 Unauthorized

**Síntoma**: Al hacer login, ves error 401

**Solución**:

1. Verifica que el token se esté guardando en localStorage:
   - Abre consola del navegador (F12)
   - Ve a "Application" → "Local Storage"
   - Deberías ver `authToken` con un valor largo
2. Si no hay token, verifica que el login esté funcionando correctamente
3. Verifica que `JWT_SECRET` esté configurado en Railway
4. Verifica que la URL del backend en `api.js` sea correcta

### 7.3 Error 500 Internal Server Error

**Síntoma**: El backend responde con error 500

**Solución**:

1. Ve a Railway → Servicio backend → Deployments
2. Haz clic en el deployment más reciente
3. Ve a "Logs" para ver el error específico
4. Errores comunes:
   - **"DATABASE_URL is not set"**: Agrega la variable en Railway
   - **"Table does not exist"**: Ejecuta `npx prisma migrate deploy` en Railway
   - **"JWT_SECRET is not set"**: Agrega la variable en Railway

### 7.4 Las tablas no se crearon

**Síntoma**: Error al hacer queries, dice que la tabla no existe

**Solución**:

1. En Railway, abre el terminal del servicio backend
2. Ejecuta: `npx prisma migrate deploy`
3. Verifica que todas las migraciones se aplicaron
4. Si hay errores, ejecuta: `npx prisma db push` (solo en desarrollo, no recomendado en producción)

### 7.5 El frontend no carga

**Síntoma**: Vercel muestra error o página en blanco

**Solución**:

1. Verifica que el "Root Directory" en Vercel sea `frontend`
2. Verifica que los archivos HTML estén en `frontend/`
3. Revisa los logs de deploy en Vercel
4. Verifica que `vercel.json` esté en la raíz del proyecto

### 7.6 No puedo hacer login

**Síntoma**: El formulario de login no funciona

**Solución**:

1. Abre la consola del navegador (F12 → Console)
2. Busca errores en rojo
3. Verifica que `api.js` esté cargado correctamente:
   - Ve a "Network" en las herramientas de desarrollador
   - Recarga la página
   - Busca `api.js` en la lista
   - Debería tener status 200
4. Verifica que la URL del backend en `api.js` sea correcta
5. Prueba hacer una petición manual en la consola:
   ```javascript
   fetch('https://tu-backend.railway.app/health')
     .then(r => r.json())
     .then(console.log)
   ```

### 7.7 Las notificaciones no aparecen

**Síntoma**: No ves notificaciones aunque deberías

**Solución**:

1. Verifica que el sistema de notificaciones esté implementado en el frontend
2. Verifica que el backend esté creando notificaciones (revisa logs)
3. Verifica que el frontend esté consultando las notificaciones periódicamente

### 7.8 Los turnos no se crean

**Síntoma**: Al intentar crear un turno, da error o no aparece

**Solución**:

1. Abre la consola del navegador y busca errores
2. Verifica que el médico tenga disponibilidad configurada
3. Verifica que la fecha y hora sean válidas
4. Verifica que no haya conflictos de horario
5. Revisa los logs del backend en Railway para ver el error específico

---

## ✅ CHECKLIST FINAL

Antes de considerar el proyecto completo, verifica:

- [ ] Backend desplegado en Railway y funcionando
- [ ] Base de datos creada y migraciones aplicadas
- [ ] Frontend desplegado en Vercel y accesible
- [ ] Login funciona para todos los roles
- [ ] Registro de nuevos usuarios funciona
- [ ] Crear turnos funciona
- [ ] Cancelar turnos funciona
- [ ] Ver historial funciona
- [ ] Panel de médico funciona
- [ ] Panel de secretario funciona
- [ ] Panel de administrador funciona
- [ ] Permisos están funcionando correctamente
- [ ] No hay errores CORS
- [ ] No hay errores en la consola del navegador

---

## 🎉 ¡FELICITACIONES!

Si has completado todos los pasos y el checklist, tu sistema Mediturnos está completamente funcional y accesible desde internet.

**URLs importantes**:
- Frontend: `https://tu-proyecto.vercel.app`
- Backend: `https://tu-backend.railway.app`
- Health Check: `https://tu-backend.railway.app/health`

**Próximos pasos opcionales**:
- Configurar dominio personalizado
- Agregar más funcionalidades
- Mejorar el diseño
- Agregar tests automatizados
- Configurar monitoreo

---

**Última actualización**: 2024

