# Architecture

## Context

Phase 1 is a static React single-page application for a recruiter-facing product demo. It intentionally has no API or database dependency: local fixture data keeps the public experience available without credentials or a running backend.

## Structure

- `src/App.tsx` — route boundary, global filter state, dashboard composition, and KPI presentation.
- `src/features/transactions/` — transaction and category types plus deterministic fictional data.
- `src/features/dashboard/selectors.ts` — pure date/category filters and financial aggregates.
- `src/features/dashboard/DashboardCharts.tsx` — lazily loaded Recharts visualizations.
- `src/features/dashboard/*.test.ts(x)` — selector and user-visible interaction tests.
- `e2e/` — Playwright public-demo smoke test.

## Data Flow

The dashboard owns the selected date range and category. Both are applied by `filterTransactions`; the resulting transaction list is the single input to KPI summaries, category spending, monthly totals, and the table. Amounts are represented as positive integer cents; `income` or `expense` determines which aggregate receives each amount. The USD formatter is presentation-only.

Fixture dates are generated relative to the current date, keeping the default rolling six-month view populated. `createDemoTransactions(referenceDate)` accepts a reference date so tests can remain deterministic.

## State and Boundaries

- React state contains only view filters.
- Fixture data is local, fictional, read-only, and synchronous.
- Selectors contain the calculation rules and do not depend on React or browser APIs.
- Recharts is loaded as a separate chunk so its code does not delay the first dashboard render.
- React Router serves `/` and redirects unknown paths to the dashboard; additional routes are not scaffolded before they are needed.

## Quality and Deployment

Vitest checks calculations and edge cases; React Testing Library verifies that global filters keep the dashboard in sync; Playwright checks the built public app without environment secrets. GitHub Actions runs format, lint, typecheck, unit/component tests, build, and the browser smoke test. Cloudflare Pages serves the static `dist` output.

## Deferred Architecture

Phase 2 may add Supabase Auth and Postgres behind an explicit data-access boundary with per-user Row Level Security. No service-role key may be exposed to the browser. Phase 3 may add a React Native client and share domain logic where appropriate; web components should not be forced into cross-platform UI abstractions.