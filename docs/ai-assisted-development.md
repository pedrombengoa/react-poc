# AI-Assisted Development Notes

## Purpose

This document records how AI tools contribute to the Personal Finance Dashboard and how their output is reviewed. Update it as implementation continues; it is a factual log, not a claim that generated code is automatically correct.

## Tools and Workflows

- **GitHub Copilot in VS Code:** used to refine product scope, shape the Phase 1 plan, scaffold and implement the React experience, and draft tests and documentation.
- **Builder Methods Agent OS:** used to organize product mission, roadmap, technology decisions, and the Phase 1 implementation spec.
- **Vite:** generated the official React + TypeScript starter; application code and configuration were then adapted to the product requirements.

## Human Decisions

- Keep Phase 1 public, read-only, and independent of login, Supabase, API credentials, and real financial records.
- Use USD/en-US fictional data, with global filters that keep every dashboard view consistent.
- Defer real authentication/persistence to Phase 2 and React Native to Phase 3.
- Choose free-tier static hosting and keep the PoC narrower than a production finance product.

## Verification

AI-generated or AI-assisted code is checked through TypeScript strict mode, ESLint, Prettier, focused unit/component tests, a Playwright browser flow, and a production build. Financial totals and date boundaries receive explicit tests; a reviewer should still assess accessibility, correctness, security boundaries, and free-tier assumptions.

## Current Limitations

- Phase 1 uses generated fictional fixtures and does not provide account security, persistence, bank integrations, or financial advice.
- Free-tier quotas and provider terms can change. Deployment must be verified in the project owner's Cloudflare account.
- Add dated entries here when later phases introduce real data, AI workflows, or additional providers.

## Implementation Log

### 2026-09-28 — Phase 1 dashboard

- Used GitHub Copilot to adapt a Vite React + TypeScript starter into the dashboard, generate fictional transaction fixtures and selectors, build the responsive UI, and add unit, component, and browser tests.
- Kept the data layer deterministic and local; no backend credentials or real financial data were introduced.
- A failing date-boundary test led to tightening monthly aggregation to the exact selected range. A production bundle warning led to lazy-loading the chart module.
- Verified with `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test` (8 tests), `npm run build`, and `npm run test:e2e` (1 smoke test).
- Manually checked desktop and 390 px mobile rendering; the page showed no horizontal overflow and both charts mounted.