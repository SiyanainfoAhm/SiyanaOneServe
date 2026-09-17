# 06 — Project Scope Filtering

## 6.1 The idea

There is **one global Projects selector** in the top bar of both portals. Whatever project you pick there instantly filters the data shown on the main pages. This replaces the old, non-functional organization dropdown (admin) and the old label-only project dropdown (client).

## 6.2 The selector

- **Location:** top bar of both the Console and the Client portal.
- **Default value:** **All Projects**.
- **No organization-level filter** on the top menu — there is a single **Projects** option only.
- **Options:**
  - Siyana staff → every project.
  - Government users → only the projects they are assigned to.
- Shared state lives in one small store: `src/hooks/useProjectScope.ts` (single source of truth).

## 6.3 What it filters

### Console (admin)
- Global Dashboard (KPI tiles + recent tickets + widgets)
- Ticket Queue
- SLA Monitor
- Reports
- Projects list
- Users

### Client portal
- Dashboard
- My Requests
- Recent requests table

## 6.4 Feedback on screen

- **Ticket Queue:** shows a filter banner when a project is active.
- **SLA Monitor:** shows a "filtered to …" hint when a project is active.
- **Reports:** shows a "filtered to …" hint when a project is active.

## 6.5 Behaviour rules

- Selecting e.g. **MGSU Website Portal** shows only that project's tickets, SLA rows, report numbers, projects and users.
- **All Projects** shows everything the signed-in user is allowed to see.
- Both portals share the **same** selector and the **same** filtering behaviour, so the experience is consistent.
- The **Assigned projects** field on users (doc 05) is what makes a client's project list meaningful.

## 6.6 Prefill in forms

The **Project** field in request forms (console and client) defaults to the currently selected project from this global filter, so a user creating a request while filtered keeps context.