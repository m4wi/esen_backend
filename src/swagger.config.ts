import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('ESEN Backend API')
  .setDescription(`
    # ESEN Backend API Documentation
    
    Esta API proporciona endpoints para la gestión del sistema de ESEN.
    
    ## Autenticación
    
    La API utiliza autenticación basada en cookies JWT. Al hacer login o registro, 
    se establece una cookie llamada \`auth_cookie\` que debe ser incluida en 
    las siguientes peticiones.
    
    ## Endpoints Principales
    
    - **Auth**: Endpoints de autenticación (login, registro)
    - **Users**: Gestión de usuarios
    - **Files**: Gestión de archivos y Google Drive
    
    ## Códigos de Respuesta
    
    - \`200\`: Operación exitosa
    - \`400\`: Datos de entrada inválidos
    - \`401\`: No autorizado
    - \`404\`: Recurso no encontrado
    - \`409\`: Conflicto (ej: usuario ya existe)
    - \`500\`: Error interno del servidor
  `)
  .setVersion('1.0')
  .addTag('auth', 'Endpoints de autenticación y autorización')
  .addTag('users', 'Gestión de usuarios del sistema')
  .addTag('files', 'Gestión de archivos y Google Drive')
  .addCookieAuth('auth_cookie', {
    type: 'apiKey',
    in: 'cookie',
    name: 'auth_cookie',
    description: 'Cookie de autenticación JWT'
  })
  .addServer('http://localhost:3000', 'Servidor de desarrollo')
  .addServer('https://esen-backend.fly.dev', 'Servidor de producción')
  .build(); 