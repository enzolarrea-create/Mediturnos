# 🏥 MediTurnos - Sistema de Gestión de Turnos Médicos

Sistema completo de gestión de turnos médicos desarrollado como proyecto universitario. Permite a pacientes, médicos, secretarios y administradores gestionar turnos, agendas y historiales médicos.

## 📋 Características

### Roles y Funcionalidades

#### 👤 Paciente
- Registro e inicio de sesión
- Búsqueda de médicos por nombre o especialidad
- Visualización de calendario de disponibilidad
- Reserva de turnos
- Cancelación de turnos
- Visualización de historial de turnos

#### 👨‍⚕️ Médico
- Agenda diaria en orden cronológico
- Visualización de información del paciente
- Visualización de historial del paciente
- Agregar notas clínicas
- Notificaciones por cancelaciones
- Gestión de horarios de disponibilidad

#### 📋 Secretario
- Calendario global (día/semana/mes) de todos los médicos
- Creación manual de turnos para pacientes
- Búsqueda de pacientes por nombre o DNI
- Modificación de turnos (cambio de hora o fecha)
- Marcar turno como confirmado, cancelado o ausente
- Visualización de datos de contacto del paciente

#### 🔧 Administrador
- Crear/editar/eliminar perfiles de médicos
- Gestión de cuentas del personal de secretaría
- Gestión de lista de especialidades
- Visualización de estadísticas

## 🛠️ Stack Tecnológico

- **Backend**: Node.js + Express.js
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Autenticación**: JWT (JSON Web Tokens)
- **Frontend**: HTML5, CSS3, JavaScript (ES6 Modules)
- **Estilos**: CSS Vanilla con variables CSS

## 📁 Estructura del Proyecto

```
Mediturnoscursor/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Esquema de base de datos
│   ├── src/
│   │   ├── controllers/           # Lógica de negocio
│   │   ├── routes/                # Rutas de API
│   │   ├── middlewares/           # Middlewares (auth, errores)
│   │   ├── utils/                 # Utilidades
│   │   └── server.js              # Punto de entrada
│   ├── .env.example               # Variables de entorno de ejemplo
│   └── package.json
│
├── frontend/
│   ├── js/
│   │   ├── api.js                 # Cliente API
│   │   ├── auth.js                # Lógica de autenticación
│   │   ├── dashboard.js           # Dashboard principal
│   │   ├── landing.js             # Landing page
│   │   └── utils.js               # Utilidades frontend
│   ├── landing.html               # Landing page
│   ├── iniciado.html              # Dashboard
│   └── styles.css                 # Estilos
│
├── ARQUITECTURA.md                # Documentación de arquitectura
└── README.md                      # Este archivo
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js (v18 o superior)
- PostgreSQL (v14 o superior)
- npm o yarn

### Paso 1: Clonar e instalar dependencias

```bash
# Instalar dependencias del backend
cd backend
npm install

# Generar cliente de Prisma
npm run prisma:generate
```

### Paso 2: Configurar base de datos

1. Crear una base de datos PostgreSQL:
```sql
CREATE DATABASE mediturnos;
```

2. Copiar el archivo de variables de entorno:
```bash
cp .env.example .env
```

3. Editar `.env` con tus credenciales:
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/mediturnos?schema=public"
JWT_SECRET="tu-secret-key-super-segura"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
FRONTEND_URL="http://localhost:5500"
```

### Paso 3: Ejecutar migraciones

```bash
npm run prisma:migrate
```

Esto creará todas las tablas en la base de datos.

### Paso 4: (Opcional) Poblar con datos de ejemplo

```bash
npm run prisma:seed
```

### Paso 5: Iniciar el servidor

```bash
# Modo desarrollo (con watch)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

### Paso 6: Abrir el frontend

Abre `landing.html` en tu navegador o usa un servidor local:

```bash
# Con Python
python -m http.server 5500

# Con Node.js (http-server)
npx http-server -p 5500
```

Luego accede a `http://localhost:5500/landing.html`

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de paciente
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/me` - Obtener usuario actual

### Turnos
- `GET /api/turnos` - Listar turnos (con filtros)
- `POST /api/turnos` - Crear turno
- `GET /api/turnos/:id` - Obtener turno específico
- `PUT /api/turnos/:id` - Modificar turno
- `DELETE /api/turnos/:id` - Cancelar turno

### Pacientes
- `GET /api/pacientes` - Listar pacientes (Secretario/Admin)
- `GET /api/pacientes/:id` - Obtener paciente
- `GET /api/pacientes/:id/historial` - Historial de turnos

### Médicos
- `GET /api/medicos` - Listar médicos
- `GET /api/medicos/:id` - Obtener médico
- `POST /api/medicos` - Crear médico (Admin)
- `PUT /api/medicos/:id` - Editar médico (Admin)
- `DELETE /api/medicos/:id` - Eliminar médico (Admin)

### Disponibilidad
- `GET /api/disponibilidad/:medicoId` - Obtener disponibilidad
- `POST /api/disponibilidad` - Crear disponibilidad (Médico)
- `PUT /api/disponibilidad/:id` - Actualizar disponibilidad (Médico)
- `DELETE /api/disponibilidad/:id` - Eliminar disponibilidad (Médico)

### Especialidades
- `GET /api/especialidades` - Listar especialidades
- `POST /api/especialidades` - Crear especialidad (Admin)
- `PUT /api/especialidades/:id` - Actualizar especialidad (Admin)

### Notas Médicas
- `POST /api/notas-medicas` - Crear nota médica (Médico)
- `GET /api/notas-medicas/turno/:turnoId` - Obtener notas de un turno

### Notificaciones
- `GET /api/notificaciones` - Listar notificaciones
- `PUT /api/notificaciones/:id/leida` - Marcar como leída
- `PUT /api/notificaciones/marcar-todas` - Marcar todas como leídas

## 🔐 Autenticación

El sistema usa JWT (JSON Web Tokens) para autenticación. Después de iniciar sesión, el token se almacena en `localStorage` y se envía en el header `Authorization` de cada request:

```
Authorization: Bearer <token>
```

## 🗄️ Modelo de Datos

El esquema de base de datos incluye:

- **Usuario**: Tabla base para todos los roles
- **Paciente**: Extiende Usuario
- **Medico**: Extiende Usuario
- **Secretario**: Extiende Usuario
- **Especialidad**: Especialidades médicas
- **MedicoEspecialidad**: Relación muchos a muchos
- **Disponibilidad**: Horarios de disponibilidad de médicos
- **Turno**: Turnos médicos
- **NotaMedica**: Notas clínicas
- **Notificacion**: Sistema de notificaciones

Ver `backend/prisma/schema.prisma` para más detalles.

## 🚢 Despliegue

### Opción 1: Render (Recomendado)

1. Crear cuenta en [Render](https://render.com)
2. Crear una base de datos PostgreSQL
3. Crear un servicio Web para el backend
4. Configurar variables de entorno
5. Desplegar frontend en Netlify o Vercel

### Opción 2: Railway

1. Crear cuenta en [Railway](https://railway.app)
2. Crear proyecto
3. Agregar servicio PostgreSQL
4. Agregar servicio Node.js
5. Configurar variables de entorno

### Opción 3: Vercel/Netlify (Frontend) + Render (Backend)

- Frontend: Desplegar en Vercel o Netlify
- Backend: Desplegar en Render
- Base de datos: PostgreSQL en Render

## 📝 Notas de Desarrollo

- El proyecto usa ES6 Modules (`import/export`)
- Las rutas del frontend deben usar un servidor HTTP (no `file://`)
- El CORS está configurado para `http://localhost:5500` por defecto
- Cambiar `API_BASE_URL` en `frontend/js/api.js` para producción

## 🤝 Contribuciones

Este es un proyecto universitario. Para mejoras o correcciones, crear un issue o pull request.

## 📄 Licencia

Este proyecto es de uso educativo.

## 👨‍💻 Autor

Proyecto desarrollado como trabajo universitario.

---

**¿Necesitas ayuda?** Revisa `ARQUITECTURA.md` para más detalles sobre la arquitectura del sistema.

