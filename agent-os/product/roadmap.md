# Product Roadmap

## Phase 1: Recruiter-Ready PoC

Ship a polished, live, zero-cost demo that communicates the product and its engineering quality quickly.

### Product

- Open the app directly into a responsive, read-only demo backed by fictional local fixture data; no account, Supabase availability, or environment secrets are needed to explore it.
- Show monthly spending, income, balance, and transaction count, with category spending and monthly trend charts.
- Provide a transaction list with date and category filters, plus clear loading, empty, and error states.
- Use one configured currency for the PoC; no currency conversion or real bank data.

### Engineering and delivery

- Keep a small feature-oriented structure with clear UI, data-access, and domain boundaries; avoid infrastructure or abstractions that do not serve the demo.
- Enable TypeScript strict mode, ESLint, and Prettier.
- Cover financial calculations, date/category filtering, and key UI behavior with Vitest and React Testing Library; add one Playwright smoke flow for the public demo.
- Run lint, tests, and build in a small GitHub Actions workflow using included free usage.
- Deploy the static Vite build to Cloudflare Pages Free from GitHub; use the provided `pages.dev` URL and do not require a paid domain or Docker.
- Include a recruiter-oriented README, a concise architecture document, and an AI-development report describing prompts/workflows, human decisions, and verification.

### Acceptance criteria

- A new visitor can inspect the demo dashboard without signing in or depending on Supabase.
- KPI and chart calculations are deterministic, tested, and consistent with the displayed transaction set.
- The app is usable on mobile and desktop, and CI passes lint, tests, and production build.
- The hosted site and complete MVP toolchain remain within free tiers; hosting limits are documented.

## Phase 2: Real Accounts and Persistent Data

- Add real sign-up, login, logout, and session management with Supabase Auth.
- Add a private user workspace with transaction create, read, update, and delete backed by Supabase Postgres.
- Enforce per-user data isolation with Row Level Security and test policies; never expose a service-role key in the client.
- Add authenticated routes, loading/error handling, and React Hook Form + Zod validation for transaction forms.
- Use TanStack Query for remote transaction state and mutations.
- Validate authenticated transaction forms with React Hook Form + Zod.
- Document Supabase Free limits and the one-week inactivity pause; keep the public demo independent of the backend.

## Phase 3: React Native Mobile App

- Build a companion iOS/Android app with React Native and TypeScript, using the same Supabase accounts and transaction data.
- Reuse domain types, validation, and financial calculations where practical; do not force web UI reuse across platforms.
- Deliver an installable development/demo experience with no paid app-store publication requirement. Evaluate Expo and its free-tier limits before choosing the build and distribution workflow.
- Provide mobile-specific navigation, forms, responsive charts, and tests for core workflows.

## Explicitly Out of Scope

- Bank integrations, financial advice, budgeting, recurring transactions, CSV import/export, multiple currencies, and production compliance or availability guarantees.
- Docker, a custom domain, a paid hosting plan, and runtime AI features.

## Later, Only If Useful

Beyond the mobile app, consider CSV export or another feature only if recruiter feedback justifies the added scope.