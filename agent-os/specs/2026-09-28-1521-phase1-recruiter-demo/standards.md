# Standards for Phase 1 Recruiter Demo

The Agent OS standards index (`agent-os/standards/index.yml`) is currently empty, so no repository coding standards apply yet.

The following product constraints govern this implementation:

- `agent-os/product/mission.md` — public account-free demo for a recruiter-facing Engineering Manager proof of concept.
- `agent-os/product/roadmap.md` — Phase 1 read-only scope; authentication/persistence and React Native are later phases.
- `agent-os/product/tech-stack.md` — React, TypeScript strict, Vite, React Router, Tailwind/shadcn/ui, Recharts, Vitest, Testing Library, Playwright, GitHub Actions, and Cloudflare Pages Free.

## Phase 1 Engineering Rules

- Keep all demo data fictional, local, deterministic, and read-only.
- Avoid floating-point arithmetic for stored monetary amounts; represent fixture amounts as integer cents.
- Derive all KPIs and chart series from the same selected, filtered dataset.
- Apply both date and category filters consistently to KPIs, both charts, and the transaction list.
- Do not add authentication, forms, Supabase, API calls, or Phase 2/3 scaffolding.
- Preserve keyboard operation, accessible names, readable contrast, and chart summaries that do not rely on color alone.
- Keep deployment and CI within free tiers; document limits and unverified account-specific configuration.