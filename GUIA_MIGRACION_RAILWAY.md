# 🚀 Guía Completa: Migración de Neon a Railway PostgreSQL

Esta guía te llevará paso a paso para migrar tu base de datos de Neon a Railway PostgreSQL.

---

## 📋 ¿Por qué Railway?

✅ **Muy estable**: No se pausa automáticamente  
✅ **Excelente para Prisma**: Conexiones directas sin problemas  
✅ **Plan gratuito**: $5 de crédito mensual (suficiente para desarrollo)  
✅ **Fácil de usar**: Interfaz simple y clara  
✅ **Sin problemas de conexión**: Conexiones persistentes  

---

## 🎯 PASO 1: Crear cuenta y proyecto en Railway

### Paso 1.1: Ir a Railway
1. Abre tu navegador
2. Ve a: **https://railway.app**
3. Haz clic en **"Login"** o **"Start a New Project"**

### Paso 1.2: Registrarse
1. **Opción recomendada**: Haz clic en **"Sign up with GitHub"**
   - Esto te permite usar tu cuenta de GitHub
   - Autoriza Railway a acceder a tu GitHub
   
2. **Alternativa**: Puedes registrarte con email
   - Ingresa tu email
   - Verifica tu email (revisa tu bandeja de entrada)
   - Crea una contraseña

### Paso 1.3: Crear un nuevo proyecto
1. Una vez dentro de Railway, verás un botón **"New Project"**
2. Haz clic en ese botón

### Paso 1.4: Agregar base de datos PostgreSQL
1. En el menú desplegable, selecciona **"Empty Project"** o **"New"**
2. Dale un nombre al proyecto: `mediturnos-db` (o el nombre que prefieras)
3. Haz clic en **"+ New"** o **"Add Service"**
4. Selecciona **"Database"** → **"Add PostgreSQL"**

### Paso 1.5: Esperar la creación
- Railway creará tu base de datos PostgreSQL automáticamente
- Esto toma aproximadamente **30-60 segundos**
- Verás un mensaje de "Provisioning..." y luego "Deployed" ✅

---

## 🔗 PASO 2: Obtener la DATABASE_URL de Railway

### Paso 2.1: Ir a la configuración de la base de datos
1. Una vez que tu base de datos esté lista, haz clic en el servicio **"PostgreSQL"**
2. Verás el panel de configuración de la base de datos

### Paso 2.2: Encontrar la Connection String
1. Ve a la pestaña **"Variables"** o **"Connect"**
2. Busca la variable `DATABASE_URL` o `POSTGRES_URL`
3. También puedes verla en la pestaña **"Data"**

### Paso 2.3: Copiar la Connection String
1. Verás algo como esto:
   ```
   postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
   ```
2. Haz clic en el ícono de **"copiar"** o selecciona y copia toda la URL

### Paso 2.4: Formato correcto para Prisma
La URL debería verse así:
```
postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

**Nota**: Railway generalmente no requiere `?sslmode=require`, pero si Prisma lo pide, puedes agregarlo:
```
postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway?sslmode=require
```

✅ **Verificación**: Si tienes una URL que empieza con `postgresql://`, estás listo para continuar.

---

## ⚙️ PASO 3: Actualizar el archivo .env

### Paso 3.1: Abrir el archivo .env
1. Abre tu editor de código (VS Code, Cursor, etc.)
2. Navega a la carpeta `backend` de tu proyecto
3. Abre el archivo `.env`

### Paso 3.2: Reemplazar DATABASE_URL
1. Encuentra la línea que dice:
   ```
   DATABASE_URL="postgresql://neondb_owner:..."
   ```
   O cualquier URL que tenga `neon` o `neondb`

2. **Reemplaza toda esa línea** con la URL que copiaste de Railway:
   ```
   DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"
   ```
   
   ⚠️ **IMPORTANTE**: 
   - Pega la URL EXACTA que copiaste de Railway
   - Mantén las comillas dobles `"` alrededor de la URL
   - No dejes espacios antes o después

### Paso 3.3: Verificar el archivo completo
Tu archivo `.env` debería verse así:

```env
DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"
JWT_SECRET="clave_secreta_local_12345"
NODE_ENV=development
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

### Paso 3.4: Guardar el archivo
- Guarda el archivo (Ctrl+S o Cmd+S)

---

## 🔄 PASO 4: Limpiar migraciones anteriores de Neon

### Paso 4.1: Eliminar migraciones antiguas (opcional pero recomendado)
Si quieres empezar limpio, puedes eliminar las migraciones anteriores:

1. Ve a la carpeta `backend/prisma/migrations`
2. Si existe una carpeta con migraciones de Neon, puedes eliminarla
3. **O mejor aún**: Mantén las migraciones pero crearemos una nueva para Railway

### Paso 4.2: Verificar que el schema.prisma esté correcto
El schema.prisma ya está bien configurado, no necesita cambios. Solo verifica que tenga:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 🚀 PASO 5: Ejecutar las migraciones en Railway

### Paso 5.1: Abrir la terminal
1. Abre tu terminal (PowerShell en Windows)
2. Navega a la carpeta `backend`:
   ```powershell
   cd backend
   ```

### Paso 5.2: Generar el cliente de Prisma
Ejecuta:
```powershell
npm run prisma:generate
```

✅ **Resultado esperado**: Deberías ver:
```
✔ Generated Prisma Client
```

### Paso 5.3: Crear la migración inicial
Ejecuta:
```powershell
npx prisma migrate dev --name init_railway
```

**¿Qué hace esto?**
- Crea todas las tablas en tu base de datos de Railway
- Crea un archivo de migración que registra los cambios
- Sincroniza tu esquema con la base de datos

✅ **Resultado esperado**: Deberías ver:
```
✔ Migration `init_railway` applied successfully
```

**Si ves algún error**:
- Verifica que la DATABASE_URL en `.env` esté correcta
- Asegúrate de que copiaste la URL completa de Railway
- Revisa que no haya espacios extra en el archivo `.env`

---

## ✅ PASO 6: Verificar que todo funciona

### Paso 6.1: Abrir Prisma Studio
Ejecuta en la terminal:
```powershell
npx prisma studio
```

Esto abrirá una página en tu navegador (generalmente en `http://localhost:5555`)

### Paso 6.2: Verificar las tablas
1. En Prisma Studio, deberías ver una lista de modelos/tablas:
   - ✅ `Usuario`
   - ✅ `Paciente`
   - ✅ `Medico`
   - ✅ `Secretario`
   - ✅ `Administrador`
   - ✅ `Especialidad`
   - ✅ `Turno`
   - ✅ `Disponibilidad`
   - ✅ `ExcepcionDisponibilidad`
   - ✅ `NotaMedica`
   - ✅ `Notificacion`
   - ✅ `Configuracion`

2. Haz clic en cualquiera de ellas para ver su estructura
3. Intenta crear un registro de prueba para verificar que funciona

✅ **Si ves todas estas tablas**: ¡Tu base de datos está configurada correctamente!

### Paso 6.3: Probar el servidor
1. Cierra Prisma Studio (Ctrl+C en la terminal)
2. Ejecuta el servidor:
   ```powershell
   npm run dev
   ```

3. Deberías ver:
   ```
   🚀 Servidor corriendo en puerto 3000
   ```

4. Abre en tu navegador: `http://localhost:3000/health`
5. Deberías ver un JSON con `{"status":"OK",...}`

✅ **Si todo funciona**: ¡La migración fue exitosa!

---

## 🔧 Solución de Problemas Comunes

### Error: "Environment variable not found: DATABASE_URL"
**Solución**: 
- Verifica que el archivo `.env` esté en la carpeta `backend/`
- Verifica que la línea `DATABASE_URL=...` no tenga espacios antes del `=`
- Reinicia la terminal después de editar `.env`

### Error: "Can't reach database server"
**Solución**:
- Verifica que copiaste la URL completa de Railway
- Verifica tu conexión a internet
- Asegúrate de que el servicio de PostgreSQL esté "Running" en Railway

### Error: "Migration failed"
**Solución**:
- Asegúrate de que la base de datos en Railway esté activa
- Verifica que la DATABASE_URL sea correcta
- Intenta ejecutar: `npx prisma migrate reset` (⚠️ esto borrará todos los datos)

---

## 📚 Recursos Adicionales

- **Documentación de Railway**: https://docs.railway.app
- **Documentación de Prisma**: https://www.prisma.io/docs
- **Guía de Despliegue**: Ver `GUIA_DESPLIEGUE.md`

---

**Última actualización**: Esta guía está diseñada para migrar de Neon a Railway sin perder datos ni configuración.

