# ==============================================================================
# SPRINTLY BACKEND DOCKERFILE (Production Multi-Stage Build)
# ==============================================================================
# Architecture:
#   Stage 1: 'builder' -> Compiles TypeScript to JavaScript, generates Prisma client,
#                         and prepares production dependencies.
#   Stage 2: 'runner'  -> Minimal, hardened production runtime containing only compiled
#                         code and production dependencies, executed by a non-root user.
# ==============================================================================

# ------------------------------------------------------------------------------
# STAGE 1: Builder
# ------------------------------------------------------------------------------
# We use node:20-bookworm-slim (Debian) rather than Alpine because:
# 1. Prisma Query Engine and native C++ modules (bcrypt) rely on standard glibc.
# 2. Avoids musl-libc edge cases, memory allocator differences, and compilation failures.
# 3. Keeps build times predictable and fast.
FROM node:20-bookworm-slim AS builder

# Install OpenSSL, CA certificates, and build tools for native addons (bcrypt)
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl ca-certificates python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

# Enable Corepack to activate the exact version of pnpm matching the repository
RUN corepack enable && corepack prepare pnpm@10.34.5 --activate

# Set working directory inside the builder container
WORKDIR /app

# STEP 1: Copy package definitions and lockfiles FIRST (Docker Layer Caching).
# Docker caches layers from top to bottom. If package.json/pnpm-lock.yaml haven't changed,
# Docker will reuse the cached node_modules layer instead of reinstalling on every build!
COPY pnpm-lock.yaml pnpm-workspace.yaml* package.json ./

# STEP 2: Copy Prisma schema before installing dependencies.
# This ensures that postinstall scripts and prisma generate have access to schema.prisma.
COPY prisma ./prisma/

# STEP 3: Install all dependencies (including devDependencies required for building).
# --frozen-lockfile ensures deterministic builds by failing if pnpm-lock.yaml is out of sync.
RUN pnpm install --frozen-lockfile

# STEP 4: Generate typed Prisma Client JavaScript/TypeScript bindings
RUN pnpm prisma:generate

# STEP 5: Copy application source code and configuration files.
# Notice this happens AFTER pnpm install, so editing source code won't trigger re-installation!
COPY tsconfig*.json nest-cli.json ./
COPY src ./src

# STEP 6: Compile NestJS TypeScript application into optimized JavaScript in /app/dist
RUN pnpm build

# STEP 7: Prune development dependencies so only production modules remain for the final image.
# This cuts image size down significantly by removing TypeScript, linters, and compilers.
RUN pnpm prune --prod


# ------------------------------------------------------------------------------
# STAGE 2: Production Runner
# ------------------------------------------------------------------------------
# A fresh, clean Debian slim image containing zero build tools or compiler bloat.
FROM node:20-bookworm-slim AS runner

# Install runtime prerequisites:
# - dumb-init: Container init system. Solves the PID 1 problem (reaps zombie processes and
#   forwards POSIX signals like SIGTERM cleanly so containers stop gracefully).
# - openssl: Required by the Prisma query engine binary at runtime.
# - wget: Used by the Docker HEALTHCHECK directive to ping the /api/health endpoint.
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends dumb-init openssl wget && \
    rm -rf /var/lib/apt/lists/*

# Set working directory for the application
WORKDIR /app

# Set default production environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Ensure the non-root 'node' user owns the /app directory.
# The 'node' user is a built-in unprivileged user provided by official Node.js Docker images.
RUN chown -R node:node /app

# STEP 8: Copy only production artifacts from the builder stage.
# --chown=node:node ensures files are owned by the unprivileged user, not root.
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=builder /app/prisma ./prisma

# STEP 9: Copy startup entrypoint script (handles migrations) and make it executable
COPY --chown=node:node docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# STEP 10: Drop privileges to non-root user (Principle of Least Privilege).
# If the application is ever compromised, the attacker has no root access to the host.
USER node

# STEP 11: Document the port the container listens on (NestJS default: 3000)
EXPOSE 3000

# STEP 12: Container Healthcheck probe.
# Docker daemon pings this endpoint periodically. If the server hangs or crashes,
# Docker / Kubernetes / Compose marks the container as 'unhealthy' and restarts it.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

# STEP 13: Define entrypoint and default command.
# dumb-init runs as PID 1, forwards signals to docker-entrypoint.sh,
# which runs migrations and then executes 'node dist/src/main'.
ENTRYPOINT ["/usr/bin/dumb-init", "--", "./docker-entrypoint.sh"]
CMD ["node", "dist/src/main"]
