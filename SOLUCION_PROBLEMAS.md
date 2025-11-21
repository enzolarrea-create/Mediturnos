# 🔧 Solución de Problemas - MediTurnos Pro

## ❌ Problema: "Email o contraseña incorrectos"

Si estás recibiendo este error incluso con las credenciales correctas, sigue estos pasos:

### Solución Rápida

1. **Abre la consola del navegador** (F12 o clic derecho > Inspeccionar > Consola)

2. **Ejecuta este comando para reinicializar los datos:**
   ```javascript
   reinitStorage()
   ```

3. **Verifica que los usuarios se hayan creado:**
   ```javascript
   checkStorage()
   ```

4. **Intenta iniciar sesión nuevamente con:**
   - Admin: `admin@mediturnos.com` / `Admin123`
   - Secretario: `secretario@mediturnos.com` / `Secret123`
   - Médico: `medico@mediturnos.com` / `Medico123`
   - Paciente: `paciente@mediturnos.com` / `Paciente123`

### Solución Manual

Si la solución rápida no funciona:

1. **Abre la consola del navegador** (F12)

2. **Limpia todo el localStorage:**
   ```javascript
   localStorage.clear()
   ```

3. **Recarga la página** (F5)

4. **Los datos se inicializarán automáticamente**

### Verificar Usuarios

Para ver qué usuarios están en el sistema:

```javascript
checkStorage()
```

Esto mostrará todos los usuarios disponibles y sus credenciales.

### Probar Login

Para probar un login específico:

```javascript
testLogin('admin@mediturnos.com', 'Admin123')
```

Esto te dirá si las credenciales son correctas.

## 🔍 Otros Problemas Comunes

### El sistema no carga
- Verifica que estés usando un servidor web local (no `file://`)
- Revisa la consola para errores de JavaScript
- Asegúrate de que el navegador soporte ES6 modules

### Los datos no se guardan
- Verifica que localStorage esté habilitado
- Revisa la consola para errores
- Intenta en modo incógnito para descartar extensiones

### No puedo acceder a las vistas
- Verifica que hayas iniciado sesión correctamente
- Revisa la consola para errores de permisos
- Asegúrate de que el rol del usuario sea correcto

## 📝 Comandos Útiles en Consola

```javascript
// Ver todos los datos
checkStorage()

// Reinicializar todo
reinitStorage()

// Probar login
testLogin('email@ejemplo.com', 'password')

// Ver usuario actual
localStorage.getItem('mediturnos_current_user')

// Ver todos los usuarios
JSON.parse(localStorage.getItem('mediturnos_users'))
```

## 🆘 Si Nada Funciona

1. Limpia completamente el navegador:
   - Cierra todas las pestañas
   - Limpia caché y cookies
   - Reinicia el navegador

2. Verifica que estés usando un servidor web:
   ```bash
   python -m http.server 8000
   ```

3. Abre `http://localhost:8000/landing.html`

4. Ejecuta `reinitStorage()` en la consola

5. Intenta iniciar sesión nuevamente

---

Si el problema persiste, revisa la consola del navegador para mensajes de error específicos.

