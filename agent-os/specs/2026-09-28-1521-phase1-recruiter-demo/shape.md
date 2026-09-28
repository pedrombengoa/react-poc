# Phase 1 Recruiter Demo — Shaping Notes

## Scope

Build only the Phase 1 Personal Finance Dashboard web MVP: a responsive, read-only public demo with fictional local transaction data, USD/en-US formatting, global date/category filters, four KPIs, two charts, and a transaction table. It must be useful without login, secrets, Supabase, or another backend.

## Decisions

- Audience: engineering recruiters, hiring managers, and technical interviewers assessing product judgment and AI-assisted React delivery.
- Default filter: last six months, to show a meaningful monthly trend on first load.
- Filters update all dashboard aggregates, charts, and rows together.
- Store fixture amounts as positive integer cents; transaction type determines whether the amount contributes to income or expenses.
- Use static deterministic demo data and pure calculation functions; no remote calls or writes.
- Build a single public route. Auth and persistence are Phase 2; React Native is Phase 3.
- Use an accessible, responsive visual hierarchy and color-independent labels; no reference mockups were supplied.
- User approved USD/en-US, no visual reference, and global filters during shaping.

## Context

- **Visuals:** None provided.
- **References:** No existing application code is present to reuse. See `references.md` for official framework and testing documentation.
- **Product alignment:** Supports the Engineering Manager job search by emphasizing a complete, deployable, tested product without unnecessary production infrastructure.

## Standards Applied

The Agent OS standards index is empty. Product constraints are sourced from `agent-os/product/mission.md`, `roadmap.md`, and `tech-stack.md`. The roadmap's Phase 1 reference to form validation was corrected because this phase intentionally has no forms; transaction form validation belongs in Phase 2.