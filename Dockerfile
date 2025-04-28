# Usa una imagen base ligera con Node
FROM node:22.14-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia el resto del código
COPY . .

# Compila el código
RUN npm run build

# Genera el cliente de Prisma
RUN npx prisma generate

# Expone el puerto NestJS
EXPOSE 3000

# Usa "migrate deploy" si estás en producción
# Usa "db push" si solo necesitas sincronizar sin migraciones
# Usa "migrate dev" solo en desarrollo (¡no ideal aquí!)
# Seed podría ir aquí si estás seguro que la DB ya existe
CMD npx prisma migrate deploy && npm run seed && npm run start:prod