# Arquitectura del Sistema Mediturnos

## 📐 Diagrama de Capas

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Cliente)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Landing  │  │  Login   │  │ Dashboard│  │  Admin  │ │
│  │   Page   │  │ Register │  │  (Roles) │  │  Panel  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │         JavaScript (API Client + Auth)           │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/HTTPS
                          │ (REST API)
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │              Middleware Layer                      │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │ │
│  │  │   CORS   │  │   Auth   │  │  Error   │         │ │
│  │  │          │  │   JWT    │  │ Handler  │         │ │
│  │  └──────────┘  └──────────┘  └──────────┘         │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │              Routes Layer                         │ │
│  │  /api/auth  /api/turnos  /api/pacientes  ...      │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │           Controllers Layer                        │ │
│  │  auth.controller  turno.controller  ...            │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │           Services Layer (Opcional)                │ │
│  │  Business Logic & Complex Operations               │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Prisma ORM
                          ▼
┌─────────────────────────────────────────────────────────┐
│              BASE DE DATOS (PostgreSQL)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Usuarios │  │  Turnos  │  │ Médicos  │  │  ...    │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Comunicación

### 1. Autenticación

```
Usuario → Frontend → POST /api/auth/login
                    ↓
                 Backend valida credenciales
                    ↓
                 Genera JWT
                    ↓
                 Retorna token
                    ↓
Frontend almacena token en localStorage
```

### 2. Request Autenticado

```
Frontend → Request con Header: Authorization: Bearer <token>
                    ↓
                 Middleware authenticateToken
                    ↓
                 Valida JWT
                    ↓
                 Agrega req.user y req.userRole
                    ↓
                 Controller procesa request
                    ↓
                 Retorna respuesta
```

### 3. Creación de Turno

```
Paciente → Frontend → POST /api/turnos
                    ↓
                 Backend valida permisos
                    ↓
                 Verifica disponibilidad
                    ↓
                 Crea turno en BD
                    ↓
                 Crea notificaciones
                    ↓
                 Retorna turno creado
```

## 🗂️ Estructura de Carpetas Detallada

### Backend

```
backend/
├── prisma/
│   ├── schema.prisma          # Modelo de datos
│   ├── seed.js                # Datos iniciales
│   └── migrations/            # Migraciones (generadas)
│
├── src/
│   ├── server.js              # Punto de entrada
│   │
│   ├── routes/                # Definición de rutas
│   │   ├── auth.routes.js
│   │   ├── turno.routes.js
│   │   ├── paciente.routes.js
│   │   ├── medico.routes.js
│   │   ├── especialidad.routes.js
│   │   ├── disponibilidad.routes.js
│   │   ├── notaMedica.routes.js
│   │   ├── notificacion.routes.js
│   │   ├── estadistica.routes.js
│   │   └── usuario.routes.js
│   │
│   ├── controllers/           # Lógica de negocio
│   │   ├── auth.controller.js
│   │   ├── turno.controller.js
│   │   ├── paciente.controller.js
│   │   ├── medico.controller.js
│   │   ├── especialidad.controller.js
│   │   ├── disponibilidad.controller.js
│   │   ├── notaMedica.controller.js
│   │   ├── notificacion.controller.js
│   │   ├── estadistica.controller.js
│   │   └── usuario.controller.js
│   │
│   └── middlewares/           # Middlewares
│       ├── auth.middleware.js
│       └── errorHandler.middleware.js
│
├── package.json
├── .env.example
└── .gitignore
```

### Frontend (Propuesta)

```
frontend/
├── index.html                 # Landing page
├── login.html                 # Página de login
├── register.html              # Página de registro
│
├── dashboard/
│   ├── paciente.html          # Dashboard paciente
│   ├── medico.html            # Dashboard médico
│   ├── secretario.html        # Dashboard secretario
│   └── administrador.html    # Dashboard administrador
│
├── js/
│   ├── api.js                 # Cliente API
│   ├── auth.js                # Manejo de autenticación
│   ├── utils.js               # Utilidades
│   └── components/            # Componentes reutilizables
│       ├── modal.js
│       ├── table.js
│       └── calendar.js
│
└── css/
    ├── styles.css             # Estilos principales
    └── components.css         # Estilos de componentes
```

## 🔐 Sistema de Permisos

### Matriz de Permisos

| Recurso | Paciente | Médico | Secretario | Administrador |
|---------|----------|--------|------------|---------------|
| Ver sus turnos | ✅ | ❌ | ✅ | ✅ |
| Ver todos los turnos | ❌ | ❌ | ✅ | ✅ |
| Crear turno | ✅ | ❌ | ✅ | ✅ |
| Cancelar su turno | ✅ | ❌ | ✅ | ✅ |
| Ver pacientes | ❌ | ✅* | ✅ | ✅ |
| Ver médicos | ✅ | ✅ | ✅ | ✅ |
| Gestionar disponibilidad | ❌ | ✅ (propia) | ❌ | ✅ |
| Crear nota médica | ❌ | ✅ | ❌ | ✅ |
| Ver historial paciente | ❌ | ✅ | ❌ | ✅ |
| Gestionar especialidades | ❌ | ❌ | ❌ | ✅ |
| Gestionar usuarios | ❌ | ❌ | ❌ | ✅ |

*Médicos solo ven pacientes con turnos asignados a ellos

## 📊 Modelo de Datos Relacional

```
Usuario (1) ──┬── (1) Paciente
              ├── (1) Médico ── (N) Disponibilidad
              ├── (1) Secretario
              └── (1) Administrador

Médico (1) ── (1) Especialidad

Turno (N) ── (1) Paciente
Turno (N) ── (1) Médico
Turno (N) ── (1) Especialidad

Paciente (N) ── (N) Nota Médica ── (1) Médico

Usuario (1) ── (N) Notificación
```

## 🚦 Flujo de Navegación

### Usuario No Autenticado
```
Landing Page
    ├── Login → Dashboard (según rol)
    └── Register → Login → Dashboard
```

### Usuario Autenticado
```
Dashboard (según rol)
    ├── Turnos
    ├── Perfil
    ├── Notificaciones
    └── (Funcionalidades específicas del rol)
```

## 🔄 Estados de Turno

```
PENDIENTE → CONFIRMADO → COMPLETADO
     │           │
     └───────────┴──→ CANCELADO
                    AUSENTE
```

## 📱 Responsive Design

- **Desktop**: Layout completo con sidebar
- **Tablet**: Sidebar colapsable
- **Mobile**: Menú hamburguesa, cards en lugar de tablas

## 🎨 Sistema de Diseño

### Colores
- Primario: `#2563eb` (Azul)
- Secundario: `#64748b` (Gris)
- Éxito: `#10b981` (Verde)
- Peligro: `#ef4444` (Rojo)
- Advertencia: `#f59e0b` (Naranja)

### Tipografía
- Fuente: Inter
- Tamaños: xs, sm, base, lg, xl, 2xl, 3xl

### Componentes
- Botones: primary, secondary, danger
- Cards: con sombra y border-radius
- Modales: overlay con blur
- Formularios: inputs con validación visual

## 🔧 Configuración de Producción

### Variables de Entorno

```env
# Backend
DATABASE_URL=postgresql://...
JWT_SECRET=...
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://mediturnos.vercel.app

# Frontend
API_BASE_URL=https://mediturnos-api.railway.app/api
```

### Optimizaciones

- **Backend**: 
  - Compresión de respuestas
  - Rate limiting
  - Caching de consultas frecuentes
  - Logging estructurado

- **Frontend**:
  - Minificación de JS/CSS
  - Lazy loading de imágenes
  - Service Workers (PWA)
  - Optimización de bundle

## 📈 Escalabilidad

### Horizontal
- Múltiples instancias del backend
- Load balancer
- Base de datos con réplicas de lectura

### Vertical
- Optimización de consultas
- Índices en BD
- Caching (Redis)
- CDN para assets estáticos

## 🔍 Monitoreo y Logging

- **Logging**: Winston o Pino
- **Monitoreo**: Sentry para errores
- **Métricas**: Prometheus + Grafana
- **Health Checks**: Endpoint `/health`

## 🧪 Testing

### Backend
- Unit tests: Jest
- Integration tests: Supertest
- E2E tests: Cypress

### Frontend
- Unit tests: Jest
- E2E tests: Cypress

---

**Documentación actualizada**: 2024

