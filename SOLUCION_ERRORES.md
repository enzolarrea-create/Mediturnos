# 🔧 Solución de Errores Comunes

## Error: "Failed to fetch" al iniciar sesión

Este error significa que el frontend no puede conectarse al backend.

### Solución 1: Verificar que el backend esté corriendo

1. Abre una terminal
2. Ve a la carpeta `backend-simple`
3. Ejecuta:
   ```bash
   npm start
   ```
4. Deberías ver:
   ```
   ✅ Base de datos JSON creada
   🚀 Servidor corriendo en http://localhost:3000
   ```

### Solución 2: Verificar el puerto

- El backend debe estar en el puerto **3000**
- El frontend debe estar en el puerto **5500**

### Solución 3: Verificar CORS

Si el backend está corriendo pero aún hay error:

1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Network" (Red)
3. Intenta iniciar sesión de nuevo
4. Busca la petición a `/api/auth/login`
5. Si ves un error de CORS, verifica que en `server.js` esté:
   ```javascript
   app.use(cors({
     origin: 'http://localhost:5500',
     credentials: true
   }));
   ```

### Solución 4: Verificar la URL del API

En `frontend-simple/js/api-simple.js` debe estar:
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

### Solución 5: Probar el backend directamente

Abre en tu navegador:
```
http://localhost:3000/api/health
```

Deberías ver:
```json
{"status":"ok","message":"MediTurnos API funcionando"}
```

Si no ves esto, el backend no está corriendo correctamente.

## Error: "Usuario no encontrado" después del seed

Si ejecutaste el seed pero no puedes iniciar sesión:

1. Verifica que el archivo `database.json` se haya creado
2. Abre `backend-simple/database.json`
3. Busca el usuario `admin@mediturnos.com`
4. Si no existe, ejecuta el seed de nuevo:
   ```bash
   cd backend-simple
   npm run seed
   ```

## Error: "Cannot find module"

```bash
cd backend-simple
npm install
```

## El frontend no carga los datos

1. Abre la consola del navegador (F12)
2. Busca errores en rojo
3. Verifica que el backend esté corriendo
4. Verifica que la URL del API sea correcta

---

**¿Sigue sin funcionar?** 

1. Verifica que ambos servidores estén corriendo:
   - Backend: `http://localhost:3000`
   - Frontend: `http://localhost:5500`

2. Abre la consola del navegador (F12) y comparte los errores que veas

