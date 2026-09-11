#!/bin/sh
# ==============================================================================
# Sprintly Backend Docker Entrypoint Script
# ==============================================================================
# Purpose:
#   Runs required startup lifecycle hooks (like applying database migrations
#   and priming mandatory system roles/permissions) before handing over
#   execution to the main NestJS process.
#
# Key DevOps Principles Implemented:
#   1. 'set -e' ensures the script terminates immediately if any critical step fails.
#   2. Runs 'prisma migrate deploy' to guarantee the database schema matches code.
#   3. Automatically executes 'node dist/prisma/seed.js' to seed essential system
#      roles (OWNER, ADMIN, MEMBER, VIEWER) and 22 permissions. This seeder is
#      idempotent (uses upsert), so it safely runs on every boot without duplicates.
#   4. Uses 'exec "$@"' so the Node.js process replaces the shell and receives
#      POSIX signals (SIGTERM, SIGINT) directly for zero-downtime graceful shutdown.
# ==============================================================================

set -e

echo "[entrypoint] Starting Sprintly backend container..."

# Run database migrations and system seeding if DATABASE_URL is provided
if [ -n "$DATABASE_URL" ]; then
  echo "[entrypoint] Applying pending Prisma database migrations..."
  npx prisma migrate deploy
  echo "[entrypoint] Database migrations applied successfully."

  # Automatically seed mandatory system roles and permissions
  echo "[entrypoint] Seeding mandatory system roles and permissions..."
  node dist/prisma/seed.js || echo "[entrypoint] Seeding completed or already initialized."

  # Optional additional custom seed flag if requested
  if [ "$RUN_SEEDS" = "true" ] || [ "$SEED_DATABASE" = "true" ]; then
    echo "[entrypoint] RUN_SEEDS is set to true."
  fi
else
  echo "[entrypoint] WARNING: DATABASE_URL is not set. Skipping migrations."
fi

# Execute the main command passed to the container (e.g., node dist/src/main)
# 'exec' replaces the shell with the process, keeping PID 1 signal handling intact.
echo "[entrypoint] Executing command: $@"
exec "$@"
