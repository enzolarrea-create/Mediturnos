# 🚀 Instrucciones de Inicio Rápido - MediTurnos

Sigue estos pasos para poner en marcha tu aplicación MediTurnos.

## ⚡ Inicio Rápido (5 minutos)

### 1. Instalar Dependencias

```bash
cd backend
npm install
```

### 2. Configurar Base de Datos con Supabase

**📖 Guía detallada:** Si necesitas más ayuda, consulta `GUIA_SUPABASE.md`

**Resumen rápido:**

1. **Crear cuenta y proyecto:**
   - Ve a [https://supabase.com](https://supabase.com)
   - Crea una cuenta (puedes usar GitHub)
   - Clic en "New Project"
   - Name: `mediturnos`
   - Crea una contraseña segura (¡GUÁRDALA!)
   - Plan: Free
   - Espera 1-2 minutos

2. **Obtener Connection String:**
   - Settings → Database → Connection string
   - Pestaña "URI"
   - Copia la URL
   - **IMPORTANTE**: Reemplaza `[YOUR-PASSWORD]` con tu contraseña real

3. **Configurar en el proyecto:**
   ```bash
   cd backend
   cp .env.example .env
   ```

4. **Editar `.env`:**
   ```env
   DATABASE_URL="postgresql://postgres.xxxxx:TU_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
   JWT_SECRET="genera-un-secret-aleatorio"
   JWT_EXPIRES_IN="7d"
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL="http://localhost:5500"
   ```

5. **Generar JWT_SECRET:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copia el resultado y pégalo como valor de `JWT_SECRET`

#### Alternativa: PostgreSQL Local

Si prefieres usar PostgreSQL local:

**Paso 1: Crear cuenta y proyecto en Supabase**

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en "Start your project" o "Sign in" si ya tienes cuenta
3. Crea una cuenta (puedes usar GitHub, Google, etc.)
4. Una vez dentro, haz clic en "New Project"
5. Completa el formulario:
   - **Name**: `mediturnos` (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura (¡GUÁRDALA BIEN!)
   - **Region**: Elige la más cercana a tu ubicación
   - **Pricing Plan**: Free (gratis, perfecto para desarrollo)
6. Haz clic en "Create new project"
7. Espera 1-2 minutos mientras Supabase crea tu base de datos

**Paso 2: Obtener la Connection String**

1. Una vez que el proyecto esté listo, ve a la sección "Settings" (⚙️) en el menú lateral
2. Haz clic en "Database" en el submenú
3. Baja hasta la sección "Connection string"
4. Selecciona la pestaña "URI"
5. Copia la connection string (se ve así: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)
6. **IMPORTANTE**: Reemplaza `[YOUR-PASSWORD]` con la contraseña que creaste en el Paso 1
   - Ejemplo: Si tu contraseña es `miPassword123`, la URL debería ser:
   - `postgresql://postgres:miPassword123@db.xxxxx.supabase.co:5432/postgres`

**Paso 3: Configurar en tu proyecto**

1. En tu proyecto, copia el archivo de ejemplo:
```bash
cd backend
cp .env.example .env
```

2. Abre el archivo `.env` y pega tu connection string:
```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
```

**Nota importante sobre Supabase:**
- Supabase usa un pooler de conexiones, por lo que es recomendable agregar `?pgbouncer=true&connection_limit=1` al final de la URL
- Si tienes problemas, también puedes usar la "Connection string" de la pestaña "Session mode" en lugar de "URI"

### 3. Ejecutar Migraciones

```bash
# Generar cliente de Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate
```

Cuando te pregunte el nombre de la migración, puedes poner: `init`

### 4. (Opcional) Poblar con Datos de Ejemplo

```bash
npm run prisma:seed
```

Esto creará usuarios de prueba:
- **Admin**: admin@mediturnos.com / password123
- **Médico**: dr.lopez@mediturnos.com / password123
- **Secretario**: secretario@mediturnos.com / password123
- **Paciente**: maria.gonzalez@example.com / password123

### 5. Iniciar el Backend

```bash
npm run dev
```

El servidor estará en `http://localhost:3000`

### 6. Abrir el Frontend

Tienes dos opciones:

#### Opción A: Servidor HTTP Simple (Recomendado)

```bash
# Desde la raíz del proyecto
python -m http.server 5500
```

O con Node.js:
```bash
npx http-server -p 5500
```

Luego abre: `http://localhost:5500/frontend/landing.html`

#### Opción B: Extensión de VS Code

Instala la extensión "Live Server" y haz clic derecho en `landing.html` → "Open with Live Server"

### 7. Probar la Aplicación

1. Abre `http://localhost:5500/frontend/landing.html`
2. Haz clic en "Registrarse" o "Iniciar Sesión"
3. Si usaste el seed, prueba con las credenciales de ejemplo

## 🔧 Solución de Problemas Comunes

### Error: "Cannot find module '@prisma/client'"

```bash
cd backend
npm install
npm run prisma:generate
```

### Error: "P1001: Can't reach database server"

- Verifica que la contraseña en `DATABASE_URL` sea correcta (reemplaza `[YOUR-PASSWORD]`)
- Verifica que no haya espacios extra en la URL
- Si usas Supabase, verifica que tu proyecto esté activo
- Prueba agregar `?pgbouncer=true&connection_limit=1` al final de la URL de Supabase

### Error: "CORS policy"

- Verifica que `FRONTEND_URL` en `.env` coincida con la URL donde abres el frontend
- Asegúrate de abrir el frontend con un servidor HTTP (no `file://`)

### El frontend no carga datos

1. Abre la consola del navegador (F12)
2. Verifica que no haya errores
3. Verifica que `API_BASE_URL` en `frontend/js/api.js` sea `http://localhost:3000/api`
4. Verifica que el backend esté corriendo

### Error en el seed

Si el seed falla porque ya existen datos, puedes:

1. Limpiar la base de datos manualmente
2. O comentar las líneas de limpieza en `seed.js` si quieres mantener datos existentes

## 📝 Próximos Pasos

1. **Explorar la aplicación**: Prueba todas las funcionalidades
2. **Personalizar**: Modifica estilos, textos, etc.
3. **Agregar funcionalidades**: Implementa las que faltan según tus necesidades
4. **Desplegar**: Sigue `GUIA_DESPLIEGUE.md` para ponerlo en producción

## 🎯 Estructura de Archivos Importantes

```
backend/
├── .env                    # Variables de entorno (crear desde .env.example)
├── prisma/
│   ├── schema.prisma       # Esquema de base de datos
│   └── seed.js            # Datos de ejemplo
└── src/
    └── server.js          # Servidor principal

frontend/
├── js/
│   ├── api.js            # Cliente API (cambiar API_BASE_URL aquí)
│   ├── auth.js           # Lógica de autenticación
│   └── dashboard.js      # Dashboard principal
├── landing.html          # Página de inicio
└── iniciado.html        # Dashboard después de login
```

## 💡 Tips

- Usa `npm run prisma:studio` para ver y editar datos en la base de datos con una interfaz gráfica
- Los logs del backend aparecen en la consola donde ejecutaste `npm run dev`
- Puedes usar Postman o Thunder Client para probar la API directamente

## 🆘 ¿Necesitas Ayuda?

1. Revisa los logs del backend
2. Revisa la consola del navegador (F12)
3. Verifica que todas las variables de entorno estén configuradas
4. Asegúrate de que las migraciones se ejecutaron correctamente

---

**¡Listo!** Tu aplicación debería estar funcionando. 🎉

