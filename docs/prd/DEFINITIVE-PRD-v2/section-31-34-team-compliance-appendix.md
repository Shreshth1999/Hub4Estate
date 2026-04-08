# Hub4Estate Definitive PRD v2 -- Sections 31-34

> **Document**: section-31-34-team-compliance-appendix
> **Version**: 2.0.0
> **Date**: 2026-04-08
> **Author**: CTO Office, Hub4Estate
> **Status**: Authoritative Reference
> **Classification**: Internal -- Confidential
> **Prerequisite Reading**: section-01-executive-foundation.md, section-05-06-techstack-database.md

---

# SECTION 31 -- TEAM STRUCTURE & HIRING PLAN

> *A startup is its people. Hub4Estate is currently a one-person operation with 10 active clients, 4 validated deals, and a production-deployed platform. This section defines how Shreshth Agarwal builds the team that turns a working pilot into a category-defining company. Every role, every timeline, every rupee of payroll is specified. No "we'll figure it out later." The org chart at 12 months is drawn today.*

---

## 31.1 Current Team (April 2026)

| Name | Role | Type | Responsibilities | Status |
|------|------|------|-----------------|--------|
| Shreshth Agarwal | Founder & CEO | Full-time | Product vision, business development, Figma design, investor relations, dealer relationships, manual operations, pricing research | Active |
| -- | CTO | -- | This PRD is the recruitment tool. The CTO will own the entire engineering organization, technical architecture, and product delivery. | **To be hired (P0)** |

**Current operational reality:**
- All client management is manual (WhatsApp + spreadsheets + personal relationships)
- Shreshth personally sources quotes from dealers, compares prices, and facilitates every transaction
- Platform is deployed (EC2 + Amplify + RDS) but underutilized relative to its capabilities
- Design work happens in Figma daily -- Shreshth owns the design language
- No dedicated engineering, sales, or operations support

**Implication:** The first 3 hires determine whether Hub4Estate becomes a real company or stays a one-man side project. Every hire in Q2 2026 is existential.

---

## 31.2 Hiring Plan by Quarter

### 31.2.1 Q2 2026 (April-June) -- Foundation

The absolute minimum team to move from "founder doing everything" to "company with separation of concerns."

| # | Role | Type | Priority | Monthly Budget (INR) | Equity (Post-Conversion) | Key Deliverables in First 90 Days |
|---|------|------|----------|---------------------|--------------------------|----------------------------------|
| 1 | Full-Stack Engineer | Full-time | P0 | ₹80,000 - ₹1,20,000 | 1.0 - 2.0% | Deploy blind matching engine improvements, build dealer dashboard, integrate Razorpay payment flow |
| 2 | Backend Engineer | Full-time | P0 | ₹80,000 - ₹1,20,000 | 1.0 - 2.0% | Build inquiry-quote API, implement real-time notifications (SSE/WebSocket), set up BullMQ job processing |
| 3 | UI/UX Designer | Contract (part-time) | P1 | ₹40,000 - ₹60,000 | 0.25 - 0.5% (if converts to FT) | Design system documentation, buyer flow wireframes, dealer onboarding flow, mobile-responsive audit |
| 4 | QA/Testing Intern | Intern | P2 | ₹15,000 - ₹25,000 | -- | Manual test suite for critical flows, bug tracking setup, regression testing before each deploy |

**Q2 payroll budget:** ₹2,15,000 - ₹3,25,000/month
**Q2 total compensation cost (3 months):** ₹6,45,000 - ₹9,75,000

**Hiring channels for Q2:**
- MESA School of Business network (co-founding engineer from Founder's Batch)
- Bangalore startup communities (Twitter/X, Discord, Peerlist, Topmate)
- AngelList / Wellfound (full-stack and backend roles)
- Internshala + LinkedIn (QA intern)
- Personal referrals from Tej Agarwal and mentor network

**Why not hire a CTO first?**
The CTO search runs in parallel but will take 2-4 months to find the right person. The two P0 engineers start building immediately under Shreshth's product direction and this PRD's technical guidance. The CTO inherits a codebase with clear conventions, not a blank slate.

---

### 31.2.2 Q3 2026 (July-September) -- Growth

Product is stable. Jaipur expansion begins. Need sales muscle and operational depth.

| # | Role | Type | Priority | Monthly Budget (INR) | Equity | Key Deliverables in First 90 Days |
|---|------|------|----------|---------------------|--------|----------------------------------|
| 5 | Frontend Engineer | Full-time | P0 | ₹70,000 - ₹1,00,000 | 0.5 - 1.0% | Catalog UI rebuild, search + filter implementation, product comparison feature, performance optimization |
| 6 | DevOps Engineer | Part-time / Contract | P1 | ₹50,000 - ₹80,000 | 0.25 - 0.5% | CI/CD pipeline (GitHub Actions → Amplify + EC2), monitoring (Sentry + PostHog + Grafana), auto-scaling, backup automation |
| 7 | Content Writer (Hindi + English) | Contract | P2 | ₹25,000 - ₹40,000 | -- | Product descriptions for catalog (500+ SKUs), dealer onboarding guides, buyer education content, SEO articles |
| 8 | Sales Executive (Dealer Onboarding) | Full-time | P0 | ₹30,000 - ₹50,000 + incentives | -- | Onboard 40+ dealers in Jaipur, field visits, relationship management, onboarding training |

**Incentive structure for Sales Executive:**
- Base: ₹30,000 - ₹50,000/month
- Per dealer onboarded (verified + first transaction): ₹2,000
- Per dealer retained at 90 days: ₹1,000 bonus
- Monthly target: 15 dealers onboarded
- Realistic total compensation: ₹60,000 - ₹90,000/month at target

**Q3 payroll budget:** ₹1,75,000 - ₹2,70,000/month (new hires) + ₹2,15,000 - ₹3,25,000 (Q2 team) = ₹3,90,000 - ₹5,95,000/month
**Q3 total compensation cost (3 months):** ₹11,70,000 - ₹17,85,000

---

### 31.2.3 Q4 2026 (October-December) -- Scale

Mumbai/Pune expansion. Platform needs data capabilities, mobile presence, and customer success.

| # | Role | Type | Priority | Monthly Budget (INR) | Equity | Key Deliverables in First 90 Days |
|---|------|------|----------|---------------------|--------|----------------------------------|
| 9 | Data Engineer | Full-time | P1 | ₹80,000 - ₹1,20,000 | 0.5 - 1.0% | Pricing intelligence pipeline, dealer analytics, procurement trend models, Elasticsearch indexing pipeline |
| 10 | Mobile Developer (React Native) | Full-time | P1 | ₹70,000 - ₹1,00,000 | 0.5 - 1.0% | Android app MVP (buyer flow: search, inquiry, quote comparison, order tracking), push notifications |
| 11 | Customer Success Manager | Full-time | P1 | ₹40,000 - ₹60,000 | -- | Buyer onboarding support, dealer issue resolution, NPS tracking, churn prevention playbook |
| 12 | Marketing Manager | Full-time | P2 | ₹50,000 - ₹80,000 | 0.25 - 0.5% | Growth marketing strategy, dealer acquisition campaigns, SEO/SEM, content calendar, social media |

**Q4 payroll budget:** ₹2,40,000 - ₹3,60,000/month (new) + ₹3,90,000 - ₹5,95,000 (existing) = ₹6,30,000 - ₹9,55,000/month
**Q4 total compensation cost (3 months):** ₹18,90,000 - ₹28,65,000

---

### 31.2.4 Q1 2027 (January-March) -- Platform Maturity

| # | Role | Type | Priority | Monthly Budget (INR) | Equity | Key Deliverables |
|---|------|------|----------|---------------------|--------|-----------------|
| 13 | CTO (if not hired earlier) | Full-time | P0 | ₹1,50,000 - ₹2,50,000 | 3.0 - 5.0% | Technical leadership, architecture ownership, engineering culture, hiring pipeline |
| 14 | Second Sales Executive | Full-time | P0 | ₹30,000 - ₹50,000 + incentives | -- | Bangalore/Hyderabad dealer onboarding |
| 15 | Security/Compliance Lead | Contract | P1 | ₹60,000 - ₹1,00,000 | -- | DPDP audit, penetration testing, compliance documentation |

---

## 31.3 Organizational Structure (Target: 12 Months)

```
Shreshth Agarwal
CEO & Founder
├── Product & Design
│   ├── Shreshth (product vision, Figma, business requirements)
│   └── UI/UX Designer (1) -- design system, wireframes, prototypes
│
├── Engineering (reporting to CTO when hired, Shreshth interim)
│   ├── CTO (1) -- architecture, code review, technical decisions
│   ├── Full-Stack Engineer (2) -- feature development, API + UI
│   ├── Backend Engineer (1) -- API, jobs, integrations, data layer
│   ├── Frontend Engineer (1) -- catalog UI, search, performance
│   ├── Mobile Developer (1) -- React Native Android + iOS
│   ├── Data Engineer (1) -- pricing pipeline, analytics, search indexing
│   ├── DevOps (1, contract) -- CI/CD, monitoring, infrastructure
│   └── QA/Testing (1, intern → full-time) -- manual + automated testing
│
├── Growth & Sales
│   ├── Marketing Manager (1) -- acquisition, brand, content strategy
│   ├── Sales Executive (2) -- dealer onboarding, field relationships
│   └── Content Writer (1, contract) -- product descriptions, guides
│
└── Operations & Support
    ├── Customer Success Manager (1) -- buyer + dealer support, NPS
    └── Security/Compliance Lead (1, contract) -- DPDP, audits
```

**Total headcount at 12 months:** 14-16 people (including Shreshth)
**Monthly payroll budget at 12 months:** ₹8,50,000 - ₹12,50,000
**Annual payroll cost (Year 1 total, ramping):** ₹55,00,000 - ₹85,00,000

---

## 31.4 Role Specifications

### 31.4.1 CTO (Chief Technology Officer)

**Priority:** P0 -- single most important hire after the first two engineers
**Timeline:** Parallel search from Day 1, target hire by Q3 2026

| Attribute | Requirement |
|-----------|-------------|
| Experience | 5-10 years in software engineering, 2+ years in a leadership/architect role |
| Must-Have Skills | TypeScript, React, Node.js, PostgreSQL, AWS, system design, team management |
| Nice-to-Have | Marketplace/e-commerce background, B2B SaaS, Indian market experience |
| Mindset | Builder (ships code, not just manages), comfortable with ambiguity, startup pace |
| Location | Bangalore (in-person preferred), remote acceptable with monthly Bangalore visits |
| Compensation | ₹1,50,000 - ₹2,50,000/month + 3-5% equity (vesting) |
| Reporting | Directly to Shreshth (CEO) |

**CTO Responsibilities:**
1. Own the entire codebase and technical architecture
2. Hire, manage, and mentor the engineering team
3. Set engineering standards: code review process, testing requirements, deployment practices
4. Make build-vs-buy decisions for all technical components
5. Own infrastructure reliability (99.9% uptime target)
6. Technical due diligence preparation for investor meetings
7. Security and compliance technical implementation
8. Ship code daily -- this is not a "PowerPoint CTO" role

**CTO Interview Process:**
1. Resume + GitHub/portfolio screen (async, 24-hour turnaround)
2. System design interview: "Design Hub4Estate's blind matching engine from scratch" (60 min, video call)
3. Live coding: build a real-time bid notification system with WebSocket (90 min, pair programming)
4. Architecture review: review Hub4Estate's current codebase and produce a technical debt report (take-home, 48 hours)
5. Culture fit with Shreshth: 60-minute unstructured conversation about building, ambiguity, and vision
6. Reference check (2 former colleagues, 1 former manager)

**Red flags (immediate disqualification):**
- "I don't write code anymore, I manage"
- Cannot explain database indexing strategy
- No GitHub/public work to show
- Dismissive of the market ("construction is too old-school")
- Wants a large team before shipping anything

---

### 31.4.2 Full-Stack Engineer

| Attribute | Requirement |
|-----------|-------------|
| Experience | 2-5 years |
| Must-Have | TypeScript, React 18, Node.js, Express, PostgreSQL, REST APIs, Git |
| Nice-to-Have | Prisma, Tailwind CSS, Redis, AWS (EC2/S3/RDS), real-time (WebSocket/SSE) |
| Test | Build a mini blind-matching prototype (take-home, 72 hours): React form → Express API → PostgreSQL → display results anonymized |
| Compensation | ₹80,000 - ₹1,20,000/month + 1-2% equity |

---

### 31.4.3 Backend Engineer

| Attribute | Requirement |
|-----------|-------------|
| Experience | 2-5 years |
| Must-Have | TypeScript, Node.js, Express or Fastify, PostgreSQL, Prisma or raw SQL, job queues (BullMQ/similar) |
| Nice-to-Have | Elasticsearch, Redis, AWS, Docker, CI/CD, API design (OpenAPI spec) |
| Test | Design and implement the inquiry → quote → selection API (take-home, 72 hours): full CRUD with blind matching logic, quote anonymization, reveal-on-selection |
| Compensation | ₹80,000 - ₹1,20,000/month + 1-2% equity |

---

### 31.4.4 Frontend Engineer

| Attribute | Requirement |
|-----------|-------------|
| Experience | 2-4 years |
| Must-Have | TypeScript, React 18, Tailwind CSS, Zustand or Redux, React Query/TanStack Query, responsive design |
| Nice-to-Have | Framer Motion, Chart.js/Recharts, accessibility (WCAG), performance optimization, Vite |
| Test | Build a product catalog page with search, filters, and comparison (take-home, 48 hours) |
| Compensation | ₹70,000 - ₹1,00,000/month + 0.5-1% equity |

---

### 31.4.5 Mobile Developer

| Attribute | Requirement |
|-----------|-------------|
| Experience | 2-4 years |
| Must-Have | React Native or Expo, TypeScript, REST API integration, push notifications, offline-first patterns |
| Nice-to-Have | iOS + Android native debugging, app store deployment, deep linking |
| Test | Build a basic product search + inquiry submission app in React Native (take-home, 72 hours) |
| Compensation | ₹70,000 - ₹1,00,000/month + 0.5-1% equity |

---

### 31.4.6 Sales Executive (Dealer Onboarding)

| Attribute | Requirement |
|-----------|-------------|
| Experience | 1-3 years in B2B sales (electrical/construction industry preferred) |
| Must-Have | Hindi + English fluency, comfort with field visits, relationship management, smartphone literacy |
| Nice-to-Have | Existing dealer network in target city, CRM tool experience |
| Location | Based in target expansion city (Jaipur for Q3, Mumbai/Pune for Q4) |
| KPIs | Dealers onboarded/month, dealer activation rate, first-transaction rate |
| Test | Role-play: pitch Hub4Estate to a skeptical electrical dealer in Hindi (15 min, video call) |
| Compensation | ₹30,000 - ₹50,000 base + performance incentives |

---

## 31.5 Hiring Criteria (Universal)

### 31.5.1 Non-Negotiable Requirements (All Roles)

1. **Builder Mentality**: Has shipped something real. Side project, open-source contribution, previous startup -- anything that proves they build, not just theorize.
2. **Comfort with Ambiguity**: Hub4Estate is pre-product-market-fit. Requirements change weekly. The right hire sees that as exciting, not frustrating.
3. **Startup Pace**: Willing to ship daily, iterate based on user feedback, and throw away code that does not work.
4. **Communication**: Can articulate decisions clearly in writing. Async communication is the default.
5. **Integrity**: Handles blind matching data. Every employee signs confidentiality agreements covering buyer-dealer anonymity.

### 31.5.2 Engineering-Specific Criteria

1. **TypeScript Proficiency**: The entire stack is TypeScript. No exceptions. Engineers who "prefer JavaScript" will not thrive.
2. **Git Hygiene**: Clean commit messages, feature branches, PR-based workflow. No direct commits to `main`.
3. **Testing Habit**: Writes tests for business logic without being asked. Coverage is a habit, not a checkbox.
4. **Code Review Culture**: Gives and receives constructive feedback on PRs. No ego in code reviews.
5. **Production Awareness**: Thinks about error states, edge cases, and monitoring from the start, not as an afterthought.

### 31.5.3 Sourcing Strategy by Channel

| Channel | Best For | Expected Response Rate | Cost |
|---------|----------|----------------------|------|
| MESA School of Business (direct) | Co-founding engineer, intern | 30-50% | ₹0 (personal network) |
| Twitter/X tech community | Full-stack, backend engineers | 5-10% | ₹0 (organic outreach) |
| AngelList / Wellfound | All engineering roles | 3-5% | ₹0 (free job posting for startups) |
| Peerlist | Engineers with portfolios | 5-8% | ₹0 |
| LinkedIn (direct outreach) | CTO, senior engineers, marketing | 8-15% | ₹0-5,000/month (InMail credits) |
| Internshala | QA intern, content writer | 20-30% | ₹5,000/listing |
| Referrals (mentor network) | CTO, senior engineers | 15-25% | ₹0 (but offer referral bonus ₹10,000-25,000) |
| Hacker News "Who is Hiring" | Backend, full-stack | 2-4% | ₹0 |
| Local Jaipur/Mumbai communities | Sales executives | 10-20% | ₹2,000-5,000/listing |

---

## 31.6 Equity & ESOP Framework

### 31.6.1 Current Ownership

| Partner | Ownership | Status |
|---------|-----------|--------|
| Shreshth Agarwal | 75% | Active, CEO |
| Father (designated partner) | 25% | Passive, family anchor |

### 31.6.2 Pre-Requisite: LLP to Private Limited Conversion

LLP cannot issue ESOPs or equity to employees. Conversion to Private Limited is required before any equity grants.

| Step | Action | Timeline | Cost (Approx.) | Responsible |
|------|--------|----------|----------------|-------------|
| 1 | Board resolution for conversion | Week 1 | -- | CA |
| 2 | Obtain NOC from creditors (if any) | Week 1-2 | -- | CA |
| 3 | File Form 18 with ROC | Week 2 | ₹5,000 - 10,000 (govt fees) | CA |
| 4 | Obtain Memorandum + Articles of Association | Week 2-3 | ₹15,000 - 25,000 (legal fees) | Lawyer |
| 5 | ROC approval + new CIN | Week 4-8 | -- | ROC |
| 6 | Update PAN, TAN, GST, bank accounts | Week 8-10 | ₹5,000 - 10,000 | CA |
| 7 | ESOP scheme approval (Board + Shareholders) | Week 10-12 | ₹10,000 - 20,000 (legal drafting) | Lawyer |

**Total conversion cost:** ₹35,000 - ₹65,000
**Timeline:** 10-12 weeks from decision
**Trigger:** Before any equity investment round OR before first ESOP grant, whichever comes first

### 31.6.3 ESOP Pool Structure

| Parameter | Value |
|-----------|-------|
| Total ESOP pool | 10-15% of fully diluted equity (post-conversion) |
| Initial allocation | 10% (expand to 15% at Series A if needed) |
| Vesting schedule | 4-year vesting with 1-year cliff |
| Cliff | 12 months (0% vests before 12 months) |
| Post-cliff vesting | Monthly (1/36th per month for remaining 36 months) |
| Exercise window | 90 days after termination (extend to 10 years for good leavers) |
| Exercise price | Fair Market Value (FMV) at grant date per Rule 11UA of Income Tax Rules |
| Tax | Perquisite tax on exercise (difference between FMV and exercise price) |
| Board approval | Required for each grant |
| Accelerated vesting | Double-trigger on acquisition (company acquired + employee terminated) |

### 31.6.4 Equity Allocation Guidelines

| Role | Equity Range | Vesting | Notes |
|------|-------------|---------|-------|
| CTO | 3.0 - 5.0% | 4yr / 1yr cliff | Co-founding role, only if hired in first 6 months |
| First 2 Engineers (Q2 2026) | 1.0 - 2.0% each | 4yr / 1yr cliff | Foundational team, building from scratch |
| Engineers (Q3-Q4 2026) | 0.5 - 1.0% each | 4yr / 1yr cliff | Joining an established but early team |
| UI/UX Designer (if FT) | 0.25 - 0.5% | 4yr / 1yr cliff | Design is core to the brand |
| Marketing Manager | 0.25 - 0.5% | 4yr / 1yr cliff | Only if joined pre-Series A |
| Engineers (Year 2+) | 0.1 - 0.5% each | 4yr / 1yr cliff | Standard startup equity |
| Sales / Operations | Equity not standard | -- | Cash incentives preferred |

**Total allocated in Year 1 (estimated):** 7-10% across CTO + 5 engineers + 1-2 others
**Remaining ESOP pool after Year 1:** 0-5% (expand at Series A if needed)

### 31.6.5 Equity Negotiation Rules

1. **Never negotiate equity over chat/phone.** All equity discussions happen in person or formal video call with written follow-up.
2. **All equity grants are Board-approved.** Shreshth cannot grant equity unilaterally post-conversion.
3. **Equity replaces salary discount.** If an engineer takes ₹80K instead of market rate ₹1.2L, the ₹40K/month gap is compensated in equity at a formula: `annual_gap / current_valuation * multiplier(1.5x)`.
4. **No advisor equity exceeds 1%.** Advisors get 0.1-0.5% with 2-year vesting, 6-month cliff.
5. **Contractor/freelance equity:** Generally not granted. If exceptional, maximum 0.25% with performance-based vesting.

---

## 31.7 Key Advisors & Support Network

| Name | Role | Engagement | Contribution |
|------|------|-----------|-------------|
| Tej Agarwal | Core Mentor | Weekly calls, ad-hoc | Strategic thinking, assumption-challenging, founder mindset |
| Hitesh Sir | Business Advisor | Multiple times/week | Business model validation, market reality checks, operational guidance |
| Geetika Ma'am | Academic Advisor | Monthly | Academic guidance, MESA School connections |
| TBD | Legal Advisor | As needed | LLP → Pvt Ltd conversion, compliance, contracts, trademark filing |
| TBD | Chartered Accountant (CA) | Monthly | GST filing, TDS, financial statements, tax planning, DPIIT application |
| TBD | Technical Advisor | Monthly | Architecture review, technology decisions, engineering mentorship |

**Advisor compensation (post-Pvt Ltd conversion):**
- Core advisors: 0.1 - 0.5% equity, 2-year vesting, 6-month cliff
- Professional advisors (CA, legal): cash retainer, no equity
- Target: 3-4 advisors by Q4 2026

---

## 31.8 Team Culture & Operating Principles

### 31.8.1 Communication

| Channel | Purpose | Response SLA |
|---------|---------|-------------|
| Slack (primary) | Day-to-day communication, quick questions, updates | < 2 hours during work hours |
| GitHub PRs | Code review, technical discussion | < 24 hours for first review |
| Linear / Notion | Task management, specs, documentation | Updated daily |
| Weekly Standup (Mon 10 AM IST) | Priorities for the week, blockers, demos | Mandatory attendance |
| Monthly All-Hands | Company metrics, roadmap updates, wins, learnings | Mandatory attendance |
| 1:1s with Shreshth | Individual check-ins, feedback, growth | Every 2 weeks, 30 min |

### 31.8.2 Work Policy

| Parameter | Policy |
|-----------|--------|
| Work model | Remote-first (Bangalore co-working for in-person days) |
| Core hours | 10 AM - 6 PM IST (flexible outside core) |
| In-person days | 2 days/month minimum for Bangalore-based team |
| Leave policy | 18 days PTO + national holidays + 5 sick days |
| Equipment | ₹30,000 setup allowance (laptop if needed, peripherals) |
| Learning budget | ₹5,000/quarter for courses, books, conferences |
| Travel | Covered for work travel (dealer visits, team meetups) |

### 31.8.3 Engineering Culture

1. **Ship daily.** If code is not in production within 48 hours of being written, something is wrong.
2. **PRs over perfection.** A small PR merged today beats a perfect PR merged next week.
3. **Write tests for business logic.** Unit test the blind matching engine. Unit test the pricing calculation. Do not unit test button colors.
4. **Document decisions, not code.** Self-explanatory code with ADRs (Architecture Decision Records) for non-obvious choices.
5. **On-call is everyone.** No dedicated DevOps carrying a pager. Engineers own their services end-to-end.
6. **Postmortems, not blame.** Every incident gets a blameless postmortem within 48 hours.
7. **Demo Fridays.** Every Friday at 4 PM, whoever shipped something that week shows it to the team. 5 minutes per demo. No slides.

---

## 31.9 Monthly Burn Rate Projection

| Month | Headcount | Payroll (INR) | Infra (INR) | Tools/SaaS (INR) | Misc (INR) | Total Burn (INR) |
|-------|-----------|---------------|-------------|-------------------|------------|------------------|
| Apr 2026 | 1 (Shreshth) | ₹0 (founder) | ₹15,000 | ₹5,000 | ₹10,000 | ₹30,000 |
| May 2026 | 3 | ₹1,75,000 | ₹20,000 | ₹8,000 | ₹15,000 | ₹2,18,000 |
| Jun 2026 | 5 | ₹2,70,000 | ₹25,000 | ₹12,000 | ₹20,000 | ₹3,27,000 |
| Jul 2026 | 7 | ₹4,20,000 | ₹35,000 | ₹18,000 | ₹25,000 | ₹4,98,000 |
| Aug 2026 | 8 | ₹4,80,000 | ₹40,000 | ₹20,000 | ₹30,000 | ₹5,70,000 |
| Sep 2026 | 9 | ₹5,30,000 | ₹45,000 | ₹22,000 | ₹30,000 | ₹6,27,000 |
| Oct 2026 | 11 | ₹6,80,000 | ₹55,000 | ₹28,000 | ₹35,000 | ₹7,98,000 |
| Nov 2026 | 12 | ₹7,40,000 | ₹60,000 | ₹30,000 | ₹35,000 | ₹8,65,000 |
| Dec 2026 | 13 | ₹8,00,000 | ₹65,000 | ₹32,000 | ₹40,000 | ₹9,37,000 |
| Jan 2027 | 14 | ₹9,50,000 | ₹75,000 | ₹35,000 | ₹40,000 | ₹11,00,000 |
| Feb 2027 | 15 | ₹10,00,000 | ₹80,000 | ₹38,000 | ₹45,000 | ₹11,63,000 |
| Mar 2027 | 15 | ₹10,00,000 | ₹85,000 | ₹40,000 | ₹45,000 | ₹11,70,000 |

**Year 1 total burn (Apr 2026 - Mar 2027):** ₹83,03,000 (~₹83L)
**Average monthly burn (steady state, Q1 2027):** ₹11,00,000 - ₹12,00,000

**Infrastructure cost breakdown (at steady state):**
| Service | Monthly Cost (INR) |
|---------|-------------------|
| AWS EC2 (t3.medium × 2) | ₹12,000 |
| AWS RDS (db.t3.medium, PostgreSQL) | ₹15,000 |
| AWS Amplify (frontend hosting) | ₹3,000 |
| AWS S3 + CloudFront (assets, images) | ₹5,000 |
| Redis (Upstash, Pro plan) | ₹4,000 |
| Elasticsearch (AWS OpenSearch, t3.small) | ₹8,000 |
| Domain + SSL | ₹500 |
| Sentry (Team plan) | ₹3,000 |
| PostHog (free tier → Growth) | ₹5,000 |
| Razorpay (per-transaction, not monthly) | Variable |
| Claude API (Anthropic) | ₹15,000 |
| MSG91 (SMS + WhatsApp) | ₹5,000 |
| Email (Resend) | ₹1,500 |
| Miscellaneous | ₹3,000 |
| **Total** | **₹80,000** |

---

# SECTION 32 -- LEGAL & COMPLIANCE

> *Hub4Estate operates in the intersection of e-commerce, fintech (escrow/payments), and data-intensive marketplace technology. Indian regulation in all three domains has evolved rapidly since 2020. This section specifies every compliance obligation, every policy document, every regulatory filing. An auditor reading this section should be able to verify compliance in under 4 hours. No ambiguity. No "consult legal later." Every clause is actionable now.*

---

## 32.1 Entity Structure

### 32.1.1 Current Entity

| Parameter | Value |
|-----------|-------|
| Legal Name | HUB4ESTATE LLP |
| LLPIN | ACW-4269 |
| PAN | AATFH3466L |
| TAN | JDHH05755B |
| Date of Incorporation | 17 March 2026 |
| Registered Office | 8-D-12, Jawahar Nagar, Sriganganagar, Ganganagar-335001, Rajasthan |
| Partners | Shreshth Agarwal (75%), Father (25%) |
| Designated Partners | Both |
| NIC Codes | 63122 (Web Portal Operations), 47912 (Retail via E-Commerce), 74999 (Miscellaneous Professional Services) |
| Annual Filing | Form 8 (Statement of Account) + Form 11 (Annual Return) to MCA |
| Audit Requirement | Mandatory if turnover > ₹40L or contribution > ₹25L |

### 32.1.2 Planned Conversion: LLP to Private Limited

**Why convert:**
1. VCs and angel investors require equity shareholding -- LLPs cannot issue shares
2. ESOPs cannot be granted under LLP structure
3. DPIIT recognition benefits (tax exemption under Section 80-IAC) are more favorable for Pvt Ltd
4. Foreign investment (FDI) is simpler in a Pvt Ltd company
5. Exit/acquisition mechanics are cleaner with share transfer vs. LLP interest transfer

**Conversion process under Section 366 of Companies Act 2013 + Third Schedule:**

| Step | Action | Timeline | Documents Required | Cost (Approx.) |
|------|--------|----------|--------------------|----------------|
| 1 | Pass resolution among partners | Day 1 | Written consent of all partners | -- |
| 2 | Obtain consent of creditors (if any) | Day 1-7 | Creditor consent letters, NOC from bank | -- |
| 3 | File e-Form URC-1 with ROC | Day 7-14 | LLP agreement, financial statements, list of partners, compliance certificate from CA | ₹5,000-10,000 |
| 4 | Prepare MOA and AOA | Day 7-14 | Memorandum of Association, Articles of Association | ₹15,000-25,000 (legal) |
| 5 | Obtain DIN for directors (if not already) | Day 14-21 | DIR-3 KYC, Aadhaar, PAN | ₹500/director |
| 6 | ROC processes application | Day 21-60 | -- (waiting period) | -- |
| 7 | Receive Certificate of Incorporation (CIN) | Day 60-75 | -- | -- |
| 8 | Apply for new PAN for Pvt Ltd | Day 75-80 | Form 49A | ₹200 |
| 9 | Apply for new TAN | Day 80-85 | Form 49B | ₹200 |
| 10 | Update GST registration | Day 85-90 | Amendment in GST portal | -- |
| 11 | Update bank accounts | Day 85-95 | Board resolution, CIN, new PAN | -- |
| 12 | File ESOP scheme for Board approval | Day 90-100 | ESOP plan document, Board resolution, Shareholders' resolution | ₹10,000-20,000 (legal) |

**Total cost:** ₹35,000 - ₹65,000
**Total timeline:** 10-14 weeks
**Recommended trigger:** Before first equity investor signs term sheet

### 32.1.3 Post-Conversion Structure (Target)

| Parameter | Value |
|-----------|-------|
| Legal Name | HUB4ESTATE PRIVATE LIMITED |
| Type | Private Limited Company under Companies Act 2013 |
| Authorized Share Capital | ₹10,00,000 (10,000 shares @ ₹100 each) |
| Paid-Up Share Capital | ₹1,00,000 (1,000 shares @ ₹100 each) |
| Directors | Shreshth Agarwal (MD), Father (Director) |
| Shareholding | Shreshth 75%, Father 25% (pre-dilution) |
| ESOP Pool | 10-15% reserved (see Section 31.6) |
| Registered Office | Same address (update if Bangalore office is established) |
| Statutory Auditor | To be appointed (mandatory for Pvt Ltd) |
| Company Secretary | Not required until paid-up capital exceeds ₹10Cr or turnover exceeds ₹50Cr |

---

## 32.2 Regulatory Compliance

### 32.2.1 Digital Personal Data Protection Act, 2023 (DPDP Act)

The DPDP Act is India's primary data protection legislation, enacted August 2023, rules notified in stages. Hub4Estate is a "Data Fiduciary" (entity that determines the purpose and means of processing personal data).

**32.2.1.1 Applicability**

Hub4Estate collects and processes personal data of Indian residents (buyers, dealers, service providers). The DPDP Act applies fully. Non-compliance attracts penalties up to ₹250 crore.

**32.2.1.2 Consent Management**

| Requirement | Implementation |
|-------------|---------------|
| Lawful basis for processing | Consent (primary) + Legitimate use (Section 7 -- contract performance) |
| Consent must be free, specific, informed, unconditional, unambiguous | Consent form with plain-language description of each data use |
| Consent must be as easy to withdraw as to give | One-click withdrawal in Privacy Dashboard |
| Separate consent for each purpose | Individual toggles per data use (platform operations, marketing, analytics, AI processing) |
| Consent for minors | Not applicable -- Hub4Estate requires users to be 18+ (verified via registration) |
| Record of consent | `consent_records` table with timestamp, version, IP, user agent |

**Consent form text (exact, displayed during registration):**

```
Hub4Estate collects and processes your personal data to provide our services.
By creating an account, you consent to:

[Required -- cannot proceed without]
☑ Platform Operations: Using your name, email, phone number, and business
  details to create your account, process inquiries, facilitate transactions,
  and provide customer support.
☑ Communication: Sending you transaction-related notifications via email,
  SMS, WhatsApp, and in-app notifications (order updates, quote alerts,
  delivery status).

[Optional -- can proceed without]
☐ Marketing: Sending you promotional offers, new feature announcements,
  and market insights via email and SMS. You can unsubscribe anytime.
☐ Analytics & AI: Using your anonymized usage data and transaction patterns
  to improve our AI recommendations, pricing intelligence, and platform
  experience. Individual data is never shared -- only aggregate insights.
☐ Third-Party Analytics: Sharing anonymized, aggregated market data with
  industry research partners. Your identity is never included.

You can change these preferences anytime in Settings → Privacy.
Read our full Privacy Policy: hub4estate.com/privacy

By clicking "Create Account," you agree to our Terms of Service and confirm
you are 18 years or older.
```

**32.2.1.3 Data Principal Rights**

| Right | DPDP Section | Implementation | SLA |
|-------|-------------|----------------|-----|
| Right to Access | Section 11 | Privacy Dashboard → "Download My Data" (JSON + CSV export) | 72 hours |
| Right to Correction | Section 11 | Profile edit page for all personal fields | Real-time |
| Right to Erasure | Section 12 | Settings → "Delete My Account" → 30-day cooling period → soft delete → hard purge at 90 days | 30 days (cooling) + 90 days (purge) |
| Right to Nominate | Section 14 | Nominate another person to exercise rights in case of death/incapacity | Settings → Privacy → Nominee |
| Right to Grievance Redressal | Section 13 | Grievance Officer contact on every page footer | Acknowledge within 48 hours, resolve within 30 days |

**32.2.1.4 Data Retention Schedule**

| Data Category | Retention Period | Justification | Deletion Method |
|---------------|-----------------|---------------|-----------------|
| Active user account data | Until account deletion + 90 days | Required for service delivery | Soft delete → hard purge |
| Deleted user account data | 90 days from deletion request | Cooling period for accidental deletion + fraud prevention | Hard delete (all PII, anonymize transactions) |
| Transaction records | 8 years from transaction date | GST/IT Act requirement (Section 44AA, books of account) | Archive to cold storage, PII masked |
| Inquiry/quote data | 3 years from inquiry close | Business analytics, dispute resolution | Anonymize (remove buyer/dealer identity, keep pricing data) |
| Server logs (with IP) | 180 days | Security investigation, debugging | Auto-purge via log rotation |
| AI conversation history | 90 days | User context, service improvement | Anonymize at 90 days, delete at 180 days |
| Payment records | 8 years | Financial regulations, audit trail | Archive to cold storage |
| KYC documents (dealer) | Active account + 5 years | RBI guidelines, fraud prevention | Encrypted archive, delete post-retention |
| Analytics events (anonymized) | Indefinite | No PII, aggregate insights | No deletion required |
| Marketing consent records | Until consent withdrawn + 3 years | Proof of consent for regulatory audit | Archive |
| Support tickets | 3 years from resolution | Quality assurance, dispute reference | Anonymize |

**32.2.1.5 Data Breach Protocol**

| Step | Action | SLA | Responsible |
|------|--------|-----|-------------|
| 1 | Detection (automated alerting via Sentry + AWS GuardDuty) | < 1 hour | Engineering on-call |
| 2 | Containment (isolate affected systems, revoke compromised credentials) | < 4 hours | Engineering lead |
| 3 | Assessment (determine scope, data affected, number of users) | < 12 hours | CTO + Legal |
| 4 | Notify Data Protection Board of India | < 72 hours (mandatory under DPDP) | CEO + Legal |
| 5 | Notify affected Data Principals (users) | < 72 hours (mandatory under DPDP) | CEO + Marketing |
| 6 | Remediation (patch vulnerability, reset passwords, enhance controls) | < 7 days | Engineering |
| 7 | Post-incident report (root cause, impact, remediation, prevention) | < 14 days | CTO |
| 8 | External audit (if breach affects >100 users) | < 30 days | Third-party security firm |

**Notification template (to Data Protection Board):**

```
To: Data Protection Board of India
From: HUB4ESTATE LLP / HUB4ESTATE PRIVATE LIMITED
Date: [date]
Subject: Personal Data Breach Notification under Section 8(6), DPDP Act 2023

1. Nature of breach: [unauthorized access / data leak / ransomware / other]
2. Date and time of breach: [detected at]
3. Data categories affected: [name, email, phone, business details, transaction data]
4. Number of Data Principals affected: [estimated count]
5. Likely consequences: [identity theft risk / financial loss risk / none]
6. Measures taken: [containment actions, remediation steps]
7. Contact: Shreshth Agarwal, CEO, shreshth.agarwal@hub4estate.com, +91 7690001999
```

---

### 32.2.2 Information Technology Act, 2000 (IT Act)

**32.2.2.1 Intermediary Status (Section 79)**

Hub4Estate qualifies as an "intermediary" under Section 2(1)(w) of the IT Act -- it provides a platform for buyers and dealers to transact but does not itself sell products.

**Safe harbor protection requires:**

| Obligation | Implementation |
|------------|---------------|
| Due diligence | Terms of Service clearly state Hub4Estate is a marketplace, not a seller |
| Actual knowledge | Act on takedown requests within 36 hours of receiving actual knowledge of unlawful content |
| No modification of content | Platform does not alter product listings submitted by dealers (except formatting) |
| Grievance officer | Appointed, name and contact displayed on website |
| Content moderation | Automated (AI-flagged) + manual review for reported content |
| Monthly compliance report | Complaints received, actioned, pending -- published on hub4estate.com/compliance |

**32.2.2.2 Reasonable Security Practices (Section 43A)**

Section 43A requires "reasonable security practices and procedures" for sensitive personal data. The IT (Reasonable Security Practices and Procedures) Rules, 2011 accept ISO 27001 or equivalent.

| Practice | Implementation |
|----------|---------------|
| Documented security policy | Published at hub4estate.com/security-policy |
| Encryption of sensitive data at rest | AES-256 via AWS RDS encryption + application-layer encryption for PAN/Aadhaar |
| Encryption in transit | TLS 1.3, HSTS header, minimum TLS 1.2 |
| Access control | RBAC with Row-Level Security (see Section 7) |
| Audit logging | Every data access logged in `audit_logs` table with user_id, action, timestamp, IP |
| Periodic security audit | Quarterly internal, annual external (after Series A) |
| Vulnerability management | Dependabot + Snyk for dependencies, OWASP ZAP for application scanning |

**32.2.2.3 Section 72A -- Breach of Confidentiality**

Hub4Estate's blind matching system is a contractual confidentiality mechanism. Any employee or contractor who leaks buyer/dealer identity before the selection event commits an offense under Section 72A (penalty: up to ₹5L fine + 3 years imprisonment).

**Implementation:**
- All employees sign a Confidentiality and Non-Disclosure Agreement (CNDA) with specific clause on blind matching data
- Database access to buyer-dealer mapping is restricted to the `reveal_on_selection` function
- Admin access to PII requires 2FA + audit log entry
- Quarterly access review: revoke permissions for anyone who does not need them

---

### 32.2.3 Consumer Protection (E-Commerce) Rules, 2020

**Applicability:** Hub4Estate is a "marketplace e-commerce entity" under these rules.

| Obligation | Implementation | Status |
|------------|---------------|--------|
| Display seller details on product listing | Dealer name, address, GSTIN displayed post-selection (in order confirmation page and invoice) | In blind matching, disclosed only after selection |
| Return/refund/exchange policy | Displayed on website, in order confirmation, and in dealer agreement | See Section 32.3.3 |
| Grievance redressal mechanism | Grievance Officer appointed, resolution within 30 days | Implemented |
| No manipulation of search results | Search algorithm is transparent (relevance + price), no paid boosting without "Sponsored" label | By design |
| No fake reviews | Only verified-purchase reviews allowed, AI moderation for suspicious patterns | Built into review system |
| Country of origin for products | Displayed in product catalog (imported brands marked) | In product data model |
| Display of MRP | Mandatory on all product listings | Product price includes MRP field |
| Seller rating | Dealer conversion rate and response metrics displayed (anonymized pre-selection) | Part of blind matching UI |
| No differential pricing based on consumer profile | Blind matching prevents this by design -- same price to all buyers for the same inquiry | Core architecture |
| Appointment of Chief Compliance Officer | Required if annual turnover > ₹5Cr (not yet) | Monitor threshold |
| Appointment of Nodal Contact Person | Required for law enforcement communication | Shreshth Agarwal (interim) |
| Monthly compliance report | Complaints received, actioned, pending | Auto-generated from support ticket system |

---

### 32.2.4 GST Compliance

**32.2.4.1 Hub4Estate's GST Registration**

| Parameter | Value |
|-----------|-------|
| Entity | HUB4ESTATE LLP (later Pvt Ltd) |
| GSTIN | To be obtained (registration pending/in progress) |
| State | Rajasthan (27 → 08) |
| Registration type | Regular (not Composition -- not eligible for e-commerce operators) |
| HSN/SAC for platform services | SAC 998314 (Online intermediation platform services) |
| GST rate on platform services | 18% (CGST 9% + SGST 9% for intra-state, IGST 18% for inter-state) |
| Threshold | ₹20L turnover for services (Rajasthan) -- register proactively |

**32.2.4.2 GST on Different Revenue Streams**

| Revenue Stream | Nature | SAC/HSN | GST Rate | Charged To |
|----------------|--------|---------|----------|------------|
| Dealer subscription (monthly plan) | Online platform service | 998314 | 18% | Dealer |
| Lead credit purchase | Information service | 998314 | 18% | Dealer |
| Transaction commission (future) | Commission/brokerage | 997159 | 18% | Dealer (or split) |
| Featured listing / advertising | Advertising service | 998361 | 18% | Dealer/Brand |
| SaaS API access (future) | IT service | 998314 | 18% | Business customer |

**32.2.4.3 TCS/TDS under GST (E-Commerce Operator)**

When Hub4Estate facilitates product transactions (beyond lead generation):

| Provision | Requirement | Implementation |
|-----------|-------------|---------------|
| Section 52 CGST Act (TCS) | E-commerce operator must collect TCS @ 1% (0.5% CGST + 0.5% SGST) on net taxable supplies | Deducted from dealer payout, deposited to govt monthly |
| GSTR-8 (TCS return) | Monthly filing by 10th of next month | Automated from transaction data |
| GSTR-1 (outward supply) | Monthly filing by 11th of next month | Platform subscription invoices + commission invoices |
| GSTR-3B (summary return) | Monthly filing by 20th of next month | Consolidated from GSTR-1, input credit |

**Note:** TCS obligation triggers when Hub4Estate facilitates the actual sale (payment flows through platform). During the current lead-generation model (subscription + lead credits), TCS does not apply. Monitor trigger point.

**32.2.4.4 Invoice Requirements (Rule 46, CGST Rules)**

Every invoice generated by the platform must contain:

```
Hub4Estate Tax Invoice

Invoice No: H4E/2026-27/INV/001234 (sequential, financial year)
Date: 08-04-2026
Place of Supply: Rajasthan (08)

Supplier:
  HUB4ESTATE LLP
  8-D-12, Jawahar Nagar, Sriganganagar, 335001
  GSTIN: [to be obtained]
  PAN: AATFH3466L

Recipient:
  [Dealer Name]
  [Dealer Address]
  GSTIN: [Dealer GSTIN]

| # | Description           | SAC    | Qty | Rate (₹) | Taxable (₹) | CGST 9% | SGST 9% | Total (₹) |
|---|----------------------|--------|-----|-----------|-------------|---------|---------|-----------|
| 1 | Growth Plan - April  | 998314 | 1   | 2,499.00  | 2,499.00    | 224.91  | 224.91  | 2,948.82  |

Total in Words: Rupees Two Thousand Nine Hundred Forty-Eight and Eighty-Two Paise Only

Terms: Payment due within 7 days of invoice date.
HSN/SAC Summary as per Rule 54(2)

Authorized Signatory
[Digital Signature / E-signature]
```

**32.2.4.5 Input Tax Credit (ITC) Management**

Hub4Estate can claim ITC on:
| Expense | GST Paid | Claimable |
|---------|----------|-----------|
| AWS infrastructure (if India-billed) | 18% | Yes |
| SaaS tools (Indian vendors) | 18% | Yes |
| Office rent (if GST registered landlord) | 18% | Yes |
| Professional services (CA, legal) | 18% | Yes |
| Claude API (Anthropic -- US vendor) | No GST (import) | No (but RCM may apply on import of services) |
| Razorpay charges | 18% | Yes |

**Reverse Charge Mechanism (RCM):** For import of services (Anthropic Claude API, AWS global services), Hub4Estate must pay GST under RCM @ 18% and can claim ITC.

---

### 32.2.5 Payment Regulations

**32.2.5.1 RBI Guidelines (through Razorpay)**

Hub4Estate does NOT directly handle payment data. Razorpay (PA/PG licensed entity) processes all payments.

| Requirement | How Addressed |
|-------------|---------------|
| PA/PG License | Razorpay holds the license; Hub4Estate operates through Razorpay's APIs |
| Nodal/escrow account | Razorpay Route holds funds in a nodal account; Hub4Estate never touches buyer money directly |
| T+1 settlement | Razorpay settles to Hub4Estate's bank account; dealer payouts via Razorpay Route |
| PCI-DSS compliance | Razorpay is PCI-DSS Level 1 certified; Hub4Estate never sees card numbers |
| Two-factor authentication | UPI inherently has device binding; card payments have 3DS/OTP |
| Transaction limits | UPI: ₹1L per transaction (₹2L for some banks); NEFT/RTGS: no limit |
| KYC for high-value | PAN mandatory for transactions > ₹2L (collected during registration for business accounts) |
| Refund timelines | RBI mandate: 5-7 business days for card refunds, instant for UPI |

**32.2.5.2 Escrow Flow (via Razorpay Route)**

```
Buyer pays → Razorpay holds in nodal account → Delivery confirmed by buyer
→ Razorpay releases to dealer account (minus platform commission)
→ Platform commission transferred to Hub4Estate account
```

**Compliance notes:**
- Razorpay Route is NOT a bank escrow -- it is a payment split mechanism
- Hub4Estate does not need an escrow license (Razorpay handles custody)
- Maximum hold period: 15 days (Razorpay default, can extend to 30 with approval)
- Auto-release: if buyer does not confirm/dispute within 7 days of delivery, funds auto-release to dealer

**32.2.5.3 Anti-Money Laundering (AML) Considerations**

Hub4Estate is not a "reporting entity" under PMLA 2002 (banks, NBFCs, insurance are). However:

| Measure | Implementation |
|---------|---------------|
| Suspicious transaction monitoring | Flag transactions > ₹10L single, > ₹25L monthly per user |
| Dealer KYC | PAN + GST + bank account verification |
| Transaction velocity limits | Max 10 transactions/day per buyer, max 50/day per dealer |
| No cash transactions | All payments digital via Razorpay |
| Record keeping | All transaction records retained for 8 years |
| Reporting | If suspicious pattern detected, report to internal compliance + document |

---

### 32.2.6 Labour & Employment Laws

**Current state (LLP, <10 employees):** Minimal compliance burden.
**Post-conversion + scaling:** The following become applicable:

| Law | Trigger | Hub4Estate Obligation |
|-----|---------|----------------------|
| EPF & Miscellaneous Provisions Act, 1952 | 20+ employees | Register with EPFO, contribute 12% of basic salary |
| ESI Act, 1948 | 10+ employees (some states) | Register with ESIC if employees earn < ₹21,000/month |
| Payment of Gratuity Act, 1972 | 10+ employees | Gratuity payable after 5 years of continuous service |
| Shops & Establishments Act (state-specific) | From Day 1 (Rajasthan / Karnataka) | Register establishment, comply with working hours, leave, holidays |
| Maternity Benefit Act, 1961 | 10+ employees | 26 weeks paid maternity leave |
| Sexual Harassment of Women at Workplace Act, 2013 | 10+ employees | Constitute Internal Complaints Committee (ICC) |
| Code on Wages, 2019 (when notified) | All employees | Minimum wages, equal remuneration, timely payment |

**Immediate actions (Q2 2026):**
1. Register under Rajasthan Shops & Establishments Act (or Karnataka if Bangalore is primary)
2. Set up payroll system with TDS deduction (Section 192 of Income Tax Act)
3. Issue offer letters with clear terms (role, compensation, notice period, IP assignment, confidentiality)
4. Maintain attendance/leave records from Day 1

---

### 32.2.7 Startup India / DPIIT Recognition

**Status:** Pending -- Priority #1

**Why this is Priority #1:**
1. Tax exemption under Section 80-IAC (3 consecutive years out of first 10 years)
2. Self-certification for 6 labour laws and 3 environmental laws
3. Fast-track patent examination (50% fee reduction)
4. Easy winding up (under Insolvency and Bankruptcy Code)
5. Access to Fund of Funds (₹10,000Cr corpus)
6. Exemption from angel tax (Section 56(2)(viib)) on investment premiums

**Eligibility checklist:**

| Criterion | Hub4Estate Status |
|-----------|------------------|
| Incorporated < 10 years ago | Yes (17 March 2026) |
| Turnover < ₹100Cr in any financial year | Yes (pre-revenue / minimal revenue) |
| Working towards innovation / improvement | Yes (blind matching in construction procurement) |
| Entity type: Pvt Ltd / LLP / Partnership | Yes (LLP, eligible) |
| Not formed by splitting/restructuring existing business | Yes (greenfield) |

**Application process:**

| Step | Action | Status |
|------|--------|--------|
| 1 | Register on startupindia.gov.in | To do |
| 2 | Fill application with entity details, incorporation certificate | To do |
| 3 | Describe innovation (blind matching, AI procurement, marketplace model) | Draft ready |
| 4 | Upload: Certificate of Incorporation, PAN, description of business | Documents ready |
| 5 | Submit for DPIIT review | To do |
| 6 | Receive recognition certificate | Expected: 2-4 weeks post-submission |

**Post-recognition actions:**
1. Apply for Section 80-IAC tax exemption (Inter-Ministerial Board approval)
2. Register for self-certification on Shram Suvidha Portal
3. Apply for Startup India Seed Fund if eligible

---

## 32.3 Platform Policies

### 32.3.1 Terms of Service

**Effective date:** [Launch date]
**Last updated:** [Date]
**Governing law:** Laws of India
**Jurisdiction:** Courts of Sri Ganganagar, Rajasthan (or Bangalore, Karnataka, post-relocation)

**Key clauses (summarized -- full legal document to be drafted by legal counsel):**

**32.3.1.1 Platform Nature**
```
Hub4Estate is an online marketplace that connects buyers of construction
materials (starting with electrical products) with verified dealers. Hub4Estate
is an intermediary platform and is NOT a party to any transaction between
buyers and dealers. Hub4Estate does not own, stock, or sell any products listed
on the platform.
```

**32.3.1.2 Eligibility**
```
You must be at least 18 years of age and legally competent to enter into
contracts under the Indian Contract Act, 1872, to use Hub4Estate.
By registering, you represent and warrant that you meet these requirements.
```

**32.3.1.3 Blind Matching Rules**
```
Hub4Estate operates a proprietary blind matching system. During the quoting
process:
(a) Buyer identity is concealed from dealers.
(b) Dealer identity is concealed from buyers.
(c) Identity is revealed ONLY when a buyer selects a winning quote.
(d) Any attempt to circumvent anonymity -- including but not limited to sharing
    contact details in quote descriptions, using coded language, or creating
    multiple accounts -- constitutes a violation of these Terms and will result
    in immediate account suspension or permanent termination.
(e) Hub4Estate reserves the right to void any transaction where anonymity
    circumvention is detected.
```

**32.3.1.4 Limitation of Liability**
```
To the maximum extent permitted by law, Hub4Estate's total liability arising
from or related to any transaction shall not exceed the platform fees charged
for that specific transaction (or the monthly subscription fee, whichever
is greater).

Hub4Estate is NOT liable for:
(a) Product quality, specifications, or authenticity (dealer's responsibility)
(b) Delivery delays or non-delivery (dealer/logistics partner responsibility)
(c) Pricing errors by dealers
(d) Indirect, incidental, or consequential damages
(e) Loss of business or profits arising from platform use
```

**32.3.1.5 Dispute Resolution**
```
Step 1: Platform-mediated resolution (complaint filed, both parties respond
        within 48 hours, Hub4Estate mediates within 7 days)
Step 2: If unresolved, escalation to independent mediation (mediator appointed
        by Hub4Estate, costs shared equally)
Step 3: If still unresolved, binding arbitration under the Arbitration and
        Conciliation Act, 1996. Seat: Sri Ganganagar, Rajasthan.
        Language: Hindi or English. Arbitrator: sole, appointed by Hub4Estate.
Step 4: Courts of Sri Ganganagar, Rajasthan (exclusive jurisdiction for
        any matter not subject to arbitration).
```

**32.3.1.6 Intellectual Property**
```
The Hub4Estate platform, including but not limited to its software, design,
blind matching algorithm, user interface, brand name, and logo, is the
intellectual property of HUB4ESTATE LLP (or its successor entity). Users may
not copy, modify, reverse-engineer, or create derivative works from any part
of the platform.

User-generated content (product reviews, messages, business descriptions)
remains the property of the user. By submitting content, users grant Hub4Estate
a non-exclusive, royalty-free, worldwide license to use, display, and
distribute the content in connection with platform operations.
```

**32.3.1.7 Account Termination**
```
Hub4Estate may suspend or terminate your account for:
(a) Violation of these Terms of Service
(b) Fraud or attempted fraud
(c) Blind matching circumvention
(d) Abusive behavior toward other users or Hub4Estate team
(e) Non-payment of platform fees (dealers, after 30-day grace period)
(f) Legal or regulatory requirement

You may terminate your account at any time via Settings → Delete Account.
Active subscriptions will not be refunded upon voluntary termination.
Ongoing transactions must be completed or cancelled before account deletion.
```

---

### 32.3.2 Privacy Policy

**Key sections (legal document to be drafted by counsel, this specifies requirements):**

| Section | Content |
|---------|---------|
| Data Controller | HUB4ESTATE LLP, 8-D-12, Jawahar Nagar, Sriganganagar, 335001, Rajasthan |
| Data Protection Officer (interim) | Shreshth Agarwal, shreshth.agarwal@hub4estate.com |
| Data Collected | Name, email, phone, address, business name, GSTIN, PAN (dealers), product search history, inquiry history, transaction history, device info, IP address, browser info |
| Purpose | Account management, inquiry processing, blind matching, payment processing, notifications, analytics, AI recommendations, customer support |
| Legal Basis | Consent (DPDP Act), contract performance (IT Act), legitimate interest (fraud prevention) |
| Data Sharing | Dealers (post-selection only), Razorpay (payments), MSG91/Gupshup (SMS/WhatsApp), Resend (email), Anthropic (AI, anonymized context), Google (OAuth, analytics), AWS (hosting) |
| Cross-Border Transfer | Data processed by AWS (Mumbai region primarily, global CDN), Anthropic (US), Google (US) -- informed consent obtained |
| Retention | See Section 32.2.1.4 retention schedule |
| Security | Encryption at rest + transit, RBAC, RLS, audit logging, quarterly security reviews |
| User Rights | Access, correction, erasure, portability, nomination -- all via Privacy Dashboard |
| Cookie Policy | Functional cookies (required), analytics cookies (optional, PostHog), no advertising cookies |
| Updates | Policy updates notified via email 30 days before effect; continued use = acceptance |

---

### 32.3.3 Refund & Return Policy

| Scenario | Refund Eligible | Timeline | Process |
|----------|----------------|----------|---------|
| Product materially different from listing description | Yes, full refund | Within 48 hours of delivery | Buyer raises dispute with photo evidence → dealer has 24 hours to respond → platform decides |
| Product damaged during shipping | Yes, full refund or replacement | Within 24 hours of delivery | Buyer uploads photos of damage → platform escalates to dealer → dealer arranges replacement or refund |
| Product defective (manufacturing defect) | Yes, replacement or refund | Within 7 days of delivery | Buyer reports defect → dealer validates → manufacturer warranty process or platform-mediated refund |
| Buyer changed mind (no defect) | No refund (unless dealer agrees) | -- | Hub4Estate does not mandate seller returns for change of mind; dealer may choose to accept |
| Custom/special order items | No refund | -- | Buyer acknowledged non-refundable at order placement |
| Dealer fails to deliver within committed timeline | Yes, full refund | After committed delivery date + 3-day grace | Auto-triggered if delivery not confirmed by committed date + 3 days |
| Partial delivery (quantity short) | Partial refund for undelivered quantity | Within 48 hours of delivery | Buyer reports shortage with evidence → dealer confirms → proportional refund |

**Refund method:** Original payment method (UPI → UPI, bank transfer → bank transfer)
**Refund timeline:** 5-7 business days (Razorpay processing time)
**Escrow protection:** If buyer has not confirmed delivery, funds remain in Razorpay Route and are returned to buyer upon dispute resolution

---

### 32.3.4 Dealer Agreement

**Key terms (incorporated into dealer onboarding flow):**

| Clause | Terms |
|--------|-------|
| KYC Verification | Mandatory: GSTIN, PAN, bank account details, trade license (if applicable), business address proof |
| Pricing Accuracy | Dealer commits that quoted prices are valid for the stated period. Frequent price manipulation (> 3 instances of quoting then retracting) results in warning → suspension |
| Delivery Commitment | Dealer must deliver within the timeline stated in their quote. Failure rate > 20% triggers review and potential tier downgrade |
| Response Time SLA | Dealer must respond to inquiries within 24 hours of notification. Non-response to > 5 consecutive inquiries triggers auto-deactivation |
| Blind Matching Compliance | Dealer must not attempt to identify buyers or share identity in quotes. First violation: warning. Second violation: 30-day suspension. Third violation: permanent ban |
| Platform Commission | As per the dealer's subscription plan. Commission is deducted from payout before transfer |
| Content Accuracy | Product descriptions, images, and specifications must be accurate. Deliberate misrepresentation = immediate suspension + chargeback |
| Exclusivity | Non-exclusive -- dealer may sell through other channels |
| Termination | Dealer: 30-day written notice, must fulfill all active orders. Platform: immediate for policy violations, 30-day notice for business reasons |
| Dispute Cooperation | Dealer must participate in platform dispute resolution process in good faith |
| Data Usage | Dealer consents to Hub4Estate using anonymized transaction data for platform analytics and market intelligence |

---

## 32.4 Intellectual Property

### 32.4.1 Trademark Protection

| Mark | Class | Description | Status | Priority |
|------|-------|-------------|--------|----------|
| Hub4Estate (word mark) | Class 35 | Advertising, business management, marketplace services | To be filed | P0 |
| Hub4Estate (word mark) | Class 42 | Software as a service, online platform services | To be filed | P0 |
| Hub4Estate logo (device mark) | Class 35 + 42 | Logo with "Hub4Estate" | To be filed | P1 |
| "Blind Matching" (descriptive, may not be registrable) | -- | Consider as trade secret instead | Assess registrability | P2 |

**Filing process:**
1. Trademark search on IP India portal (ipindiaonline.gov.in) to check availability
2. File TM-A form (₹4,500 for startup, ₹9,000 otherwise)
3. Examination by Trademark Registry (3-6 months)
4. Publication in Trade Marks Journal (4 months for opposition)
5. Registration certificate (if no opposition)
6. Validity: 10 years, renewable indefinitely

### 32.4.2 Domain & Digital Assets

| Asset | Status | Details |
|-------|--------|---------|
| hub4estate.com | Owned | Primary domain, registrar: [to verify] |
| hub4estate.in | To register | Indian ccTLD, defensive registration |
| hub4estate.co.in | To register | Defensive registration |
| @hub4estate (Twitter/X) | To verify/create | Brand presence |
| hub4estate (GitHub org) | Active | Code repository |
| Hub4Estate (LinkedIn page) | Active | Company page |
| hub4estate (Instagram) | To verify/create | Brand presence |

### 32.4.3 Trade Secrets

The following constitute Hub4Estate trade secrets, protected under the Indian Trade Secrets doctrine (contractual, not statutory):

1. Blind matching algorithm and implementation details
2. Dealer scoring algorithm (weights, factors, thresholds)
3. Pricing intelligence model and data pipeline
4. AI agent system prompts and tool configurations
5. Dealer network data (who stocks what, at what prices, in which zones)

**Protection measures:**
- All employees sign CNDA with specific trade secret clauses
- Code repository is private with access control
- Production database access limited to need-to-know basis
- No trade secret information in public-facing documentation
- Departure procedure: access revocation within 1 hour of termination

---

## 32.5 Insurance

| Policy | Coverage | When to Obtain | Estimated Annual Premium |
|--------|----------|---------------|------------------------|
| Cyber Liability Insurance | Data breach costs, regulatory fines, legal defense, notification costs | Before scaling beyond pilot (Q3 2026) | ₹50,000 - ₹1,50,000 |
| Professional Indemnity (Errors & Omissions) | Platform errors, incorrect pricing display, matching failures | Before first paid transaction flows through platform | ₹30,000 - ₹80,000 |
| Directors & Officers (D&O) | Personal liability protection for Shreshth + Father as designated partners/directors | Post-Pvt Ltd conversion, before fundraise | ₹40,000 - ₹1,00,000 |
| Commercial General Liability | Office premises, events, third-party bodily injury/property damage | When physical office is established | ₹15,000 - ₹40,000 |
| Workmen's Compensation | Employee injury during work (field sales executives) | When field team exceeds 5 people | ₹10,000 - ₹30,000 |

**Total insurance cost (Year 1 estimate):** ₹1,45,000 - ₹4,00,000

---

## 32.6 Compliance Calendar

| Frequency | Task | Due Date | Responsible | Penalty for Non-Compliance |
|-----------|------|----------|-------------|---------------------------|
| Monthly | GSTR-1 filing | 11th of next month | CA | ₹50/day late (max ₹5,000) |
| Monthly | GSTR-3B filing | 20th of next month | CA | ₹50/day late + interest @ 18% p.a. |
| Monthly | TDS deposit (Section 194) | 7th of next month | CA | 1.5% per month interest |
| Monthly | GSTR-8 (TCS, when applicable) | 10th of next month | CA | ₹200/day (₹100 CGST + ₹100 SGST) |
| Quarterly | TDS return (Form 26Q) | 31st of month after quarter end | CA | ₹200/day late |
| Quarterly | Advance tax installment (if applicable) | Jun 15, Sep 15, Dec 15, Mar 15 | CA | Interest under Section 234C |
| Annual | LLP Form 8 (Statement of Account) | Within 30 days of 6 months from FY end (Oct 30) | CA | ₹100/day late |
| Annual | LLP Form 11 (Annual Return) | Within 60 days of FY end (May 30) | CA | ₹100/day late |
| Annual | Income Tax Return | July 31 (no audit) / Oct 31 (if audit required) | CA | ₹5,000 - ₹10,000 penalty |
| Annual | Tax Audit (if turnover > ₹1Cr) | September 30 | CA | 0.5% of turnover (max ₹1.5L) |
| Annual | Statutory audit (post-Pvt Ltd conversion) | Before AGM (within 6 months of FY end) | Statutory auditor | Non-compliance penalties under Companies Act |
| Annual | DPT-3 (Return of Deposits, post-Pvt Ltd) | June 30 | CA/CS | ₹5,000 - ₹25,000 |
| Annual | DIR-3 KYC (Director KYC) | September 30 | Directors personally | ₹5,000 per director |
| Annual | AOC-4 + MGT-7 (post-Pvt Ltd) | Within 30 days of AGM | CA/CS | ₹100/day late per form |
| Ongoing | Compliance report (E-Commerce Rules) | Monthly, published on website | Shreshth / Compliance Lead | Loss of intermediary safe harbor |
| Ongoing | Data breach notification (DPDP) | Within 72 hours of detection | CTO / CEO | Up to ₹250 Cr |
| Ongoing | Grievance redressal | Acknowledge within 48 hours, resolve within 30 days | Customer Success | Loss of intermediary safe harbor |
| Ongoing | Content takedown requests | Action within 36 hours | Moderation team | Loss of intermediary safe harbor |

---

# SECTION 33 -- GLOSSARY & TERMINOLOGY

> *Every term used in this PRD that is not universally understood is defined below. An engineer from outside India, a lawyer who has never worked with a marketplace, or a dealer who has never used software should all be able to read the PRD by referencing this glossary. Organized alphabetically within categories.*

---

## 33.1 Hub4Estate Platform Terms

| Term | Definition |
|------|-----------|
| Blind Matching | Hub4Estate's core mechanism where buyer and dealer identities are concealed during the quoting process. Neither party knows who the other is until the buyer selects a winning quote. Prevents price discrimination, collusion, and brand bias. |
| Buyer | Any individual or business entity using Hub4Estate to procure construction materials. Not limited to contractors or builders -- includes homeowners, architects, facility managers, or anyone purchasing electrical products. |
| Dealer | A verified business entity that supplies construction materials through Hub4Estate. Must complete KYC verification. Can respond to buyer inquiries with quotes. |
| Inquiry | A buyer's procurement request submitted through Hub4Estate. Contains one or more line items, each specifying a product category, specifications, quantity, delivery location, and timeline. An inquiry enters the blind matching system and is distributed to eligible dealers. |
| Line Item | A single product requirement within an inquiry. Example: "Havells FRLS 2.5mm wire, 200 meters, red." |
| Quote | A dealer's sealed response to a buyer's inquiry. Contains pricing per line item, delivery timeline, delivery charges, validity period, and any conditions. Quotes are anonymous -- the buyer sees pricing and dealer metrics but not dealer identity. |
| Selection | The act of a buyer choosing a winning quote from the anonymized list. This is the "reveal event" -- at this moment, buyer and dealer identities are disclosed to each other. |
| Reveal Event | The precise moment when both buyer and dealer identities become visible to each other. Triggered only by buyer selecting a quote. All pre-reveal communication is anonymous. |
| Inquiry Status | The lifecycle state of an inquiry: `DRAFT` → `PUBLISHED` → `QUOTING` → `EVALUATION` → `SELECTED` → `IN_FULFILLMENT` → `DELIVERED` → `COMPLETED` → `CLOSED`. Can also enter `CANCELLED` or `DISPUTED` from certain states. |
| Dealer Score | A composite metric (0-100) calculated from a dealer's conversion rate, response time, delivery accuracy, pricing competitiveness, and dispute rate. Displayed to buyers as part of anonymous quote metadata. |
| Dealer Tier | Classification of dealers based on transaction volume and score: `STARTER` (new/low volume), `GROWTH` (moderate), `PREMIUM` (high volume + high score). Higher tiers get better visibility and lower commission rates. |
| Platform Commission | The fee Hub4Estate charges per transaction, deducted from dealer payout. Currently: subscription-based. Future: percentage-based commission on transaction value. |
| Lead Credit | A unit of value purchased by dealers on Hub4Estate. Each credit can be used to view and respond to one buyer inquiry. Part of the freemium monetization model. |
| Subscription Plan | Monthly or annual dealer plans (Starter: ₹999/mo, Growth: ₹2,499/mo, Premium: ₹4,999/mo) that include lead credits, premium features, and priority visibility. |
| Privacy Dashboard | A user-facing page (Settings → Privacy) where users can view what personal data Hub4Estate holds, export their data, manage consent preferences, and request account deletion. |
| Grievance Officer | The designated person responsible for handling user complaints under the IT Act and E-Commerce Rules. Currently: Shreshth Agarwal (interim). Contact displayed in website footer. |

---

## 33.2 Construction & Electrical Industry Terms

| Term | Definition |
|------|-----------|
| MCB | Miniature Circuit Breaker. An automatic safety device that disconnects a circuit when current exceeds a rated value. Rated in amperes (6A, 10A, 16A, 20A, 25A, 32A, 40A, 63A). Common brands: Havells, Schneider, Legrand, ABB. |
| RCCB | Residual Current Circuit Breaker. Detects earth leakage current (difference between live and neutral) and disconnects the circuit. Critical safety device for wet areas (bathrooms, kitchens). Rated in milliamperes (30mA, 100mA, 300mA). |
| MCCB | Moulded Case Circuit Breaker. Higher-rated breaker (100A-1600A) for industrial and commercial installations. Provides adjustable overload and short-circuit protection. |
| Distribution Board (DB) | An enclosure that houses MCBs, RCCBs, bus bars, and other protective devices for distributing power in a building. Available in 4-way, 6-way, 8-way, 12-way configurations. |
| FRLS | Fire Retardant Low Smoke. A type of PVC insulation on electrical cables that retards flame propagation and produces low smoke when burned. Standard for residential and commercial installations in India. |
| ZHFR | Zero Halogen Flame Retardant. Premium cable insulation that produces no halogenated acids when burned. Preferred for hospitals, data centers, and high-safety environments. |
| FR | Fire Retardant. Basic flame-retardant cable insulation. Less expensive than FRLS but produces more smoke. |
| Sq mm (mm²) | Square millimeters. The unit of measurement for cable conductor cross-sectional area. Common sizes: 0.75, 1.0, 1.5, 2.5, 4.0, 6.0, 10.0 mm². Determines current-carrying capacity. |
| BIS | Bureau of Indian Standards. The national standards body. BIS certification (ISI mark) is mandatory for many electrical products (cables, switches, MCBs). |
| ISI Mark | Certification mark issued by BIS indicating compliance with Indian Standards. Mandatory for safety-critical products. |
| MRP | Maximum Retail Price. The legally mandated maximum price at which a product can be sold to the end consumer (inclusive of all taxes). Defined under Legal Metrology Act, 2009. |
| BOQ | Bill of Quantities. An itemized list of materials, parts, and labor required for a construction project, with quantities and estimated costs. Hub4Estate's AI generates BOQs from project descriptions. |
| Conduit | A tube or channel for protecting electrical wiring. PVC conduits for concealed wiring (25mm, 32mm diameter), metal conduits for industrial use. |
| Earth Electrode | A metal conductor buried in the ground that provides a path for fault current to safely dissipate. Types: copper plate, GI pipe, chemical earthing. |
| Changeover Switch | A manual or automatic switch that transfers electrical supply from one source to another (e.g., mains to generator/inverter). |
| Isolator | A switching device used to disconnect a circuit from the power supply for maintenance. Unlike MCBs, isolators cannot interrupt fault current. |
| Lux | Unit of illumination (lumens per square meter). Used to specify lighting requirements: office (300-500 lux), residential (100-300 lux), retail (500-1000 lux). |
| Wattage (W) | Rate of energy consumption. Used to specify LED bulbs (7W, 9W, 12W, 15W, 18W, 22W), fans (50-75W), and other electrical appliances. |
| IP Rating | Ingress Protection rating (e.g., IP65, IP44). First digit: dust protection (0-6). Second digit: water protection (0-9). Critical for outdoor and bathroom fixtures. |
| Star Rating (BEE) | Energy efficiency rating (1-5 stars) assigned by the Bureau of Energy Efficiency. Mandatory for fans, ACs, refrigerators. Higher stars = less power consumption. |
| SWG | Standard Wire Gauge. An older system for measuring wire thickness, still referenced in India. Being replaced by mm² measurements. |
| Modular Switches | Modern-style switches and sockets that fit into modular plates (1M, 2M, 4M, 6M, 8M, 12M modules). Brands: Legrand, Schneider, Havells, Anchor. |
| Surge Protection Device (SPD) | Device that protects electrical equipment from voltage spikes (lightning, grid switching). Installed in distribution boards. Types 1, 2, 3. |
| DIN Rail | Standardized metal rail for mounting circuit breakers and other devices inside distribution boards. Width: 35mm (standard). |
| Bus Bar | A copper or aluminum bar in a distribution board that distributes power to individual circuit breakers. |
| ELCB | Earth Leakage Circuit Breaker. Older term, largely replaced by RCCB. Some markets still use the term interchangeably. |
| Armoured Cable | Cable with steel wire or tape armor for mechanical protection. Used for underground and outdoor installations. |
| Cable Tray | A structural support system for cables. Types: ladder, perforated, mesh, channel. Used in commercial and industrial buildings. |
| Submersible Pump | A pump designed to operate while fully submerged in water. Used for borewells, tube wells. Rated in HP (0.5, 1.0, 1.5, 2.0, 3.0, 5.0 HP). |
| Motor Starter | An electrical device that controls the starting, stopping, and protection of electric motors. Types: DOL (Direct On Line), Star-Delta, VFD. |

---

## 33.3 Business & Financial Terms

| Term | Definition |
|------|-----------|
| GMV | Gross Merchandise Value. The total value of all transactions processed through the platform before deducting returns, cancellations, and platform fees. Primary top-line metric for marketplaces. |
| ARPD | Average Revenue Per Dealer. Total platform revenue divided by number of active dealers. Key unit economics metric: target ₹3,000-8,000/month. |
| ARPU | Average Revenue Per User. Total platform revenue divided by total active users (buyers + dealers). |
| CAC | Customer Acquisition Cost. Total sales + marketing spend divided by number of new customers acquired. Target: < ₹500 for buyers, < ₹2,000 for dealers. |
| LTV | Lifetime Value. Total revenue expected from a customer over their entire relationship with the platform. Target LTV:CAC ratio > 3:1. |
| Churn Rate | Percentage of subscribers who cancel in a given period. Monthly churn target: < 5% for dealers. |
| NPS | Net Promoter Score. Customer satisfaction metric (-100 to +100). Calculated from: "How likely are you to recommend Hub4Estate to a friend?" Promoters (9-10) minus Detractors (0-6). Target: > 40. |
| MRR | Monthly Recurring Revenue. Total subscription revenue per month. Predictable revenue base. |
| ARR | Annual Recurring Revenue. MRR x 12. Used for company valuation. |
| Unit Economics | The revenue and costs associated with a single unit of business (one transaction or one dealer). Must be positive before scaling. |
| Burn Rate | Monthly cash expenditure. See Section 31.9 for Hub4Estate's projected burn. |
| Runway | Months of operation remaining at current burn rate. Runway = cash in bank / monthly burn. |
| Escrow | An arrangement where a neutral third party (Razorpay, in Hub4Estate's case) holds funds until transaction conditions are met. Buyer pays → Razorpay holds → delivery confirmed → Razorpay releases to dealer. |
| TCS | Tax Collected at Source. Under Section 52 of CGST Act, e-commerce operators must collect 1% TCS on the net value of taxable supplies made through them. |
| TDS | Tax Deducted at Source. Hub4Estate deducts TDS on payments to contractors, professionals, and rent per Income Tax Act sections. |
| INR | Indian Rupee. Hub4Estate's operating currency. All prices, budgets, and financials are in INR. |
| Paise | 1/100th of an Indian Rupee. ALL monetary values in the Hub4Estate database are stored as integers in paise to avoid floating-point precision errors. ₹100.50 = 10050 paise. |
| GSTIN | Goods and Services Tax Identification Number. 15-character alphanumeric identifier. Format: 08AATFH3466L1Z5 (state code + PAN + entity number + checksum). |
| HSN Code | Harmonized System of Nomenclature code. 4-8 digit product classification code used for GST. Example: 8536 (electrical apparatus for switching, ≤1000V). |
| SAC | Services Accounting Code. 6-digit service classification code for GST. Hub4Estate's primary SAC: 998314 (online intermediation platform services). |
| PAN | Permanent Account Number. 10-character alphanumeric Indian tax identification. Format: AATFH3466L. |
| DPIIT | Department for Promotion of Industry and Internal Trade. Government body that recognizes startups, granting access to tax benefits, self-certification, and the Startup India scheme. |
| FMV | Fair Market Value. The price at which an asset would change hands between a willing buyer and seller. Used for ESOP exercise price determination per Rule 11UA. |

---

## 33.4 Technical Terms

| Term | Definition |
|------|-----------|
| TypeScript | A typed superset of JavaScript that compiles to plain JavaScript. Hub4Estate's entire codebase (frontend + backend) uses TypeScript for type safety. |
| React 18 | A JavaScript library for building user interfaces. Hub4Estate uses React 18.3.1 with functional components and hooks. |
| Vite | A next-generation frontend build tool. Provides instant HMR (Hot Module Replacement) during development and optimized production builds via Rollup. |
| Node.js | A JavaScript runtime built on Chrome's V8 engine. Hub4Estate's backend runs on Node.js 20 LTS. |
| Express.js | A minimal web application framework for Node.js. Hub4Estate uses Express for REST API routing and middleware. |
| PostgreSQL | An open-source relational database. Hub4Estate uses PostgreSQL 15+ on AWS RDS for all structured data. |
| Prisma | A TypeScript ORM (Object-Relational Mapping) for PostgreSQL. Provides type-safe database queries, migrations, and schema management. |
| Redis | An in-memory data store used for caching, session storage, and job queues. Hub4Estate uses Upstash (serverless Redis). |
| Elasticsearch | A distributed search and analytics engine. Hub4Estate uses AWS OpenSearch for product catalog search, dealer search, and pricing intelligence. |
| BullMQ | A Redis-based job queue for Node.js. Hub4Estate uses BullMQ for background processing: notification delivery, quote evaluation, price index updates, KYC verification. |
| REST API | Representational State Transfer API. Hub4Estate's primary API architecture. All endpoints follow REST conventions (GET, POST, PUT, PATCH, DELETE). |
| JWT | JSON Web Token. A compact, URL-safe token used for API authentication. Hub4Estate issues JWTs upon login containing user_id, role, and permissions. |
| OAuth 2.0 | Authorization framework for third-party login. Hub4Estate supports Google OAuth for social sign-in. |
| OTP | One-Time Password. A temporary code sent via SMS for phone number verification and two-factor authentication. |
| SSE | Server-Sent Events. A unidirectional real-time communication protocol (server → client). Hub4Estate uses SSE for live quote updates and notification streaming. |
| WebSocket | A bidirectional real-time communication protocol. Used for live chat between buyer and dealer (post-selection). |
| RLS | Row-Level Security. PostgreSQL feature that restricts which rows a user can access based on policies. Critical for blind matching data isolation. |
| RBAC | Role-Based Access Control. Permission management system where access is determined by user role (ADMIN, BUYER, DEALER, MODERATOR). |
| CI/CD | Continuous Integration / Continuous Deployment. Automated pipeline that tests and deploys code changes. Hub4Estate uses GitHub Actions → AWS Amplify (frontend) + SCP/PM2 (backend). |
| TLS 1.3 | Transport Layer Security version 1.3. Latest cryptographic protocol for securing data in transit. Hub4Estate enforces TLS 1.3 for all HTTPS connections. |
| HSTS | HTTP Strict Transport Security. Header that forces browsers to use HTTPS. Hub4Estate sets `Strict-Transport-Security: max-age=31536000; includeSubDomains`. |
| CDN | Content Delivery Network. A distributed network of servers that delivers static assets (images, CSS, JS) from edge locations near the user. Hub4Estate uses CloudFront. |
| CORS | Cross-Origin Resource Sharing. Browser security mechanism that controls which domains can access Hub4Estate's API. Configured to allow only hub4estate.com origins. |
| CSRF | Cross-Site Request Forgery. An attack where a malicious website triggers actions on Hub4Estate using the victim's session. Prevented via SameSite cookies and CSRF tokens. |
| XSS | Cross-Site Scripting. An attack where malicious scripts are injected into web pages. Prevented via React's built-in escaping, Content Security Policy headers, and input sanitization. |
| DDoS | Distributed Denial of Service. An attack that floods the platform with traffic to cause downtime. Mitigated via Cloudflare, AWS Shield, and rate limiting. |
| Sentry | Error tracking and performance monitoring service. Hub4Estate uses Sentry to capture frontend and backend errors in real-time. |
| PostHog | Product analytics platform. Hub4Estate uses PostHog for user behavior tracking, funnel analysis, and feature flag management. |
| Zustand | A lightweight state management library for React. Hub4Estate uses Zustand for global client state (auth, cart, notifications). |
| React Query (TanStack Query) | A data-fetching library for React that handles caching, background refetching, and optimistic updates. Hub4Estate uses it for all API calls. |
| Tailwind CSS | A utility-first CSS framework. Hub4Estate uses Tailwind for all styling with a custom design token configuration. |
| Framer Motion | A React animation library. Hub4Estate uses it for page transitions, micro-interactions, and loading states. |
| Zod | A TypeScript-first schema validation library. Hub4Estate uses Zod for API request validation, form validation, and runtime type checking. |
| Resend | An email delivery service. Hub4Estate uses Resend for transactional emails (order confirmations, quote alerts, verification codes). |
| MSG91 | An Indian communication platform for SMS and OTP delivery. Hub4Estate uses MSG91 for OTP verification and transactional SMS. |
| Gupshup | A messaging platform providing WhatsApp Business API access. Hub4Estate uses Gupshup for WhatsApp notifications. |
| Razorpay | An Indian payment gateway and financial services platform. Hub4Estate uses Razorpay for payment processing, Razorpay Route for split payments/escrow, and Razorpay Payouts for dealer settlements. |
| PM2 | A Node.js process manager. Hub4Estate uses PM2 to run and monitor the Express backend on EC2. |
| SCP | Secure Copy Protocol. Used to deploy backend code to EC2 instances. |
| DLT | Distributed Ledger Technology registration. Required in India for sending commercial SMS. All SMS templates must be registered on the DLT platform (Jio, Airtel, etc.) before use. |
| pgvector | A PostgreSQL extension for vector similarity search. Used for semantic search in the AI agent system (finding similar products, caching similar queries). |
| LangChain.js | A TypeScript framework for building LLM-powered applications. Hub4Estate uses it for agent orchestration, tool calling, and conversation management. |
| Claude API | Anthropic's large language model API. Hub4Estate uses Claude for the procurement assistant, BOQ generation, price prediction, and negotiation agents. |

---

## 33.5 Indian Regulatory & Legal Terms

| Term | Definition |
|------|-----------|
| DPDP Act 2023 | Digital Personal Data Protection Act, 2023. India's primary data protection law. Governs collection, processing, storage, and transfer of personal data. Penalties up to ₹250 crore. |
| IT Act 2000 | Information Technology Act, 2000. India's primary cyber law. Provides legal recognition for electronic transactions and defines cyber crimes. |
| Section 79 (IT Act) | Intermediary safe harbor provision. Protects platforms like Hub4Estate from liability for user-generated content, provided due diligence obligations are met. |
| Consumer Protection Act, 2019 | Protects consumers from unfair trade practices, defective goods, and deficient services. Applies to e-commerce transactions. |
| E-Commerce Rules 2020 | Consumer Protection (E-Commerce) Rules, 2020. Specific obligations for marketplace and inventory-based e-commerce entities. |
| Companies Act 2013 | Primary legislation governing company incorporation, management, and dissolution in India. Relevant for LLP → Pvt Ltd conversion. |
| LLP Act 2008 | Limited Liability Partnership Act, 2008. Governs Hub4Estate's current entity structure. |
| GST | Goods and Services Tax. India's unified indirect tax. Hub4Estate charges 18% GST on platform services. |
| CGST | Central Goods and Services Tax. The central government's share of GST on intra-state supply. |
| SGST | State Goods and Services Tax. The state government's share of GST on intra-state supply. |
| IGST | Integrated Goods and Services Tax. GST on inter-state supply. Entire amount goes to central government, later apportioned. |
| RCM | Reverse Charge Mechanism. Tax liability shifts to the recipient of goods/services instead of the supplier. Applicable when Hub4Estate imports services (e.g., AWS, Anthropic). |
| ITC | Input Tax Credit. GST paid on business inputs can be claimed as credit against output GST liability. |
| ROC | Registrar of Companies. Government authority that registers and oversees companies and LLPs. |
| MCA | Ministry of Corporate Affairs. Central ministry overseeing company law administration. |
| SEBI | Securities and Exchange Board of India. Securities market regulator. Relevant for future equity fundraising compliance. |
| RBI | Reserve Bank of India. Central bank. Regulates payment systems, foreign exchange. Relevant for payment aggregator compliance (via Razorpay). |
| PMLA 2002 | Prevention of Money Laundering Act, 2002. Anti-money laundering legislation. Hub4Estate is not a reporting entity but maintains transaction monitoring. |
| FEMA 1999 | Foreign Exchange Management Act, 1999. Governs foreign investment into India. Relevant when accepting foreign VC investment. |
| Arbitration Act 1996 | Arbitration and Conciliation Act, 1996. Governs dispute resolution by arbitration. Hub4Estate's ToS mandates arbitration with seat in Sri Ganganagar. |
| Legal Metrology Act 2009 | Mandates MRP display on packaged commodities. Applies to all products listed on Hub4Estate. |
| BIS Act 2016 | Bureau of Indian Standards Act, 2016. Governs mandatory product standards and certification. Many electrical products require BIS certification. |

---

## 33.6 Abbreviations Quick Reference

| Abbreviation | Full Form |
|-------------|-----------|
| API | Application Programming Interface |
| B2B | Business-to-Business |
| B2C | Business-to-Consumer |
| BEE | Bureau of Energy Efficiency |
| CA | Chartered Accountant |
| CIN | Corporate Identification Number |
| CS | Company Secretary |
| CTO | Chief Technology Officer |
| D2C | Direct-to-Consumer |
| DAU / WAU / MAU | Daily / Weekly / Monthly Active Users |
| DB | Distribution Board (electrical) OR Database (tech context) |
| DIN | Deutsches Institut fur Normung (standard for rail-mounted devices) |
| DOL | Direct On Line (motor starter type) |
| ECS | Elastic Container Service (AWS) |
| EPF | Employees' Provident Fund |
| ESIC | Employees' State Insurance Corporation |
| ESOP | Employee Stock Ownership Plan |
| FTE | Full-Time Equivalent |
| FY | Financial Year (India: April to March) |
| GI | Galvanized Iron |
| HMR | Hot Module Replacement |
| HP | Horsepower (motor/pump rating) |
| ICC | Internal Complaints Committee (POSH Act) |
| IST | Indian Standard Time (UTC+5:30) |
| KPI | Key Performance Indicator |
| LLPIN | Limited Liability Partnership Identification Number |
| MOA | Memorandum of Association |
| AOA | Articles of Association |
| NIC | National Industrial Classification |
| ORM | Object-Relational Mapping |
| P0 / P1 / P2 / P3 | Priority levels (P0 = critical, P1 = high, P2 = medium, P3 = low) |
| PII | Personally Identifiable Information |
| POSH | Prevention of Sexual Harassment (at Workplace) |
| PR | Pull Request (engineering context) |
| PVC | Polyvinyl Chloride (conduit/cable insulation material) |
| RPO | Recovery Point Objective (maximum acceptable data loss) |
| RTO | Recovery Time Objective (maximum acceptable downtime) |
| SLA | Service Level Agreement |
| SME | Small and Medium Enterprise |
| SPD | Surge Protection Device |
| TTL | Time To Live (cache expiration) |
| TTFB | Time To First Byte |
| UPI | Unified Payments Interface |
| VFD | Variable Frequency Drive (motor control) |
| WCAG | Web Content Accessibility Guidelines |

---

# SECTION 34 -- APPENDICES

> *Reference data, taxonomies, brand databases, expansion plans, standards, and version history. Everything an engineer, sales executive, or investor needs to look up without searching through the main document.*

---

## 34.1 Appendix A: Category Taxonomy (Electrical)

### 34.1.1 Complete Hierarchy with Market Data

```
ELECTRICAL (Root Category)
│
├── 1. WIRES & CABLES
│   ├── 1.1 House Wiring Cables
│   │   ├── FR (Fire Retardant)
│   │   ├── FRLS (Fire Retardant Low Smoke)
│   │   └── ZHFR (Zero Halogen Flame Retardant)
│   │   Sizes: 0.75, 1.0, 1.5, 2.5, 4.0, 6.0, 10.0 mm²
│   │   Top 5 Brands: Havells, Polycab, Finolex, RR Kabel, KEI
│   │   Price Range: ₹8-45/meter (varies by size and type)
│   │   Common Specs: Voltage rating 1100V, conductor: electrolytic copper
│   │
│   ├── 1.2 Industrial Cables
│   │   ├── Armoured Cables (STA, XLPE)
│   │   ├── Control Cables (multi-core)
│   │   ├── Flexible Cables (multi-strand)
│   │   └── Submersible Cables (flat/round)
│   │   Top 5 Brands: Polycab, KEI, Havells, Finolex, RR Kabel
│   │   Price Range: ₹50-500/meter (varies by core count and size)
│   │
│   ├── 1.3 Coaxial Cables
│   │   ├── RG-6 (TV/satellite)
│   │   └── RG-59 (CCTV)
│   │   Top 5 Brands: Polycab, Havells, RR Kabel, Anchor, Finolex
│   │   Price Range: ₹8-25/meter
│   │
│   ├── 1.4 LAN / Networking Cables
│   │   ├── Cat5e
│   │   ├── Cat6
│   │   └── Cat6a
│   │   Top 5 Brands: D-Link, Polycab, Havells, Anchor, Digisol
│   │   Price Range: ₹10-40/meter
│   │
│   └── 1.5 Speaker / Audio Cables
│       ├── 14 AWG / 16 AWG
│       └── Transparent / PVC sheath
│       Top 3 Brands: Polycab, RR Kabel, generic
│       Price Range: ₹8-20/meter
│
├── 2. SWITCHGEAR & PROTECTION
│   ├── 2.1 MCBs (Miniature Circuit Breakers)
│   │   ├── SP (Single Pole): 6A, 10A, 16A, 20A, 25A, 32A, 40A, 63A
│   │   ├── DP (Double Pole): 6A-63A
│   │   ├── TP (Triple Pole): 6A-63A
│   │   └── TPN (Triple Pole + Neutral): 6A-63A
│   │   Curve types: B (general), C (motor), D (high inrush)
│   │   Top 5 Brands: Havells, Schneider, Legrand, ABB, Siemens
│   │   Price Range: ₹80-800/piece (varies by pole count and rating)
│   │
│   ├── 2.2 RCCBs (Residual Current Circuit Breakers)
│   │   ├── 2P (Double Pole): 25A, 40A, 63A
│   │   └── 4P (Four Pole): 25A, 40A, 63A
│   │   Sensitivity: 30mA (human protection), 100mA (fire protection), 300mA (equipment)
│   │   Top 5 Brands: Havells, Schneider, Legrand, ABB, Siemens
│   │   Price Range: ₹800-3,500/piece
│   │
│   ├── 2.3 MCCBs (Moulded Case Circuit Breakers)
│   │   Rating: 100A, 125A, 160A, 200A, 250A, 400A, 630A, 800A
│   │   Top 5 Brands: Schneider, ABB, Siemens, L&T, Havells
│   │   Price Range: ₹3,000-50,000/piece
│   │
│   ├── 2.4 Isolators
│   │   ├── Switch Disconnectors (TP, TPN)
│   │   └── Rotary Isolators
│   │   Top 5 Brands: Schneider, ABB, Havells, L&T, Siemens
│   │   Price Range: ₹500-5,000/piece
│   │
│   ├── 2.5 Changeover Switches
│   │   ├── Manual Changeover (32A, 63A, 100A)
│   │   └── Automatic Transfer Switches (ATS)
│   │   Top 5 Brands: Havells, L&T, Schneider, Salzer, Siemens
│   │   Price Range: ₹500-15,000/piece
│   │
│   ├── 2.6 Distribution Boards
│   │   ├── SPN (Single Phase + Neutral): 4-way, 6-way, 8-way, 12-way
│   │   ├── TPN (Three Phase + Neutral): 4-way, 6-way, 8-way, 12-way
│   │   └── Custom Panels
│   │   Top 5 Brands: Havells, Schneider, Legrand, ABB, L&T
│   │   Price Range: ₹300-5,000/piece (standard), ₹5,000-50,000 (custom panels)
│   │
│   └── 2.7 Surge Protection Devices (SPD)
│       ├── Type 1 (lightning protection)
│       ├── Type 2 (equipment protection)
│       └── Type 3 (sensitive equipment)
│       Top 5 Brands: Schneider, ABB, Havells, Legrand, Phoenix Contact
│       Price Range: ₹1,000-8,000/piece
│
├── 3. MODULAR SWITCHES & SOCKETS
│   ├── 3.1 Switches
│   │   ├── 1-Way Switches (6A, 10A, 16A, 20A)
│   │   ├── 2-Way Switches (6A, 10A, 16A)
│   │   ├── Dimmer Switches
│   │   ├── Bell Push
│   │   ├── Step-Type Regulator (fan speed)
│   │   └── Electronic Regulator
│   │   Top 5 Brands: Legrand, Schneider, Havells, Anchor (Panasonic), GM Modular
│   │   Price Range: ₹30-500/piece
│   │
│   ├── 3.2 Sockets
│   │   ├── 5A/6A Socket (general purpose)
│   │   ├── 16A Socket (AC, geyser, high-power)
│   │   ├── 20A Socket (industrial)
│   │   ├── USB Socket (Type-A, Type-C)
│   │   └── International Sockets (multi-standard)
│   │   Top 5 Brands: Legrand, Schneider, Havells, Anchor, GM Modular
│   │   Price Range: ₹40-600/piece
│   │
│   ├── 3.3 Plates & Frames
│   │   ├── 1M, 2M, 3M, 4M, 6M, 8M, 12M modules
│   │   ├── Materials: polycarbonate, glass, metal
│   │   └── Colors: white, black, champagne, grey, wood finish
│   │   Top 5 Brands: Legrand (Myrius/Arteor), Schneider (Unica), Havells (Pearlz), Anchor (Roma), GM
│   │   Price Range: ₹20-2,000/plate (polycarbonate to premium glass)
│   │
│   └── 3.4 Smart Switches
│       ├── Wi-Fi Switches (app-controlled)
│       ├── Touch Switches (capacitive)
│       ├── Voice-Controlled (Alexa/Google compatible)
│       └── Scene Controllers
│       Top 5 Brands: Schneider (Wiser), Legrand (Eliot), Havells (Digi), Anchor, Wipro
│       Price Range: ₹500-5,000/module
│
├── 4. LIGHTING & LUMINAIRES
│   ├── 4.1 LED Panels
│   │   ├── Round: 3W, 6W, 9W, 12W, 15W, 18W, 22W
│   │   ├── Square: 3W, 6W, 9W, 12W, 15W, 18W, 22W
│   │   └── Slim/Surface: various wattages
│   │   Color temperatures: 3000K (warm), 4000K (neutral), 6500K (cool)
│   │   Top 5 Brands: Philips, Havells, Syska, Crompton, Wipro
│   │   Price Range: ₹80-600/piece
│   │
│   ├── 4.2 LED Bulbs
│   │   Wattages: 5W, 7W, 9W, 10W, 12W, 15W, 18W, 22W, 30W, 40W, 50W
│   │   Base: B22 (bayonet), E27 (screw)
│   │   Top 5 Brands: Philips, Havells, Syska, Crompton, Wipro
│   │   Price Range: ₹50-400/piece
│   │
│   ├── 4.3 LED Tubes
│   │   Lengths: 2ft (10W), 4ft (18-22W)
│   │   Top 5 Brands: Philips, Havells, Syska, Crompton, Bajaj
│   │   Price Range: ₹100-350/piece
│   │
│   ├── 4.4 Downlights / COB Lights
│   │   Wattages: 3W, 5W, 7W, 10W, 15W, 20W
│   │   Types: fixed, adjustable, gimbal, surface-mounted
│   │   Top 5 Brands: Philips, Havells, Crompton, Osram, Wipro
│   │   Price Range: ₹150-2,000/piece
│   │
│   ├── 4.5 Strip Lights / LED Tape
│   │   Types: 2835 SMD, 5050 SMD, COB strip
│   │   Voltage: 12V, 24V
│   │   IP ratings: IP20 (indoor), IP65 (waterproof)
│   │   Top 5 Brands: Philips, Havells, Wipro, Syska, generic
│   │   Price Range: ₹40-200/meter
│   │
│   ├── 4.6 Flood Lights / Outdoor Lighting
│   │   Wattages: 10W, 20W, 30W, 50W, 100W, 150W, 200W
│   │   IP rating: IP65 or IP66
│   │   Top 5 Brands: Philips, Havells, Syska, Crompton, Wipro
│   │   Price Range: ₹300-5,000/piece
│   │
│   ├── 4.7 Street Lights
│   │   Wattages: 12W, 24W, 30W, 50W, 100W, 150W
│   │   Top 5 Brands: Philips, Havells, Wipro, Crompton, Bajaj
│   │   Price Range: ₹1,000-10,000/piece
│   │
│   └── 4.8 Decorative Lighting
│       ├── Chandeliers
│       ├── Wall Sconces
│       ├── Pendant Lights
│       ├── Track Lighting
│       └── Landscape Lighting
│       Top 5 Brands: Philips, Havells, Wipro, Jaquar, Fos Lighting
│       Price Range: ₹500-50,000/piece
│
├── 5. FANS & VENTILATION
│   ├── 5.1 Ceiling Fans
│   │   ├── Standard (48", 56"): 50-75W
│   │   ├── BLDC (energy-efficient): 28-35W
│   │   ├── Decorative / Designer
│   │   └── High-Speed
│   │   Sweep: 600mm, 900mm, 1050mm, 1200mm, 1400mm
│   │   BEE Star Rating: 1-5 stars
│   │   Top 5 Brands: Crompton, Havells, Orient, Bajaj, Usha
│   │   Price Range: ₹1,200-8,000/piece
│   │
│   ├── 5.2 Exhaust Fans
│   │   Sizes: 6", 8", 10", 12", 15"
│   │   Types: metal body, plastic body, wall-mounted, window-mounted
│   │   Top 5 Brands: Havells, Crompton, Usha, Orient, Bajaj
│   │   Price Range: ₹500-3,000/piece
│   │
│   ├── 5.3 Table / Pedestal Fans
│   │   Top 5 Brands: Bajaj, Orient, Usha, Crompton, Havells
│   │   Price Range: ₹1,000-4,000/piece
│   │
│   └── 5.4 Industrial Fans
│       Top 3 Brands: Crompton, Havells, Bajaj
│       Price Range: ₹3,000-15,000/piece
│
├── 6. EARTHING & LIGHTNING PROTECTION
│   ├── 6.1 Earthing Electrodes
│   │   ├── Copper Plate Earthing
│   │   ├── GI Pipe Earthing
│   │   ├── Chemical Earthing (maintenance-free)
│   │   └── Copper Bonded Ground Rods
│   │   Top 5 Brands: JMV, Axis, Supreme, Safe Earthing, Generic
│   │   Price Range: ₹1,500-15,000/set
│   │
│   ├── 6.2 Earthing Wire / Strip
│   │   ├── Bare Copper Wire (8, 10, 12 SWG)
│   │   ├── GI Strip (25x3mm, 25x6mm)
│   │   └── Green PVC Insulated Earth Wire
│   │   Price Range: ₹20-100/meter
│   │
│   └── 6.3 Lightning Arresters
│       ├── ESE (Early Streamer Emission)
│       ├── Conventional (Franklin Rod)
│       └── Surge Arresters
│       Top 5 Brands: JMV, Indelec, DEHN, Axis, Pentair
│       Price Range: ₹5,000-50,000/piece
│
├── 7. CONDUITS & ACCESSORIES
│   ├── 7.1 PVC Conduits
│   │   ├── Light duty (LMS): 20mm, 25mm
│   │   ├── Heavy duty (HMS): 20mm, 25mm, 32mm
│   │   └── Flexible PVC
│   │   Top 5 Brands: Precision, Anchor, Finolex, Supreme, National
│   │   Price Range: ₹5-20/meter
│   │
│   ├── 7.2 Metal Conduits (GI)
│   │   Sizes: 20mm, 25mm, 32mm, 40mm, 50mm
│   │   Top 3 Brands: Precision, Swastik, generic
│   │   Price Range: ₹30-100/meter
│   │
│   ├── 7.3 Flexible Conduits
│   │   ├── PVC flexible
│   │   └── Metal flexible (galvanized steel)
│   │   Price Range: ₹15-60/meter
│   │
│   ├── 7.4 Junction Boxes
│   │   ├── Concealed (for wall embedding)
│   │   ├── Surface mount
│   │   └── Weatherproof (IP65+)
│   │   Top 5 Brands: Anchor, Legrand, Havells, Schneider, GM
│   │   Price Range: ₹15-200/piece
│   │
│   └── 7.5 Cable Trays
│       ├── Ladder Type
│       ├── Perforated Type
│       ├── Mesh Type
│       └── Channel Type
│       Materials: GI, aluminum, stainless steel
│       Top 3 Brands: Mars, Super, generic
│       Price Range: ₹200-1,000/meter
│
├── 8. MOTORS & PUMPS
│   ├── 8.1 Submersible Pumps
│   │   HP ratings: 0.5, 1.0, 1.5, 2.0, 3.0, 5.0, 7.5, 10.0
│   │   Types: single phase, three phase
│   │   Top 5 Brands: CRI, Crompton, Kirloskar, Havells, V-Guard
│   │   Price Range: ₹5,000-50,000/piece
│   │
│   ├── 8.2 Monoblock Pumps
│   │   HP ratings: 0.5, 1.0, 1.5, 2.0
│   │   Top 5 Brands: Crompton, Kirloskar, CRI, Havells, Lubi
│   │   Price Range: ₹3,000-15,000/piece
│   │
│   └── 8.3 Motor Starters
│       ├── DOL Starters (up to 5HP)
│       ├── Star-Delta Starters (5-50HP)
│       └── VFD (Variable Frequency Drives)
│       Top 5 Brands: L&T, Schneider, ABB, Siemens, Havells
│       Price Range: ₹500-50,000/piece
│
└── 9. SMART HOME & AUTOMATION
    ├── 9.1 Smart Switches (Wi-Fi / Zigbee / Z-Wave)
    │   Top 5 Brands: Schneider (Wiser), Legrand, Havells, Wipro, Aqara
    │   Price Range: ₹500-5,000/module
    │
    ├── 9.2 Smart Plugs
    │   Top 5 Brands: TP-Link, Wipro, Havells, Amazon, generic
    │   Price Range: ₹500-2,000/piece
    │
    ├── 9.3 Smart Locks
    │   ├── Fingerprint
    │   ├── PIN code
    │   ├── Card/NFC
    │   └── App-controlled
    │   Top 5 Brands: Godrej, Yale, Samsung, Spider, Ozone
    │   Price Range: ₹5,000-30,000/piece
    │
    └── 9.4 Home Automation Hubs / Controllers
        ├── Alexa-compatible
        ├── Google Home-compatible
        └── Proprietary (Schneider Wiser, Legrand)
        Top 5 Brands: Amazon (Echo), Google (Nest), Schneider, Legrand, Aqara
        Price Range: ₹3,000-15,000/piece
```

---

## 34.2 Appendix B: Brand Database

### 34.2.1 Complete Brand Reference

| # | Brand | Parent Company | Origin | Categories | Price Segment | BIS Certified | Hub4Estate Priority |
|---|-------|---------------|--------|-----------|---------------|---------------|-------------------|
| 1 | Havells | Havells India Ltd | India | Wires, Cables, MCBs, Switches, Fans, Lighting, Water Heaters, Pumps | Mid-Premium | Yes | P0 |
| 2 | Polycab | Polycab India Ltd | India | Wires, Cables, Switches, Fans, Lighting, Conduits | Mid-Premium | Yes | P0 |
| 3 | Finolex | Finolex Cables Ltd | India | Wires, Cables, Switches, Conduits | Budget-Mid | Yes | P0 |
| 4 | Anchor (Panasonic) | Panasonic Life Solutions | India/Japan | Switches, Sockets, MCBs, Conduits, Accessories | Mid | Yes | P0 |
| 5 | Legrand | Legrand SA | France | Switches, Sockets, MCBs, Distribution Boards, Cable Management | Premium | Yes | P0 |
| 6 | Schneider Electric | Schneider Electric SE | France | MCBs, RCCBs, Switches (Unica), Distribution, Automation | Premium | Yes | P0 |
| 7 | ABB | ABB Ltd | Switzerland | MCBs, MCCBs, Motor Starters, Distribution, Automation | Premium | Yes | P1 |
| 8 | Siemens | Siemens AG | Germany | MCBs, MCCBs, Motor Starters, Drives | Premium | Yes | P1 |
| 9 | L&T Electrical | Larsen & Toubro Ltd | India | MCBs, MCCBs, Motor Starters, Contactors, Cables | Mid-Premium | Yes | P1 |
| 10 | Crompton | Crompton Greaves Consumer | India | Fans, Lighting, Pumps, Geysers | Mid | Yes | P0 |
| 11 | Orient Electric | CK Birla Group | India | Fans, Lighting, Switches, Water Heaters | Mid | Yes | P1 |
| 12 | Bajaj Electricals | Bajaj Electricals Ltd | India | Fans, Lighting, Water Heaters, Appliances | Budget-Mid | Yes | P1 |
| 13 | Usha | Usha International Ltd | India | Fans, Water Heaters, Kitchen Appliances | Budget-Mid | Yes | P2 |
| 14 | Philips (Signify) | Signify NV | Netherlands | LED Lighting (bulbs, panels, tubes, outdoor) | Premium | Yes | P0 |
| 15 | Syska | SSK Group | India | LED Lighting, Wires, Accessories | Budget-Mid | Yes | P1 |
| 16 | Wipro Lighting | Wipro Enterprises Ltd | India | LED Lighting, Smart Lighting | Mid | Yes | P1 |
| 17 | RR Kabel | RR Global | India | Wires, Cables (house wiring, industrial, telecom) | Mid | Yes | P1 |
| 18 | KEI Industries | KEI Industries Ltd | India | Wires, Cables (house wiring, EHV, industrial) | Mid-Premium | Yes | P1 |
| 19 | GM Modular | Goldmedal Electricals | India | Switches, Sockets, Plates, Accessories | Budget-Mid | Yes | P2 |
| 20 | V-Guard | V-Guard Industries Ltd | India | Stabilizers, Water Heaters, Pumps, Fans, Wires | Mid | Yes | P2 |
| 21 | Kirloskar | Kirloskar Group | India | Pumps, Motors, Generators | Mid-Premium | Yes | P2 |
| 22 | CRI Pumps | CRI Fluid Systems Pvt Ltd | India | Submersible Pumps, Monoblock Pumps, Motors | Mid | Yes | P2 |
| 23 | Osram | ams-OSRAM AG | Germany | LED Lighting (specialty, automotive, architectural) | Premium | Yes | P2 |
| 24 | Jaquar Lighting | Jaquar Group | India | Decorative Lighting, Bathroom Lighting | Premium | Partial | P2 |
| 25 | Precision Conduits | Precision Pipes & Profiles | India | PVC Conduits, Fittings, Accessories | Mid | Yes | P1 |
| 26 | Supreme Conduits | Supreme Industries Ltd | India | PVC Conduits, Piping | Mid | Yes | P2 |
| 27 | D-Link | D-Link Corporation | Taiwan | Networking Cables, Switches, Routers | Mid | Partial | P2 |
| 28 | TP-Link | TP-Link Technologies | China | Smart Plugs, Smart Bulbs, Networking | Budget-Mid | Partial | P3 |
| 29 | Godrej Locks | Godrej & Boyce | India | Smart Locks, Electronic Locks, Safes | Mid-Premium | Yes | P2 |
| 30 | Yale | ASSA ABLOY | USA/Sweden | Smart Locks, Digital Door Locks | Premium | Partial | P3 |
| 31 | JMV (Jyoti Metal Works) | JMV LPS Ltd | India | Earthing, Lightning Protection | Mid | Yes | P2 |
| 32 | DEHN | DEHN SE | Germany | Surge Protection, Lightning Protection | Premium | Yes | P3 |
| 33 | Salzer Electronics | Salzer Electronics Ltd | India | Changeover Switches, Rotary Switches | Mid | Yes | P2 |
| 34 | Indo Asian | Indo Asian Fusegear | India | Switches, MCBs, Distribution Boards | Budget-Mid | Yes | P2 |
| 35 | Standard Electricals | Standard Industries Ltd | India | Fans, Water Heaters | Budget | Yes | P3 |
| 36 | Phoenix Contact | Phoenix Contact GmbH | Germany | Industrial Connectors, Surge Protection, Automation | Premium | Yes | P3 |
| 37 | Hager | Hager Group | Germany | MCBs, RCCBs, Distribution Boards | Mid-Premium | Yes | P3 |
| 38 | C&S Electric | C&S Electric Ltd | India | MCBs, MCCBs, Switchgear, Distribution | Mid | Yes | P2 |
| 39 | Lubi Pumps | Lubi Industries LLP | India | Submersible Pumps, Monoblock Pumps | Budget-Mid | Yes | P3 |
| 40 | Aqara | Aqara (Lumi United Technology) | China | Smart Home Sensors, Switches, Hubs (Zigbee) | Mid | Partial | P3 |

### 34.2.2 Brand Onboarding Priority

| Priority | Brands | Rationale |
|----------|--------|-----------|
| P0 (Launch) | Havells, Polycab, Finolex, Anchor, Legrand, Schneider, Crompton, Philips | Covers 80%+ of residential electrical demand in Tier 2/3 cities |
| P1 (Month 2-3) | ABB, Siemens, L&T, Orient, Bajaj, Syska, Wipro, RR Kabel, KEI, Precision | Expands industrial + commercial coverage |
| P2 (Month 4-6) | GM Modular, V-Guard, Kirloskar, CRI, Osram, Jaquar, Supreme, JMV, Salzer, Indo Asian, C&S, Godrej | Long-tail brands, niche categories |
| P3 (Month 7+) | D-Link, TP-Link, Yale, DEHN, Standard, Phoenix Contact, Hager, Lubi, Aqara | Smart home + industrial specialty |

---

## 34.3 Appendix C: City Expansion Roadmap

### 34.3.1 Phased Expansion Plan

| Phase | Cities | Timeline | Target Dealers | Target Active Buyers | Revenue Target (MRR) | Sales Team Required |
|-------|--------|----------|---------------|---------------------|---------------------|-------------------|
| Pilot | Sri Ganganagar | Q2 2026 (current) | 10 → 20 | 10 → 50 | ₹20,000 - ₹50,000 | Shreshth (solo) |
| Phase 1 | Jaipur, Jodhpur, Udaipur | Q3 2026 | 50 (20+15+15) | 300 (150+80+70) | ₹1,50,000 - ₹3,00,000 | 1 Sales Executive (Jaipur-based) |
| Phase 2 | Mumbai, Pune, Ahmedabad | Q4 2026 | 200 (100+60+40) | 1,500 (800+400+300) | ₹5,00,000 - ₹10,00,000 | 2 Sales Executives (Mumbai, Pune) |
| Phase 3 | Bangalore, Hyderabad, Chennai | Q1 2027 | 500 (200+150+150) | 5,000 (2500+1500+1000) | ₹15,00,000 - ₹25,00,000 | 3 Sales Executives (1 per city) |
| Phase 4 | Delhi NCR, Kolkata, Lucknow | Q2 2027 | 1,000 (500+300+200) | 15,000 (8000+4000+3000) | ₹40,00,000 - ₹60,00,000 | 5 Sales Executives (2 NCR, 1 each) |
| Phase 5 | Tier 2 cities (20+): Chandigarh, Indore, Bhopal, Kochi, Coimbatore, Visakhapatnam, Patna, Ranchi, Raipur, Nagpur, Nashik, Surat, Vadodara, Rajkot, Trivandrum, Mysore, Guwahati, Dehradun, Agra, Kanpur | Q3-Q4 2027 | 3,000 | 50,000 | ₹1,00,00,000+ | Regional sales managers + local reps |

### 34.3.2 City Selection Criteria

Each city is evaluated on these factors (scored 1-5, weighted):

| Factor | Weight | Measurement |
|--------|--------|-------------|
| Construction activity volume | 30% | New building permits, cement consumption, real estate launches |
| Electrical dealer density | 25% | Number of electrical wholesale markets, registered dealers |
| Internet penetration (smartphone) | 15% | TRAI data on broadband/mobile subscribers |
| Shreshth's network reach | 10% | Personal/family/mentor connections in the city |
| Competition (existing marketplaces) | 10% | Presence of IndustryBuying, Moglix, GrowthFalcon |
| Logistics infrastructure | 10% | Delivery partner coverage, average delivery time |

### 34.3.3 City-Specific Notes

| City | Key Electrical Markets | Language | Notes |
|------|----------------------|----------|-------|
| Sri Ganganagar | Station Road market, Purani Abadi | Hindi (Rajasthani) | Home base. Family network. Pilot city. |
| Jaipur | Chandpole, Johari Bazaar, Mansarovar | Hindi | Rajasthan capital. Large construction boom. Shreshth has connections. |
| Jodhpur | Sojati Gate, Station Road | Hindi (Marwari) | Marble/stone industry (Satvario synergy). Electrical demand from hotels/heritage. |
| Udaipur | Suraj Pol, Hathi Pol | Hindi (Mewari) | Tourism-driven hospitality construction. Premium segment. |
| Mumbai | Lamington Road, Lohar Chawl, Crawford Market | Hindi / Marathi | Largest electrical wholesale market in India. High volume, high competition. |
| Pune | Rasta Peth, Laxmi Road | Marathi / Hindi | IT-driven residential boom. Modern buyers, tech-savvy. |
| Ahmedabad | Relief Road, Kalupur | Gujarati / Hindi | Strong trader community. High dealership density. |
| Bangalore | SP Road, BVK Iyengar Road | Kannada / Hindi / English | Tech capital. Smart home demand. Shreshth's current base. |
| Hyderabad | Begum Bazaar, General Bazaar | Telugu / Hindi | Pharma city + IT corridor driving construction. |
| Chennai | Parry's Corner, Broadway | Tamil / Hindi / English | Conservative market. Strong local brand loyalty. |
| Delhi NCR | Bhagirath Palace (Asia's largest electrical market) | Hindi | Massive volume. Price-sensitive. Extremely competitive. |
| Kolkata | Chandni Chowk (Kolkata), Burrabazar | Bengali / Hindi | Traditional market. Slow digital adoption. |
| Lucknow | Aminabad, Chowk | Hindi | UP capital. Government construction projects. |

---

## 34.4 Appendix D: Indian Electrical Standards Reference

### 34.4.1 Key Indian Standards (IS) for Electrical Products

| Standard | Title | Applicable Products | Hub4Estate Relevance |
|----------|-------|--------------------|--------------------|
| IS 694:2010 | PVC insulated cables for voltages up to and including 1100V | House wiring cables (FR, FRLS, ZHFR) | Product specification verification, BIS compliance check |
| IS 732:2019 | Code of practice for electrical wiring installations | Wiring practice guidelines | BOQ generator reference, AI agent knowledge base |
| IS 3854:2019 | Switches for domestic and similar purposes | Modular switches, sockets | Product specification verification |
| IS 8828:1996 | MCBs for AC circuits up to 63A | Miniature Circuit Breakers | Product specification verification |
| IS 12640-1:2000 | RCCBs without integral overcurrent protection | RCCBs | Product specification verification |
| IS 13947 (Parts 1-4) | Low-voltage switchgear and controlgear | MCCBs, contactors, isolators | Product specification verification |
| IS 374:2019 | Ceiling fans | Ceiling fans | BEE rating verification |
| IS 302 (Part 2/Section 30) | Electric luminaires | LED panels, bulbs, tubes | Product specification verification |
| IS 10322 (Parts 1-8) | Luminaires | Various lighting fixtures | Product specification verification |
| IS 15885:2010 | GLS lamps used as self-ballasted LED lamps | LED bulbs | Product specification verification |
| IS 16102 (Parts 1-2) | Self-ballasted LED lamps for general lighting | LED retrofit lamps | Product specification verification |
| IS 1293:2019 | Plugs and socket-outlets | Sockets (5A, 6A, 16A, 20A) | Product specification verification |
| IS 3043:2018 | Code of practice for earthing | Earthing electrodes, conductors | BOQ generator reference |
| IS 2309:1989 | Protection of buildings and structures against lightning | Lightning arresters | Product specification verification |

### 34.4.2 National Electrical Code of India 2011 (NEC)

The NEC is published by BIS (IS/SP 30:2011) and is the primary reference for electrical installation practices in India.

**Key sections relevant to Hub4Estate's BOQ generator:**

| NEC Section | Topic | Hub4Estate Use |
|-------------|-------|---------------|
| Part 1, Section 3 | Selection and erection of electrical equipment | Material selection logic for AI agent |
| Part 1, Section 4 | Protection against electric shock | RCCB/earthing recommendation logic |
| Part 1, Section 5 | Protection against overcurrent | MCB sizing calculations |
| Part 2 | Wiring systems (concealed, surface, conduit sizing) | Conduit and cable quantity estimation in BOQ |
| Part 7 | Requirements for special installations (bathrooms, swimming pools, agricultural) | Context-specific recommendations |
| Part 8 | Energy efficiency and conservation | BEE-rated product recommendations |

### 34.4.3 Energy Conservation Building Code (ECBC) 2017

| Requirement | Hub4Estate Integration |
|-------------|----------------------|
| Connected load limits for lighting (W/m²) | AI agent recommends lighting within ECBC limits |
| BEE star rating for equipment | Product catalog displays BEE rating, filter by star rating |
| Power factor requirements | Recommendation for PF correction capacitors |
| Solar readiness for new buildings | Future: solar product category |

---

## 34.5 Appendix E: PRD Version History

| Version | Date | Author | Sections | Lines | Key Changes |
|---------|------|--------|----------|-------|------------|
| 1.0 | 2026-04-08 | Claude (CTO) | 22 sections | ~10,629 | Initial comprehensive PRD: architecture, features, database, API, security, testing, deployment |
| 2.0 | 2026-04-08 | Claude (CTO) | 34 sections | ~25,000+ | Complete rewrite with forensic detail: executive foundation, gap analysis, market architecture, tech stack audit (actual vs. target), database schema (exact SQL), security hardening, agentic AI systems, design system tokens, scraping/intelligence, CRM/lifecycle, search/knowledge graph, file structure, team/hiring, legal/compliance, glossary, appendices |

### 2.0 Section Index

| Section | Title | File | Lines (Approx.) |
|---------|-------|------|-----------------|
| 1 | Executive Foundation | section-01-executive-foundation.md | 800 |
| 2 | Forensic Audit & Gap Analysis | section-02-audit-gap-analysis.md | 900 |
| 3 | Market Architecture | section-03-04-market-architecture.md | 600 |
| 4 | System Architecture | section-03-04-market-architecture.md | 700 |
| 5 | Technology Stack | section-05-06-techstack-database.md | 800 |
| 6 | Database Schema | section-05-06-techstack-database.md | 1,200 |
| 7 | Security Architecture | section-07-08-security-ai.md | 800 |
| 8 | AI/ML Architecture | section-07-08-security-ai.md | 700 |
| 9 | Agentic Systems | section-09-10-agents-design.md | 900 |
| 10 | Design System | section-09-10-agents-design.md | 800 |
| 11-18 | Features, Flows, APIs | (various section files) | ~6,000 |
| 19 | Competitive Intelligence & Scraping | section-19-20-scraping-crm.md | 600 |
| 20 | CRM & Lifecycle | section-19-20-scraping-crm.md | 600 |
| 21-22 | Testing, Performance, DevOps | (section files) | ~1,400 |
| 23 | Search & Knowledge Graph | section-23-24-search-filestructure.md | 800 |
| 24 | File & Folder Structure | section-23-24-search-filestructure.md | 700 |
| 25-30 | Monetization, Analytics, Mobile, Integrations | (section files) | ~3,600 |
| 31 | Team Structure & Hiring Plan | section-31-34-team-compliance-appendix.md | 700 |
| 32 | Legal & Compliance | section-31-34-team-compliance-appendix.md | 1,000 |
| 33 | Glossary & Terminology | section-31-34-team-compliance-appendix.md | 400 |
| 34 | Appendices | section-31-34-team-compliance-appendix.md | 700 |

---

## 34.6 Appendix F: Document Map (Traceability Matrix)

This matrix maps every PRD section to the code files, database tables, and infrastructure components it will produce.

### 34.6.1 Section → Code File Mapping

| PRD Section | Primary Code Files Produced | Database Tables | Infrastructure |
|-------------|---------------------------|-----------------|---------------|
| §1 (Executive Foundation) | `README.md`, `packages/shared/constants/company.ts` | -- | -- |
| §2 (Audit & Gap Analysis) | Technical debt tickets in Linear | -- | -- |
| §3-4 (Architecture) | `packages/api/src/server.ts`, `docker-compose.yml`, `infrastructure/` | -- | AWS EC2, RDS, Redis, Elasticsearch |
| §5 (Tech Stack) | `tsconfig.base.json`, `turbo.json`, `package.json` (all) | -- | -- |
| §6 (Database) | `packages/api/prisma/schema.prisma`, `packages/api/prisma/migrations/` | ALL tables (users, dealers, products, inquiries, quotes, orders, payments, etc.) | RDS PostgreSQL |
| §7 (Security) | `packages/api/src/middleware/auth.middleware.ts`, `rbac.middleware.ts`, `rateLimit.middleware.ts`, `packages/api/src/config/security.ts` | `audit_logs`, `user_sessions`, `consent_records` | WAF, SSL, Cloudflare |
| §8 (AI/ML) | `packages/api/src/integrations/claude/`, `packages/api/src/services/ai/` | `ai_token_usage`, `agent_sessions`, `agent_messages` | Anthropic API |
| §9 (Agentic Systems) | `packages/api/src/agents/`, `packages/api/src/services/token-ledger.service.ts` | `negotiation_sessions`, `ai_conversations` | Redis (agent state cache) |
| §10 (Design System) | `packages/web/src/styles/`, `packages/web/tailwind.config.ts`, `packages/web/src/components/ui/` | -- | -- |
| §11-14 (Features) | `packages/web/src/app/`, `packages/api/src/routes/`, `packages/api/src/controllers/`, `packages/api/src/services/` | Feature-specific tables per section | -- |
| §15-16 (Inquiry & Quote) | `packages/api/src/routes/inquiries.routes.ts`, `quotes.routes.ts`, `packages/web/src/app/(dashboard)/buyer/inquiries/`, `packages/web/src/app/(dashboard)/dealer/quotes/` | `inquiries`, `inquiry_items`, `quotes`, `quote_items`, `quote_evaluations` | -- |
| §17-18 (Orders & Payments) | `packages/api/src/routes/orders.routes.ts`, `payments.routes.ts`, `packages/api/src/integrations/razorpay/` | `orders`, `order_items`, `order_tracking`, `payments`, `payment_transactions`, `escrow_accounts` | Razorpay API |
| §19 (Scraping) | `packages/api/src/jobs/priceIntelligence.job.ts`, `packages/api/src/services/scraping/` | `price_intelligence`, `competitor_prices`, `market_indices` | Proxy service, BullMQ |
| §20 (CRM) | `packages/api/src/services/lifecycle/`, `packages/api/src/jobs/notification.job.ts` | `crm_events`, `user_segments`, `campaigns` | MSG91, Resend, Gupshup |
| §21-22 (Testing/DevOps) | `.github/workflows/`, `packages/api/tests/`, `packages/web/tests/`, `playwright.config.ts` | -- | GitHub Actions, Sentry, PostHog |
| §23 (Search) | `packages/api/src/integrations/elasticsearch/`, `packages/api/src/services/search/` | Elasticsearch indices: `products`, `dealers`, `inquiries` | AWS OpenSearch |
| §24 (File Structure) | Entire repository structure | -- | -- |
| §25-26 (Monetization) | `packages/api/src/services/billing/`, `packages/api/src/routes/subscriptions.routes.ts` | `subscriptions`, `invoices`, `subscription_plans`, `lead_credits` | Razorpay Subscriptions |
| §27-28 (Analytics) | `packages/web/src/app/(dashboard)/*/analytics/`, `packages/api/src/routes/analytics.routes.ts` | `analytics_events`, `dashboard_snapshots` | PostHog, Grafana |
| §29-30 (Mobile) | `packages/mobile/` (React Native/Expo) | -- | App Store, Play Store |
| §31 (Team) | Hiring docs, offer letter templates | -- | -- |
| §32 (Legal) | `packages/web/src/app/legal/`, privacy policy, terms of service pages | `consent_records`, `compliance_logs` | -- |
| §33 (Glossary) | -- (reference only) | -- | -- |
| §34 (Appendices) | `packages/shared/constants/categories.ts`, `packages/shared/constants/brands.ts`, `packages/api/prisma/seed.ts` | Seed data for `categories`, `brands`, `cities` | -- |

### 34.6.2 Database Table → PRD Section Mapping

| Table | Defined In | Used By Sections |
|-------|-----------|-----------------|
| `users` | §6 | §7, §9, §11-14, §15-16, §20, §27 |
| `user_profiles` | §6 | §11, §14, §20 |
| `dealers` | §6 | §13, §15-16, §19, §25, §32 |
| `dealer_kyc` | §6 | §13, §32 |
| `products` | §6 | §12, §19, §23, §34.1 |
| `categories` | §6 | §12, §23, §34.1 |
| `brands` | §6 | §12, §23, §34.2 |
| `inquiries` | §6 | §15, §9 (agents), §27 |
| `inquiry_items` | §6 | §15 |
| `quotes` | §6 | §16, §9 (negotiation agent), §27 |
| `quote_items` | §6 | §16 |
| `orders` | §6 | §17, §27 |
| `payments` | §6 | §18, §32 |
| `audit_logs` | §7 | §32 |
| `ai_token_usage` | §9 | §8, §27 |
| `consent_records` | §32 | §32 |
| `subscriptions` | §25 | §25, §27 |
| `analytics_events` | §27 | §27, §28 |
| `cities` | §6 | §34.3 |
| `notification_preferences` | §20 | §20 |

### 34.6.3 API Endpoint → PRD Section Mapping

| Endpoint Group | Route File | Defined In | Controller | Service |
|---------------|-----------|-----------|------------|---------|
| `POST /api/v1/auth/*` | `auth.routes.ts` | §11 | `auth.controller.ts` | `auth.service.ts` |
| `GET/POST /api/v1/users/*` | `users.routes.ts` | §14 | `users.controller.ts` | `users.service.ts` |
| `GET/POST /api/v1/inquiries/*` | `inquiries.routes.ts` | §15 | `inquiries.controller.ts` | `inquiries.service.ts` |
| `GET/POST /api/v1/quotes/*` | `quotes.routes.ts` | §16 | `quotes.controller.ts` | `quotes.service.ts` |
| `GET/POST /api/v1/orders/*` | `orders.routes.ts` | §17 | `orders.controller.ts` | `orders.service.ts` |
| `POST /api/v1/payments/*` | `payments.routes.ts` | §18 | `payments.controller.ts` | `payments.service.ts` |
| `GET /api/v1/catalog/*` | `catalog.routes.ts` | §12 | `catalog.controller.ts` | `catalog.service.ts` |
| `GET/POST /api/v1/dealers/*` | `dealers.routes.ts` | §13 | `dealers.controller.ts` | `dealers.service.ts` |
| `POST /api/v1/ai/*` | `ai.routes.ts` | §8, §9 | `ai.controller.ts` | `agent.service.ts` |
| `GET /api/v1/analytics/*` | `analytics.routes.ts` | §27 | `analytics.controller.ts` | `analytics.service.ts` |
| `GET/POST /api/v1/admin/*` | `admin.routes.ts` | §14 | `admin.controller.ts` | `admin.service.ts` |
| `GET/POST /api/v1/notifications/*` | `notifications.routes.ts` | §20 | `notifications.controller.ts` | `notification.service.ts` |
| `GET/POST /api/v1/subscriptions/*` | `subscriptions.routes.ts` | §25 | `subscriptions.controller.ts` | `billing.service.ts` |

---

## 34.7 Appendix G: Competitor Reference

| Competitor | Type | Focus | Geography | Key Differentiator | Hub4Estate Advantage |
|-----------|------|-------|-----------|-------------------|---------------------|
| Moglix | B2B marketplace | Industrial MRO, electrical, safety | India (national) | Large catalog, enterprise contracts | Blind matching (Moglix has open pricing). Hub4Estate protects buyers from price discrimination. |
| IndustryBuying | B2B marketplace | Industrial supplies, electrical | India (national) | Wide category coverage | Hub4Estate's AI procurement assistant + BOQ generator. IB has no intelligence layer. |
| GrowthFalcon | B2B procurement | Construction materials | India (Rajasthan + Gujarat) | Regional focus, builder relationships | Hub4Estate's blind matching is unique. GF is traditional dealer-broker model. |
| MaterialTree | B2B marketplace | Construction materials | India (South) | Curated catalog, verified suppliers | Hub4Estate serves anyone (not just builders). Wider market. |
| Amazon Business | B2B marketplace | Everything | India (national) | Scale, logistics, trust | Hub4Estate has construction-specific expertise, blind matching, and dealer relationship depth Amazon cannot match. |
| Infra.Market | B2B marketplace | Construction materials | India (national) | Vertical integration, own brands | Hub4Estate is asset-light (marketplace only). Lower capital requirement. Blind matching unique. |
| BuildNext | Home construction | End-to-end home building | India (Kerala, Karnataka) | Full-service construction management | Different market: Hub4Estate is procurement-focused, BuildNext is full construction. |
| ContractorBhai | Service marketplace | Contractor/architect discovery | India (Mumbai, Pune) | Verified contractors, project management | Hub4Estate focuses on material procurement. ContractorBhai focuses on labor. Complementary. |

---

## 34.8 Appendix H: Risk Register

| # | Risk | Probability | Impact | Mitigation | Owner |
|---|------|-------------|--------|-----------|-------|
| R1 | CTO hire takes >6 months | Medium | High | Two P0 engineers + PRD provide technical direction. CTO inherits, not starts from scratch. | Shreshth |
| R2 | Dealer adoption in new cities is slow | Medium | High | Start with warm introductions via local electrical association contacts. First 10 dealers per city via personal visits. | Sales Executive |
| R3 | Competitor copies blind matching | Low | Medium | First-mover advantage + execution speed + network effects. File trademark for "Blind Matching" if registrable. | Shreshth |
| R4 | DPDP Act enforcement catches us unprepared | Low | Very High | Compliance built from Day 1 (Section 32.2.1). Privacy dashboard, consent management, data retention -- all shipped now. | CTO |
| R5 | Razorpay changes pricing or terms | Low | Medium | Keep Cashfree as backup payment processor. Abstract payment layer (Section 18) to enable hot-swap. | CTO |
| R6 | Cash burn exceeds projections | Medium | High | ₹83L Year 1 budget assumes aggressive hiring. Fallback: defer Q4 hires by 1 quarter, saving ~₹15L. | Shreshth |
| R7 | AWS costs spike with scale | Medium | Medium | Monitoring + alerts at 80% of budget. Spot instances for non-critical workloads. CDN for static asset offload. | DevOps |
| R8 | AI hallucination causes wrong pricing recommendation | Medium | High | Safety rails in AI agent: all price recommendations include source citation + confidence score. Human review for >₹50K orders. | CTO |
| R9 | Dealer collusion (sharing bids outside platform) | Low | Medium | Analytics detect correlated pricing patterns. Randomized inquiry distribution. Penalty system. | CTO + Operations |
| R10 | LLP → Pvt Ltd conversion delayed | Medium | Medium | Start process in Q2 2026 (not tied to fundraise). Budget ₹65K for worst case. | CA + Legal |
| R11 | Key engineer leaves before cliff | Medium | High | Competitive compensation + equity. Quarterly 1:1s to catch issues early. Knowledge sharing culture (no single points of failure). | Shreshth |
| R12 | Data breach / security incident | Low | Very High | Security architecture (Section 7), breach protocol (Section 32.2.1.5), cyber insurance (Section 32.5). | CTO |

---

*End of Sections 31-34. This concludes the Hub4Estate Definitive PRD v2.*

*Founder: Shreshth Agarwal | Platform: Hub4Estate | LLPIN: ACW-4269 | Version: 2.0 | Date: 2026-04-08*