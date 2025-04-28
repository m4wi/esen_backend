import { PrismaClient } from '../../generated/prisma';
import * as bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const bcpass = bcryptjs.hashSync('123456', 10);
  
  // Elimina todos los usuarios existentes
  await prisma.usuario.deleteMany();

  // Inserta nuevos usuarios
  const newUsers = await prisma.usuario.createMany({
    data: [
      {
        nombre: 'root',
        apellido: 'root',
        correo: 'p1@correo.com',
        telefono: '999999999',
        contrasenia: bcpass,
        rol: 'admin',
      },
      {
        nombre: 'Carlos',
        apellido: 'Pérez',
        correo: 'p2@correo.com',
        telefono: '987654321',
        contrasenia: bcpass,
        rol: 'usuario',
      },
      {
        nombre: 'Lucía',
        apellido: 'Gómez',
        correo: 'p3@correo.com',
        telefono: '912345678',
        contrasenia: bcpass,
        rol: 'usuario',
      },
      {
        nombre: 'Andrés',
        apellido: 'Torres',
        correo: 'p4@correo.com',
        telefono: '911222333',
        contrasenia: bcpass,
        rol: 'usuario',
      },
      {
        nombre: 'María',
        apellido: 'Lozano',
        correo: 'p5@correo.com',
        telefono: '933444555',
        contrasenia: bcpass,
        rol: 'usuario',
      },
    ],
  });

  console.log(`${newUsers.count} usuarios creados ✅`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });