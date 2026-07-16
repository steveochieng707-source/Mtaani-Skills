# Mtaani Skills

A Kenyan marketplace connecting customers with verified TVET student "Fundis" (skilled tradespeople). Book trusted plumbers, electricians, carpenters, and more — with escrow payment protection and TVET certificate verification.

## Run & Operate

- `pnpm --filter @workspace/mtaani-skills run dev` — run the frontend (port assigned by workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui, wouter routing
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle table definitions (users, fundis, jobs, payments, reviews)
- `artifacts/api-server/src/routes/` — Express route handlers (users, fundis, jobs, payments, reviews, dashboard)
- `artifacts/mtaani-skills/src/` — React frontend (pages, components, hooks)
- `lib/api-client-react/src/generated/` — generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — generated Zod schemas for server validation (do not edit)

## Architecture decisions

- OpenAPI-first: all API contracts defined in `lib/api-spec/openapi.yaml` before any code is written
- Escrow model: 10% platform commission auto-calculated on job creation; payments sit in `escrow` status until explicitly released
- Auth simulation: role-based demo auth stored in localStorage (`mtaani_user` key) — no real auth server in MVP
- Fundi enrichment: fundi list/detail endpoints join users, reviews, and jobs tables server-side to return `averageRating`, `totalReviews`, `completedJobs`, `userName`
- Verification: admin sets `verified=true` via PATCH `/fundis/:id/verify`; unverified fundis still appear in search but without the green TVET badge

## Product

- **Customers**: Search fundis by skill + location, view TVET-verified profiles with ratings, book a job, pay via escrow, release payment when done, leave a review
- **Fundis**: Register with TVET certificate and ID, set skills/price/availability, accept or reject incoming jobs, get paid to M-Pesa after customer releases escrow
- **Admin**: Dashboard with platform stats (fundis, jobs, revenue, 10% commission), pending verification queue, recent jobs table, verify/reject fundi applications

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any schema change in `lib/db/src/schema/`, run `pnpm --filter @workspace/db run push` then `pnpm run typecheck:libs` so API server sees updated types
- After any `lib/api-spec/openapi.yaml` change, run `pnpm --filter @workspace/api-spec run codegen` before using updated hooks
- Reviews table uses `job_id = 0` for seed data (standalone reviews not tied to a real job) — production should enforce FK constraint

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
