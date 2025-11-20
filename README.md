# Mediturnos - Sistema de Gestión de Turnos Médicos

Sistema web completo para la gestión integral de turnos médicos con múltiples roles de usuario.

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

- **Backend**: Node.js + Express
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Autenticación**: JWT (JSON Web Tokens)
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Hosting**: 
  - Frontend: Vercel
  - Backend y BD: Railway/Render

### Estructura del Proyecto

```
mediturnos/
├── backend/                 # Backend Node.js + Express
│   ├── prisma/
│   │   ├── schema.prisma    # Modelo de datos
│   │   └── seed.js          # Datos iniciales
│   ├── src/
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── routes/          # Definición de rutas
│   │   ├── middlewares/     # Middlewares (auth, error handling)
│   │   └── server.js        # Punto de entrada
│   ├── package.json
│   └── .env.example
├── frontend/                # Frontend HTML/CSS/JS
│   ├── index.html           # Landing page
│   ├── login.html
│   ├── register.html
│   ├── dashboard/           # Dashboards por rol
│   │   ├── paciente.html
│   │   ├── medico.html
│   │   ├── secretario.html
│   │   └── administrador.html
│   ├── js/
│   │   ├── api.js           # Cliente API
│   │   ├── auth.js          # Manejo de autenticación
│   │   └── utils.js         # Utilidades
│   └── css/
│       └── styles.css
└── README.md
```

## 🗄️ Modelo de Datos

### Entidades Principales

1. **Usuario**: Usuario base del sistema
2. **Paciente**: Extiende Usuario, información médica del paciente
3. **Médico**: Extiende Usuario, información profesional del médico
4. **Secretario**: Extiende Usuario, personal administrativo
5. **Administrador**: Extiende Usuario, administrador del sistema
6. **Especialidad**: Especialidades médicas
7. **Turno**: Citas médicas
8. **Disponibilidad**: Horarios disponibles de los médicos
9. **Nota Médica**: Historial clínico
10. **Notificación**: Sistema de notificaciones

### Relaciones

- Un Usuario puede tener UN rol específico (Paciente, Médico, Secretario o Administrador)
- Un Médico tiene UNA Especialidad
- Un Turno pertenece a UN Paciente y UN Médico
- Un Médico tiene múltiples Disponibilidades
- Un Paciente tiene múltiples Notas Médicas

## 🔐 Sistema de Autenticación

### JWT (JSON Web Tokens)

- **Algoritmo**: HS256
- **Expiración**: 7 días (configurable)
- **Estructura del token**: `{ userId: string }`

### Flujo de Autenticación

1. Usuario se registra o inicia sesión
2. Backend valida credenciales
3. Se genera un JWT con el userId
4. Frontend almacena el token en localStorage
5. Cada request incluye el token en el header: `Authorization: Bearer <token>`
6. Middleware valida el token y agrega información del usuario al request

### Permisos por Rol

- **Paciente**: Ver y gestionar sus propios turnos, ver su historial
- **Médico**: Ver y gestionar sus turnos, ver disponibilidad, crear notas médicas
- **Secretario**: Ver y gestionar todos los turnos, ver pacientes y médicos
- **Administrador**: Acceso completo al sistema

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/me` - Obtener usuario actual
- `PUT /api/auth/me` - Actualizar perfil
- `PUT /api/auth/change-password` - Cambiar contraseña

### Turnos
- `GET /api/turnos` - Listar turnos (con filtros)
- `GET /api/turnos/:id` - Obtener turno por ID
- `POST /api/turnos` - Crear turno
- `PUT /api/turnos/:id` - Actualizar turno
- `DELETE /api/turnos/:id` - Cancelar turno
- `GET /api/turnos/disponibles` - Obtener horarios disponibles

### Pacientes
- `GET /api/pacientes` - Listar pacientes (solo admin/secretario/médico)
- `GET /api/pacientes/me` - Perfil del paciente actual
- `GET /api/pacientes/:id` - Obtener paciente por ID
- `PUT /api/pacientes/me` - Actualizar perfil
- `GET /api/pacientes/:id/turnos` - Turnos de un paciente
- `GET /api/pacientes/:id/historial` - Historial médico

### Médicos
- `GET /api/medicos` - Listar médicos
- `GET /api/medicos/me` - Perfil del médico actual
- `GET /api/medicos/:id` - Obtener médico por ID
- `GET /api/medicos/:id/turnos` - Turnos de un médico
- `GET /api/medicos/:id/disponibilidad` - Disponibilidad de un médico

### Especialidades
- `GET /api/especialidades` - Listar especialidades
- `GET /api/especialidades/:id` - Obtener especialidad por ID
- `POST /api/especialidades` - Crear especialidad (admin)
- `PUT /api/especialidades/:id` - Actualizar especialidad (admin)
- `DELETE /api/especialidades/:id` - Eliminar especialidad (admin)

### Disponibilidades
- `GET /api/disponibilidades/medico/:medicoId` - Disponibilidad de un médico
- `POST /api/disponibilidades` - Crear disponibilidad
- `PUT /api/disponibilidades/:id` - Actualizar disponibilidad
- `DELETE /api/disponibilidades/:id` - Eliminar disponibilidad

### Notas Médicas
- `GET /api/notas-medicas/paciente/:pacienteId` - Notas de un paciente
- `GET /api/notas-medicas/:id` - Obtener nota por ID
- `POST /api/notas-medicas` - Crear nota médica
- `PUT /api/notas-medicas/:id` - Actualizar nota médica
- `DELETE /api/notas-medicas/:id` - Eliminar nota médica

### Notificaciones
- `GET /api/notificaciones` - Listar notificaciones del usuario
- `GET /api/notificaciones/unread-count` - Contador de no leídas
- `PUT /api/notificaciones/:id/read` - Marcar como leída
- `PUT /api/notificaciones/read-all` - Marcar todas como leídas
- `DELETE /api/notificaciones/:id` - Eliminar notificación

### Estadísticas
- `GET /api/estadisticas/dashboard` - Estadísticas del dashboard
- `GET /api/estadisticas/turnos` - Estadísticas de turnos
- `GET /api/estadisticas/medicos` - Estadísticas de médicos

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ 
- PostgreSQL 14+
- npm o yarn

### Backend

1. Navegar a la carpeta backend:
```bash
cd backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

4. Configurar base de datos:
```bash
# Generar cliente de Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# (Opcional) Poblar con datos de ejemplo
npm run prisma:seed
```

5. Iniciar servidor:
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

### Frontend

1. Configurar URL del backend en `js/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

2. Abrir `index.html` en un navegador o usar un servidor local:
```bash
# Con Python
python -m http.server 8000

# Con Node.js (http-server)
npx http-server
```

## 📋 Plan de Desarrollo

### Fase 1: Configuración Inicial ✅
- [x] Estructura del proyecto
- [x] Configuración de Prisma
- [x] Modelo de datos
- [x] Configuración de Express

### Fase 2: Autenticación y Autorización ✅
- [x] Sistema de registro
- [x] Sistema de login
- [x] Middleware de autenticación JWT
- [x] Middleware de autorización por roles

### Fase 3: CRUD Básico ✅
- [x] Gestión de usuarios
- [x] Gestión de pacientes
- [x] Gestión de médicos
- [x] Gestión de especialidades
- [x] Gestión de turnos
- [x] Gestión de disponibilidades

### Fase 4: Funcionalidades Avanzadas ✅
- [x] Sistema de notificaciones
- [x] Notas médicas
- [x] Estadísticas y reportes
- [x] Validación de disponibilidad

### Fase 5: Frontend
- [ ] Landing page
- [ ] Páginas de autenticación
- [ ] Dashboard por rol
- [ ] Integración con API
- [ ] Manejo de estado

### Fase 6: Despliegue
- [ ] Configuración de producción
- [ ] Despliegue de backend
- [ ] Despliegue de frontend
- [ ] Configuración de dominio

## 🔒 Seguridad

### Implementado
- Hash de contraseñas con bcrypt
- Validación de tokens JWT
- Middleware de autorización por roles
- Validación de entrada con express-validator
- Manejo centralizado de errores

### Recomendaciones Adicionales
- Implementar rate limiting
- Agregar CORS más restrictivo en producción
- Implementar HTTPS
- Agregar logging de seguridad
- Implementar recuperación de contraseña
- Agregar verificación de email

## 📝 Notas de Desarrollo

### Convenciones de Código
- Nombres de archivos en camelCase
- Rutas en kebab-case
- Variables y funciones en camelCase
- Constantes en UPPER_SNAKE_CASE

### Estructura de Respuestas API

**Éxito:**
```json
{
  "message": "Operación exitosa",
  "data": { ... }
}
```

**Error:**
```json
{
  "error": "Tipo de error",
  "message": "Descripción del error"
}
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Autores

- Equipo de desarrollo Mediturnos

---

**Versión**: 1.0.0  
**Última actualización**: 2024

