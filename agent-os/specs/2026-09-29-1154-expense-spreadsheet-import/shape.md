# Expense Spreadsheet Import — Shaping Notes

## Scope

Replace the fictional fixture-backed initial dashboard with an empty state and support importing expenditure transactions from a downloadable example `.xls` file. Imported records drive the existing dashboard views for the current browser session.

## Decisions

- Use a fixed `.xls` template with `date`, `description`, `category`, and `amount` columns.
- Support only existing expense categories: housing, groceries, dining, transport, wellness, and shopping. The importer assigns `type=expense`.
- Validate the entire file before committing; reject invalid imports with row-specific errors and no partial updates.
- Each successful import replaces the previous in-memory dataset. A failed import preserves it.
- After import, set the date range to the earliest and latest imported transaction dates.
- Keep data session-only; refresh clears imported data.
- Use the existing selectors and transaction model to keep KPIs, charts, filters, and table consistent.
- No visuals were provided. Reuse the current dashboard's design patterns and accessible controls.
- No existing spreadsheet-import implementation was identified.

## Context

- **Visuals:** None.
- **References:** `src/App.tsx`, `src/features/transactions/transaction.ts`, `src/features/dashboard/selectors.ts`, and existing dashboard tests; see `references.md`.
- **Product alignment:** The feature remains a public, account-free, backend-independent recruiter demo. It intentionally changes Phase 1 from fictional fixture data to an empty start with user-provided local spreadsheet data. Update the conflicting Phase 1 roadmap and technology-stack claims as implementation documentation.

## Standards Applied

The Agent OS standards index is empty. No indexed standards apply. Product mission, roadmap, and technology-stack constraints are summarized in `standards.md`; they are product context, not invented coding standards.
