# ⚡ Migración Rápida: Neon → Supabase/Railway

## 🎯 Resumen Ejecutivo

Esta guía rápida te ayudará a migrar de Neon a Supabase (recomendado) o Railway en menos de 10 minutos.

---

## 🚀 Opción 1: Supabase (RECOMENDADO)

### Paso 1: Crear proyecto en Supabase
1. Ve a https://supabase.com
2. Crea cuenta con GitHub
3. Click en "New Project"
4. Nombre: `mediturnos`
5. Crea una contraseña segura y **GUÁRDALA**
6. Selecciona región cercana
7. Plan: **Free**
8. Click "Create new project"
9. Espera 1-2 minutos

### Paso 2: Obtener DATABASE_URL
1. En Supabase: Settings → Database
2. Scroll hasta "Connection string"
3. Pestaña **"URI"**
4. Reemplaza `[YOUR-PASSWORD]` con tu contraseña
5. Copia la URL completa
6. Agrega `?sslmode=require` al final si no está

**Formato esperado:**
```
postgresql://postgres:TU_PASSWORD@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

### Paso 3: Actualizar .env
Abre `backend/.env` y reemplaza la línea `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD@db.xxxxx.supabase.co:5432/postgres?sslmode=require"
```

### Paso 4: Ejecutar migraciones
```powershell
cd backend
npm run prisma:generate
npx prisma migrate dev --name init_supabase
```

### Paso 5: Verificar
```powershell
npx prisma studio
# Deberías ver todas las tablas
```

---

## 🚂 Opción 2: Railway

### Paso 1: Crear proyecto en Railway
1. Ve a https://railway.app
2. Crea cuenta con GitHub
3. Click "New Project" → "Empty Project"
4. Click "+ New" → "Database" → "Add PostgreSQL"
5. Espera 30-60 segundos

### Paso 2: Obtener DATABASE_URL
1. Click en el servicio "PostgreSQL"
2. Pestaña "Variables" o "Connect"
3. Busca `DATABASE_URL` o `POSTGRES_URL`
4. Copia la URL completa

**Formato esperado:**
```
postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

### Paso 3: Actualizar .env
Abre `backend/.env` y reemplaza la línea `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"
```

### Paso 4: Ejecutar migraciones
```powershell
cd backend
npm run prisma:generate
npx prisma migrate dev --name init_railway
```

### Paso 5: Verificar
```powershell
npx prisma studio
# Deberías ver todas las tablas
```

---

## ✅ Checklist Final

- [ ] Proyecto creado en Supabase/Railway
- [ ] DATABASE_URL copiada y actualizada en `.env`
- [ ] `npm run prisma:generate` ejecutado sin errores
- [ ] `npx prisma migrate dev --name init_*` ejecutado sin errores
- [ ] Prisma Studio muestra todas las tablas
- [ ] `npm run dev` inicia sin errores
- [ ] `http://localhost:3000/health` responde correctamente

---

## 🆘 Si algo falla

1. **Error de conexión**: Verifica que la DATABASE_URL esté correcta
2. **Error de migración**: Ejecuta `npx prisma migrate reset` (⚠️ borra datos)
3. **Prisma Studio no conecta**: Verifica que el servidor esté corriendo

---

## 📚 Guías Detalladas

- **Supabase**: Ver `GUIA_MIGRACION_SUPABASE.md`
- **Railway**: Ver `GUIA_MIGRACION_RAILWAY.md`

---

**Tiempo estimado**: 10-15 minutos  
**Dificultad**: Fácil  
**Resultado**: Base de datos estable y funcional ✅

