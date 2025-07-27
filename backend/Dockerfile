# Backend Dockerfile
FROM node:18-alpine AS backend-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS backend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS backend-runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 backend

COPY --from=backend-builder --chown=backend:nodejs /app/dist ./dist
COPY --from=backend-deps --chown=backend:nodejs /app/node_modules ./node_modules
COPY --chown=backend:nodejs package*.json ./

USER backend
EXPOSE 8000
ENV PORT 8000

CMD ["node", "dist/index.js"]
