# Architecture

## Context

Phase 1 is a static React single-page application for a recruiter-facing product demo. It has no API or database dependency: users import a local `.xls` expense file which is parsed in the browser. Imported data is held in transient React state and is cleared on page refresh. No backend, credentials, or server-side storage are involved.

## Structure

- `src/App.tsx` — route boundary, global filter state, import state machine, dashboard composition, and KPI presentation.
- `src/features/transactions/transaction.ts` — transaction and category types.
- `src/features/transactions/xls-importer.ts` — browser-side `.xls` parser; validates and maps rows to `Transaction` objects.
- `src/features/dashboard/selectors.ts` — pure date/category filters and financial aggregates.
- `src/features/dashboard/DashboardCharts.tsx` — lazily loaded Recharts visualizations.
- `src/features/dashboard/*.test.ts(x)` — selector and user-visible interaction tests.
- `src/features/transactions/xls-importer.test.ts` — parser unit tests.
- `e2e/` — Playwright smoke tests covering the import workflow.
- `public/example-expenses.xls` — downloadable sample workbook; regenerate with `node scripts/generate-example-xls.mjs`.

## Data Flow

1. The user selects a `.xls` file via the import panel.
2. `parseXlsFile` reads the file with `FileReader`, passes the buffer to `parseXlsBuffer`, which uses SheetJS to validate and map every row to a `Transaction`.
3. On success, `DashboardPage` replaces its `transactions` state and resets the date range to span the imported data.
4. On failure, the existing dataset is preserved and row-specific errors are displayed.
5. The dashboard owns the selected date range and category. Both are applied by `filterTransactions`; the resulting transaction list is the single input to KPI summaries, category spending, monthly totals, and the transaction table.
6. Amounts are stored as positive integer cents; `type: "expense"` is set by the importer on all rows.

## Import Contract

The template has four columns: `date` (Excel date cell or `YYYY-MM-DD`), `description` (non-blank text), `category` (one of the six expense categories), and `amount` (positive USD ≤ 2 decimal places). The entire file is validated before any row is committed; a single invalid row rejects the whole import.

## State and Boundaries

- React state contains the imported transaction list, import status, and view filters.
- Transactions are in-memory only; a page refresh clears all data.
- Selectors contain the calculation rules and do not depend on React or browser APIs.
- Recharts is loaded as a separate chunk so its code does not delay the first dashboard render.
- React Router serves `/` and redirects unknown paths to the dashboard.

## Quality and Deployment

Vitest checks parser validation and edge cases; React Testing Library verifies that import and global filters keep the dashboard in sync; Playwright tests the built app's download link and file-upload flow. GitHub Actions runs format, lint, typecheck, unit/component tests, build, and the browser smoke test. Cloudflare Pages serves the static `dist` output.

## Deferred Architecture

Phase 2 may add Supabase Auth and Postgres behind an explicit data-access boundary with per-user Row Level Security. No service-role key may be exposed to the browser. Phase 3 may add a React Native client and share domain logic where appropriate.
