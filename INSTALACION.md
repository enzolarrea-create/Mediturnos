# 📋 Guía de Instalación - MediTurnos Pro

## 🚀 Inicio Rápido

### Opción 1: Abrir Directamente
1. Abre `landing.html` en tu navegador
2. El sistema se inicializará automáticamente

### Opción 2: Servidor Local (Recomendado)

#### Con Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Con Node.js:
```bash
# Instalar http-server globalmente
npm install -g http-server

# Ejecutar
http-server -p 8000
```

#### Con PHP:
```bash
php -S localhost:8000
```

Luego abre: `http://localhost:8000/landing.html`

## 👤 Usuarios de Prueba

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
- **Acceso**: Vista de turnos propios

### Paciente
- **Email**: `paciente@mediturnos.com`
- **Password**: `Paciente123`
- **Acceso**: Portal de paciente

## 📁 Estructura de Archivos

```
MediTurnos/
├── css/                    # Estilos
│   ├── main.css
│   ├── layout.css
│   └── landing.css
├── js/                     # JavaScript modular
│   ├── app.js             # Inicialización
│   ├── config.js          # Configuración
│   ├── modules/           # Módulos del sistema
│   ├── components/        # Componentes reutilizables
│   └── views/             # Vistas por rol
├── views/                  # Vistas HTML
│   ├── admin/
│   ├── secretario/
│   ├── medico/
│   └── paciente/
├── landing.html            # Página principal
└── README.md
```

## ⚙️ Configuración

El sistema se configura automáticamente al cargar. Los datos se guardan en `localStorage` del navegador.

### Limpiar Datos
Para resetear el sistema, ejecuta en la consola del navegador:
```javascript
localStorage.clear();
location.reload();
```

## 🔧 Requisitos del Navegador

- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 79+

**Importante**: El navegador debe soportar ES6 Modules.

## 🐛 Solución de Problemas

### Error: "Failed to load module"
- Asegúrate de usar un servidor web local
- No se puede abrir directamente desde `file://`

### Los datos no se guardan
- Verifica que localStorage esté habilitado
- Revisa la consola del navegador

### No puedo iniciar sesión
- Verifica las credenciales
- Limpia localStorage y recarga

## 📝 Notas Importantes

1. **Datos en localStorage**: Todos los datos se guardan localmente en el navegador
2. **Sin backend**: El sistema funciona completamente sin servidor
3. **Modo desarrollo**: Este es un sistema de demostración

## 🎯 Próximos Pasos

1. Inicia sesión con cualquier usuario de prueba
2. Explora las funcionalidades según el rol
3. Crea nuevos turnos, pacientes y médicos
4. Prueba los diferentes dashboards

---

¡Listo para usar! 🎉

