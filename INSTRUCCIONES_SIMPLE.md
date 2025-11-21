# 🚀 Instrucciones Simples - MediTurnos

## ⚡ Inicio Rápido (2 minutos)

### 1. Instalar dependencias del backend

```bash
cd backend-simple
npm install
```

### 2. (Opcional) Poblar con datos de ejemplo

```bash
npm run seed
```

### 3. Iniciar el servidor

```bash
npm start
```

El servidor estará en `http://localhost:3000`

**¡Eso es todo!** La base de datos JSON se crea automáticamente en `database.json`.

### 4. Abrir el frontend

Abre `landing.html` en tu navegador o usa un servidor simple:

```bash
# Opción 1: Python
python -m http.server 5500

# Opción 2: Node.js
npx http-server -p 5500
```

Luego abre: `http://localhost:5500/landing.html`

## 📁 Estructura del Proyecto

```
Mediturnoscursor/
├── backend-simple/
│   ├── server.js          # Servidor Express
│   ├── database-json.js   # Base de datos JSON
│   ├── seed-json.js       # Datos de ejemplo
│   ├── package.json
│   └── database.json      # Archivo de datos (se crea automáticamente)
│
└── frontend-simple/
    ├── js/
    │   ├── api-simple.js      # Cliente API
    │   ├── landing-simple.js  # Landing page
    │   └── dashboard-simple.js # Dashboard
    ├── landing.html
    ├── iniciado.html
    └── styles.css
```

## 🎯 Funcionalidades Implementadas

- ✅ Registro de pacientes
- ✅ Login/Logout con sesiones
- ✅ Crear turnos
- ✅ Listar turnos (filtrados por rol)
- ✅ Cancelar turnos
- ✅ Listar médicos
- ✅ Listar pacientes (Secretario/Admin)

## 🔧 Crear Usuarios de Prueba

Puedes crear usuarios directamente desde la interfaz o agregar algunos manualmente.

### Crear un médico manualmente (opcional)

Abre `database.sqlite` con cualquier visor SQLite y ejecuta:

```sql
-- Crear usuario médico
INSERT INTO usuarios (email, password, rol, nombre, apellido, dni, telefono)
VALUES ('medico@test.com', '$2a$10$...', 'MEDICO', 'Dr. Juan', 'López', '12345678', '123456789');

-- Obtener el ID del usuario creado y crear el médico
INSERT INTO medicos (usuario_id, matricula) VALUES (1, '12345');
```

**Nota:** Para obtener el hash de contraseña, puedes usar:
```javascript
const bcrypt = require('bcryptjs');
bcrypt.hash('password123', 10).then(console.log);
```

## 📝 Notas Importantes

1. **Base de datos**: Se crea automáticamente en `backend-simple/database.json` (archivo JSON simple)
2. **Sin compilación**: No requiere Python ni herramientas de compilación
3. **Sesiones**: Se guardan en memoria (se pierden al reiniciar el servidor)
4. **Sin migraciones**: Los datos se guardan directamente en JSON
5. **Sin configuración compleja**: Todo funciona con valores por defecto

## 🐛 Solución de Problemas

### Error: "Cannot find module"

```bash
cd backend-simple
npm install
```

### Error: "Port 3000 already in use"

Cambia el puerto en `server.js`:
```javascript
const PORT = 3001; // O cualquier otro puerto
```

### El frontend no carga datos

- Verifica que el backend esté corriendo
- Abre la consola del navegador (F12) para ver errores
- Verifica que `API_BASE_URL` en `api-simple.js` sea correcta

## ✅ Listo para usar

¡Tu aplicación está funcionando! Puedes:
- Registrarte como paciente
- Crear turnos
- Ver tu dashboard

---

**¿Necesitas ayuda?** Revisa los logs del servidor en la terminal.

