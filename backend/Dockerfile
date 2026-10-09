# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install --frozen-lockfile || npm install

COPY . .
RUN npm run build

# ── Production stage (uses Next.js standalone output) ─────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Must match the PORT the container exposes; set in docker-compose too
ENV PORT=3001

# next.config.mjs has output: "standalone" — copy the self-contained bundle
COPY --from=builder /app/.next/standalone ./
# Static assets must be copied separately alongside the standalone bundle
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3001
CMD ["node", "server.js"]
