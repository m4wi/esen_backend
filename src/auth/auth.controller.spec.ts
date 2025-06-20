import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    signIn: jest.fn(),
    signUp: jest.fn(),
  };

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    const loginUserDto: LoginUserDto = {
      credencial: 'test@esen.edu.sv',
      contrasenia: 'Password123',
    };

    const mockUser = {
      usuario_id: '123',
      nombre: 'Juan',
      apellido: 'Pérez',
      correo: 'test@esen.edu.sv',
      rol: 'ESTUDIANTE',
      tipo_usuario: 'ACTIVO',
    };

    const mockToken = 'jwt-token';

    it('should successfully authenticate user and set cookie', async () => {
      // Arrange
      authService.signIn.mockResolvedValue({
        usuario: mockUser,
        token: mockToken,
      });

      // Act
      const result = await controller.signIn(loginUserDto, mockResponse);

      // Assert
      expect(authService.signIn).toHaveBeenCalledWith(
        loginUserDto.credencial,
        loginUserDto.contrasenia
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith('auth_cookie', mockToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 3600000,
      });
      expect(result).toEqual(mockUser);
    });

    it('should handle authentication failure', async () => {
      // Arrange
      authService.signIn.mockRejectedValue(new Error('Invalid credentials'));

      // Act & Assert
      await expect(controller.signIn(loginUserDto, mockResponse)).rejects.toThrow('Invalid credentials');
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });
  });

  describe('signUp', () => {
    const registerUserDto: RegisterUserDto = {
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

    it('should successfully register user and set cookie', async () => {
      // Arrange
      authService.signUp.mockResolvedValue({
        newuser: mockNewUser,
        token: mockToken,
      });

      // Act
      const result = await controller.signUp(registerUserDto, mockResponse);

      // Assert
      expect(authService.signUp).toHaveBeenCalledWith(registerUserDto);
      expect(mockResponse.cookie).toHaveBeenCalledWith('auth_cookie', mockToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 3600000,
      });
      expect(result).toEqual(mockNewUser);
    });

    it('should handle registration failure', async () => {
      // Arrange
      authService.signUp.mockRejectedValue(new Error('User already exists'));

      // Act & Assert
      await expect(controller.signUp(registerUserDto, mockResponse)).rejects.toThrow('User already exists');
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });

    it('should register user without optional fields', async () => {
      // Arrange
      const userWithoutOptionals = {
        ...registerUserDto,
        codigo_usuario: undefined as any,
        drive_folder: undefined as any,
      };

      authService.signUp.mockResolvedValue({
        newuser: mockNewUser,
        token: mockToken,
      });

      // Act
      const result = await controller.signUp(userWithoutOptionals, mockResponse);

      // Assert
      expect(authService.signUp).toHaveBeenCalledWith(userWithoutOptionals);
      expect(result).toEqual(mockNewUser);
    });
  });
}); 