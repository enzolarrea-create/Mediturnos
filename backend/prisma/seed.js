import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear especialidades
  const especialidades = await Promise.all([
    prisma.especialidad.upsert({
      where: { nombre: 'Cardiología' },
      update: {},
      create: {
        nombre: 'Cardiología',
        descripcion: 'Especialidad médica que se encarga del corazón y el sistema circulatorio'
      }
    }),
    prisma.especialidad.upsert({
      where: { nombre: 'Dermatología' },
      update: {},
      create: {
        nombre: 'Dermatología',
        descripcion: 'Especialidad médica que se encarga de la piel, el cabello y las uñas'
      }
    }),
    prisma.especialidad.upsert({
      where: { nombre: 'Pediatría' },
      update: {},
      create: {
        nombre: 'Pediatría',
        descripcion: 'Especialidad médica que se encarga de la salud de los niños'
      }
    }),
    prisma.especialidad.upsert({
      where: { nombre: 'Clínica Médica' },
      update: {},
      create: {
        nombre: 'Clínica Médica',
        descripcion: 'Medicina general para adultos'
      }
    })
  ]);

  console.log('✅ Especialidades creadas');

  // Hash de contraseña por defecto
  const hashedPassword = await bcrypt.hash('Password123', 10);

  // Crear administrador
  const adminUsuario = await prisma.usuario.upsert({
    where: { email: 'admin@mediturnos.com' },
    update: {},
    create: {
      email: 'admin@mediturnos.com',
      password: hashedPassword,
      nombre: 'Admin',
      apellido: 'Sistema',
      dni: '00.000.000',
      fechaNacimiento: new Date('1990-01-01'),
      telefono: '1234567890',
      administrador: {
        create: {
          nivelAcceso: 'completo'
        }
      }
    },
    include: {
      administrador: true
    }
  });

  console.log('✅ Administrador creado:', adminUsuario.email);

  // Crear médicos
  const medicos = await Promise.all([
    prisma.usuario.create({
      data: {
        email: 'medico1@mediturnos.com',
        password: hashedPassword,
        nombre: 'Juan',
        apellido: 'López',
        dni: '12.345.678',
        fechaNacimiento: new Date('1980-05-15'),
        telefono: '1234567891',
        medico: {
          create: {
            matricula: '12345',
            especialidadId: especialidades[0].id // Cardiología
          }
        }
      }
    }),
    prisma.usuario.create({
      data: {
        email: 'medico2@mediturnos.com',
        password: hashedPassword,
        nombre: 'María',
        apellido: 'Martínez',
        dni: '23.456.789',
        fechaNacimiento: new Date('1985-08-20'),
        telefono: '1234567892',
        medico: {
          create: {
            matricula: '23456',
            especialidadId: especialidades[1].id // Dermatología
          }
        }
      }
    }),
    prisma.usuario.create({
      data: {
        email: 'medico3@mediturnos.com',
        password: hashedPassword,
        nombre: 'Carlos',
        apellido: 'García',
        dni: '34.567.890',
        fechaNacimiento: new Date('1975-03-10'),
        telefono: '1234567893',
        medico: {
          create: {
            matricula: '34567',
            especialidadId: especialidades[2].id // Pediatría
          }
        }
      }
    })
  ]);

  console.log('✅ Médicos creados');

  // Crear disponibilidades para los médicos
  for (const medico of medicos) {
    const medicoData = await prisma.medico.findUnique({
      where: { usuarioId: medico.id }
    });

    // Lunes a Viernes, 8:00 a 17:00
    for (let dia = 1; dia <= 5; dia++) {
      await prisma.disponibilidad.create({
        data: {
          medicoId: medicoData.id,
          diaSemana: dia,
          horaInicio: '08:00',
          horaFin: '17:00',
          duracionTurno: 30
        }
      });
    }
  }

  console.log('✅ Disponibilidades creadas');

  // Crear secretario
  const secretario = await prisma.usuario.create({
    data: {
      email: 'secretario@mediturnos.com',
      password: hashedPassword,
      nombre: 'Ana',
      apellido: 'Secretaria',
      dni: '45.678.901',
      fechaNacimiento: new Date('1990-06-15'),
      telefono: '1234567894',
      secretario: {
        create: {}
      }
    }
  });

  console.log('✅ Secretario creado');

  // Crear pacientes
  const pacientes = await Promise.all([
    prisma.usuario.create({
      data: {
        email: 'paciente1@mediturnos.com',
        password: hashedPassword,
        nombre: 'Pedro',
        apellido: 'González',
        dni: '56.789.012',
        fechaNacimiento: new Date('1995-07-20'),
        telefono: '1234567895',
        paciente: {
          create: {
            contactoEmergencia: 'María González',
            telefonoEmergencia: '1234567896',
            obraSocial: 'OSDE',
            numeroAfiliado: '12345678'
          }
        }
      }
    }),
    prisma.usuario.create({
      data: {
        email: 'paciente2@mediturnos.com',
        password: hashedPassword,
        nombre: 'Laura',
        apellido: 'Ruiz',
        dni: '67.890.123',
        fechaNacimiento: new Date('1988-11-05'),
        telefono: '1234567897',
        paciente: {
          create: {
            contactoEmergencia: 'Juan Ruiz',
            telefonoEmergencia: '1234567898'
          }
        }
      }
    })
  ]);

  console.log('✅ Pacientes creados');

  console.log('🎉 Seed completado exitosamente!');
  console.log('\n📋 Credenciales de acceso:');
  console.log('Admin: admin@mediturnos.com / Password123');
  console.log('Médico 1: medico1@mediturnos.com / Password123');
  console.log('Secretario: secretario@mediturnos.com / Password123');
  console.log('Paciente 1: paciente1@mediturnos.com / Password123');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

