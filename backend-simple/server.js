/**
 * Servidor Express simple para MediTurnos
 */

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors({
  origin: 'http://localhost:5500',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesiones simples
app.use(session({
  secret: 'mediturnos-secret-key-cambiar-en-produccion',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true en producción con HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Middleware para verificar autenticación
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  next();
}

// ==================== RUTAS DE AUTENTICACIÓN ====================

// Registro
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, nombre, apellido, dni, telefono } = req.body;

    if (!email || !password || !nombre || !apellido || !dni) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Verificar si el email ya existe
    const existing = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // Hashear contraseña
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const result = db.prepare(`
      INSERT INTO usuarios (email, password, rol, nombre, apellido, dni, telefono)
      VALUES (?, ?, 'PACIENTE', ?, ?, ?, ?)
    `).run(email, hashedPassword, nombre, apellido, dni, telefono || null);

    res.json({ 
      message: 'Usuario registrado exitosamente',
      userId: result.lastInsertRowid 
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    // Buscar usuario
    const user = db.prepare('SELECT * FROM usuarios WHERE email = ? AND activo = 1').get(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const bcrypt = require('bcryptjs');
    const valid = await bcrypt.compare(password, user.password);
    
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Crear sesión
    req.session.userId = user.id;
    req.session.userRol = user.rol;

    // Obtener datos adicionales según el rol
    let userData = { ...user };
    delete userData.password;

    if (user.rol === 'MEDICO') {
      const medico = db.prepare('SELECT * FROM medicos WHERE usuario_id = ?').get(user.id);
      userData.medico = medico;
    }

    res.json({ 
      message: 'Login exitoso',
      user: userData
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Sesión cerrada' });
});

// Obtener usuario actual
app.get('/api/auth/me', requireAuth, (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, rol, nombre, apellido, dni, telefono FROM usuarios WHERE id = ?').get(req.session.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// ==================== RUTAS DE TURNOS ====================

// Listar turnos
app.get('/api/turnos', requireAuth, (req, res) => {
  try {
    const { fecha, medicoId, pacienteId } = req.query;
    let query = `
      SELECT t.*, 
             p.nombre as paciente_nombre, p.apellido as paciente_apellido, p.dni as paciente_dni,
             m.nombre as medico_nombre, m.apellido as medico_apellido,
             med.matricula
      FROM turnos t
      JOIN usuarios p ON t.paciente_id = p.id
      JOIN medicos med ON t.medico_id = med.id
      JOIN usuarios m ON med.usuario_id = m.id
      WHERE 1=1
    `;
    const params = [];

    // Filtros según rol
    if (req.session.userRol === 'PACIENTE') {
      query += ' AND t.paciente_id = ?';
      params.push(req.session.userId);
    } else if (req.session.userRol === 'MEDICO') {
      const medico = db.prepare('SELECT id FROM medicos WHERE usuario_id = ?').get(req.session.userId);
      if (medico) {
        query += ' AND t.medico_id = ?';
        params.push(medico.id);
      }
    }

    if (fecha) {
      query += ' AND t.fecha = ?';
      params.push(fecha);
    }
    if (medicoId) {
      query += ' AND t.medico_id = ?';
      params.push(medicoId);
    }
    if (pacienteId) {
      query += ' AND t.paciente_id = ?';
      params.push(pacienteId);
    }

    query += ' ORDER BY t.fecha, t.hora';

    const turnos = db.prepare(query).all(...params);
    res.json({ turnos });
  } catch (error) {
    console.error('Error al listar turnos:', error);
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

    // Si es paciente, solo puede crear turnos para sí mismo
    if (req.session.userRol === 'PACIENTE') {
      if (parseInt(pacienteId) !== req.session.userId) {
        return res.status(403).json({ error: 'Solo puedes crear turnos para ti mismo' });
      }
    }

    // Verificar que no haya conflicto
    const conflicto = db.prepare(`
      SELECT id FROM turnos 
      WHERE medico_id = ? AND fecha = ? AND hora = ? AND estado != 'CANCELADO'
    `).get(medicoId, fecha, hora);

    if (conflicto) {
      return res.status(409).json({ error: 'Ya existe un turno en ese horario' });
    }

    const result = db.prepare(`
      INSERT INTO turnos (paciente_id, medico_id, fecha, hora, estado, motivo_consulta)
      VALUES (?, ?, ?, ?, 'PENDIENTE', ?)
    `).run(pacienteId, medicoId, fecha, hora, motivoConsulta || null);

    res.status(201).json({ 
      message: 'Turno creado exitosamente',
      turnoId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error al crear turno:', error);
    res.status(500).json({ error: 'Error al crear turno' });
  }
});

// Cancelar turno
app.delete('/api/turnos/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;

    // Verificar permisos
    const turno = db.prepare('SELECT * FROM turnos WHERE id = ?').get(id);
    if (!turno) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    if (req.session.userRol === 'PACIENTE' && turno.paciente_id !== req.session.userId) {
      return res.status(403).json({ error: 'No tienes permisos' });
    }

    db.prepare('UPDATE turnos SET estado = ? WHERE id = ?').run('CANCELADO', id);
    res.json({ message: 'Turno cancelado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cancelar turno' });
  }
});

// ==================== RUTAS DE MÉDICOS ====================

// Listar médicos
app.get('/api/medicos', (req, res) => {
  try {
    const medicos = db.prepare(`
      SELECT m.*, u.nombre, u.apellido, u.email, u.telefono
      FROM medicos m
      JOIN usuarios u ON m.usuario_id = u.id
      WHERE u.activo = 1
    `).all();
    res.json({ medicos });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener médicos' });
  }
});

// ==================== RUTAS DE PACIENTES ====================

// Listar pacientes (solo Secretario/Admin)
app.get('/api/pacientes', requireAuth, (req, res) => {
  try {
    if (req.session.userRol !== 'SECRETARIO' && req.session.userRol !== 'ADMINISTRADOR') {
      return res.status(403).json({ error: 'No tienes permisos' });
    }

    const pacientes = db.prepare(`
      SELECT id, nombre, apellido, dni, telefono, email
      FROM usuarios
      WHERE rol = 'PACIENTE' AND activo = 1
    `).all();
    res.json({ pacientes });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pacientes' });
  }
});

// ==================== RUTAS DE ESPECIALIDADES ====================

app.get('/api/especialidades', (req, res) => {
  try {
    const especialidades = db.prepare('SELECT * FROM especialidades').all();
    res.json({ especialidades });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener especialidades' });
  }
});

// ==================== RUTA DE SALUD ====================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MediTurnos API funcionando' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

