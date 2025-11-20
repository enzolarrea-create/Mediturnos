# Backend - Mediturnos

Backend del sistema de gestión de turnos médicos desarrollado con Node.js, Express y Prisma.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18 o superior
- PostgreSQL 14 o superior
- npm o yarn

### Instalación

1. **Instalar dependencias**
```bash
npm install
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/mediturnos?schema=public"
JWT_SECRET="tu_secret_key_super_segura"
PORT=3000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

3. **Configurar base de datos**

```bash
# Generar cliente de Prisma
npm run prisma:generate

# Crear base de datos (si no existe)
# psql -U postgres
# CREATE DATABASE mediturnos;

# Ejecutar migraciones
npm run prisma:migrate

# (Opcional) Poblar con datos de ejemplo
npm run prisma:seed
```

4. **Iniciar servidor**

```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
backend/
├── prisma/
│   ├── schema.prisma          # Modelo de datos
│   └── seed.js                # Datos iniciales
├── src/
│   ├── server.js              # Punto de entrada
│   ├── routes/                # Definición de rutas
│   ├── controllers/           # Lógica de negocio
│   └── middlewares/           # Middlewares
├── package.json
└── .env
```

## 🔌 Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuario actual

### Turnos
- `GET /api/turnos` - Listar turnos
- `POST /api/turnos` - Crear turno
- `PUT /api/turnos/:id` - Actualizar turno
- `DELETE /api/turnos/:id` - Cancelar turno

Ver documentación completa en `README.md` principal.

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén implementados)
npm test
```

## 📝 Scripts Disponibles

- `npm run dev` - Iniciar en modo desarrollo
- `npm start` - Iniciar en modo producción
- `npm run prisma:generate` - Generar cliente Prisma
- `npm run prisma:migrate` - Ejecutar migraciones
- `npm run prisma:studio` - Abrir Prisma Studio
- `npm run prisma:seed` - Poblar base de datos

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- Autenticación JWT
- Validación de entrada
- CORS configurado
- Manejo centralizado de errores

## 📚 Documentación Adicional

- Ver `README.md` principal para documentación completa
- Ver `ARQUITECTURA.md` para detalles de arquitectura
- Ver `PLAN_DESARROLLO.md` para plan de desarrollo

