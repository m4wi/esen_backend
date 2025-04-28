import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';


/* Types */

type MockPrismaService = {
  usuario: {
    findUniqueOrThrow: jest.Mock;
    create: jest.Mock;
  };
}

type MockJwtService = {
  sign: jest.Mock;
}



/* Mocks */
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));


const mockPrismaService: MockPrismaService = {
  usuario: {
    findUniqueOrThrow: jest.fn(),
    create: jest.fn(),
  }
};


const mockJwtService: MockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
};




describe('AuthService', () => {

  let authService: AuthService;
  let prisma: MockPrismaService;
  let jwtService: MockJwtService;
  let bcrypt: any;

  beforeEach(async () => {
    jest.clearAllMocks();
  
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prisma = module.get<MockPrismaService>(PrismaService);
    jwtService = module.get<MockJwtService>(JwtService);
    bcrypt = require('bcryptjs');
  });

  describe('signIn',() => {

    const loginUserDto: LoginUserDto = {
      correo: 'test@test.com',
      contrasenia: 'testpassword'
    }

    const mockUser: any = {
      usuario_id: "1",
      correo: "test@test.com",
      contrasenia: "testpassword",
    }

    it('should return a token and user data on successful sign-in', async () => {
      prisma.usuario.findUniqueOrThrow.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const result = await authService.signIn(loginUserDto.correo, loginUserDto.contrasenia);

      expect(result.usuario).toEqual({
        usuario_id: mockUser.usuario_id,
        correo: mockUser.correo,
        contrasenia: mockUser.contrasenia,
      });
      expect(result.token).toEqual('mock-token');
    });

    it('should throw BadRequestException if credentials are invalid', async () => {
      prisma.usuario.findUniqueOrThrow.mockRejectedValue(new Error());

      await expect(authService.signIn(loginUserDto.correo, loginUserDto.contrasenia))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password is incorrect', async () => {
      prisma.usuario.findUniqueOrThrow.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(authService.signIn(loginUserDto.correo, loginUserDto.contrasenia))
        .rejects
        .toThrow(BadRequestException);
    });
  });
});
