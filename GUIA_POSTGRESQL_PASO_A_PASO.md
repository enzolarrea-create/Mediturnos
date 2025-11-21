# 🗄️ Guía Completa: Configurar PostgreSQL desde Cero

Esta guía te llevará paso a paso para crear tu primera base de datos PostgreSQL y conectarla con tu proyecto.

---

## 📋 ¿Qué vamos a hacer?

1. Crear una cuenta en Neon (servicio gratuito de PostgreSQL en la nube)
2. Crear una base de datos PostgreSQL
3. Obtener la URL de conexión (DATABASE_URL)
4. Configurar el archivo .env
5. Ejecutar las migraciones de Prisma
6. Verificar que todo funciona

**Tiempo estimado**: 10-15 minutos

---

## 🚀 PASO 1: Crear cuenta en Neon

### Paso 1.1: Ir a Neon
1. Abre tu navegador
2. Ve a: **https://neon.tech**
3. Haz clic en el botón **"Sign Up"** (Registrarse) en la esquina superior derecha

### Paso 1.2: Registrarse
1. **Opción recomendada**: Haz clic en **"Continue with GitHub"**
   - Esto te permite usar tu cuenta de GitHub (más rápido y seguro)
   - Autoriza Neon a acceder a tu GitHub
   
2. **Alternativa**: Puedes registrarte con email
   - Ingresa tu email
   - Verifica tu email (revisa tu bandeja de entrada)
   - Crea una contraseña

### Paso 1.3: Confirmar cuenta
- Si usaste GitHub: Ya estás dentro ✅
- Si usaste email: Verifica tu correo y confirma tu cuenta

---

## 🗄️ PASO 2: Crear tu primera base de datos

### Paso 2.1: Crear un proyecto
1. Una vez dentro de Neon, verás un botón **"Create a project"** o **"New Project"**
2. Haz clic en ese botón

### Paso 2.2: Configurar el proyecto
1. **Nombre del proyecto**: Escribe `mediturnos` (o el nombre que prefieras)
2. **Región**: Elige la más cercana a ti (por ejemplo: `US East (Ohio)` o `Europe (Frankfurt)`)
3. **PostgreSQL version**: Deja la versión por defecto (generalmente 16 o 15)
4. Haz clic en **"Create Project"**

### Paso 2.3: Esperar la creación
- Neon creará tu base de datos automáticamente
- Esto toma aproximadamente **30-60 segundos**
- Verás un mensaje de "Project created successfully" ✅

---

## 🔗 PASO 3: Obtener la DATABASE_URL

### Paso 3.1: Encontrar la URL de conexión
1. Una vez creado el proyecto, verás un panel con información
2. Busca una sección que dice **"Connection string"** o **"Connection details"**
3. Verás algo como esto:

```
postgresql://usuario:password@ep-xxxx-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### Paso 3.2: Copiar la URL
1. Haz clic en el botón **"Copy"** o el ícono de copiar 📋
2. **IMPORTANTE**: Guarda esta URL en un lugar seguro:
   - Cópiala en un documento de texto
   - O en un archivo de notas
   - La necesitarás en el siguiente paso

### Paso 3.3: Formato de la URL
La URL debería verse así:
```
postgresql://[usuario]:[password]@[host]/[database]?sslmode=require
```

**Ejemplo real**:
```
postgresql://neondb_owner:abc123xyz@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

✅ **Verificación**: Si tienes una URL que empieza con `postgresql://`, estás listo para continuar.

---

## ⚙️ PASO 4: Configurar el archivo .env del backend

### Paso 4.1: Abrir el archivo .env
1. Abre tu editor de código (VS Code, Cursor, etc.)
2. Navega a la carpeta `backend` de tu proyecto
3. Abre el archivo `.env` (si no lo ves, puede estar oculto)

### Paso 4.2: Editar DATABASE_URL
1. Encuentra la línea que dice:
   ```
   DATABASE_URL="postgresql://usuario:password@localhost:5432/mediturnos?schema=public"
   ```

2. **Reemplaza toda esa línea** con la URL que copiaste de Neon:
   ```
   DATABASE_URL="postgresql://tu-usuario:tu-password@ep-xxxx-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```
   
   ⚠️ **IMPORTANTE**: 
   - Pega la URL EXACTA que copiaste de Neon
   - Mantén las comillas dobles `"` alrededor de la URL
   - No dejes espacios antes o después

### Paso 4.3: Verificar el archivo completo
Tu archivo `.env` debería verse así:

```env
DATABASE_URL="postgresql://tu-usuario:tu-password@ep-xxxx-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="clave_secreta_local_12345"
NODE_ENV=development
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

### Paso 4.4: Guardar el archivo
- Guarda el archivo (Ctrl+S o Cmd+S)

---

## 🔄 PASO 5: Ejecutar las migraciones de Prisma

### Paso 5.1: Abrir la terminal
1. Abre tu terminal (PowerShell en Windows)
2. Navega a la carpeta `backend`:
   ```powershell
   cd backend
   ```

### Paso 5.2: Verificar que Prisma está instalado
Ejecuta:
```powershell
npx prisma --version
```

Deberías ver algo como: `Prisma CLI Version: 5.22.0`

### Paso 5.3: Generar el cliente de Prisma
Ejecuta:
```powershell
npm run prisma:generate
```

✅ **Resultado esperado**: Deberías ver:
```
✔ Generated Prisma Client
```

### Paso 5.4: Crear la migración inicial
Ejecuta:
```powershell
npx prisma migrate dev --name init
```

**¿Qué hace esto?**
- Crea todas las tablas en tu base de datos PostgreSQL
- Crea un archivo de migración que registra los cambios
- Sincroniza tu esquema con la base de datos

✅ **Resultado esperado**: Deberías ver:
```
✔ Migration `init` applied successfully
```

**Si ves algún error**:
- Verifica que la DATABASE_URL en `.env` esté correcta
- Asegúrate de que copiaste la URL completa de Neon
- Revisa que no haya espacios extra en el archivo `.env`

---

## ✅ PASO 6: Verificar que la base de datos fue creada correctamente

### Paso 6.1: Abrir Prisma Studio (interfaz visual)
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

✅ **Si ves todas estas tablas**: ¡Tu base de datos está configurada correctamente!

### Paso 6.3: Cerrar Prisma Studio
- Presiona `Ctrl+C` en la terminal para cerrar Prisma Studio

---

## 🎉 ¡Felicidades!

Has completado la configuración de PostgreSQL. Ahora puedes:

1. ✅ Continuar con el desarrollo del backend
2. ✅ Ejecutar el servidor: `npm run dev`
3. ✅ Continuar con el despliegue siguiendo la guía `GUIA_DESPLIEGUE.md`

---

## 🔧 Solución de Problemas Comunes

### Error: "Environment variable not found: DATABASE_URL"
**Solución**: 
- Verifica que el archivo `.env` esté en la carpeta `backend/`
- Verifica que la línea `DATABASE_URL=...` no tenga espacios antes del `=`
- Reinicia la terminal después de editar `.env`

### Error: "Can't reach database server"
**Solución**:
- Verifica que copiaste la URL completa de Neon
- Asegúrate de que la URL incluye `?sslmode=require` al final
- Verifica tu conexión a internet

### Error: "Migration failed"
**Solución**:
- Asegúrate de que la base de datos en Neon esté activa
- Verifica que la DATABASE_URL sea correcta
- Intenta ejecutar: `npx prisma migrate reset` (⚠️ esto borrará todos los datos)

### No puedo ver el archivo .env
**Solución**:
- En VS Code/Cursor: Ve a View → Show Hidden Files
- O crea el archivo manualmente en `backend/.env`

---

## 📚 Recursos Adicionales

- **Documentación de Neon**: https://neon.tech/docs
- **Documentación de Prisma**: https://www.prisma.io/docs
- **Guía de Despliegue**: Ver `GUIA_DESPLIEGUE.md`

---

## 🆘 ¿Necesitas ayuda?

Si encuentras algún problema:
1. Revisa la sección "Solución de Problemas Comunes" arriba
2. Verifica que seguiste todos los pasos en orden
3. Asegúrate de que la DATABASE_URL esté correctamente copiada

---

**Última actualización**: Esta guía está diseñada para principiantes. Si algo no funciona, revisa cada paso cuidadosamente.

