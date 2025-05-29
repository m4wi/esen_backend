import { Client } from 'pg';
import * as bcryptjs from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Necesario para Neon
  },
});

async function main() {
  await client.connect();

  const bcpass = bcryptjs.hashSync('123456', 10);

  // Eliminar todos los usuarios
  await client.query('DELETE FROM "Usuario"');

  // Datos de usuarios a insertar
  const users = [
    {
      nombre: 'admin',
      apellido: 'admin',
      correo: 'admin',
      telefono: '999999999',
      contrasenia: bcryptjs.hashSync('admin', 10),
      rol: 'admin',
      tipo_usuario: "desconocido",
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
      tipo_usuario: "desconocido",
    },
    {
      nombre: 'María',
      apellido: 'Lozano',
      correo: 'p5@correo.com',
      telefono: '933444555',
      contrasenia: bcpass,
      rol: 'usuario',
      tipo_usuario: "desconocido",
    },
  ];

  for (const user of users) {
    await client.query(
      `INSERT INTO "Usuario" (nombre, apellido, correo, telefono, contrasenia, rol, tipo_usuario, updated_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(),NOW())`,
      [
        user.nombre,
        user.apellido,
        user.correo,
        user.telefono,
        user.contrasenia,
        user.rol,
        user.tipo_usuario,
      ]
    );
  }

  console.log(`${users.length} usuarios creados ✅`);

  await client.end();
}

main().catch((err) => {
  console.error('Error en el seed:', err);
  client.end();
  process.exit(1);
});
