import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {


  private pool: Pool;
  private client: PoolClient;

  async onModuleInit() {
    // Configura tu conexión usando variables de entorno o directamente aquí
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL, // o configura host, user, password, db, port
      ssl: {
        rejectUnauthorized: false, // Si usas SSL y necesitas esto (Neon, Heroku, etc)
      },
    });

    // Conéctate a la base de datos
    this.client = await this.pool.connect();
    console.log('Postgres conectado!');
  }

  async onModuleDestroy() {
    // Liberar el cliente y cerrar el pool cuando se destruya el módulo
    if (this.client) {
      this.client.release();
    }
    if (this.pool) {
      await this.pool.end();
      console.log('Postgres desconectado');
    }
  }

  // Método de ejemplo para hacer consultas
  async query(text: string, params?: any[]) {
    return this.pool.query(text, params);
  }
}

