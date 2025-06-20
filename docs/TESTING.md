# Guía de Testing - ESEN Backend

## Descripción

Este proyecto incluye una suite completa de tests para los módulos de autenticación y base de datos, incluyendo tests unitarios, de integración y end-to-end (e2e).

## Estructura de Tests

```
src/
├── auth/
│   ├── auth.service.spec.ts      # Tests unitarios del servicio
│   └── auth.controller.spec.ts   # Tests unitarios del controlador
├── database/
│   ├── database.service.spec.ts  # Tests unitarios del servicio de BD
│   └── database.module.spec.ts   # Tests unitarios del módulo de BD
test/
├── auth.e2e-spec.ts              # Tests de integración (e2e) auth
├── database.e2e-spec.ts          # Tests de integración (e2e) database
└── jest-e2e.json                 # Configuración de Jest para e2e
src/
└── test-setup.ts                 # Configuración global para tests
```

## Comandos de Testing

### Tests Unitarios
```bash
# Ejecutar todos los tests unitarios
npm test

# Ejecutar tests del módulo auth
npm run test:auth

# Ejecutar tests del módulo auth en modo watch
npm run test:auth:watch

# Ejecutar tests del módulo database
npm run test:database

# Ejecutar tests del módulo database en modo watch
npm run test:database:watch

# Ejecutar tests con cobertura
npm run test:cov
```

### Tests de Integración (E2E)
```bash
# Ejecutar todos los tests e2e
npm run test:e2e

# Ejecutar tests e2e del módulo auth
npm run test:auth:e2e

# Ejecutar tests e2e del módulo database
npm run test:database:e2e
```

### Tests de Debug
```bash
# Ejecutar tests en modo debug
npm run test:debug
```

## Tipos de Tests

### 1. Tests Unitarios (`*.spec.ts`)

#### AuthService Tests
- **signIn**: Prueba la autenticación de usuarios
  - Autenticación exitosa con email
  - Autenticación exitosa con código de usuario
  - Manejo de credenciales inválidas
  - Manejo de contraseñas incorrectas
  - Manejo de errores de base de datos

- **signUp**: Prueba el registro de usuarios
  - Registro exitoso de nuevo usuario
  - Manejo de usuarios duplicados
  - Manejo de errores de base de datos
  - Registro sin campos opcionales

#### AuthController Tests
- **signIn**: Prueba el endpoint de login
  - Autenticación exitosa y configuración de cookies
  - Manejo de fallos de autenticación

- **signUp**: Prueba el endpoint de registro
  - Registro exitoso y configuración de cookies
  - Manejo de fallos de registro
  - Registro sin campos opcionales

#### DatabaseService Tests
- **onModuleInit**: Prueba la inicialización del módulo
  - Conexión exitosa a PostgreSQL
  - Manejo de errores de conexión
  - Configuración SSL correcta

- **onModuleDestroy**: Prueba la limpieza del módulo
  - Cierre exitoso de conexiones
  - Manejo de errores durante la limpieza
  - Manejo de conexiones faltantes

- **query**: Prueba las consultas a la base de datos
  - Ejecución exitosa de consultas
  - Consultas con parámetros
  - Manejo de errores de consulta
  - Prevención de SQL injection

- **withTransaction**: Prueba las transacciones
  - Ejecución exitosa de transacciones
  - Rollback automático en errores
  - Liberación de recursos
  - Manejo de errores de conexión

#### DatabaseModule Tests
- **Configuración del módulo**: Prueba la configuración correcta
- **Proveedores**: Verifica que los servicios estén disponibles
- **Ciclo de vida**: Prueba los métodos de inicialización y destrucción

### 2. Tests de Integración (E2E)

#### Endpoint `/auth/login`
- Validación de credenciales inválidas
- Validación de campos requeridos faltantes
- Validación de credenciales vacías
- Configuración de cookies de autenticación

#### Endpoint `/auth/register`
- Validación de campos requeridos faltantes
- Validación de formato de email
- Validación de contraseñas débiles
- Validación de contraseñas con espacios
- Validación de contraseñas sin caracteres requeridos
- Validación de roles inválidos
- Validación de tipos de usuario inválidos
- Registro exitoso con datos válidos
- Registro sin campos opcionales

#### Database Integration
- Ejecución de consultas simples
- Consultas con parámetros
- Manejo de consultas inválidas
- Ejecución de transacciones
- Rollback de transacciones
- Consultas concurrentes
- Manejo de timeouts
- Tests de rendimiento

#### Manejo de Cookies
- Configuración de cookies seguras (HttpOnly, Secure, SameSite)

## Configuración de Tests

### Jest Configuration
Los tests unitarios usan la configuración de Jest en `package.json`:
```json
{
  "jest": {
    "moduleNameMapper": {
      "^src/(.*)$": "<rootDir>/src/$1"
    },
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    }
  }
}
```

### E2E Configuration
Los tests e2e usan `test/jest-e2e.json`:
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

### Validación Global
Los tests e2e incluyen validación global usando `ValidationPipe`:
```typescript
// src/test-setup.ts
export const testAppConfig = {
  globalPipes: [
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  ],
};
```

## Mocks y Stubs

### DatabaseService Mock
```typescript
const mockDatabaseService = {
  query: jest.fn(),
  withTransaction: jest.fn(),
};
```

### JwtService Mock
```typescript
const mockJwtService = {
  sign: jest.fn(),
};
```

### bcrypt Mock
```typescript
jest.mock('bcryptjs');
(bcrypt.compare as jest.Mock).mockResolvedValue(true);
(bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
```

### PostgreSQL Pool Mock
```typescript
jest.mock('pg', () => ({
  Pool: jest.fn(),
}));

const mockPool = {
  connect: jest.fn(),
  query: jest.fn(),
  end: jest.fn(),
};
```

## Cobertura de Tests

### Casos Cubiertos

#### Autenticación (signIn)
- ✅ Autenticación exitosa con email
- ✅ Autenticación exitosa con código de usuario
- ✅ Usuario no encontrado
- ✅ Contraseña incorrecta
- ✅ Error de base de datos

#### Registro (signUp)
- ✅ Registro exitoso
- ✅ Usuario ya existe
- ✅ Error de base de datos
- ✅ Registro sin campos opcionales

#### Base de Datos (DatabaseService)
- ✅ Inicialización del módulo
- ✅ Conexión a PostgreSQL
- ✅ Manejo de errores de conexión
- ✅ Ejecución de consultas
- ✅ Consultas con parámetros
- ✅ Manejo de errores de consulta
- ✅ Transacciones exitosas
- ✅ Rollback de transacciones
- ✅ Liberación de recursos
- ✅ Limpieza del módulo

#### Validación de DTOs
- ✅ Campos requeridos
- ✅ Formato de email
- ✅ Validación de contraseña
- ✅ Roles y tipos de usuario válidos

#### Manejo de Cookies
- ✅ Configuración de cookies seguras
- ✅ Limpieza de cookies en logout

## Mejores Prácticas

### 1. Estructura de Tests
- Usar el patrón AAA (Arrange, Act, Assert)
- Agrupar tests relacionados en `describe` blocks
- Usar nombres descriptivos para los tests

### 2. Mocks
- Mockear dependencias externas (base de datos, servicios)
- Resetear mocks antes de cada test
- Verificar que los mocks fueron llamados correctamente

### 3. Validación
- Probar casos de éxito y casos de error
- Validar respuestas HTTP correctas
- Verificar el contenido de las respuestas

### 4. Base de Datos
- Los tests e2e pueden requerir una base de datos de prueba
- Considerar usar transacciones para rollback automático
- Limpiar datos de prueba después de cada test
- Usar consultas parametrizadas para prevenir SQL injection

### 5. Tests de Base de Datos
- Mockear la librería `pg` para tests unitarios
- Usar tests de integración para probar conexiones reales
- Manejar casos donde la base de datos no esté disponible
- Probar transacciones y rollbacks

## Troubleshooting

### Tests Failing
1. **Verificar dependencias**: `npm install`
2. **Limpiar cache**: `npm run test -- --clearCache`
3. **Verificar configuración**: Revisar `jest.config.js` y `tsconfig.json`

### Tests E2E Failing
1. **Verificar base de datos**: Asegurar que la base de datos esté disponible
2. **Verificar variables de entorno**: Configurar `.env.test` si es necesario
3. **Verificar puertos**: Asegurar que el puerto de prueba esté disponible

### Tests de Base de Datos Failing
1. **Verificar DATABASE_URL**: Configurar variable de entorno para tests
2. **Verificar conexión**: Asegurar que PostgreSQL esté ejecutándose
3. **Verificar permisos**: Asegurar permisos de lectura/escritura en la BD

### Cobertura Baja
1. **Agregar tests faltantes**: Identificar código no cubierto
2. **Refactorizar código**: Simplificar lógica compleja
3. **Usar herramientas**: Usar `npm run test:cov` para análisis detallado

## Próximos Pasos

1. **Agregar tests para otros módulos** (users, files)
2. **Implementar tests de performance**
3. **Agregar tests de seguridad**
4. **Configurar CI/CD con tests automáticos**
5. **Implementar tests de carga**
6. **Agregar tests de migración de base de datos**
7. **Implementar tests de backup y recuperación** 