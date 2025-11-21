# 🗄️ Guía Completa: Configurar Supabase para MediTurnos

Esta guía te llevará paso a paso para configurar Supabase como tu base de datos.

## 📋 Paso 1: Crear Cuenta en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en "Start your project" (o "Sign in" si ya tienes cuenta)
3. Elige un método de autenticación:
   - GitHub (recomendado)
   - Google
   - Email
4. Completa el proceso de registro

## 🆕 Paso 2: Crear un Nuevo Proyecto

1. Una vez dentro del dashboard, haz clic en el botón **"New Project"** (arriba a la derecha)

2. Completa el formulario:
   ```
   Name: mediturnos
   Database Password: [Crea una contraseña segura - GUÁRDALA]
   Region: [Elige la más cercana]
   Pricing Plan: Free
   ```

3. ⚠️ **IMPORTANTE**: Guarda la contraseña en un lugar seguro. La necesitarás para conectarte.

4. Haz clic en **"Create new project"**

5. Espera 1-2 minutos mientras Supabase crea tu base de datos (verás un progreso en pantalla)

## 🔗 Paso 3: Obtener la Connection String

Una vez que tu proyecto esté listo:

1. En el menú lateral izquierdo, haz clic en **"Settings"** (⚙️)

2. En el submenú, haz clic en **"Database"**

3. Baja hasta la sección **"Connection string"**

4. Verás varias pestañas. Selecciona la pestaña **"URI"**

5. Verás algo como esto:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

6. **IMPORTANTE**: Reemplaza `[YOUR-PASSWORD]` con la contraseña que creaste en el Paso 2

   **Ejemplo:**
   - Si tu contraseña es: `MiPassword123!`
   - La URL debería quedar:
   ```
   postgresql://postgres.abcdefghijklmnop:MiPassword123!@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

7. **Copia toda la URL completa** (con tu contraseña ya reemplazada)

## ⚙️ Paso 4: Configurar en tu Proyecto

1. Ve a la carpeta `backend` de tu proyecto

2. Si no existe, crea el archivo `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```

3. Abre el archivo `.env` con tu editor de texto

4. Pega tu connection string en la variable `DATABASE_URL`:

   ```env
   DATABASE_URL="postgresql://postgres.xxxxx:TU_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
   JWT_SECRET="genera-un-secret-aleatorio-y-seguro"
   JWT_EXPIRES_IN="7d"
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL="http://localhost:5500"
   ```

5. **Genera un JWT_SECRET seguro:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copia el resultado y pégalo como valor de `JWT_SECRET`

6. Guarda el archivo `.env`

## ✅ Paso 5: Verificar la Conexión

1. Ejecuta las migraciones para crear las tablas:
   ```bash
   cd backend
   npm run prisma:generate
   npm run prisma:migrate
   ```

2. Cuando te pregunte el nombre de la migración, puedes poner: `init`

3. Si todo va bien, verás:
   ```
   ✅ The migration has been applied
   ```

4. (Opcional) Pobla con datos de ejemplo:
   ```bash
   npm run prisma:seed
   ```

## 🔍 Verificar en Supabase

Puedes verificar que las tablas se crearon correctamente:

1. En Supabase, ve a **"Table Editor"** en el menú lateral
2. Deberías ver todas las tablas creadas:
   - usuarios
   - pacientes
   - medicos
   - secretarios
   - especialidades
   - turnos
   - etc.

## 🐛 Solución de Problemas

### Error: "Can't reach database server"

**Solución:**
- Verifica que la contraseña en la URL sea correcta
- Asegúrate de haber reemplazado `[YOUR-PASSWORD]` con tu contraseña real
- Verifica que no haya espacios extra en la URL

### Error: "Connection timeout"

**Solución:**
- Supabase puede tener límites de conexión en el plan gratuito
- Espera unos minutos e intenta de nuevo
- Verifica que tu proyecto esté activo en Supabase

### Error: "Password authentication failed"

**Solución:**
- La contraseña en la URL no coincide con la que creaste
- Ve a Supabase → Settings → Database → Reset database password
- Genera una nueva contraseña y actualiza tu `.env`

### Error en Prisma: "P1001"

**Solución:**
- Verifica que la URL esté correctamente formateada
- Asegúrate de usar la URL de la pestaña "URI" (no "Session mode")
- Prueba agregar `?pgbouncer=true&connection_limit=1` al final de la URL

## 📊 Usar Supabase Studio (Opcional)

Supabase incluye una interfaz visual para ver y editar datos:

1. En Supabase, ve a **"Table Editor"**
2. Puedes ver, editar y agregar datos directamente desde la interfaz
3. También puedes usar **"SQL Editor"** para ejecutar queries personalizadas

## 🔒 Seguridad

- ⚠️ **NUNCA** commitees el archivo `.env` a Git
- ⚠️ **NUNCA** compartas tu connection string públicamente
- ✅ El archivo `.env` ya está en `.gitignore` para protegerlo

## 💡 Tips

1. **Plan Gratuito de Supabase:**
   - 500 MB de base de datos
   - 2 GB de ancho de banda
   - Perfecto para desarrollo y proyectos pequeños

2. **Backup:**
   - Supabase hace backups automáticos
   - Puedes exportar tu base de datos desde Settings → Database → Backups

3. **Monitoreo:**
   - Ve a "Database" → "Connection Pooling" para ver estadísticas
   - "Logs" te muestra queries y errores

## ✅ Checklist

- [ ] Cuenta creada en Supabase
- [ ] Proyecto creado
- [ ] Contraseña guardada de forma segura
- [ ] Connection string copiada y configurada en `.env`
- [ ] JWT_SECRET generado y configurado
- [ ] Migraciones ejecutadas exitosamente
- [ ] Tablas visibles en Supabase Table Editor
- [ ] (Opcional) Seed ejecutado con datos de ejemplo

---

**¡Listo!** Tu base de datos está configurada. Continúa con el Paso 3 de `INSTRUCCIONES_INICIO.md` para ejecutar las migraciones.

