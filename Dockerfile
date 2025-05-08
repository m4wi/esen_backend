# Base Stage
FROM node:23-alpine3.20 AS base

WORKDIR /usr/src/app

# Development Stage
FROM base AS development

COPY --chown=node:node package*.json ./
RUN npm install

COPY --chown=node:node . .

USER node

# Build Stage
FROM base AS build

COPY --from=development /usr/src/app /usr/src/app

RUN npm run build && npx prisma generate

# Production Stage
FROM base AS production

ENV NODE_ENV=production

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/generated ./generated
COPY --from=build /usr/src/app/prisma ./prisma

CMD ["node", "dist/main.js"]
