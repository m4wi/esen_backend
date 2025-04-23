# Usa una imagen base de Node.js
FROM node:22.14-alpine

# Crea y configura el directorio de trabajo
WORKDIR /app

# Copia los archivos de package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el código de tu aplicación
COPY . .

# Compila el código de TypeScript
RUN npm run build

# Expone el puerto que va a utilizar NestJS
EXPOSE 3000

# Comando para ejecutar tu app en producción
CMD ["npm", "run", "start:prod"]
