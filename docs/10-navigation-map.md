# 10 — Navigation Map

Complete route map for both portals. All internal links use the client-side router (no full-page reloads), and every route resolves without a broken link.

## 10.1 Landing

| Route | Screen |
|-------|--------|
| `/` | Portal selector (choose Siyana Console or Government Client Portal) |
| `*` | Not Found |

## 10.2 Siyana Internal Operations Console

| Route | Screen | Sidebar group |
|-------|--------|---------------|
| `/console` | → redirects to `/console/dashboard` | — |
| `/console/signin` | Staff login | — |
| `/console/dashboard` | Global Dashboard | Operations |
| `/console/create` | Create Request | Operations |
| `/console/queue` | Ticket Queue | Operations |
| `/console/tickets/:id` | Ticket Workbench | (from Queue) |
| `/console/projects` | Projects | Operations |
| `/console/projects/:code` | Project detail | (from Projects) |
| `/console/sla` | SLA Monitor | Operations |
| `/console/reports` | Reports | Operations |
| `/console/users` | Users | Administration |
| `/console/settings` | Settings | Administration |
| `/console/notifications` | Notifications | (top bar bell) |

## 10.3 Government Client Portal

| Route | Screen | Sidebar group |
|-------|--------|---------------|
| `/client` | → redirects to `/client/dashboard` | — |
| `/client/signin` | Government login | — |
| `/client/dashboard` | Dashboard | Service |
| `/client/create` | Create Request (guided catalogue) | Service |
| `/client/requests` | My Requests | Service |
| `/client/requests/:id` | Request detail (Details / Conversation / Timeline / Verification) | (from My Requests) |
| `/client/draft-approvals` | Draft Approval Request | Service |
| `/client/profile` | Profile (shared settings module) | Account |
| `/client/notifications` | Notifications | (top bar bell) |

## 10.4 Shell behaviour

- **Sidebar:** fixed 248px on desktop (`lg:` and up); collapses to a slide-in drawer with an overlay on smaller screens.
- **Top bar:** global **Projects** selector (default **All Projects**), notification bell, user identity.
- **Sidebar badges:** Ticket Queue shows the open-queue count; Draft Approval Request shows the pending-approval count.
- **Active state:** current route is highlighted with a primary accent bar and tinted background.
- **Sign out:** available at the bottom of both sidebars.

## 10.5 Navigation rules

1. **No broken links** — every sidebar item, breadcrumb and in-page link must resolve to a real route.
2. **Router links only** — internal navigation uses the router (SPA), never raw anchors or full reloads.
3. **Consistent heights** — where multiple navigation bars exist, keep their heights aligned.
4. **No top-bar max width** — the top bar spans full width.