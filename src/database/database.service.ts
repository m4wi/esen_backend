import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {

  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool;

  async onModuleInit() {

    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      idleTimeoutMillis: 0, // no cerrar conexiones inactivas
      connectionTimeoutMillis: 10000, // evita timeouts por sleep
    });

    try {
      await this.pool.query('SELECT 1'); 
      this.logger.log('Conectado a PostgreSQL');
    } catch (error) {
      this.logger.error('Error al conectar a PostgreSQL', error.stack);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      if (this.pool) await this.pool.end();
      this.logger.log('Desconectado de PostgreSQL');
    } catch (error) {
      this.logger.error('Error al cerrar la conexión', error.stack);
    }
  }

  // método de consulta seguro
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

  // transacciones seguras
  async withTransaction(callback: Function) {
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
