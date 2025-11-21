# 🏥 MediTurnos Pro - Sistema de Gestión de Turnos Médicos

Sistema profesional, modular y moderno para la gestión integral de turnos médicos con 4 roles diferenciados.

## 🎯 Características Principales

### ✅ Sistema de Roles
- **Administrador**: Acceso total al sistema
- **Secretario/Recepcionista**: Gestión de turnos y pacientes
- **Médico**: Vista personalizada de turnos y pacientes
- **Paciente**: Portal para reservar y gestionar turnos

### ✅ Funcionalidades
- ✅ Sistema de autenticación completo
- ✅ CRUD completo de turnos, pacientes, médicos y usuarios
- ✅ Dashboard dinámico por rol
- ✅ Sistema de notificaciones
- ✅ Filtros y búsqueda avanzada
- ✅ Validación de formularios
- ✅ Diseño responsive y moderno
- ✅ Arquitectura modular ES6

## 📁 Estructura del Proyecto

```
MediTurnos/
├── css/
│   ├── main.css          # Estilos principales
│   ├── layout.css        # Layout y sidebar
│   └── landing.css       # Estilos landing page
├── js/
│   ├── app.js            # Inicialización principal
│   ├── config.js         # Configuración global
│   ├── modules/          # Módulos del sistema
│   │   ├── auth.js       # Autenticación y roles
│   │   ├── storage.js    # Gestión de localStorage
│   │   ├── notifications.js  # Sistema de notificaciones
│   │   ├── router.js     # Routing
│   │   ├── turnos.js     # CRUD turnos
│   │   ├── pacientes.js  # CRUD pacientes
│   │   ├── medicos.js    # CRUD médicos
│   │   └── usuarios.js   # CRUD usuarios
│   ├── components/       # Componentes reutilizables
│   │   ├── modal.js      # Componente modal
│   │   ├── form.js       # Validación de formularios
│   │   └── table.js      # Tabla de datos
│   └── views/            # Vistas por rol
│       ├── landing.js    # Vista landing
│       └── admin/        # Vistas administrador
├── views/
│   ├── admin/
│   │   └── dashboard.html
│   ├── secretario/
│   ├── medico/
│   └── paciente/
├── landing.html          # Página principal
└── README.md
```

## 🚀 Instalación y Uso

### Requisitos
- Navegador moderno con soporte para ES6 modules
- Servidor web local (opcional, puede abrirse directamente)

### Pasos de Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   git clone [url-del-repositorio]
   cd Mediturnoscursor
   ```

2. **Abrir en el navegador**
   - Opción 1: Abrir directamente `landing.html` en el navegador
   - Opción 2: Usar un servidor local:
     ```bash
     # Con Python
     python -m http.server 8000
     
     # Con Node.js (http-server)
     npx http-server
     ```

3. **Acceder al sistema**
   - Abrir `http://localhost:8000/landing.html` (o la ruta correspondiente)

## 👤 Usuarios de Prueba

El sistema viene con usuarios de ejemplo preconfigurados:

### Administrador
- **Email**: `admin@mediturnos.com`
- **Password**: `Admin123`
- **Acceso**: Total al sistema

### Secretario
- **Email**: `secretario@mediturnos.com`
- **Password**: `Secret123`
- **Acceso**: Gestión de turnos y pacientes

### Médico
- **Email**: `medico@mediturnos.com`
- **Password**: `Medico123`
- **Acceso**: Vista de turnos propios y pacientes

### Paciente
- **Email**: `paciente@mediturnos.com`
- **Password**: `Paciente123`
- **Acceso**: Portal de paciente

## 🎨 Diseño

El sistema utiliza un diseño moderno y profesional inspirado en:
- Apple Health
- Paneles SaaS modernos
- Interfaz de clínica/hospital profesional

### Paleta de Colores
- **Primario**: Azul médico (#2563eb)
- **Éxito**: Verde (#10b981)
- **Error**: Rojo (#ef4444)
- **Advertencia**: Naranja (#f59e0b)

## 🔧 Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Variables CSS, Grid, Flexbox
- **JavaScript ES6+**: Módulos, clases, async/await
- **Font Awesome**: Iconos
- **Google Fonts**: Tipografía Inter

## 📝 Funcionalidades por Rol

### Administrador
- ✅ Dashboard con estadísticas completas
- ✅ Gestión completa de turnos
- ✅ CRUD de pacientes
- ✅ CRUD de médicos
- ✅ Gestión de usuarios y roles
- ✅ Reportes y estadísticas
- ✅ Auditoría de cambios

### Secretario
- ✅ Panel rápido del día
- ✅ Calendario semanal
- ✅ Gestión de turnos (crear, editar, cancelar)
- ✅ Gestión de pacientes
- ✅ Búsqueda y filtros
- ✅ Notificaciones

### Médico
- ✅ Dashboard médico personalizado
- ✅ Lista de turnos del día
- ✅ Cambiar estado de turnos
- ✅ Ver historial de pacientes
- ✅ Cargar notas clínicas
- ✅ Gestionar disponibilidad

### Paciente
- ✅ Portal de paciente
- ✅ Reservar turnos online
- ✅ Ver turnos futuros
- ✅ Cancelar turnos
- ✅ Ver historial personal
- ✅ Editar datos personales

## 🗄️ Almacenamiento de Datos

El sistema utiliza **localStorage** para persistir datos:
- `mediturnos_users`: Usuarios del sistema
- `mediturnos_current_user`: Usuario actual
- `mediturnos_turnos`: Turnos
- `mediturnos_medicos`: Médicos
- `mediturnos_pacientes`: Pacientes
- `mediturnos_notificaciones`: Notificaciones

## 🔐 Seguridad

- Validación de formularios en cliente
- Sistema de permisos por rol
- Autenticación con sesión persistente
- Validación de disponibilidad de turnos

## 🚧 Próximas Mejoras

- [ ] Integración con backend real
- [ ] Exportación de reportes a PDF
- [ ] Calendario interactivo completo
- [ ] Sistema de notificaciones por email
- [ ] Historial clínico completo
- [ ] Búsqueda avanzada con filtros múltiples
- [ ] Modo oscuro
- [ ] Internacionalización (i18n)

## 📄 Licencia

Este proyecto es de uso educativo y demostrativo.

## 👨‍💻 Desarrollo

Para contribuir o modificar el proyecto:

1. Los módulos están en `js/modules/`
2. Las vistas están en `js/views/`
3. Los componentes reutilizables en `js/components/`
4. Los estilos principales en `css/main.css`

## 🐛 Solución de Problemas

### El sistema no carga
- Verificar que el navegador soporte ES6 modules
- Revisar la consola del navegador para errores
- Asegurarse de usar un servidor web local

### No puedo iniciar sesión
- Verificar que los datos de usuario sean correctos
- Revisar que localStorage esté habilitado
- Limpiar localStorage y recargar

### Los datos no se guardan
- Verificar permisos del navegador para localStorage
- Revisar la consola para errores de JavaScript

## 📞 Soporte

Para consultas o problemas, revisar la documentación del código o contactar al equipo de desarrollo.

---

**MediTurnos Pro** - Sistema profesional de gestión de turnos médicos
Desarrollado con ❤️ para profesionales de la salud

