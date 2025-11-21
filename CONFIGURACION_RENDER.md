# ⚙️ CONFIGURACIÓN RENDER - TUS URLs

## 📊 Base de Datos PostgreSQL

**Internal Database URL** (para usar en Render):
```
postgresql://mediturnos_user:v52KrfNlMuNUkiDgjCYRAgUgytWS0UtP@dpg-d4gdg3npm1nc73f92dag-a/mediturnos
```

**External Database URL** (para usar desde tu computadora):
```
postgresql://mediturnos_user:v52KrfNlMuNUkiDgjCYRAgUgytWS0UtP@dpg-d4gdg3npm1nc73f92dag-a.oregon-postgres.render.com/mediturnos
```

## 🔧 PASOS INMEDIATOS

### 1. Ejecutar SQL en la Base de Datos

**OPCIÓN A: DBeaver (Recomendado)**
1. Descarga DBeaver: https://dbeaver.io/download/
2. Nueva conexión → PostgreSQL
3. Usa la **External Database URL** completa
4. Abre `backend/database.sql`
5. Copia TODO y ejecuta en DBeaver

**OPCIÓN B: Desde tu computadora**
1. Crea `backend/.env` con:
   ```
   DATABASE_URL=postgresql://mediturnos_user:v52KrfNlMuNUkiDgjCYRAgUgytWS0UtP@dpg-d4gdg3npm1nc73f92dag-a.oregon-postgres.render.com/mediturnos
   ```
2. Ejecuta: `cd backend && npm install && node init-db.js`

### 2. Configurar Backend en Render

1. Ve a tu servicio backend en Render
2. "Environment" → Agrega estas variables:
   - `DATABASE_URL` = `postgresql://mediturnos_user:v52KrfNlMuNUkiDgjCYRAgUgytWS0UtP@dpg-d4gdg3npm1nc73f92dag-a/mediturnos`
   - `SESSION_SECRET` = (genera uno: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `PORT` = `10000`
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = (déjalo vacío por ahora)

### 3. Verificar que funciona

1. Una vez desplegado, copia la URL de tu backend (ejemplo: `https://mediturnos-backend.onrender.com`)
2. Abre: `https://tu-backend.onrender.com/api/health`
3. Deberías ver: `{"status":"ok","message":"MediTurnos API funcionando"}`

### 4. Actualizar Frontend

1. Abre `frontend/js/api.js`
2. Reemplaza la URL con tu link real de Render
3. Guarda y haz commit a GitHub
4. Netlify se actualizará automáticamente

---

**IMPORTANTE**: 
- Usa **Internal URL** en Render (sin `.oregon-postgres.render.com`)
- Usa **External URL** desde tu computadora (con `.oregon-postgres.render.com`)

