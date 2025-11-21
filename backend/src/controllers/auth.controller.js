import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js';
import { prisma } from '../server.js';

/**
 * Registro de nuevo paciente
 */
export const register = async (req, res, next) => {
  try {
    const { email, password, nombre, apellido, dni, fechaNacimiento, telefono, direccion } = req.body;

    // Validaciones básicas
    if (!email || !password || !nombre || !apellido || !dni || !fechaNacimiento) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        required: ['email', 'password', 'nombre', 'apellido', 'dni', 'fechaNacimiento']
      });
    }

    // Verificar si el email ya existe
    const emailExists = await prisma.usuario.findUnique({
      where: { email }
    });

    if (emailExists) {
      return res.status(409).json({
        error: 'El email ya está registrado'
      });
    }

    // Verificar si el DNI ya existe
    const dniExists = await prisma.paciente.findUnique({
      where: { dni }
    });

    if (dniExists) {
      return res.status(409).json({
        error: 'El DNI ya está registrado'
      });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario y paciente en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear usuario
      const usuario = await tx.usuario.create({
        data: {
          email,
          password: hashedPassword,
          rol: 'PACIENTE'
        }
      });

      // Crear paciente
      const paciente = await tx.paciente.create({
        data: {
          usuarioId: usuario.id,
          nombre,
          apellido,
          dni,
          fechaNacimiento: new Date(fechaNacimiento),
          telefono: telefono || null,
          direccion: direccion || null
        },
        include: {
          usuario: {
            select: {
              id: true,
              email: true,
              rol: true
            }
          }
        }
      });

      return { usuario, paciente };
    });

    // Generar token
    const token = generateToken({
      userId: result.usuario.id,
      email: result.usuario.email,
      rol: result.usuario.rol
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: result.usuario.id,
        email: result.usuario.email,
        rol: result.usuario.rol,
        paciente: {
          id: result.paciente.id,
          nombre: result.paciente.nombre,
          apellido: result.paciente.apellido,
          dni: result.paciente.dni
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Inicio de sesión
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        paciente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true
          }
        },
        medico: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            matricula: true
          }
        },
        secretario: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        }
      }
    });

    if (!usuario) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        error: 'Tu cuenta está desactivada'
      });
    }

    // Verificar contraseña
    const passwordValid = await bcrypt.compare(password, usuario.password);

    if (!passwordValid) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = generateToken({
      userId: usuario.id,
      email: usuario.email,
      rol: usuario.rol
    });

    // Preparar datos del usuario según su rol
    let userData = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol
    };

    if (usuario.paciente) {
      userData.paciente = usuario.paciente;
    }
    if (usuario.medico) {
      userData.medico = usuario.medico;
    }
    if (usuario.secretario) {
      userData.secretario = usuario.secretario;
    }

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: userData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener información del usuario actual
 */
export const getMe = async (req, res, next) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        rol: true,
        activo: true,
        createdAt: true
      },
      include: {
        paciente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            fechaNacimiento: true,
            telefono: true,
            direccion: true
          }
        },
        medico: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            matricula: true,
            telefono: true,
            especialidades: {
              include: {
                especialidad: {
                  select: {
                    id: true,
                    nombre: true
                  }
                }
              }
            }
          }
        },
        secretario: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    res.json({ user: usuario });
  } catch (error) {
    next(error);
  }
};

