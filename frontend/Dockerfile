# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm install --frozen-lockfile || npm install

# NEXT_PUBLIC_* vars are baked into the bundle at build time.
# Pass your server's public URL at build time, e.g.:
#   docker compose build --build-arg NEXT_PUBLIC_API_URL=http://<vm-ip>/backend/api
# Defaults to a relative path that works through nginx for browser-side calls.
ARG NEXT_PUBLIC_API_URL=/backend/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY . .
RUN npm run build

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy only what next start needs at runtime
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]