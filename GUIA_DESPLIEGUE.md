# 🚀 Guía de Despliegue - MediTurnos

Esta guía te ayudará a desplegar tu aplicación MediTurnos en un hosting accesible por link.

## 📋 Opción Recomendada: Render + Netlify

### Parte 1: Desplegar Backend en Render

#### Paso 1: Preparar el repositorio

1. Asegúrate de que tu código esté en GitHub
2. Verifica que `backend/package.json` tenga el script `start`:
```json
"scripts": {
  "start": "node src/server.js"
}
```

#### Paso 2: Crear base de datos PostgreSQL en Render

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click en "New +" → "PostgreSQL"
3. Configura:
   - **Name**: `mediturnos-db`
   - **Database**: `mediturnos`
   - **User**: (se genera automáticamente)
   - **Region**: Elige la más cercana
   - **Plan**: Free (para desarrollo)
4. Click en "Create Database"
5. **IMPORTANTE**: Copia la "Internal Database URL" (la necesitarás)

#### Paso 3: Crear servicio Web para el Backend

1. En Render Dashboard, click en "New +" → "Web Service"
2. Conecta tu repositorio de GitHub
3. Configura:
   - **Name**: `mediturnos-backend`
   - **Environment**: `Node`
   - **Build Command**: 
     ```bash
     cd backend && npm install && npx prisma generate && npx prisma migrate deploy
     ```
   - **Start Command**: 
     ```bash
     cd backend && npm start
     ```
   - **Root Directory**: Dejar vacío (o `backend` si Render lo requiere)

#### Paso 4: Configurar Variables de Entorno

En la sección "Environment Variables" del servicio web, agrega:

```
DATABASE_URL=<tu-internal-database-url-de-render>
JWT_SECRET=<genera-un-secret-aleatorio-y-seguro>
JWT_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=https://tu-app.netlify.app
PORT=10000
```

**Generar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Paso 5: Desplegar

1. Click en "Create Web Service"
2. Espera a que termine el build (puede tardar varios minutos)
3. Una vez desplegado, copia la URL del servicio (ej: `https://mediturnos-backend.onrender.com`)

### Parte 2: Desplegar Frontend en Netlify

#### Paso 1: Preparar archivos

1. Crea un archivo `netlify.toml` en la raíz del proyecto:
```toml
[build]
  publish = "frontend"
  command = "echo 'No build needed'"

[[redirects]]
  from = "/*"
  to = "/landing.html"
  status = 200
```

2. Actualiza `frontend/js/api.js` para usar la URL de producción:
```javascript
const API_BASE_URL = 'https://tu-backend-url.onrender.com/api';
```

O mejor aún, usa una variable de entorno:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```

#### Paso 2: Desplegar en Netlify

1. Ve a [Netlify](https://app.netlify.com)
2. Click en "Add new site" → "Import an existing project"
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Base directory**: `frontend`
   - **Build command**: (dejar vacío o el de netlify.toml)
   - **Publish directory**: `frontend`
5. Click en "Deploy site"
6. Una vez desplegado, copia la URL (ej: `https://mediturnos.netlify.app`)

#### Paso 3: Actualizar CORS en Backend

Vuelve a Render y actualiza la variable de entorno:
```
FRONTEND_URL=https://tu-app.netlify.app
```

Reinicia el servicio para aplicar los cambios.

### Parte 3: Verificar Despliegue

1. Abre la URL de Netlify en tu navegador
2. Intenta registrarte
3. Verifica que puedas iniciar sesión
4. Prueba las funcionalidades principales

## 🔄 Alternativa: Railway (Todo en uno)

### Paso 1: Crear proyecto en Railway

1. Ve a [Railway](https://railway.app)
2. Click en "New Project" → "Deploy from GitHub repo"
3. Selecciona tu repositorio

### Paso 2: Agregar PostgreSQL

1. En el proyecto, click en "+ New" → "Database" → "Add PostgreSQL"
2. Railway creará automáticamente la base de datos

### Paso 3: Configurar Backend

1. Click en "+ New" → "GitHub Repo"
2. Selecciona tu repositorio
3. Railway detectará automáticamente que es Node.js
4. En "Settings" → "Root Directory", pon: `backend`
5. En "Settings" → "Build Command", pon:
   ```bash
   npm install && npx prisma generate && npx prisma migrate deploy
   ```
6. En "Settings" → "Start Command", pon:
   ```bash
   npm start
   ```

### Paso 4: Variables de Entorno

Railway automáticamente inyecta `DATABASE_URL`. Agrega manualmente:

```
JWT_SECRET=<genera-un-secret-aleatorio>
JWT_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=https://tu-frontend-url.netlify.app
PORT=3000
```

### Paso 5: Desplegar Frontend

Sigue los mismos pasos de Netlify de la opción anterior.

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"

- Verifica que `DATABASE_URL` esté correctamente configurada
- Asegúrate de usar la "Internal Database URL" en Render
- Verifica que las migraciones se hayan ejecutado

### Error: CORS

- Verifica que `FRONTEND_URL` en el backend coincida exactamente con la URL de tu frontend
- Incluye el protocolo (`https://`)

### Error: "Prisma Client not generated"

- Asegúrate de que el build command incluya `npx prisma generate`
- Verifica que `@prisma/client` esté en `dependencies` (no `devDependencies`)

### El frontend no carga los datos

- Abre la consola del navegador (F12)
- Verifica que `API_BASE_URL` en `api.js` apunte a tu backend desplegado
- Verifica que no haya errores de CORS

## 📝 Checklist de Despliegue

- [ ] Base de datos PostgreSQL creada
- [ ] Backend desplegado y funcionando
- [ ] Variables de entorno configuradas
- [ ] Migraciones ejecutadas
- [ ] Frontend desplegado
- [ ] `API_BASE_URL` actualizado en el frontend
- [ ] CORS configurado correctamente
- [ ] Pruebas de registro e inicio de sesión
- [ ] Pruebas de funcionalidades principales

## 🔒 Seguridad en Producción

1. **JWT_SECRET**: Debe ser una cadena aleatoria y segura (mínimo 32 caracteres)
2. **HTTPS**: Asegúrate de que tanto frontend como backend usen HTTPS
3. **Variables de entorno**: Nunca commitees el archivo `.env`
4. **Rate limiting**: Considera agregar rate limiting al backend para prevenir abusos

## 📞 Soporte

Si encuentras problemas durante el despliegue:

1. Revisa los logs en Render/Railway
2. Verifica la consola del navegador
3. Revisa que todas las variables de entorno estén configuradas
4. Asegúrate de que las migraciones se hayan ejecutado correctamente

---

**¡Felicitaciones!** Tu aplicación debería estar funcionando en producción. 🎉

