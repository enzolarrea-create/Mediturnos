const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Pool de conexiones PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render') || process.env.DATABASE_URL?.includes('railway') 
    ? { rejectUnauthorized: false } 
    : false
});

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'mediturnos-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Middleware de autenticación
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  next();
};

// ==================== AUTENTICACIÓN ====================

// Registro
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, nombre, apellido, dni, telefono } = req.body;
    
    if (!email || !password || !nombre || !apellido || !dni) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const existing = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO usuarios (email, password, rol, nombre, apellido, dni, telefono) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [email, hashedPassword, 'PACIENTE', nombre, apellido, dni, telefono || null]
    );

    res.json({ message: 'Usuario registrado', userId: result.rows[0].id });
  } catch (error) {
    console.error('Error registro:', error);
    res.status(500).json({ error: 'Error al registrar' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1 AND activo = true', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    req.session.userId = user.id;
    req.session.userRol = user.rol;

    const { password: _, ...userData } = user;
    res.json({ message: 'Login exitoso', user: userData });
  } catch (error) {
    console.error('Error login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Sesión cerrada' });
});

// Usuario actual
app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, rol, nombre, apellido, dni, telefono FROM usuarios WHERE id = $1', [req.session.userId]);
    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// ==================== TURNOS ====================

// Listar turnos
app.get('/api/turnos', requireAuth, async (req, res) => {
  try {
    let query = `
      SELECT t.*, 
             p.nombre as paciente_nombre, p.apellido as paciente_apellido, p.dni as paciente_dni,
             m.nombre as medico_nombre, m.apellido as medico_apellido, med.matricula
      FROM turnos t
      JOIN usuarios p ON t.paciente_id = p.id
      JOIN medicos med ON t.medico_id = med.id
      JOIN usuarios m ON med.usuario_id = m.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (req.session.userRol === 'PACIENTE') {
      query += ` AND t.paciente_id = $${paramCount}`;
      params.push(req.session.userId);
      paramCount++;
    } else if (req.session.userRol === 'MEDICO') {
      const medico = await pool.query('SELECT id FROM medicos WHERE usuario_id = $1', [req.session.userId]);
      if (medico.rows.length > 0) {
        query += ` AND t.medico_id = $${paramCount}`;
        params.push(medico.rows[0].id);
        paramCount++;
      }
    }

    if (req.query.fecha) {
      query += ` AND t.fecha = $${paramCount}`;
      params.push(req.query.fecha);
      paramCount++;
    }

    query += ' ORDER BY t.fecha, t.hora';

    const result = await pool.query(query, params);
    res.json({ turnos: result.rows });
  } catch (error) {
    console.error('Error listar turnos:', error);
    res.status(500).json({ error: 'Error al obtener turnos' });
  }
});

// Crear turno
app.post('/api/turnos', requireAuth, async (req, res) => {
  try {
    const { pacienteId, medicoId, fecha, hora, motivoConsulta } = req.body;

    if (!pacienteId || !medicoId || !fecha || !hora) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    if (req.session.userRol === 'PACIENTE' && parseInt(pacienteId) !== req.session.userId) {
      return res.status(403).json({ error: 'Solo puedes crear turnos para ti mismo' });
    }

    const conflicto = await pool.query(
      'SELECT id FROM turnos WHERE medico_id = $1 AND fecha = $2 AND hora = $3 AND estado != $4',
      [medicoId, fecha, hora, 'CANCELADO']
    );

    if (conflicto.rows.length > 0) {
      return res.status(409).json({ error: 'Ya existe un turno en ese horario' });
    }

    const result = await pool.query(
      'INSERT INTO turnos (paciente_id, medico_id, fecha, hora, estado, motivo_consulta) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [pacienteId, medicoId, fecha, hora, 'PENDIENTE', motivoConsulta || null]
    );

    res.status(201).json({ message: 'Turno creado', turnoId: result.rows[0].id });
  } catch (error) {
    console.error('Error crear turno:', error);
    res.status(500).json({ error: 'Error al crear turno' });
  }
});

// Cancelar turno
app.delete('/api/turnos/:id', requireAuth, async (req, res) => {
  try {
    const turno = await pool.query('SELECT * FROM turnos WHERE id = $1', [req.params.id]);
    if (turno.rows.length === 0) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    if (req.session.userRol === 'PACIENTE' && turno.rows[0].paciente_id !== req.session.userId) {
      return res.status(403).json({ error: 'No tienes permisos' });
    }

    await pool.query('UPDATE turnos SET estado = $1 WHERE id = $2', ['CANCELADO', req.params.id]);
    res.json({ message: 'Turno cancelado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cancelar turno' });
  }
});

// ==================== MÉDICOS ====================

app.get('/api/medicos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, u.nombre, u.apellido, u.email, u.telefono
      FROM medicos m
      JOIN usuarios u ON m.usuario_id = u.id
      WHERE u.activo = true
    `);
    res.json({ medicos: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener médicos' });
  }
});

// ==================== PACIENTES ====================

app.get('/api/pacientes', requireAuth, async (req, res) => {
  try {
    if (req.session.userRol !== 'SECRETARIO' && req.session.userRol !== 'ADMINISTRADOR') {
      return res.status(403).json({ error: 'No tienes permisos' });
    }

    const result = await pool.query(
      'SELECT id, nombre, apellido, dni, telefono, email FROM usuarios WHERE rol = $1 AND activo = true',
      ['PACIENTE']
    );
    res.json({ pacientes: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pacientes' });
  }
});

// ==================== ESPECIALIDADES ====================

app.get('/api/especialidades', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM especialidades');
    res.json({ especialidades: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener especialidades' });
  }
});

// ==================== HEALTH ====================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MediTurnos API funcionando' });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: 'MediTurnos API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      turnos: '/api/turnos',
      medicos: '/api/medicos',
      pacientes: '/api/pacientes',
      especialidades: '/api/especialidades'
    }
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    message: 'Consulta /api/health para verificar que el servidor funciona'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

