import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DatabaseService } from '../database/database.service';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let databaseService: jest.Mocked<DatabaseService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockDatabaseService = {
    query: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    databaseService = module.get(DatabaseService);
    jwtService = module.get(JwtService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    const mockUser = {
      usuario_id: '123',
      rol: 'ESTUDIANTE',
      tipo_usuario: 'ACTIVO',
      contrasenia: 'hashedPassword',
      codigo_usuario: 'UNI-12345',
      drive_folder: 'folder123',
    };

    const mockToken = 'jwt-token';

    beforeEach(() => {
      jwtService.sign.mockReturnValue(mockToken);
    });

    it('should successfully authenticate user with email', async () => {
      // Arrange
      const email = 'test@esen.edu.sv';
      const password = 'Password123';
      
      databaseService.query.mockResolvedValue({
        rows: [mockUser],
      });
      
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.signIn(email, password);

      // Assert
      expect(databaseService.query).toHaveBeenCalledWith(
        expect.stringContaining(`WHERE u.correo = '${email}' OR u.codigo_usuario = '${email}'`)
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.contrasenia);
      expect(jwtService.sign).toHaveBeenCalledWith({
        id: mockUser.usuario_id,
        rol: mockUser.rol,
        tipo_usuario: mockUser.tipo_usuario,
      });
      expect(result.usuario).toEqual({
        usuario_id: mockUser.usuario_id,
        rol: mockUser.rol,
        tipo_usuario: mockUser.tipo_usuario,
        codigo_usuario: mockUser.codigo_usuario,
        drive_folder: mockUser.drive_folder,
      });
      expect(result.token).toBe(mockToken);
    });

    it('should successfully authenticate user with user code', async () => {
      // Arrange
      const userCode = 'UNI-12345';
      const password = 'Password123';
      
      databaseService.query.mockResolvedValue({
        rows: [mockUser],
      });
      
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.signIn(userCode, password);

      // Assert
      expect(databaseService.query).toHaveBeenCalledWith(
        expect.stringContaining(`WHERE u.correo = '${userCode}' OR u.codigo_usuario = '${userCode}'`)
      );
      expect(result.usuario).toBeDefined();
      expect(result.token).toBe(mockToken);
    });

    it('should throw BadRequestException when user not found', async () => {
      // Arrange
      const email = 'nonexistent@esen.edu.sv';
      const password = 'Password123';
      
      databaseService.query.mockResolvedValue({
        rows: [],
      });

      // Act & Assert
      await expect(service.signIn(email, password)).rejects.toThrow(BadRequestException);
      await expect(service.signIn(email, password)).rejects.toThrow('Wrong credentials');
    });

    it('should throw BadRequestException when password is incorrect', async () => {
      // Arrange
      const email = 'test@esen.edu.sv';
      const password = 'WrongPassword';
      
      databaseService.query.mockResolvedValue({
        rows: [mockUser],
      });
      
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.signIn(email, password)).rejects.toThrow(BadRequestException);
      await expect(service.signIn(email, password)).rejects.toThrow('Wrong credentials');
    });

    it('should throw BadRequestException when database query fails', async () => {
      // Arrange
      const email = 'test@esen.edu.sv';
      const password = 'Password123';
      
      databaseService.query.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.signIn(email, password)).rejects.toThrow(BadRequestException);
      await expect(service.signIn(email, password)).rejects.toThrow('Wrong credentials');
    });
  });

  describe('signUp', () => {
    const mockRegisterUserDto: RegisterUserDto = {
      nombre: 'Juan',
      apellido: 'Pérez',
      correo: 'juan.perez@esen.edu.sv',
      telefono: '+503 1234-5678',
      codigo_usuario: 'UNI-12345',
      contrasenia: 'Password123',
      rol: 'ESTUDIANTE' as any,
      tipo_usuario: 'ACTIVO' as any,
      drive_folder: 'folder123',
    };

    const mockNewUser = {
      usuario_id: '123',
      nombre: 'Juan',
      apellido: 'Pérez',
      correo: 'juan.perez@esen.edu.sv',
      telefono: '+503 1234-5678',
      rol: 'ESTUDIANTE',
      tipo_usuario: 'ACTIVO',
    };

    const mockToken = 'jwt-token';

    beforeEach(() => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      jwtService.sign.mockReturnValue(mockToken);
    });

    it('should successfully register a new user', async () => {
      // Arrange
      databaseService.query.mockResolvedValue({
        rows: [mockNewUser],
      });

      // Act
      const result = await service.signUp(mockRegisterUserDto);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(mockRegisterUserDto.contrasenia, 10);
      expect(databaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO "Usuario"')
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        id: mockNewUser.usuario_id,
        rol: mockNewUser.rol,
      });
      expect(result.newuser).toEqual(mockNewUser);
      expect(result.token).toBe(mockToken);
    });

    it('should handle user already exists error', async () => {
      // Arrange
      const error = new Error('User already exists');
      (error as any).code = 'P2002';
      
      databaseService.query.mockRejectedValue(error);

      // Act & Assert
      await expect(service.signUp(mockRegisterUserDto)).rejects.toThrow(BadRequestException);
      await expect(service.signUp(mockRegisterUserDto)).rejects.toThrow('User already exists');
    });

    it('should handle other database errors', async () => {
      // Arrange
      databaseService.query.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.signUp(mockRegisterUserDto)).rejects.toThrow(InternalServerErrorException);
      await expect(service.signUp(mockRegisterUserDto)).rejects.toThrow('Server error');
    });

    it('should register user without optional fields', async () => {
      // Arrange
      const userWithoutOptionals = {
        ...mockRegisterUserDto,
        codigo_usuario: undefined as any,
        drive_folder: undefined as any,
      };
      
      databaseService.query.mockResolvedValue({
        rows: [mockNewUser],
      });

      // Act
      const result = await service.signUp(userWithoutOptionals);

      // Assert
      expect(result.newuser).toBeDefined();
      expect(result.token).toBeDefined();
    });
  });
});
