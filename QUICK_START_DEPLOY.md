# 🚀 Quick Start - Despliegue Rápido

Guía resumida para desplegar Mediturnos en producción.

## 📋 Checklist Pre-Despliegue

- [ ] Backend funciona localmente
- [ ] Schema.prisma validado
- [ ] Migraciones creadas (`npx prisma migrate dev --name init`)
- [ ] Código subido a GitHub

## 🔧 Pasos Rápidos

### 1. Base de Datos (Railway)

1. Crear cuenta en https://railway.app
2. New Project → Add PostgreSQL
3. Copiar `DATABASE_URL` de Variables

### 2. Backend (Railway)

1. Add Service → GitHub Repo
2. Seleccionar repositorio
3. Settings:
   - Root Directory: `backend`
   - Start Command: `npm start`
4. Variables:
   - `DATABASE_URL`: (de paso 1)
   - `JWT_SECRET`: (generar clave aleatoria)
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: (actualizar después)
5. Deploy → Terminal → `npx prisma migrate deploy`
6. Copiar URL pública del backend

### 3. Frontend (Vercel)

1. Crear cuenta en https://vercel.com
2. Import Project → GitHub
3. Settings:
   - Root Directory: `frontend`
   - Build Command: (vacío)
   - Output Directory: `.`
4. Deploy
5. Copiar URL pública

### 4. Integración

1. Actualizar `frontend/js/api.js`:
   ```javascript
   const API_BASE_URL = 'https://tu-backend.railway.app/api';
   ```

2. Actualizar `FRONTEND_URL` en Railway:
   ```
   https://tu-frontend.vercel.app
   ```

3. Commit y push cambios

4. Vercel redeploy automático

## ✅ Verificación

1. Health check: `https://tu-backend.railway.app/health`
2. Login: `https://tu-frontend.vercel.app`
3. Credenciales de prueba:
   - Admin: `admin@mediturnos.com` / `Password123`
   - Médico: `medico1@mediturnos.com` / `Password123`
   - Secretario: `secretario@mediturnos.com` / `Password123`
   - Paciente: `paciente1@mediturnos.com` / `Password123`

## 🆘 Problemas Comunes

**CORS Error**: Verificar `FRONTEND_URL` en Railway

**401 Error**: Verificar `JWT_SECRET` en Railway

**500 Error**: Revisar logs en Railway → Deployments

**Tablas no existen**: Ejecutar `npx prisma migrate deploy` en Railway terminal

---

**Guía completa**: Ver `GUIA_DESPLIEGUE.md`

