# ⚡ PASOS RÁPIDOS - YA TIENES LA BASE DE DATOS

## ✅ LO QUE YA TIENES

- ✅ Base de datos PostgreSQL creada en Render
- ✅ Tablas creadas correctamente
- ✅ Usuario admin creado (admin@mediturnos.com / password123)

## 🎯 PASOS INMEDIATOS

### 1. ✅ Ejecutar SQL (COMPLETADO)

### 2. Desplegar Backend en Render (10 minutos)

1. Render → "New +" → "Web Service"
2. Conecta GitHub → Selecciona tu repo
3. Configura:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Environment Variables:
   ```
   DATABASE_URL=postgresql://mediturnos_user:v52KrfNlMuNUkiDgjCYRAgUgytWS0UtP@dpg-d4gdg3npm1nc73f92dag-a/mediturnos
   SESSION_SECRET=(genera uno con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   PORT=10000
   NODE_ENV=production
   ```
5. Click "Create Web Service"
6. Espera 3-5 minutos
7. Copia la URL (ejemplo: `https://mediturnos-backend.onrender.com`)

### 3. Actualizar Frontend (2 minutos)

1. Abre `frontend/js/api.js`
2. Línea 2, reemplaza con tu URL de Render:
   ```javascript
   const API_BASE_URL = 'https://tu-backend.onrender.com/api';
   ```
3. Guarda y haz commit a GitHub

### 4. Desplegar Frontend en Netlify (5 minutos)

1. Netlify → "Add new site" → "Import from Git"
2. Conecta GitHub → Selecciona tu repo
3. Configuración:
   - Base directory: (vacío)
   - Build command: (vacío)
   - Publish directory: `.`
4. Click "Deploy"
5. Copia la URL (ejemplo: `https://mediturnos.netlify.app`)

### 5. Actualizar CORS (1 minuto)

1. Render → Tu servicio backend → "Environment"
2. Agrega/actualiza: `FRONTEND_URL` = tu URL de Netlify
3. Render se reiniciará automáticamente

## ✅ LISTO

Abre tu URL de Netlify y prueba:
- Registrarte
- Iniciar sesión (admin@mediturnos.com / password123)
- Crear turnos

---

**Total: ~25 minutos**

