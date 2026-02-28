# Stage 1: Build
FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx nx build frontend && npx nx build backend

# Stage 2: Runtime
FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    dumb-init python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY --from=builder /app/dist/apps/backend/package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY --from=builder /app/dist/apps/backend/ ./
COPY --from=builder /app/dist/apps/frontend/ ./client/

RUN mkdir -p data && chown -R node:node /app

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); })"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "main.js"]
