import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {

  private readonly logger = new Logger(DatabaseService.name);
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
    
    try {
      this.client = await this.pool.connect();
      this.logger.log('Conectado a PostgreSQL');
    } catch (error) {
      this.logger.error('Error al conectar a PostgreSQL', error.stack);
      throw error;
    }
    
  }

  async onModuleDestroy() {
    try {
      if (this.client) this.client.release();

      if (this.pool) await this.pool.end();

      this.logger.log('Desconectado de PostgreSQL');
    } catch (error) {
      this.logger.error('Error al cerrar la conexión con PostgreSQL', error.stack);
    }
  }

  // Método de ejemplo para hacer consultas
  async query(text: string, params?: any[]) {
    try {
      const result = await this.pool.query(text, params);
      this.logger.debug(`Query ejecutada: ${text}`);
      return result;
    } catch (error) {
      this.logger.error(`Error en query: ${text}`, error.stack);
      throw error;
    }
  }

  async withTransaction(callback: (client: PoolClient) => Promise<void>) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await callback(client);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

