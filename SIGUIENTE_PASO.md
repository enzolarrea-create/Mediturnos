# ✅ SIGUIENTE PASO - DESPLEGAR BACKEND EN RENDER

## ✅ LO QUE YA TIENES LISTO:
- ✅ Base de datos PostgreSQL creada
- ✅ Tablas creadas correctamente
- ✅ Usuario admin creado (admin@mediturnos.com / password123)

## 🎯 AHORA: DESPLEGAR BACKEND EN RENDER

### PASO 1: Crear Web Service en Render

1. Ve a https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Conecta tu repositorio de GitHub
4. Selecciona tu repositorio `Mediturnoscursor`
5. Click "Connect"

### PASO 2: Configurar el Servicio

Configura estos valores:

- **Name**: `mediturnos-backend`
- **Region**: `Oregon (US West)` (o la misma región de tu DB)
- **Branch**: `main` (o `master`)
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### PASO 3: Agregar Variables de Entorno

Click "Advanced" → Agrega estas variables:

```
DATABASE_URL=postgresql://mediturnos_user:v52KrfNlMuNUkiDgjCYRAgUgytWS0UtP@dpg-d4gdg3npm1nc73f92dag-a/mediturnos
SESSION_SECRET=(genera uno ejecutando: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
PORT=10000
NODE_ENV=production
FRONTEND_URL=(déjalo vacío por ahora)
```

**Para generar SESSION_SECRET:**
```bash
cd backend
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copia el resultado y pégalo como valor de `SESSION_SECRET`.

### PASO 4: Crear y Desplegar

1. Click "Create Web Service"
2. Espera 3-5 minutos mientras Render construye y despliega
3. Verás logs en tiempo real
4. Cuando termine, verás "Your service is live"
5. **COPIA LA URL** (ejemplo: `https://mediturnos-backend.onrender.com`)

### PASO 5: Verificar que Funciona

1. Abre en tu navegador: `https://tu-backend.onrender.com/api/health`
2. Deberías ver: `{"status":"ok","message":"MediTurnos API funcionando"}`

### PASO 6: Actualizar Frontend

1. Abre `frontend/js/api.js`
2. Línea 2, reemplaza:
   ```javascript
   const API_BASE_URL = 'https://tu-backend.onrender.com/api';
   ```
   Con tu URL real de Render (ejemplo):
   ```javascript
   const API_BASE_URL = 'https://mediturnos-backend.onrender.com/api';
   ```
3. Guarda el archivo
4. Haz commit y push a GitHub:
   ```bash
   git add .
   git commit -m "Actualizar URL del backend"
   git push
   ```

---

**Siguiente**: Después de esto, desplegar el frontend en Netlify (ver `PASOS_RAPIDOS.md`)

