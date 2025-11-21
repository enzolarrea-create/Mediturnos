# 🏥 MediTurnos - Versión Simple

Versión ultra-simplificada del sistema de gestión de turnos médicos, perfecta para proyectos universitarios.

## ✨ Características

- ✅ **Sin Prisma** - SQLite directo con better-sqlite3
- ✅ **Sin migraciones** - Las tablas se crean automáticamente
- ✅ **Sin JWT complejo** - Sesiones simples con express-session
- ✅ **Sin configuración complicada** - Todo funciona por defecto
- ✅ **Base de datos local** - Un solo archivo SQLite

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
cd backend-simple
npm install
```

### 2. (Opcional) Poblar con datos de ejemplo

```bash
npm run seed
```

### 3. Iniciar servidor

```bash
npm start
```

### 4. Abrir frontend

Abre `landing.html` en tu navegador o usa:
```bash
python -m http.server 5500
```

Luego: `http://localhost:5500/landing.html`

## 📁 Estructura

```
backend-simple/
├── server.js          # Servidor Express
├── database.js        # Configuración SQLite
├── seed.js            # Datos de ejemplo
└── database.sqlite    # Base de datos (se crea automáticamente)

frontend-simple/
├── js/
│   ├── api-simple.js
│   ├── landing-simple.js
│   └── dashboard-simple.js
├── landing.html
└── iniciado.html
```

## 🎯 Funcionalidades

### Paciente
- Registrarse
- Iniciar sesión
- Ver turnos
- Crear turnos
- Cancelar turnos

### Médico
- Ver agenda diaria
- Ver turnos asignados

### Secretario
- Ver todos los turnos
- Ver lista de pacientes
- Crear turnos manualmente

### Administrador
- Gestionar usuarios
- Ver estadísticas

## 🔑 Credenciales de Prueba (después del seed)

- **Admin**: admin@mediturnos.com / password123
- **Médico**: dr.lopez@mediturnos.com / password123
- **Secretario**: secretario@mediturnos.com / password123
- **Paciente**: maria@example.com / password123

## 📝 Notas

- La base de datos se crea automáticamente al iniciar el servidor
- Las sesiones se guardan en memoria (se pierden al reiniciar)
- No requiere configuración de base de datos externa
- Todo funciona con valores por defecto

## 🐛 Solución de Problemas

**Error: "Cannot find module"**
```bash
cd backend-simple
npm install
```

**Puerto ocupado**
Cambia `PORT` en `server.js`

**Frontend no carga**
- Verifica que el backend esté corriendo
- Revisa la consola del navegador (F12)

---

**¡Listo para usar!** 🎉

