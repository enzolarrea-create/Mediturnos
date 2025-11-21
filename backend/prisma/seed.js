/**
 * Script para poblar la base de datos con datos de ejemplo
 * Ejecutar con: npm run prisma:seed
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes (opcional - comentar si quieres mantener datos)
  // await prisma.notaMedica.deleteMany();
  // await prisma.turno.deleteMany();
  // await prisma.disponibilidad.deleteMany();
  // await prisma.medicoEspecialidad.deleteMany();
  // await prisma.especialidad.deleteMany();
  // await prisma.paciente.deleteMany();
  // await prisma.medico.deleteMany();
  // await prisma.secretario.deleteMany();
  // await prisma.usuario.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Crear especialidades
  console.log('📋 Creando especialidades...');
  const cardiologia = await prisma.especialidad.create({
    data: {
      nombre: 'Cardiología',
      descripcion: 'Especialidad médica que se encarga del corazón y sistema circulatorio',
    },
  });

  const dermatologia = await prisma.especialidad.create({
    data: {
      nombre: 'Dermatología',
      descripcion: 'Especialidad médica que se encarga de la piel',
    },
  });

  const pediatria = await prisma.especialidad.create({
    data: {
      nombre: 'Pediatría',
      descripcion: 'Especialidad médica que se encarga de la salud de niños y adolescentes',
    },
  });

  // Crear administrador
  console.log('👤 Creando administrador...');
  const adminUsuario = await prisma.usuario.create({
    data: {
      email: 'admin@mediturnos.com',
      password: hashedPassword,
      rol: 'ADMINISTRADOR',
    },
  });

  // Crear médicos
  console.log('👨‍⚕️ Creando médicos...');
  const medico1Usuario = await prisma.usuario.create({
    data: {
      email: 'dr.lopez@mediturnos.com',
      password: hashedPassword,
      rol: 'MEDICO',
    },
  });

  const medico1 = await prisma.medico.create({
    data: {
      usuarioId: medico1Usuario.id,
      nombre: 'Juan',
      apellido: 'López',
      matricula: '12345',
      telefono: '011-1234-5678',
    },
  });

  await prisma.medicoEspecialidad.create({
    data: {
      medicoId: medico1.id,
      especialidadId: cardiologia.id,
    },
  });

  const medico2Usuario = await prisma.usuario.create({
    data: {
      email: 'dr.martinez@mediturnos.com',
      password: hashedPassword,
      rol: 'MEDICO',
    },
  });

  const medico2 = await prisma.medico.create({
    data: {
      usuarioId: medico2Usuario.id,
      nombre: 'Carlos',
      apellido: 'Martínez',
      matricula: '23456',
      telefono: '011-2345-6789',
    },
  });

  await prisma.medicoEspecialidad.create({
    data: {
      medicoId: medico2.id,
      especialidadId: dermatologia.id,
    },
  });

  const medico3Usuario = await prisma.usuario.create({
    data: {
      email: 'dr.garcia@mediturnos.com',
      password: hashedPassword,
      rol: 'MEDICO',
    },
  });

  const medico3 = await prisma.medico.create({
    data: {
      usuarioId: medico3Usuario.id,
      nombre: 'Ana',
      apellido: 'García',
      matricula: '34567',
      telefono: '011-3456-7890',
    },
  });

  await prisma.medicoEspecialidad.create({
    data: {
      medicoId: medico3.id,
      especialidadId: pediatria.id,
    },
  });

  // Crear disponibilidades
  console.log('📅 Creando disponibilidades...');
  const diasSemana = [1, 2, 3, 4, 5]; // Lunes a Viernes

  for (const dia of diasSemana) {
    await prisma.disponibilidad.create({
      data: {
        medicoId: medico1.id,
        diaSemana: dia,
        horaInicio: '08:00',
        horaFin: '17:00',
        activo: true,
      },
    });

    await prisma.disponibilidad.create({
      data: {
        medicoId: medico2.id,
        diaSemana: dia,
        horaInicio: '09:00',
        horaFin: '18:00',
        activo: true,
      },
    });

    await prisma.disponibilidad.create({
      data: {
        medicoId: medico3.id,
        diaSemana: dia,
        horaInicio: '08:30',
        horaFin: '16:30',
        activo: true,
      },
    });
  }

  // Crear secretario
  console.log('📋 Creando secretario...');
  const secretarioUsuario = await prisma.usuario.create({
    data: {
      email: 'secretario@mediturnos.com',
      password: hashedPassword,
      rol: 'SECRETARIO',
    },
  });

  await prisma.secretario.create({
    data: {
      usuarioId: secretarioUsuario.id,
      nombre: 'María',
      apellido: 'Secretaria',
    },
  });

  // Crear pacientes de ejemplo
  console.log('👥 Creando pacientes...');
  const paciente1Usuario = await prisma.usuario.create({
    data: {
      email: 'maria.gonzalez@example.com',
      password: hashedPassword,
      rol: 'PACIENTE',
    },
  });

  const paciente1 = await prisma.paciente.create({
    data: {
      usuarioId: paciente1Usuario.id,
      nombre: 'María',
      apellido: 'González',
      dni: '12345678',
      fechaNacimiento: new Date('1990-05-15'),
      telefono: '011-1111-2222',
      direccion: 'Av. Corrientes 1234',
    },
  });

  const paciente2Usuario = await prisma.usuario.create({
    data: {
      email: 'carlos.ruiz@example.com',
      password: hashedPassword,
      rol: 'PACIENTE',
    },
  });

  const paciente2 = await prisma.paciente.create({
    data: {
      usuarioId: paciente2Usuario.id,
      nombre: 'Carlos',
      apellido: 'Ruiz',
      dni: '23456789',
      fechaNacimiento: new Date('1985-08-20'),
      telefono: '011-2222-3333',
    },
  });

  // Crear algunos turnos de ejemplo
  console.log('📝 Creando turnos de ejemplo...');
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  await prisma.turno.create({
    data: {
      pacienteId: paciente1.id,
      medicoId: medico1.id,
      fecha: new Date(hoy.getTime() + 1 * 24 * 60 * 60 * 1000), // Mañana
      hora: '09:00',
      estado: 'CONFIRMADO',
      motivoConsulta: 'Control de rutina',
    },
  });

  await prisma.turno.create({
    data: {
      pacienteId: paciente2.id,
      medicoId: medico2.id,
      fecha: new Date(hoy.getTime() + 2 * 24 * 60 * 60 * 1000), // Pasado mañana
      hora: '10:30',
      estado: 'PENDIENTE',
      motivoConsulta: 'Consulta dermatológica',
    },
  });

  console.log('✅ Seed completado exitosamente!');
  console.log('\n📧 Credenciales de prueba:');
  console.log('Admin: admin@mediturnos.com / password123');
  console.log('Médico 1: dr.lopez@mediturnos.com / password123');
  console.log('Médico 2: dr.martinez@mediturnos.com / password123');
  console.log('Médico 3: dr.garcia@mediturnos.com / password123');
  console.log('Secretario: secretario@mediturnos.com / password123');
  console.log('Paciente 1: maria.gonzalez@example.com / password123');
  console.log('Paciente 2: carlos.ruiz@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

