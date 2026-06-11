# ────────────────────────────────────────────
# Stage 1 — deps: install all node_modules
# ────────────────────────────────────────────
FROM oven/bun:1.1-alpine AS deps

WORKDIR /app

# Copy manifests only (better layer caching)
# bun.lockb is optional — generated on first run if absent
COPY package.json bun.lockb* ./

RUN bun install

# ────────────────────────────────────────────
# Stage 2 — builder: compile SvelteKit
# ────────────────────────────────────────────
FROM oven/bun:1.1-alpine AS builder

WORKDIR /app

# Bring in installed deps from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Build the SvelteKit app (adapter-node output → ./build)
RUN bun run build

# ────────────────────────────────────────────
# Stage 3 — runner: minimal production image
# ────────────────────────────────────────────
FROM oven/bun:1.1-alpine AS runner

WORKDIR /app

# Reuse node_modules from deps stage — no re-install needed
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

# Copy built artefacts from builder
COPY --from=builder /app/build ./build

# Create the data directory for SQLite
RUN mkdir -p /app/data && chown -R bun:bun /app/data

# Run as non-root bun user
USER bun

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV DATABASE_URL=/app/data/burnout.db

CMD ["bun", "run", "build/index.js"]
