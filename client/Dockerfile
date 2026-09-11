# ==============================================================================
# SPRINTLY FRONTEND DOCKERFILE (Production Multi-Stage Build)
# ==============================================================================
# Architecture:
#   Stage 1: 'builder' -> Uses Node.js & pnpm to compile React 19 + TypeScript +
#                         Tailwind CSS v4 + Vite into static HTML/CSS/JS bundles.
#   Stage 2: 'runner'  -> Ultra-lightweight Nginx Alpine web server (~25MB) that
#                         serves the static assets with gzip and SPA routing.
# ==============================================================================

# ------------------------------------------------------------------------------
# STAGE 1: Builder
# ------------------------------------------------------------------------------
FROM node:20-bookworm-slim AS builder

# Enable Corepack to provide the exact pnpm binary matching the project
RUN corepack enable && corepack prepare pnpm@10.34.5 --activate

# Set working directory inside container
WORKDIR /app

# Accept build-time arguments.
# In Vite SPAs, VITE_* variables are injected INTO the client-side JavaScript bundle
# during the 'vite build' command. They cannot be read dynamically from process.env at runtime.
ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=$VITE_API_URL

# STEP 1: Copy lockfile and package manifest first (Leveraging Docker Layer Caching)
COPY pnpm-lock.yaml package.json ./

# STEP 2: Install dependencies deterministically
RUN pnpm install --frozen-lockfile

# STEP 3: Copy source code and build configs
COPY index.html vite.config.ts tsconfig*.json components.json* ./
COPY src ./src

# STEP 4: Build the production bundle into /app/dist
RUN pnpm build


# ------------------------------------------------------------------------------
# STAGE 2: Production Web Server (Nginx)
# ------------------------------------------------------------------------------
# We switch to nginx:1.27-alpine for the runtime.
# Why Nginx Alpine?
# 1. Total image size is ~25MB (compared to ~1GB if we kept Node.js).
# 2. Incredible raw throughput for static asset delivery.
# 3. Native gzip/brotli compression and zero Node.js vulnerability surface.
FROM nginx:1.27-alpine AS runner

# Remove the default boilerplate Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy our tailored Nginx configuration (SPA routing fallback, gzip, caching, security headers)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from the builder stage into Nginx's document root
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port 80
EXPOSE 80

# Container Healthcheck probe: ping our /healthz endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:80/healthz || exit 1

# Launch Nginx in the foreground ('daemon off;' prevents the container from immediately exiting)
CMD ["nginx", "-g", "daemon off;"]
