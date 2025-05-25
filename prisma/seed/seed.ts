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
        nombre: 'admin',
        apellido: 'admin',
        correo: 'admin',
        telefono: '999999999',
        contrasenia: bcryptjs.hashSync('admin', 10),
        rol: 'admin',
      },
      {
        nombre: 'egresado',
        apellido: 'egresado',
        correo: 'egresado',
        telefono: '987654321',
        contrasenia: bcryptjs.hashSync('egresado', 10),
        rol: 'usuario',
        tipo_usuario: 'egresado',
      },
      {
        nombre: 'titulado',
        apellido: 'titulado',
        correo: 'titulado',
        telefono: '912345678',
        contrasenia: bcryptjs.hashSync('titulado', 10),
        rol: 'usuario',
        tipo_usuario: 'titulado',
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