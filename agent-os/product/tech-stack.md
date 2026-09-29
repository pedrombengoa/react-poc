# Technology Stack

## Cost and Hosting Goals

- Use open-source development packages and free hosted plans; no paid API, custom domain, or runtime AI dependency.
- Keep the public demo independent of Supabase so the portfolio remains browsable even if the free backend is paused.
- Review provider limits before release because free-tier terms can change.

## Frontend

- React + TypeScript (`strict`) + Vite, managed with npm.
- React Router for the public demo route and future authenticated routes.
- Tailwind CSS + shadcn/ui for a small accessible component set.
- Recharts for the two dashboard visualizations.
- SheetJS (`xlsx`) for browser-side `.xls` parsing; supports legacy Excel workbooks without a backend.
- Transient session import: the user uploads a local `.xls` expense file; parsed transactions are held in React state and cleared on refresh. No fixtures, no backend dependency, no authentication required for Phase 1.

## Post-MVP: Web Authentication and Persistence

- Supabase Free for real Auth and Postgres persistence.
- Supabase JavaScript client, isolated behind a small data-access module.
- Row Level Security policies scope every transaction to `auth.uid()`; test the policies before exposing the project.
- Keep only the Supabase URL and publishable/anon key in browser configuration; never ship a `service_role` key.
- TanStack Query for remote state and React Hook Form + Zod for authenticated transaction CRUD.
- Store monetary values as integer minor units and use a single configured currency; no exchange-rate calculations.

## Post-MVP: Mobile

- React Native + TypeScript for an iOS/Android client connected to the same Supabase project.
- Evaluate Expo for local development and free demo distribution; verify current free-tier limits before relying on hosted builds.
- Share domain logic and schemas where practical, while keeping platform UI native to each client.

## Architecture and State

- Small feature-oriented web layout (app, dashboard, transactions, shared UI); add auth and data-access modules in Phase 2 rather than scaffolding them into the MVP.
- Keep derived KPIs and chart data as pure functions over transactions; test them independently.
- Use React state for transient UI state including the imported transaction list; add TanStack Query for remote server state in Phase 2.
- No dedicated API server: the Phase 2 authenticated client accesses Supabase under database-enforced RLS.

## Quality and Deployment

- ESLint, Prettier, and TypeScript strict checks.
- Vitest + React Testing Library for financial calculations, validation, and components.
- One Playwright smoke test for the public dashboard; keep it independent of Supabase credentials.
- GitHub Actions for lint, tests, and production build, staying within GitHub Free included usage.
- Cloudflare Pages Free for static Vite hosting, connected to GitHub; use the free `pages.dev` hostname.
- README, architecture note, and AI-assisted development report.
- No Docker: Cloudflare Pages deploys the static build directly, so a container adds setup without improving this PoC.

## Free-Tier Constraints (Checked 2026-09-28)

- **Cloudflare Pages Free:** up to 500 builds per month and one concurrent build. This is ample for a small portfolio app. [Pages limits](https://developers.cloudflare.com/pages/platform/limits/)
- **Supabase Free (Phase 2):** current published limits include 50,000 monthly active users, 500 MB database size, and 5 GB egress; free projects are paused after one week of inactivity. The read-only fixture demo avoids making the public experience depend on that service. [Supabase pricing](https://supabase.com/pricing)
- GitHub Actions usage depends on repository visibility and account quota. Keep workflows short and verify included minutes if the repository is private.

## Product Decisions Confirmed

- Display currency: USD (`en-US` locale).
- Phase 1 is import-only and read-only; authenticated CRUD is deferred to Phase 2 via Supabase.