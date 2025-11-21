# 🚀 Instrucciones de Inicio Rápido - MediTurnos

Sigue estos pasos para poner en marcha tu aplicación MediTurnos.

## ⚡ Inicio Rápido (5 minutos)

### 1. Instalar Dependencias

```bash
cd backend
npm install
```

### 2. Configurar Base de Datos

#### Opción A: PostgreSQL Local

1. Instala PostgreSQL si no lo tienes
2. Crea una base de datos:
```sql
CREATE DATABASE mediturnos;
```

3. Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

4. Edita `.env` con tus credenciales:
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/mediturnos?schema=public"
JWT_SECRET="cambiar-por-un-secret-aleatorio-y-seguro"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
FRONTEND_URL="http://localhost:5500"
```

#### Opción B: PostgreSQL en la Nube (Recomendado para empezar rápido)

1. Crea una cuenta gratuita en [Supabase](https://supabase.com) o [Neon](https://neon.tech)
2. Crea un nuevo proyecto
3. Copia la connection string
4. Pégala en tu archivo `.env` como `DATABASE_URL`

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

- Verifica que PostgreSQL esté corriendo
- Verifica que `DATABASE_URL` en `.env` sea correcta
- Si usas Supabase/Neon, verifica que la URL sea la correcta

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

