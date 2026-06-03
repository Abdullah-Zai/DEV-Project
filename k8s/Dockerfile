# ── Stage 1: deps ──────────────────────────────────────────────────────────────
FROM node:18-alpine AS deps
WORKDIR /app
COPY app/package*.json ./
RUN npm install --omit=dev

# ── Stage 2: runtime ───────────────────────────────────────────────────────────
FROM node:18-alpine AS runner
WORKDIR /app

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules
COPY app/server.js .

USER appuser

EXPOSE 3000
ENV NODE_ENV=production PORT=3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
