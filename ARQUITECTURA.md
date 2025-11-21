# 🏗️ Arquitectura del Sistema MediTurnos

## 📋 Recomendación de Stack Tecnológico

### **Decisión: Node.js + Express + PostgreSQL + Prisma**

**¿Por qué este stack?**
- ✅ **Node.js/Express**: Popular, fácil de aprender, gran ecosistema, ideal para proyectos universitarios
- ✅ **PostgreSQL**: Base de datos robusta y gratuita en hosting (Render, Railway)
- ✅ **Prisma**: ORM moderno, intuitivo, excelente para principiantes
- ✅ **JWT**: Autenticación estándar y segura
- ✅ **HTML/CSS/JS Vanilla**: Mantenemos tu frontend actual, lo hacemos funcional

**Alternativas consideradas:**
- ❌ React: Añade complejidad innecesaria para un proyecto universitario
- ❌ Flask/Django: Cambiaría todo el frontend, más trabajo de migración
- ❌ MongoDB: Menos estructura, PostgreSQL es mejor para datos relacionales

## 🏛️ Arquitectura General

```
┌─────────────────┐
│   Frontend       │
│  (HTML/CSS/JS)   │
└────────┬─────────┘
         │ HTTP/REST API
         │
┌────────▼─────────┐
│   Backend        │
│  (Express.js)    │
│  - Routes        │
│  - Controllers   │
│  - Middleware    │
└────────┬─────────┘
         │
┌────────▼─────────┐
│   Database       │
│  (PostgreSQL)    │
│  - Prisma ORM    │
└──────────────────┘
```

## 📁 Estructura de Carpetas

```
Mediturnoscursor/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Esquema de base de datos
│   ├── src/
│   │   ├── controllers/           # Lógica de negocio
│   │   │   ├── auth.controller.js
│   │   │   ├── turno.controller.js
│   │   │   ├── paciente.controller.js
│   │   │   ├── medico.controller.js
│   │   │   └── disponibilidad.controller.js
│   │   ├── routes/                # Rutas de API
│   │   │   ├── auth.routes.js
│   │   │   ├── turno.routes.js
│   │   │   ├── paciente.routes.js
│   │   │   └── medico.routes.js
│   │   ├── middlewares/           # Middlewares
│   │   │   ├── auth.middleware.js
│   │   │   └── errorHandler.middleware.js
│   │   ├── models/                # Modelos (si no usamos Prisma directamente)
│   │   ├── utils/                 # Utilidades
│   │   │   ├── jwt.js
│   │   │   └── validators.js
│   │   └── server.js              # Punto de entrada
│   ├── .env                       # Variables de entorno
│   ├── .gitignore
│   └── package.json
│
├── frontend/
│   ├── js/
│   │   ├── api.js                 # Cliente API
│   │   ├── auth.js                # Lógica de autenticación
│   │   ├── dashboard.js           # Dashboard principal
│   │   ├── turnos.js              # Gestión de turnos
│   │   ├── pacientes.js           # Gestión de pacientes
│   │   └── utils.js               # Utilidades frontend
│   ├── landing.html               # Landing page (actual)
│   ├── iniciado.html              # Dashboard (actual)
│   └── styles.css                 # Estilos (actual)
│
├── .gitignore
├── README.md
└── package.json                   # Scripts generales
```

## 🗄️ Modelo de Base de Datos

### Entidades Principales:

1. **Usuario** (tabla base para todos los roles)
   - id, email, password (hasheado), rol, createdAt, updatedAt

2. **Paciente** (extiende Usuario)
   - id, usuarioId, nombre, apellido, dni, fechaNacimiento, telefono, direccion

3. **Medico** (extiende Usuario)
   - id, usuarioId, nombre, apellido, matricula, telefono

4. **Secretario** (extiende Usuario)
   - id, usuarioId, nombre, apellido

5. **Especialidad**
   - id, nombre, descripcion

6. **MedicoEspecialidad** (relación muchos a muchos)
   - medicoId, especialidadId

7. **Disponibilidad**
   - id, medicoId, diaSemana, horaInicio, horaFin, activo

8. **Turno**
   - id, pacienteId, medicoId, fecha, hora, estado, motivoConsulta, createdAt

9. **NotaMedica**
   - id, turnoId, medicoId, contenido, fecha

10. **Notificacion**
    - id, usuarioId, tipo, mensaje, leida, createdAt

## 🔐 Sistema de Autenticación

- **JWT Tokens**: Al iniciar sesión, se genera un token JWT
- **Middleware de autenticación**: Verifica token en cada request protegido
- **Roles**: Se validan en el middleware según el endpoint

## 🛣️ Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registro de paciente
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/me` - Obtener usuario actual

### Turnos
- `GET /api/turnos` - Listar turnos (filtros por rol)
- `POST /api/turnos` - Crear turno
- `PUT /api/turnos/:id` - Modificar turno
- `DELETE /api/turnos/:id` - Cancelar turno
- `GET /api/turnos/:id` - Obtener turno específico

### Pacientes
- `GET /api/pacientes` - Listar pacientes (Secretario/Admin)
- `GET /api/pacientes/:id` - Obtener paciente
- `GET /api/pacientes/:id/historial` - Historial de turnos

### Médicos
- `GET /api/medicos` - Listar médicos
- `GET /api/medicos/:id` - Obtener médico
- `GET /api/medicos/:id/disponibilidad` - Disponibilidad del médico
- `POST /api/medicos` - Crear médico (Admin)
- `PUT /api/medicos/:id` - Editar médico (Admin)

### Disponibilidad
- `GET /api/disponibilidad/:medicoId` - Obtener disponibilidad
- `POST /api/disponibilidad` - Crear disponibilidad (Médico)
- `PUT /api/disponibilidad/:id` - Actualizar disponibilidad (Médico)

### Especialidades
- `GET /api/especialidades` - Listar especialidades
- `POST /api/especialidades` - Crear especialidad (Admin)

## 🎯 Flujo de Usuario por Rol

### Paciente
1. Registro → Login → Dashboard
2. Buscar médicos → Ver disponibilidad → Reservar turno
3. Ver mis turnos → Cancelar turno

### Secretario
1. Login → Dashboard
2. Ver calendario global → Crear turno manual → Modificar turno
3. Buscar pacientes → Ver datos de contacto

### Médico
1. Login → Dashboard
2. Ver agenda diaria → Ver paciente → Agregar nota médica
3. Gestionar disponibilidad

### Administrador
1. Login → Dashboard
2. Gestionar médicos → Gestionar secretarios → Gestionar especialidades
3. Ver estadísticas

## 🚀 Plan de Implementación

1. ✅ Configurar proyecto y dependencias
2. ✅ Crear esquema de base de datos (Prisma)
3. ✅ Implementar autenticación (registro, login, JWT)
4. ✅ Implementar CRUD de turnos
5. ✅ Implementar gestión de pacientes
6. ✅ Implementar gestión de médicos y disponibilidad
7. ✅ Implementar frontend funcional
8. ✅ Agregar validaciones y manejo de errores
9. ✅ Preparar para despliegue

