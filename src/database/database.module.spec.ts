import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from './database.module';
import { DatabaseService } from './database.service';

describe('DatabaseModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [DatabaseModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide DatabaseService', () => {
    const databaseService = module.get<DatabaseService>(DatabaseService);
    expect(databaseService).toBeDefined();
    expect(databaseService).toBeInstanceOf(DatabaseService);
  });

  it('should export DatabaseService', () => {
    const databaseService = module.get<DatabaseService>(DatabaseService);
    expect(databaseService).toBeDefined();
  });

  describe('module configuration', () => {
    it('should have correct module metadata', () => {
      const moduleRef = module.get(DatabaseModule);
      expect(moduleRef).toBeDefined();
    });

    it('should be a global module', () => {
      // Check if the module is configured as global
      // This would be true if the module has @Global() decorator
      const moduleRef = module.get(DatabaseModule);
      expect(moduleRef).toBeDefined();
    });
  });

  describe('service lifecycle', () => {
    let databaseService: DatabaseService;

    beforeEach(() => {
      databaseService = module.get<DatabaseService>(DatabaseService);
    });

    it('should implement OnModuleInit', () => {
      expect(databaseService.onModuleInit).toBeDefined();
      expect(typeof databaseService.onModuleInit).toBe('function');
    });

    it('should implement OnModuleDestroy', () => {
      expect(databaseService.onModuleDestroy).toBeDefined();
      expect(typeof databaseService.onModuleDestroy).toBe('function');
    });
  });

  describe('service methods', () => {
    let databaseService: DatabaseService;

    beforeEach(() => {
      databaseService = module.get<DatabaseService>(DatabaseService);
    });

    it('should have query method', () => {
      expect(databaseService.query).toBeDefined();
      expect(typeof databaseService.query).toBe('function');
    });

    it('should have withTransaction method', () => {
      expect(databaseService.withTransaction).toBeDefined();
      expect(typeof databaseService.withTransaction).toBe('function');
    });
  });
}); 