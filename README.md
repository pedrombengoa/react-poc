# Personal Finance Dashboard

A recruiter-facing proof of concept built to demonstrate productive, responsible AI-assisted development in a modern React stack. The public dashboard opens without login; you import your own `.xls` expense file to populate it. No backend secrets or personal financial information are stored — imported data lives only in memory and is cleared on page refresh.

## Demo

Deployment target: Cloudflare Pages Free (`*.pages.dev`). The live URL will be added after the repository is connected to Cloudflare Pages.

![Personal Finance Dashboard desktop view](docs/dashboard.png)

## Features

- Import expense transactions from a downloadable `.xls` template.
- Four period-based KPIs: spending, income, balance, and transaction count.
- Expense breakdown and monthly income/spending charts.
- Global date-range and category filters shared by every dashboard view.
- Responsive, keyboard-usable desktop and mobile layouts.
- No authentication, API, or Supabase dependency in Phase 1.

## Import Format

Download the example file from the dashboard's import panel, or create your own `.xls` spreadsheet with these four columns:

| Column | Type | Notes |
|---|---|---|
| `date` | Excel date or `YYYY-MM-DD` | Any valid date cell or ISO string |
| `description` | Text | Non-blank |
| `category` | Text | One of: `housing`, `groceries`, `dining`, `transport`, `wellness`, `shopping` |
| `amount` | Number | Positive USD, at most 2 decimal places |

The import validates the entire file before committing. Invalid rows are reported with their row number. A successful import replaces the current session's dataset; a failed import leaves it unchanged.

## Stack

React 19, TypeScript strict, Vite, React Router, Tailwind CSS 4, shadcn-style UI primitives, Recharts, SheetJS (xlsx), Lucide, Vitest, React Testing Library, Playwright, ESLint, Prettier, and GitHub Actions.

Authentication and persistent Supabase transactions are planned for Phase 2. A React Native client is planned for Phase 3.

## Local Development

Requirements: Node.js 24 and npm.

```powershell
npm ci
npm run dev
```

The app is served at `http://localhost:5173` by default.

To regenerate the downloadable example file:

```powershell
node scripts/generate-example-xls.mjs
```

## Quality Checks

```powershell
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Playwright requires Chromium. Install it once with `npx playwright install chromium`. The E2E command serves the production build on port 4173.

## Deployment: Cloudflare Pages Free

1. Push this repository to GitHub.
2. In Cloudflare, create a Pages project and connect the GitHub repository.
3. Set the production branch to `main`, build command to `npm run build`, and output directory to `dist`.
4. Deploy and use the generated `pages.dev` hostname; no custom domain or environment variables are required.

Cloudflare account access and repository connection are performed by the project owner. Free-tier quotas and terms can change; see the [Pages limits](https://developers.cloudflare.com/pages/platform/limits/).

## Architecture and Development Notes

- [Architecture](docs/architecture.md)
- [AI-assisted development](docs/ai-assisted-development.md)
- [Phase 1 product spec](agent-os/specs/2026-09-28-1521-phase1-recruiter-demo/plan.md)

## Scope and Data

This is a portfolio PoC, not financial advice or a production banking system. Imported data is not saved or transmitted anywhere. Login, persistent transactions, and Supabase are deferred to Phase 2.
