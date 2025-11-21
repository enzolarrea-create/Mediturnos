# 🏥 MediTurnos - Versión Simple

Versión ultra-simplificada del sistema de gestión de turnos médicos, perfecta para proyectos universitarios.

## ✨ Características

- ✅ **Sin Prisma** - Base de datos JSON simple
- ✅ **Sin compilación** - No requiere Python ni herramientas nativas
- ✅ **Sin migraciones** - Los datos se guardan directamente en JSON
- ✅ **Sin JWT complejo** - Sesiones simples con express-session
- ✅ **Sin configuración complicada** - Todo funciona por defecto
- ✅ **Base de datos local** - Un solo archivo JSON

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
├── database-json.js   # Base de datos JSON
├── seed-json.js       # Datos de ejemplo
└── database.json      # Archivo de datos (se crea automáticamente)

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

- La base de datos JSON se crea automáticamente al iniciar el servidor
- No requiere compilación ni Python (funciona inmediatamente)
- Las sesiones se guardan en memoria (se pierden al reiniciar)
- Los datos se guardan en un archivo JSON simple
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

