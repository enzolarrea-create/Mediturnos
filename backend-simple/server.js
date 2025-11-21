/**
 * Servidor Express simple para MediTurnos
 */

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const db = require('./database-json');

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
    const existing = db.getUsuarioByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // Hashear contraseña
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const usuario = db.createUsuario({
      email,
      password: hashedPassword,
      rol: 'PACIENTE',
      nombre,
      apellido,
      dni,
      telefono: telefono || null,
      activo: true
    });

    res.json({ 
      message: 'Usuario registrado exitosamente',
      userId: usuario.id 
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
    const user = db.getUsuarioByEmail(email);
    
    if (!user || user.activo === false) {
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
      const medico = db.getMedicoByUsuarioId(user.id);
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
    const user = db.getUsuario(req.session.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const userData = {
      id: user.id,
      email: user.email,
      rol: user.rol,
      nombre: user.nombre,
      apellido: user.apellido,
      dni: user.dni,
      telefono: user.telefono
    };

    res.json({ user: userData });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// ==================== RUTAS DE TURNOS ====================

// Listar turnos
app.get('/api/turnos', requireAuth, (req, res) => {
  try {
    const { fecha, medicoId, pacienteId } = req.query;
    const filtros = {};

    // Filtros según rol
    if (req.session.userRol === 'PACIENTE') {
      filtros.paciente_id = req.session.userId;
    } else if (req.session.userRol === 'MEDICO') {
      const medico = db.getMedicoByUsuarioId(req.session.userId);
      if (medico) {
        filtros.medico_id = medico.id;
      }
    }

    if (fecha) filtros.fecha = fecha;
    if (medicoId) filtros.medico_id = parseInt(medicoId);
    if (pacienteId) filtros.paciente_id = parseInt(pacienteId);

    const turnos = db.getTurnos(filtros);
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
    const turnosExistentes = db.getTurnos({ medico_id: parseInt(medicoId), fecha });
    const conflicto = turnosExistentes.find(t => 
      t.hora === hora && t.estado !== 'CANCELADO'
    );

    if (conflicto) {
      return res.status(409).json({ error: 'Ya existe un turno en ese horario' });
    }

    const turno = db.createTurno({
      paciente_id: parseInt(pacienteId),
      medico_id: parseInt(medicoId),
      fecha,
      hora,
      estado: 'PENDIENTE',
      motivo_consulta: motivoConsulta || null
    });

    res.status(201).json({ 
      message: 'Turno creado exitosamente',
      turnoId: turno.id
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
    const turnos = db.getTurnos();
    const turno = turnos.find(t => t.id === parseInt(id));
    
    if (!turno) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    if (req.session.userRol === 'PACIENTE' && turno.paciente_id !== req.session.userId) {
      return res.status(403).json({ error: 'No tienes permisos' });
    }

    db.updateTurno(parseInt(id), { estado: 'CANCELADO' });
    res.json({ message: 'Turno cancelado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cancelar turno' });
  }
});

// ==================== RUTAS DE MÉDICOS ====================

// Listar médicos
app.get('/api/medicos', (req, res) => {
  try {
    const medicos = db.getMedicos();
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

    const pacientes = db.getUsuariosByRol('PACIENTE').map(u => ({
      id: u.id,
      nombre: u.nombre,
      apellido: u.apellido,
      dni: u.dni,
      telefono: u.telefono,
      email: u.email
    }));
    res.json({ pacientes });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pacientes' });
  }
});

// ==================== RUTAS DE ESPECIALIDADES ====================

app.get('/api/especialidades', (req, res) => {
  try {
    const especialidades = db.getEspecialidades();
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


