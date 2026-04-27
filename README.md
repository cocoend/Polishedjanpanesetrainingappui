# Polished Japanese Training App UI

Japanese explanation training app monorepo.

## Workspace Layout

- `apps/web`: existing Vite + React frontend
- `apps/api`: NestJS backend
- `packages/shared`: shared DTOs, schemas, and constants
- `prisma`: Prisma schema and seed data

## Scripts

- `pnpm dev:web`
- `pnpm dev:api`
- `pnpm dev`
- `pnpm build:web`
- `pnpm build:api`
- `pnpm db:generate`
- `pnpm db:migrate`
- `pnpm db:seed`
- `pnpm docker:up`

## Postgres Quick Start

If you are new to Postgres, use Docker first instead of installing Postgres directly on your machine.

1. Install and open Docker Desktop.
2. Create a local env file:
   - `cp .env.example .env`
3. Start Postgres:
   - `docker compose up -d`
4. Confirm the database container is running:
   - `docker ps`
   - You should see `polished-japanese-training-postgres`
5. Run Prisma commands after the container is up:
   - `pnpm db:generate`
   - `pnpm db:migrate`
   - `pnpm db:seed`
6. Start the API:
   - `pnpm dev:api`
7. Check health:
   - `http://localhost:3001/api/health`

Expected database config in `.env`:

```env
DATABASE_URL="postgresql://polished:polished@localhost:5432/polished_japanese_training?schema=public"
```

If `GET /api/health` returns `"database": { "configured": true, ... }`, the API can see your database configuration.

Notes:

- This repo already includes the Postgres container setup in [docker-compose.yml](/Users/xinxie/XIE/GitHub/Polishedjanpanesetrainingappui/docker-compose.yml).
- On a machine with internet access, `pnpm db:generate` will let Prisma download its engines automatically the first time.
- If port `5432` is already taken by another database on your computer, stop that service first or change the port mapping in [docker-compose.yml](/Users/xinxie/XIE/GitHub/Polishedjanpanesetrainingappui/docker-compose.yml).

## Status

This repository is being migrated from a UI-only prototype into a monorepo with a real backend. The current focus is Phase 0 / Phase 1 scaffolding: repository layout, shared contracts, and frozen v1 schema.
