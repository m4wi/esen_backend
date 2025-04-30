# Usa una imagen base ligera con Node
FROM node:22.14-alpine AS builder

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
RUN npm run build


# --- Etapa de producción final ---
FROM node:22.14-alpine

WORKDIR /app

# Copia solo lo necesario del build anterior
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/generate ./generate
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# Expone el puerto NestJS
EXPOSE 3000

# Usa "migrate deploy" si estás en producción
# Usa "db push" si solo necesitas sincronizar sin migraciones
# Usa "migrate dev" solo en desarrollo (¡no ideal aquí!)
# Seed podría ir aquí si estás seguro que la DB ya existe
CMD npx prisma migrate deploy && node dist/main.js