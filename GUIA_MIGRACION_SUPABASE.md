# 🚀 Guía Completa: Migración de Neon a Supabase

Esta guía te llevará paso a paso para migrar tu base de datos de Neon a Supabase, una alternativa más estable y confiable.

---

## 📋 ¿Por qué Supabase?

✅ **Más estable**: No se pausa automáticamente como Neon  
✅ **Mejor para Prisma**: Conexiones directas sin problemas  
✅ **Plan gratuito generoso**: 500 MB de base de datos  
✅ **Interfaz intuitiva**: Fácil de usar y configurar  
✅ **Sin problemas de conexión**: Conexiones persistentes y confiables  

---

## 🎯 PASO 1: Crear cuenta y proyecto en Supabase

### Paso 1.1: Ir a Supabase
1. Abre tu navegador
2. Ve a: **https://supabase.com**
3. Haz clic en **"Start your project"** o **"Sign In"**

### Paso 1.2: Registrarse
1. **Opción recomendada**: Haz clic en **"Continue with GitHub"**
   - Esto te permite usar tu cuenta de GitHub
   - Autoriza Supabase a acceder a tu GitHub
   
2. **Alternativa**: Puedes registrarte con email
   - Ingresa tu email
   - Verifica tu email (revisa tu bandeja de entrada)
   - Crea una contraseña

### Paso 1.3: Crear un nuevo proyecto
1. Una vez dentro de Supabase, verás un botón **"New Project"** o **"Create a new project"**
2. Haz clic en ese botón

### Paso 1.4: Configurar el proyecto
1. **Nombre del proyecto**: Escribe `mediturnos` (o el nombre que prefieras)
2. **Database Password**: 
   - **IMPORTANTE**: Crea una contraseña segura y **GUÁRDALA EN UN LUGAR SEGURO**
   - Ejemplo: `MiPasswordSeguro123!@#`
   - ⚠️ **No la pierdas**, la necesitarás para la conexión
3. **Region**: Elige la región más cercana a ti:
   - `US East (North Virginia)` - Para América del Norte
   - `US West (Oregon)` - Para América del Oeste
   - `Europe (Ireland)` - Para Europa
   - `Asia Pacific (Singapore)` - Para Asia
4. **Pricing Plan**: Selecciona **"Free"** (plan gratuito)
5. Haz clic en **"Create new project"**

### Paso 1.5: Esperar la creación
- Supabase creará tu base de datos automáticamente
- Esto toma aproximadamente **1-2 minutos**
- Verás un mensaje de "Setting up your project..." y luego "Project ready!" ✅

---

## 🔗 PASO 2: Obtener la DATABASE_URL de Supabase

### Paso 2.1: Ir a la configuración de la base de datos
1. Una vez que tu proyecto esté listo, verás el dashboard de Supabase
2. En el menú lateral izquierdo, haz clic en **"Settings"** (⚙️)
3. Luego haz clic en **"Database"**

### Paso 2.2: Encontrar la Connection String
1. Desplázate hacia abajo hasta la sección **"Connection string"**
2. Verás varias pestañas: `URI`, `JDBC`, `Golang`, etc.
3. Haz clic en la pestaña **"URI"**

### Paso 2.3: Copiar la Connection String
1. Verás algo como esto:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
2. **IMPORTANTE**: Reemplaza `[YOUR-PASSWORD]` con la contraseña que creaste en el Paso 1.4
3. **Ejemplo completo**:
   ```
   postgresql://postgres:MiPasswordSeguro123!@#@db.abcdefghijklmnop.supabase.co:5432/postgres
   ```
4. **Copia toda la URL completa** (con tu contraseña incluida)

### Paso 2.4: Formato correcto para Prisma
La URL debería verse así:
```
postgresql://postgres:TU_PASSWORD@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

**Nota**: Si la URL no incluye `?sslmode=require`, agrégalo al final.

✅ **Verificación**: Si tienes una URL que empieza con `postgresql://` y termina con `?sslmode=require`, estás listo para continuar.

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

2. **Reemplaza toda esa línea** con la URL que copiaste de Supabase:
   ```
   DATABASE_URL="postgresql://postgres:TU_PASSWORD@db.xxxxx.supabase.co:5432/postgres?sslmode=require"
   ```
   
   ⚠️ **IMPORTANTE**: 
   - Pega la URL EXACTA que copiaste de Supabase
   - Mantén las comillas dobles `"` alrededor de la URL
   - No dejes espacios antes o después
   - Asegúrate de que incluya `?sslmode=require` al final

### Paso 3.3: Verificar el archivo completo
Tu archivo `.env` debería verse así:

```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD@db.xxxxx.supabase.co:5432/postgres?sslmode=require"
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
3. **O mejor aún**: Mantén las migraciones pero crearemos una nueva para Supabase

### Paso 4.2: Verificar que el schema.prisma esté correcto
El schema.prisma ya está bien configurado, no necesita cambios. Solo verifica que tenga:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 🚀 PASO 5: Ejecutar las migraciones en Supabase

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
npx prisma migrate dev --name init_supabase
```

**¿Qué hace esto?**
- Crea todas las tablas en tu base de datos de Supabase
- Crea un archivo de migración que registra los cambios
- Sincroniza tu esquema con la base de datos

✅ **Resultado esperado**: Deberías ver:
```
✔ Migration `init_supabase` applied successfully
```

**Si ves algún error**:
- Verifica que la DATABASE_URL en `.env` esté correcta
- Asegúrate de que copiaste la URL completa de Supabase
- Revisa que no haya espacios extra en el archivo `.env`
- Verifica que la contraseña esté correcta

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

## 🧹 PASO 7: Limpiar referencias a Neon (opcional)

### Paso 7.1: Verificar archivos
Busca en tu proyecto cualquier referencia a "neon" o "neondb":
- Archivos de documentación
- Comentarios en el código
- Variables de entorno de ejemplo

### Paso 7.2: Actualizar documentación
Si tienes archivos README o guías, actualiza las referencias a Supabase.

---

## 🎉 ¡Felicidades!

Has completado la migración de Neon a Supabase. Ahora tienes:

1. ✅ Base de datos PostgreSQL estable en Supabase
2. ✅ DATABASE_URL configurada correctamente
3. ✅ Migraciones aplicadas sin errores
4. ✅ Prisma Studio funcionando
5. ✅ Servidor backend conectado correctamente

---

## 🔧 Solución de Problemas Comunes

### Error: "Environment variable not found: DATABASE_URL"
**Solución**: 
- Verifica que el archivo `.env` esté en la carpeta `backend/`
- Verifica que la línea `DATABASE_URL=...` no tenga espacios antes del `=`
- Reinicia la terminal después de editar `.env`

### Error: "Can't reach database server"
**Solución**:
- Verifica que copiaste la URL completa de Supabase
- Asegúrate de que la URL incluye `?sslmode=require` al final
- Verifica que la contraseña esté correcta (sin espacios extra)
- Verifica tu conexión a internet

### Error: "password authentication failed"
**Solución**:
- Verifica que la contraseña en la DATABASE_URL sea la correcta
- Asegúrate de que reemplazaste `[YOUR-PASSWORD]` con tu contraseña real
- La contraseña puede tener caracteres especiales, asegúrate de copiarla correctamente

### Error: "Migration failed"
**Solución**:
- Asegúrate de que la base de datos en Supabase esté activa
- Verifica que la DATABASE_URL sea correcta
- Intenta ejecutar: `npx prisma migrate reset` (⚠️ esto borrará todos los datos)

---

## 📚 Recursos Adicionales

- **Documentación de Supabase**: https://supabase.com/docs
- **Documentación de Prisma**: https://www.prisma.io/docs
- **Guía de Despliegue**: Ver `GUIA_DESPLIEGUE.md`

---

## 🆘 ¿Necesitas ayuda?

Si encuentras algún problema:
1. Revisa la sección "Solución de Problemas Comunes" arriba
2. Verifica que seguiste todos los pasos en orden
3. Asegúrate de que la DATABASE_URL esté correctamente copiada

---

**Última actualización**: Esta guía está diseñada para migrar de Neon a Supabase sin perder datos ni configuración.

