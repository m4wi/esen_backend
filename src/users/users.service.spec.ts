import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseService } from '../database/database.service';
import { CreateUserObservationDto } from './dto/create-user-observation.dto';
import { CreatePreguntaDto } from './dto/create-pregunta.dto';

describe('UsersService', () => {
  let service: UsersService;
  let databaseService: jest.Mocked<DatabaseService>;

  const mockDatabaseService = {
    withTransaction: jest.fn(),
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    databaseService = module.get(DatabaseService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveObservacion', () => {
    const mockCreateUserObservationDto: CreateUserObservationDto = {
      fk_usuario_emisor: 1,
      fk_usuario_receptor: 2,
      documentos_observacion: [
        {
          id_documento: 1,
          observacion: 'Este documento necesita correcciones',
          estado: 'observacion'
        }
      ]
    };

    it('should create user observation successfully', async () => {
      // Arrange
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [] })
      };
      
      databaseService.withTransaction.mockImplementation(async (callback) => {
        await callback(mockClient);
      });

      // Act
      await service.saveObservacion(mockCreateUserObservationDto);

      // Assert
      expect(databaseService.withTransaction).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledTimes(2); // Insert + Update
      
      // Verify insert query
      const insertCall = mockClient.query.mock.calls[0];
      expect(insertCall[0]).toContain('INSERT INTO "Observacion"');
      expect(insertCall[0]).toContain('fk_emisor');
      expect(insertCall[0]).toContain('fk_receptor');
      expect(insertCall[0]).toContain('contenido');
      expect(insertCall[0]).toContain('estado');
      expect(insertCall[0]).toContain('created_at');
      expect(insertCall[0]).toContain('updated_at');
      
      // Verify parameters
      const insertParams = insertCall[1];
      expect(insertParams[0]).toBe(mockCreateUserObservationDto.fk_usuario_emisor);
      expect(insertParams[1]).toBe(mockCreateUserObservationDto.fk_usuario_receptor);
      expect(insertParams[2]).toBe(1); // doc.id_documento
      expect(insertParams[3]).toBe('Este documento necesita correcciones');
      expect(insertParams[4]).toBe('ninguna');
      // Los timestamps ahora se generan con NOW() en PostgreSQL
      expect(insertParams.length).toBe(5); // Solo 5 parámetros, no 8
    });

    it('should throw error when emisor equals receptor', async () => {
      // Arrange
      const invalidDto = {
        ...mockCreateUserObservationDto,
        fk_usuario_emisor: 1,
        fk_usuario_receptor: 1
      };

      // Act & Assert
      await expect(service.saveObservacion(invalidDto))
        .rejects.toThrow(BadRequestException);
      await expect(service.saveObservacion(invalidDto))
        .rejects.toThrow('El emisor no puede ser el mismo que el receptor');
    });

    it('should throw error when observation content is empty', async () => {
      // Arrange
      const invalidDto = {
        ...mockCreateUserObservationDto,
        documentos_observacion: [
          {
            id_documento: 1,
            observacion: '', // Empty content
            estado: 'observacion'
          }
        ]
      };

      // Act & Assert
      await expect(service.saveObservacion(invalidDto))
        .rejects.toThrow(BadRequestException);
      await expect(service.saveObservacion(invalidDto))
        .rejects.toThrow('El contenido de la observación no puede estar vacío');
    });

    it('should throw error when observation content is only whitespace', async () => {
      // Arrange
      const invalidDto = {
        ...mockCreateUserObservationDto,
        documentos_observacion: [
          {
            id_documento: 1,
            observacion: '   ', // Only whitespace
            estado: 'observacion'
          }
        ]
      };

      // Act & Assert
      await expect(service.saveObservacion(invalidDto))
        .rejects.toThrow(BadRequestException);
      await expect(service.saveObservacion(invalidDto))
        .rejects.toThrow('El contenido de la observación no puede estar vacío');
    });

    it('should handle multiple documents correctly', async () => {
      // Arrange
      const multipleDocsDto = {
        ...mockCreateUserObservationDto,
        documentos_observacion: [
          {
            id_documento: 1,
            observacion: 'Primera observación',
            estado: 'observacion'
          },
          {
            id_documento: 2,
            observacion: 'Segunda observación',
            estado: 'rechazado'
          }
        ]
      };

      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [] })
      };
      
      databaseService.withTransaction.mockImplementation(async (callback) => {
        await callback(mockClient);
      });

      // Act
      await service.saveObservacion(multipleDocsDto);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(4); // 2 inserts + 2 updates
    });

    it('should handle empty documents array gracefully', async () => {
      // Arrange
      const emptyDocsDto = {
        ...mockCreateUserObservationDto,
        documentos_observacion: []
      };

      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [] })
      };
      
      databaseService.withTransaction.mockImplementation(async (callback) => {
        await callback(mockClient);
      });

      // Act
      await service.saveObservacion(emptyDocsDto);

      // Assert
      expect(mockClient.query).not.toHaveBeenCalled(); // No queries should be executed
    });
  });

  describe('savePregunta', () => {
    const mockCreatePreguntaDto: CreatePreguntaDto = {
      pregunta: '¿Cómo cambiar mi contraseña?',
      respuesta: 'Ve al menú de configuración',
      fk_usuario: 1
    };

    const mockPreguntaResponse = {
      id_pregunta: 1,
      pregunta: '¿Cómo cambiar mi contraseña?',
      respuesta: 'Ve al menú de configuración',
      fecha_creacion: new Date(),
      fecha_respuesta: null,
      fk_usuario: 1,
      nombre: 'Juan',
      apellido: 'Pérez',
      codigo_usuario: '2021001'
    };

    it('should save a pregunta successfully', async () => {
      const mockUserResult = { rows: [{ usuario_id: 1 }] };
      const mockInsertResult = { rows: [mockPreguntaResponse] };
      const mockUserInfoResult = { 
        rows: [{ nombre: 'Juan', apellido: 'Pérez', codigo_usuario: '2021001' }] 
      };

      jest.spyOn(databaseService, 'query')
        .mockResolvedValueOnce(mockUserResult) // Validar usuario
        .mockResolvedValueOnce(mockInsertResult) // Insertar pregunta
        .mockResolvedValueOnce(mockUserInfoResult); // Obtener info usuario

      const result = await service.savePregunta(mockCreatePreguntaDto);

      expect(databaseService.query).toHaveBeenCalledTimes(3);
      expect(result).toEqual(mockPreguntaResponse);
    });

    it('should throw BadRequestException when pregunta is empty', async () => {
      const emptyPreguntaDto = { ...mockCreatePreguntaDto, pregunta: '' };

      await expect(service.savePregunta(emptyPreguntaDto))
        .rejects
        .toThrow('El contenido de la pregunta no puede estar vacío');
    });

    it('should throw BadRequestException when user not found', async () => {
      const mockUserResult = { rows: [] };
      jest.spyOn(databaseService, 'query').mockResolvedValue(mockUserResult);

      await expect(service.savePregunta(mockCreatePreguntaDto))
        .rejects
        .toThrow('Usuario no encontrado');
    });

    it('should handle database errors', async () => {
      jest.spyOn(databaseService, 'query').mockRejectedValue(new Error('Database error'));

      await expect(service.savePregunta(mockCreatePreguntaDto))
        .rejects
        .toThrow('Error al guardar pregunta: Database error');
    });
  });
});
