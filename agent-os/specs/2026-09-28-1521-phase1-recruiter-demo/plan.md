# Phase 1: Recruiter-Ready Personal Finance Demo

**Status:** Ready for implementation  
**Date:** 2026-09-28  
**Scope:** Phase 1 only; authentication, persistent storage, and mobile are deferred.

## Goal

Build a polished React + TypeScript financial dashboard that a recruiter can explore immediately. The MVP is a static, read-only public demo backed by fictional local data; no account, backend, secrets, or paid service is required.

## Decisions

- Currency and locale: USD / en-US.
- Global date-range and category filters update KPIs, both charts, and the transaction table together.
- Default date range: last six months, so the monthly trend is visible on first load. KPIs describe the selected period.
- Use fixture data spanning at least six months, with income and expense records across several categories.
- Keep the MVP read-only. No forms, authentication, CRUD, Supabase, API, or real financial information.
- Keep the public dashboard at `/`; use React Router as requested without inventing future auth routes now.
- Use free/open-source dependencies, GitHub Actions within included quota, and Cloudflare Pages Free with a `pages.dev` URL.
- Defer actual sign-up/login and Supabase persistence to Phase 2; defer React Native to Phase 3.
- No mockups or reference implementation were provided. Use a restrained, polished finance dashboard with clear hierarchy, accessible chart colors, and a carefully responsive layout.

## Implementation Tasks

### Task 1: Save Spec Documentation

This folder contains the complete shaping record:

- `plan.md` — delivery tasks and acceptance criteria.
- `shape.md` — scope and decisions.
- `standards.md` — standards considered.
- `references.md` — implementation references.

### Task 2: Bootstrap the Web App

- Initialize React + TypeScript with Vite and npm without overwriting the existing Agent OS directories.
- Configure strict TypeScript, ESLint, Prettier, Tailwind CSS, shadcn/ui, React Router, Recharts, Vitest, React Testing Library, and Playwright.
- Keep configuration minimal and use free/open-source packages only. Do not add Supabase, React Hook Form, or Zod in this phase.
- Establish a small feature-oriented structure, for example `src/app`, `src/features/dashboard`, `src/features/transactions`, `src/lib`, and `src/test`.

### Task 3: Model Demo Transactions and Pure Calculations

- Define a typed transaction with a stable ID, description, positive integer `amountCents`, ISO date-only string, category, and `income`/`expense` type.
- Add fictional fixture records spanning at least six calendar months. Keep fixtures static and make no network requests.
- Implement pure selectors for date and category filtering, income total, expense total, net balance, transaction count, expense totals by category, and monthly income/expense series.
- Interpret transaction type as the sign of the amount; format USD using `Intl.NumberFormat` and avoid floating-point math for stored values.
- Define and test inclusive date-range boundaries and empty-result behavior.

### Task 4: Build the Dashboard Experience

- Create a single public dashboard route with a responsive page header and clear selected-period label.
- Show four KPIs: spending, income, balance, and transaction count for the selected period.
- Add date-range presets (default: last six months; include this month) and a category selector with an all-categories option.
- Add an expense-by-category chart, a monthly income/expense trend chart, and a transaction table.
- Ensure both filters affect every KPI, both charts, and the table. Keep totals and chart series derived from the same filtered dataset.
- Include a useful empty/no-results state and semantic labels. Do not create artificial loading or backend-error states for local synchronous data.
- Ensure mobile layouts remain readable; charts may stack and the table may use a compact, horizontally safe presentation.

### Task 5: Verify Behavior and Accessibility

- Vitest: totals, balance, category aggregation, monthly grouping, date inclusivity, category/date combinations, empty data, and USD formatting.
- React Testing Library: filter controls update visible KPI values, charts' accessible summaries, and transaction rows consistently.
- Playwright: one smoke flow opens `/` with no environment secrets or backend, verifies the dashboard, changes filters, and confirms the filtered view.
- Check keyboard access, accessible names, contrast, chart alternatives/summaries, and desktop/mobile layout.

### Task 6: Add CI and Free Static Deployment

- Add npm scripts for `lint`, `format:check`, `typecheck`, `test`, `test:e2e`, and `build` as appropriate.
- Add a GitHub Actions workflow for clean install, lint, formatting check, typecheck, unit/component tests, and production build. Keep the workflow small and avoid paid services.
- Configure Cloudflare Pages to build the Vite app from GitHub and publish `dist` on the free `pages.dev` hostname. Document dashboard setup; do not claim a live deployment until connected and verified.

### Task 7: Complete Portfolio Documentation and Release

- Write a professional README with product purpose, screenshots, features, local setup, scripts, architecture overview, deployment steps, and current limitations.
- Add `docs/architecture.md` describing feature boundaries, fixture-data flow, derived calculations, and why auth/API layers are deferred.
- Add `docs/ai-assisted-development.md` recording AI tools/workflows used, human decisions, validation performed, and lessons learned. Keep it factual as work happens.
- Build locally, run CI-equivalent checks, deploy when repository access is configured, and inspect the published result on desktop and mobile.

## Acceptance Criteria

- A visitor lands directly on the public dashboard and can explore it without signing in, configuration, or backend availability.
- All sample financial data is fictional and all records are read-only.
- Initial view shows six months of useful demo data in USD/en-US and correct selected-period KPIs.
- Date and category filters always keep KPI totals, category chart, monthly chart, and transaction list in sync.
- Financial calculations are deterministic and unit-tested, including no-result and date-boundary cases.
- Responsive and keyboard-usable at mobile and desktop widths, with accessible chart summaries.
- Lint, formatting check, typecheck, tests, and production build pass locally and in GitHub Actions.
- Cloudflare Pages serves the production build on a verified `pages.dev` URL; README explains free-tier limits.
- Architecture and AI-assisted development documents are complete and consistent with the implementation.

## Risks and Boundaries

- Cloudflare Pages and GitHub quotas are free-tier dependent and can change; verify current limits before release.
- The Cloudflare account/repository connection may require user authentication and cannot be automated without that access.
- Do not add Phase 2 authentication, Supabase, transaction forms, or React Native as part of this spec.