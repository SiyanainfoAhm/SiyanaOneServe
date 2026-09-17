# 01 — Product Overview

## 1.1 What Siyana OneServe is

**Siyana OneServe** is a unified **Government IT Service Management & Support Portal** built by **Siyana Info Solutions Pvt. Ltd.**

It is explicitly **not**:
- a generic complaint portal,
- a Jira clone,
- a generic project-management tool.

It is a government-facing IT service management platform. Government departments raise requests; Siyana's internal teams review, assign, resolve, and track them against SLA; the government verifies and closes the work — with a full audit trail.

## 1.2 The two experiences

The product has two completely separate experiences that share one design language:

1. **Government Client Portal** — for government staff. Kept simple and non-technical. They raise requests, upload documents, track progress, give clarifications, and verify completed work.
2. **Siyana Internal Operations Console** — for Siyana teams. They manage multiple government projects, review requests, assign teams, resolve issues, track SLA, and maintain audit history.

A single **Landing page** (`/`) acts as the portal selector so a user can choose which side to enter.

## 1.3 Hierarchy

```
Siyana OneServe
  └── Government Organization        (e.g. MGSU, HAU, Department of Revenue)
        └── Project                  (e.g. MGSU Website Portal / MGSU-WEB)
              └── Service Request / Ticket
                    └── Execution → Verification → Closure
```

Every ticket belongs to exactly one project, and every project belongs to exactly one organization. This chain is what powers the global **Projects** filter (see doc 06).

## 1.4 Target users

**Government side**
- Government Requester — creates requests, replies, uploads documents.
- Government Nodal Officer — views all project requests, approves, verifies completion.

**Siyana side**
- Super Admin
- Operations Admin
- Project Manager
- Business Analyst (BA)
- Developer
- Tester

Full permissions for each role are in [02-roles-and-permissions.md](02-roles-and-permissions.md).

## 1.5 Service categories

Requests fall into three top-level categories, each with sub-categories:

1. **Website Content** — content updates, new pages, banners, document uploads.
2. **Software / Application** — new features, changes, integrations.
3. **Technical Support** — bugs, access issues, downtime, performance.

## 1.6 Design & technical baseline

- **Framework:** React + TypeScript SPA (Vite), TailwindCSS.
- **Design system:** five colour roles only — `background`, `primary`, `accent`, `secondary`, `foreground` — consumed via scale tokens (e.g. `bg-primary-500`, `text-foreground-950`).
- **Style:** minimal, small refined typography, `rounded-lg` cards / `rounded-md` controls / `rounded-full` pills, no heavy shadows, subtle purposeful animation.
- **Layout:** desktop-first, minimum content width 1024px, responsive fallbacks for smaller screens (sidebar collapses to a drawer, grids reflow).
- **Icons:** Remix Icon (linear) + Font Awesome via CDN.
- **Data:** realistic mock data under `src/mocks/` until a backend is connected.