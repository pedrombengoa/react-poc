# References for Expense Spreadsheet Import

## Similar Implementations

### Dashboard Data Flow

- **Location:** `src/App.tsx`
- **Relevance:** `DashboardPage` currently supplies the transaction collection to the shared filters, summary selectors, charts, and table.
- **Key patterns:** Keep one transaction source in dashboard state and derive all views from the same filtered array. Replace the fixture injection with transient imported data.

### Transaction Domain Model

- **Location:** `src/features/transactions/transaction.ts`
- **Relevance:** Defines `Transaction`, `Category`, `TransactionType`, and category metadata used by dashboard calculations and display.
- **Key patterns:** Reuse the current model; map each imported row to a positive `amountCents`, normalized date, supported expense category, and `type: "expense"`.

### Dashboard Selectors

- **Location:** `src/features/dashboard/selectors.ts`
- **Relevance:** Pure functions calculate filtered transactions, KPIs, category spending, and monthly totals.
- **Key patterns:** Preserve these functions as the common calculation path; add import validation separately rather than coupling parsing to chart logic.

### Dashboard Tests

- **Location:** `src/features/dashboard/App.test.tsx`, `src/features/dashboard/selectors.test.ts`, and `e2e/dashboard.spec.ts`
- **Relevance:** Existing tests cover dashboard filtering, empty data, selector behavior, and the public browser flow.
- **Key patterns:** Extend these suites for import behavior instead of creating a disconnected test approach.

## Spreadsheet Parser Reference

No parser has been selected. During implementation, choose and document a browser-compatible library that explicitly supports legacy Excel `.xls` files; do not assume `.xlsx` support implies `.xls` support.
