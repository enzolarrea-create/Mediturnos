# 📊 CÓMO EJECUTAR EL SQL EN RENDER

Tienes dos opciones:

## OPCIÓN 1: Usar DBeaver (Recomendado - Más Fácil)

1. Descarga DBeaver Community (gratis): https://dbeaver.io/download/
2. Instala y abre DBeaver
3. Click "New Database Connection"
4. Selecciona "PostgreSQL"
5. Configura:
   - **Host**: `dpg-d4gdg3npm1nc73f92dag-a.oregon-postgres.render.com`
   - **Port**: `5432`
   - **Database**: `mediturnos`
   - **Username**: `mediturnos_user`
   - **Password**: `v52KrfNlMuNUkiDgjCYRAgUgytWS0UtP`
6. Click "Test Connection" → Debería funcionar
7. Click "Finish"
8. Expande tu conexión → "Schemas" → "public" → Click derecho → "SQL Editor" → "New SQL Script"
9. Abre `backend/database.sql`
10. Copia TODO el contenido
11. Pégalo en DBeaver
12. Click "Execute SQL Script" (Ctrl+Enter)
13. ✅ Listo

## OPCIÓN 2: Usar el Script init-db.js

1. Crea un archivo `.env` en `backend/` con:
   ```
   DATABASE_URL=postgresql://mediturnos_user:v52KrfNlMuNUkiDgjCYRAgUgytWS0UtP@dpg-d4gdg3npm1nc73f92dag-a.oregon-postgres.render.com/mediturnos
   ```

2. Ejecuta:
   ```bash
   cd backend
   npm install
   node init-db.js
   ```

3. ✅ Listo

## OPCIÓN 3: Desde Render (Temporal)

1. En Render, ve a tu servicio backend
2. Ve a "Environment"
3. Temporalmente cambia "Start Command" a: `node init-db.js`
4. Guarda y espera a que termine
5. Luego cambia de vuelta a: `npm start`

---

**Recomiendo la OPCIÓN 1 (DBeaver)** - Es la más fácil y visual.

