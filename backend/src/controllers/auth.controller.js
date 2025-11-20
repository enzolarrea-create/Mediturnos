import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

/**
 * Registro de nuevo usuario
 */
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      email,
      password,
      nombre,
      apellido,
      dni,
      fechaNacimiento,
      telefono,
      direccion,
      rol,
      // Datos específicos por rol
      matricula,
      especialidadId,
      contactoEmergencia,
      telefonoEmergencia,
      obraSocial,
      numeroAfiliado
    } = req.body;

    // Verificar si el email o DNI ya existen
    const existingUser = await prisma.usuario.findFirst({
      where: {
        OR: [
          { email },
          { dni }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Usuario ya existe',
        message: existingUser.email === email 
          ? 'El email ya está registrado' 
          : 'El DNI ya está registrado'
      });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario y su rol específico en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear usuario base
      const usuario = await tx.usuario.create({
        data: {
          email,
          password: hashedPassword,
          nombre,
          apellido,
          dni,
          fechaNacimiento: new Date(fechaNacimiento),
          telefono,
          direccion
        }
      });

      // Crear rol específico
      switch (rol) {
        case 'PACIENTE':
          await tx.paciente.create({
            data: {
              usuarioId: usuario.id,
              contactoEmergencia,
              telefonoEmergencia,
              obraSocial,
              numeroAfiliado
            }
          });
          break;

        case 'MEDICO':
          if (!matricula || !especialidadId) {
            throw new Error('Matrícula y especialidad son requeridas para médicos');
          }
          await tx.medico.create({
            data: {
              usuarioId: usuario.id,
              matricula,
              especialidadId
            }
          });
          break;

        case 'SECRETARIO':
          await tx.secretario.create({
            data: {
              usuarioId: usuario.id
            }
          });
          break;

        case 'ADMINISTRADOR':
          await tx.administrador.create({
            data: {
              usuarioId: usuario.id
            }
          });
          break;

        default:
          throw new Error('Rol inválido');
      }

      return usuario;
    });

    // Generar token
    const token = generateToken(result.id);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: result.id,
        email: result.email,
        nombre: result.nombre,
        apellido: result.apellido,
        rol
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login de usuario
 */
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Buscar usuario con sus relaciones de rol
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        paciente: true,
        medico: {
          include: {
            especialidad: true
          }
        },
        secretario: true,
        administrador: true
      }
    });

    if (!usuario) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        error: 'Cuenta inactiva',
        message: 'Tu cuenta ha sido desactivada'
      });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, usuario.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Determinar rol
    let rol = 'SIN_ROL';
    if (usuario.administrador) rol = 'ADMINISTRADOR';
    else if (usuario.medico) rol = 'MEDICO';
    else if (usuario.secretario) rol = 'SECRETARIO';
    else if (usuario.paciente) rol = 'PACIENTE';

    // Generar token
    const token = generateToken(usuario.id);

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol,
        ...(usuario.medico && {
          medico: {
            matricula: usuario.medico.matricula,
            especialidad: usuario.medico.especialidad
          }
        })
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener usuario actual
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.userId },
      include: {
        paciente: true,
        medico: {
          include: {
            especialidad: true
          }
        },
        secretario: true,
        administrador: true
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        dni: true,
        fechaNacimiento: true,
        telefono: true,
        direccion: true,
        activo: true,
        createdAt: true,
        paciente: true,
        medico: {
          include: {
            especialidad: true
          }
        },
        secretario: true,
        administrador: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Determinar rol
    let rol = 'SIN_ROL';
    if (usuario.administrador) rol = 'ADMINISTRADOR';
    else if (usuario.medico) rol = 'MEDICO';
    else if (usuario.secretario) rol = 'SECRETARIO';
    else if (usuario.paciente) rol = 'PACIENTE';

    res.json({
      ...usuario,
      rol
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar perfil del usuario
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { nombre, apellido, telefono, direccion } = req.body;

    const usuario = await prisma.usuario.update({
      where: { id: req.userId },
      data: {
        ...(nombre && { nombre }),
        ...(apellido && { apellido }),
        ...(telefono !== undefined && { telefono }),
        ...(direccion !== undefined && { direccion })
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        direccion: true
      }
    });

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: usuario
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cambiar contraseña
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Contraseña actual y nueva contraseña son requeridas'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'La nueva contraseña debe tener al menos 8 caracteres'
      });
    }

    // Obtener usuario con contraseña
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.userId }
    });

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(currentPassword, usuario.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Contraseña actual incorrecta'
      });
    }

    // Hash de nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await prisma.usuario.update({
      where: { id: req.userId },
      data: { password: hashedPassword }
    });

    res.json({
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generar token JWT
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

