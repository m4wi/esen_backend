import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import { DatabaseService } from './database.service';

// Mock pg
jest.mock('pg', () => ({
  Pool: jest.fn(),
}));

describe('DatabaseService', () => {
  let service: DatabaseService;
  let mockPool: jest.Mocked<Pool>;
  let mockClient: jest.Mocked<PoolClient>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock Pool
    mockPool = {
      connect: jest.fn(),
      query: jest.fn(),
      end: jest.fn(),
    } as any;

    // Mock PoolClient
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    } as any;

    // Mock Logger
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    } as any;

    // Mock Pool constructor
    (Pool as jest.Mock).mockImplementation(() => mockPool);

    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseService],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
    
    // Mock the logger
    jest.spyOn(service['logger'], 'log').mockImplementation(mockLogger.log);
    jest.spyOn(service['logger'], 'error').mockImplementation(mockLogger.error);
    jest.spyOn(service['logger'], 'debug').mockImplementation(mockLogger.debug);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('onModuleInit', () => {
    it('should initialize pool and connect successfully', async () => {
      // Arrange
      mockPool.connect.mockResolvedValue(mockClient);
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

      // Act
      await service.onModuleInit();

      // Assert
      expect(Pool).toHaveBeenCalledWith({
        connectionString: 'postgresql://test:test@localhost:5432/test',
        ssl: {
          rejectUnauthorized: false,
        },
      });
      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith('Conectado a PostgreSQL');
    });

    it('should handle connection error', async () => {
      // Arrange
      const connectionError = new Error('Connection failed');
      mockPool.connect.mockRejectedValue(connectionError);
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

      // Act & Assert
      await expect(service.onModuleInit()).rejects.toThrow('Connection failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error al conectar a PostgreSQL',
        connectionError.stack
      );
    });

    it('should use default SSL configuration', async () => {
      // Arrange
      mockPool.connect.mockResolvedValue(mockClient);
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

      // Act
      await service.onModuleInit();

      // Assert
      expect(Pool).toHaveBeenCalledWith({
        connectionString: 'postgresql://test:test@localhost:5432/test',
        ssl: {
          rejectUnauthorized: false,
        },
      });
    });
  });

  describe('onModuleDestroy', () => {
    beforeEach(async () => {
      // Initialize the service first
      mockPool.connect.mockResolvedValue(mockClient);
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      await service.onModuleInit();
    });

    it('should close client and pool successfully', async () => {
      // Act
      await service.onModuleDestroy();

      // Assert
      expect(mockClient.release).toHaveBeenCalled();
      expect(mockPool.end).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith('Desconectado de PostgreSQL');
    });

    it('should handle errors during cleanup gracefully', async () => {
      // Arrange
      const cleanupError = new Error('Cleanup failed');
      mockClient.release.mockImplementation(() => {
        throw cleanupError;
      });

      // Act
      await service.onModuleDestroy();

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error al cerrar la conexión con PostgreSQL',
        cleanupError.stack
      );
    });

    it('should handle missing client gracefully', async () => {
      // Arrange
      service['client'] = null;

      // Act
      await service.onModuleDestroy();

      // Assert
      expect(mockPool.end).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith('Desconectado de PostgreSQL');
    });

    it('should handle missing pool gracefully', async () => {
      // Arrange
      service['pool'] = null;

      // Act
      await service.onModuleDestroy();

      // Assert
      expect(mockClient.release).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith('Desconectado de PostgreSQL');
    });
  });

  describe('query', () => {
    const mockQueryResult = {
      rows: [{ id: 1, name: 'test' }],
      rowCount: 1,
    };

    beforeEach(async () => {
      // Initialize the service
      mockPool.connect.mockResolvedValue(mockClient);
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      await service.onModuleInit();
    });

    it('should execute query successfully', async () => {
      // Arrange
      const queryText = 'SELECT * FROM users WHERE id = $1';
      const params = [1];
      mockPool.query.mockResolvedValue(mockQueryResult);

      // Act
      const result = await service.query(queryText, params);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(queryText, params);
      expect(mockLogger.debug).toHaveBeenCalledWith(`Query ejecutada: ${queryText}`);
      expect(result).toEqual(mockQueryResult);
    });

    it('should execute query without parameters', async () => {
      // Arrange
      const queryText = 'SELECT * FROM users';
      mockPool.query.mockResolvedValue(mockQueryResult);

      // Act
      const result = await service.query(queryText);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(queryText, undefined);
      expect(result).toEqual(mockQueryResult);
    });

    it('should handle query errors', async () => {
      // Arrange
      const queryText = 'SELECT * FROM nonexistent_table';
      const queryError = new Error('Table does not exist');
      mockPool.query.mockRejectedValue(queryError);

      // Act & Assert
      await expect(service.query(queryText)).rejects.toThrow('Table does not exist');
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Error en query: ${queryText}`,
        queryError.stack
      );
    });

    it('should handle SQL injection attempts', async () => {
      // Arrange
      const maliciousQuery = "SELECT * FROM users WHERE name = 'admin'; DROP TABLE users; --'";
      mockPool.query.mockResolvedValue(mockQueryResult);

      // Act
      const result = await service.query(maliciousQuery);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(maliciousQuery, undefined);
      // The service should pass the query as-is to the pool
      // Parameterized queries should be used to prevent SQL injection
    });
  });

  describe('withTransaction', () => {
    beforeEach(async () => {
      // Initialize the service
      mockPool.connect.mockResolvedValue(mockClient);
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      await service.onModuleInit();
    });

    it('should execute transaction successfully', async () => {
      // Arrange
      const callback = jest.fn().mockResolvedValue(undefined);
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({}) // COMMIT
        .mockResolvedValueOnce({}); // Any other queries

      // Act
      await service.withTransaction(callback);

      // Assert
      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(callback).toHaveBeenCalledWith(mockClient);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      // Arrange
      const callbackError = new Error('Transaction failed');
      const callback = jest.fn().mockRejectedValue(callbackError);
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({}); // ROLLBACK

      // Act & Assert
      await expect(service.withTransaction(callback)).rejects.toThrow('Transaction failed');
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.query).not.toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should release client even if callback throws error', async () => {
      // Arrange
      const callback = jest.fn().mockRejectedValue(new Error('Callback error'));
      mockClient.query.mockResolvedValue({}); // BEGIN

      // Act & Assert
      await expect(service.withTransaction(callback)).rejects.toThrow('Callback error');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should handle client connection errors', async () => {
      // Arrange
      const connectionError = new Error('Connection failed');
      mockPool.connect.mockRejectedValue(connectionError);
      const callback = jest.fn();

      // Act & Assert
      await expect(service.withTransaction(callback)).rejects.toThrow('Connection failed');
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('connection management', () => {
    it('should handle multiple query calls', async () => {
      // Arrange
      mockPool.connect.mockResolvedValue(mockClient);
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      await service.onModuleInit();

      const query1 = 'SELECT * FROM users';
      const query2 = 'SELECT * FROM posts';
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rows: [{ id: 2 }] });

      // Act
      const result1 = await service.query(query1);
      const result2 = await service.query(query2);

      // Assert
      expect(mockPool.query).toHaveBeenCalledTimes(2);
      expect(result1).toEqual({ rows: [{ id: 1 }] });
      expect(result2).toEqual({ rows: [{ id: 2 }] });
    });

    it('should maintain connection state', async () => {
      // Arrange
      mockPool.connect.mockResolvedValue(mockClient);
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

      // Act
      await service.onModuleInit();

      // Assert
      expect(service['client']).toBe(mockClient);
      expect(service['pool']).toBe(mockPool);
    });
  });
});
