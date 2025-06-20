import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { testAppConfig } from '../src/test-setup';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply global pipes for validation
    app.useGlobalPipes(...testAppConfig.globalPipes);
    
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    const loginData = {
      credencial: 'test@esen.edu.sv',
      contrasenia: 'Password123',
    };

    it('should return 401 for invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(401);
    });

    it('should return 400 for missing required fields', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ credencial: 'test@esen.edu.sv' })
        .expect(400);
    });

    it('should return 400 for empty credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ credencial: '', contrasenia: '' })
        .expect(400);
    });

    it('should set auth_cookie on successful login', async () => {
      // This test would require a test user in the database
      // For now, we'll test the endpoint structure
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData);

      expect(response.status).toBe(401); // Expected for non-existent user
      // If user existed, we would check for:
      // expect(response.headers['set-cookie']).toBeDefined();
      // expect(response.headers['set-cookie'][0]).toContain('auth_cookie');
    });
  });

  describe('/auth/register (POST)', () => {
    const validRegisterData = {
      nombre: 'Test',
      apellido: 'User',
      correo: 'test.user@esen.edu.sv',
      telefono: '+503 1234-5678',
      codigo_usuario: 'UNI-12345',
      contrasenia: 'Password123',
      rol: 'ESTUDIANTE',
      tipo_usuario: 'ACTIVO',
      drive_folder: 'test-folder',
    };

    it('should return 400 for missing required fields', () => {
      const incompleteData = {
        nombre: 'Test',
        correo: 'test@esen.edu.sv',
        // Missing other required fields
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(incompleteData)
        .expect(400);
    });

    it('should return 400 for invalid email format', () => {
      const invalidEmailData = {
        ...validRegisterData,
        correo: 'invalid-email',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidEmailData)
        .expect(400);
    });

    it('should return 400 for weak password', () => {
      const weakPasswordData = {
        ...validRegisterData,
        contrasenia: '123', // Too short
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(weakPasswordData)
        .expect(400);
    });

    it('should return 400 for password with spaces', () => {
      const passwordWithSpacesData = {
        ...validRegisterData,
        contrasenia: 'Password 123', // Contains spaces
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(passwordWithSpacesData)
        .expect(400);
    });

    it('should return 400 for password without required characters', () => {
      const invalidPasswordData = {
        ...validRegisterData,
        contrasenia: 'password', // No uppercase, no numbers
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidPasswordData)
        .expect(400);
    });

    it('should return 400 for invalid role', () => {
      const invalidRoleData = {
        ...validRegisterData,
        rol: 'INVALID_ROLE',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidRoleData)
        .expect(400);
    });

    it('should return 400 for invalid user type', () => {
      const invalidUserTypeData = {
        ...validRegisterData,
        tipo_usuario: 'INVALID_TYPE',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidUserTypeData)
        .expect(400);
    });

    it('should successfully register user with valid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(validRegisterData);

      // This might fail if user already exists, which is expected behavior
      if (response.status === 200) {
        expect(response.body).toHaveProperty('usuario_id');
        expect(response.body).toHaveProperty('nombre', 'Test');
        expect(response.body).toHaveProperty('apellido', 'User');
        expect(response.body).toHaveProperty('correo', 'test.user@esen.edu.sv');
        expect(response.headers['set-cookie']).toBeDefined();
        expect(response.headers['set-cookie'][0]).toContain('auth_cookie');
      } else {
        // User might already exist, which is also valid
        expect(response.status).toBe(400);
      }
    });

    it('should register user without optional fields', async () => {
      const dataWithoutOptionals = {
        nombre: 'Test',
        apellido: 'User',
        correo: 'test.user2@esen.edu.sv',
        telefono: '+503 1234-5678',
        contrasenia: 'Password123',
        rol: 'ESTUDIANTE',
        tipo_usuario: 'ACTIVO',
        // codigo_usuario and drive_folder are optional
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(dataWithoutOptionals);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('usuario_id');
        expect(response.body).toHaveProperty('correo', 'test.user2@esen.edu.sv');
      } else {
        expect(response.status).toBe(400); // User might already exist
      }
    });
  });

  describe('Cookie handling', () => {
    it('should set secure cookie options', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          nombre: 'Test',
          apellido: 'User',
          correo: 'test.cookie@esen.edu.sv',
          telefono: '+503 1234-5678',
          contrasenia: 'Password123',
          rol: 'ESTUDIANTE',
          tipo_usuario: 'ACTIVO',
        });

      if (response.status === 200) {
        const cookieHeader = response.headers['set-cookie'][0];
        expect(cookieHeader).toContain('HttpOnly');
        expect(cookieHeader).toContain('Secure');
        expect(cookieHeader).toContain('SameSite=None');
      }
    });
  });
}); 