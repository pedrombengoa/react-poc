# Standards for Expense Spreadsheet Import

## Repository Standards

`agent-os/standards/index.yml` is empty. No repository coding standards are indexed for this feature, and no additional standards are being invented.

## Product Constraints

The following existing product documents inform the spec:

- `agent-os/product/mission.md` — Keep the app focused as a public, recruiter-facing proof of concept; do not turn it into a banking or financial-advice product.
- `agent-os/product/roadmap.md` — Keep Phase 1 account-free and independent of Supabase. This spec intentionally revises its fixture-backed startup and import exclusion; update those claims when implementing the approved scope.
- `agent-os/product/tech-stack.md` — Use the existing React, TypeScript, and Vite client architecture; keep derived dashboard calculations pure and based on transaction data; avoid introducing backend or persistence infrastructure.

## Feature-Specific Constraints

- Parse spreadsheet data in the browser and keep imported records in transient app state.
- Store amounts as positive integer cents and use the existing transaction type/category model.
- Derive KPIs, charts, and table rows from the same filtered imported dataset.
- Preserve accessible controls, readable feedback, and responsive dashboard behavior.
- Keep the feature within the explicit scope in `plan.md`; do not add authentication, bank connections, CSV support, or persistence.
