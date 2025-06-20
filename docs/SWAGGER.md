# Documentación de Swagger en ESEN Backend

## Descripción

Este proyecto utiliza Swagger/OpenAPI para documentar automáticamente la API REST. La documentación se genera automáticamente a partir de los decoradores de NestJS y Swagger.

## Acceso a la Documentación

Una vez que el servidor esté ejecutándose, puedes acceder a la documentación de Swagger en:

- **Desarrollo**: http://localhost:3000/api
- **Producción**: https://esen-backend.fly.dev/api

## Configuración

### Archivos de Configuración

1. **`src/main.ts`**: Configuración principal de Swagger
2. **`src/swagger.config.ts`**: Configuración detallada de la documentación
3. **DTOs**: Decoradores `@ApiProperty` para documentar los modelos de datos
4. **Controladores**: Decoradores `@ApiOperation`, `@ApiResponse`, etc.

### Decoradores Principales

#### En Controladores
- `@ApiTags('auth')`: Agrupa endpoints por categoría
- `@ApiOperation()`: Describe la operación del endpoint
- `@ApiResponse()`: Documenta las respuestas posibles
- `@ApiBody()`: Documenta el cuerpo de la petición

#### En DTOs
- `@ApiProperty()`: Documenta cada propiedad del DTO
- `example`: Proporciona ejemplos de uso
- `description`: Describe el propósito del campo
- `enum`: Lista valores permitidos para campos enumerados

## Ejemplo de Uso

### Endpoint de Login

```typescript
@ApiOperation({ 
  summary: 'Iniciar sesión',
  description: 'Autentica al usuario y devuelve un token JWT en una cookie'
})
@ApiBody({ type: LoginUserDto })
@ApiResponse({ 
  status: 200, 
  description: 'Usuario autenticado exitosamente',
  type: UserResponseDto
})
@Post('login')
async signIn(@Body() loginUserDto: LoginUserDto) {
  // Implementación
}
```

### DTO con Documentación

```typescript
export class LoginUserDto {
  @ApiProperty({
    description: 'Credencial del usuario (email o código de usuario)',
    example: 'usuario@esen.edu.sv',
    minLength: 3
  })
  @IsString()
  credencial: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'Password123',
    minLength: 6,
    maxLength: 60
  })
  @IsString()
  contrasenia: string;
}
```

## Autenticación

La API utiliza autenticación basada en cookies JWT. En Swagger:

1. Haz login usando el endpoint `/auth/login`
2. La cookie `auth_cookie` se establecerá automáticamente
3. Los endpoints protegidos usarán esta cookie para autenticación

## Características de la Documentación

- **Interfaz personalizada**: Diseño adaptado al branding de ESEN
- **Ejemplos interactivos**: Puedes probar los endpoints directamente desde Swagger
- **Validación automática**: Los esquemas de validación se generan automáticamente
- **Códigos de respuesta**: Documentación completa de todos los códigos HTTP
- **Modelos de datos**: Esquemas detallados de entrada y salida

## Agregando Nuevos Endpoints

Para documentar un nuevo endpoint:

1. Agrega `@ApiTags()` al controlador
2. Usa `@ApiOperation()` para describir la operación
3. Usa `@ApiResponse()` para documentar las respuestas
4. Crea DTOs con `@ApiProperty()` para los modelos de datos
5. Usa `@ApiBody()` si el endpoint recibe datos en el cuerpo

## Mejores Prácticas

1. **Descripciones claras**: Usa descripciones que expliquen el propósito del endpoint
2. **Ejemplos útiles**: Proporciona ejemplos realistas de los datos
3. **Códigos de respuesta**: Documenta todos los códigos HTTP posibles
4. **Validaciones**: Incluye información sobre validaciones (minLength, maxLength, etc.)
5. **Enums**: Usa `enum` para campos con valores predefinidos

## Troubleshooting

### La documentación no se actualiza
- Reinicia el servidor de desarrollo
- Verifica que los decoradores estén correctamente importados

### Errores de compilación
- Asegúrate de que `@nestjs/swagger` esté instalado
- Verifica que los tipos de TypeScript sean correctos

### Endpoints no aparecen
- Verifica que el controlador esté importado en el módulo correspondiente
- Asegúrate de que el controlador tenga el decorador `@Controller()` 