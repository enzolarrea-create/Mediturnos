# 🔧 SOLUCIONAR ERROR "Not Found"

## El problema

Si ves "Not Found" al acceder a `/api/health`, puede ser:

1. El servidor no se desplegó correctamente
2. Hay un error en los logs
3. La configuración SSL está mal

## Solución

### 1. Verificar los logs en Render

1. Ve a tu servicio backend en Render
2. Click en la pestaña "Logs"
3. Busca errores en rojo
4. Comparte los errores que veas

### 2. Verificar variables de entorno

En Render → Tu servicio → "Environment", verifica que tengas:

```
DATABASE_URL=postgresql://mediturnos_user:v52KrfNlMuNUkiDgjCYRAgUgytWS0UtP@dpg-d4gdg3npm1nc73f92dag-a/mediturnos
SESSION_SECRET=(debe tener un valor)
PORT=10000
NODE_ENV=production
```

### 3. Verificar que el código se actualizó

He actualizado `backend/server.js` para:
- Configurar SSL correctamente para Render
- Agregar ruta raíz `/`
- Mejorar manejo de errores

**Haz commit y push:**
```bash
git add backend/server.js
git commit -m "Corregir configuración SSL para Render"
git push
```

Render se actualizará automáticamente (espera 2-3 minutos).

### 4. Verificar después del update

Después de que Render termine de actualizar:
1. Abre: `https://tu-backend.onrender.com/`
2. Deberías ver información de la API
3. Abre: `https://tu-backend.onrender.com/api/health`
4. Deberías ver: `{"status":"ok","message":"MediTurnos API funcionando"}`

---

**Si sigue fallando, comparte los logs de Render para ver el error exacto.**

