# Expense Spreadsheet Import Plan

## Task 1: Save Spec Documentation

Create the spec folder with `plan.md`, `shape.md`, `standards.md`, and `references.md`. This documentation is the first task and is saved before implementation begins.

## Task 2: Add Legacy XLS Parsing

- Select a browser-compatible spreadsheet parser that supports legacy `.xls` workbooks.
- Define the fixed template columns: `date`, `description`, `category`, and `amount`.
- Accept dates represented as valid Excel dates or `YYYY-MM-DD` values; normalize them to the transaction model's date format.
- Require nonblank descriptions, positive USD amounts with no more than two decimal places, and one of the supported expense categories: `housing`, `groceries`, `dining`, `transport`, `wellness`, or `shopping`.
- Set each parsed transaction's type to `expense`; the file does not include a `type` column.
- Convert amounts to integer cents. Validate the complete workbook before exposing any transactions.
- Return row-specific validation errors. If the workbook, headers, or any data row is invalid, reject the entire import.

## Task 3: Replace Fixture-Backed Dashboard State

- Initialize the dashboard with an empty transaction list and remove `demoTransactions` from the runtime data path.
- Commit parsed transactions only after the entire file is valid.
- A successful import replaces the current in-memory dataset; a failed import leaves the current dataset unchanged.
- Set the active date range to the earliest and latest transaction dates after a successful import so the imported records are visible immediately.
- Keep imported data in memory only; refreshing the page clears it.
- Preserve the existing shared filtering and selector path for KPIs, charts, and the transaction table.

## Task 4: Add Import Controls and Example Workbook

- Add an accessible file selection/import control with success, loading, and row-level error feedback.
- Provide a downloadable `example-expenses.xls` whose columns and values satisfy the canonical import contract.
- Show a useful empty state before import and remove UI copy that claims sample activity exists.
- Ensure empty chart, KPI, and transaction-list states remain understandable.

## Task 5: Test the Workflow and Update Product Documentation

- Add parser unit tests for valid workbooks, Excel and ISO dates, decimal-to-cents conversion, missing or unexpected headers, invalid rows, unsupported categories, malformed amounts, empty workbooks, and whole-file rejection.
- Update dashboard component tests for empty startup, valid import, invalid import preserving current data, replacement by a later successful import, and imported-period date range.
- Update Playwright coverage for the example download and browser file-upload flow, verifying that KPIs, charts, filters, and the transaction table use the same imported data.
- Update README and architecture documentation, and revise Phase 1 product documents that currently promise fixture-backed startup or exclude import.

## Task 6: Verify

Run focused parser, component, and E2E tests, followed by:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run format:check`

Manually inspect empty and populated dashboard states on desktop and mobile.

## Acceptance Criteria

- The app loads with no fictional or mocked transactions.
- A valid example `.xls` can be downloaded and imported.
- Imported expense rows populate every dashboard view consistently.
- Invalid workbooks or rows produce actionable row-level errors and do not partially update the dashboard.
- A later valid import replaces the current session's imported data.
- Imported data is not persisted and is cleared by a page refresh.
- The active date range reflects the imported data immediately after a successful import.
- Automated checks pass, and the Phase 1 product documentation matches the revised scope.

## Out of Scope

- Income import, CSV, custom categories, append behavior, local or remote persistence, authentication, backend services, bank integrations, and financial advice.
