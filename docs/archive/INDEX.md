# Hub4Estate — Product Requirements Document Index

**Version:** 2.0 | **Date:** 2 April 2026 | **Status:** Living Document

---

## Quick Access

| Document | Audience | Format | Description |
|----------|----------|--------|-------------|
| [Investor PRD (MD)](INVESTOR-PRD.md) | Investors | Markdown | Strategic overview, market analysis, moat, growth, financial projections |
| [Investor PRD (HTML)](hub4estate-investor-prd.html) | Investors | Interactive HTML | Same content, polished visual presentation with nav + collapsible sections |
| [Dev Team PRD (HTML)](hub4estate-dev-prd.html) | Engineering | Interactive HTML | Full technical reference — architecture, DB, features, APIs, DevOps, roadmap |

---

## Technical PRD — Markdown Reference Files

Detailed engineering documents, each covering a specific domain:

| # | File | Scope | Size |
|---|------|-------|------|
| 01 | [Executive Summary & Architecture](01-EXECUTIVE-SUMMARY-AND-ARCHITECTURE.md) | Vision, problem, solution, market analysis, tech stack, platform architecture | ~100KB |
| 02 | [Database, Security & File Structure](02-DATABASE-SECURITY-FILE-STRUCTURE.md) | 49 Prisma models, 19 enums, security architecture, RBAC, file organization | ~130KB |
| 03 | [Complete Feature Catalog](03-COMPLETE-FEATURE-CATALOG.md) | 200+ features: buyer, dealer, admin, professional, platform, automations | ~TBD |
| 04 | [AI/ML Architecture & UI/UX Design](04-AI-ML-ARCHITECTURE-AND-UIUX-DESIGN.md) | 3-year AI roadmap, design system, animations, component library | ~TBD |
| 05 | [User Journeys & API Contracts](05-USER-JOURNEYS-AND-API-CONTRACTS.md) | Step-by-step user flows, complete REST API specs, frontend/backend guides | ~80KB |
| 06 | [DevOps, Infrastructure & Roadmap](06-DEVOPS-INFRASTRUCTURE-AND-ROADMAP.md) | AWS infra, CI/CD, monitoring, testing strategy, 36-month roadmap, KPIs | ~TBD |

---

## Document Coverage Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│                    WHAT'S COVERED WHERE                          │
├──────────────────────┬──────────┬───────────┬───────────────────┤
│ Topic                │ Investor │ Dev HTML  │ Markdown Parts    │
├──────────────────────┼──────────┼───────────┼───────────────────┤
│ Executive Summary    │    ✓     │     ✓     │  01               │
│ Market Analysis      │    ✓     │     ✓     │  01               │
│ Platform Architecture│    ○     │     ✓     │  01               │
│ Tech Stack           │          │     ✓     │  01               │
│ Database Schema      │          │     ✓     │  02               │
│ Security             │          │     ✓     │  02               │
│ File Structure       │          │     ✓     │  02               │
│ Feature Catalog      │    ○     │     ✓     │  03               │
│ AI/ML Architecture   │    ✓     │     ✓     │  04               │
│ Design System        │          │     ✓     │  04               │
│ User Journeys        │          │     ✓     │  05               │
│ API Contracts        │          │     ✓     │  05               │
│ DevOps & Infra       │          │     ✓     │  06               │
│ Testing Strategy     │          │     ✓     │  06               │
│ Roadmap              │    ✓     │     ✓     │  06               │
│ KPIs & Metrics       │    ✓     │     ✓     │  06               │
│ Financial Projections│    ✓     │           │                   │
│ Risk Factors         │    ✓     │           │  06               │
│ Business Model       │    ✓     │     ○     │  01               │
│ Team & Hiring        │    ✓     │           │  06               │
├──────────────────────┴──────────┴───────────┴───────────────────┤
│  ✓ = Detailed coverage  ○ = Summary/overview  (blank) = N/A    │
└─────────────────────────────────────────────────────────────────┘
```

---

## How to Use

**For Investors:** Open `hub4estate-investor-prd.html` in a browser. Everything is self-contained — no dependencies, no build step. Print-ready.

**For Engineering:** Open `hub4estate-dev-prd.html` in a browser for the interactive reference. Use Cmd+K to search. For deep dives, read the individual markdown files (01-06).

**For Applications (YC, DPIIT, etc.):** Pull from `INVESTOR-PRD.md` for narrative content and `01-*.md` for technical depth.

---

## Company Info

- **HUB4ESTATE LLP** | LLPIN: ACW-4269 | PAN: AATFH3466L
- **Founder:** Shreshth Agarwal | shreshth.agarwal@hub4estate.com
- **Incorporated:** 17 March 2026 | Sriganganagar, Rajasthan
- **Platform:** hub4estate.com
