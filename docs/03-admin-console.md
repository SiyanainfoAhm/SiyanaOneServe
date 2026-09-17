# 03 — Siyana Internal Operations Console

Base path: `/console`. Entry via `/console/signin`. Default landing: `/console/dashboard`.

The console shell is a fixed 248px left sidebar + a top bar. The top bar carries the global **Projects** selector (see doc 06), the notification bell, and the user identity. The sidebar is grouped into **Operations** and **Administration**.

## 3.1 Sign in — `/console/signin`
- Staff login screen (demo credentials, backend Auth later).
- On success, lands on the Global Dashboard.

## 3.2 Global Dashboard — `/console/dashboard`
The operational control center.
- **KPI cards:** total tickets, open tickets, SLA at risk / breached, resolved this period.
- **Ticket trend chart:** tickets created vs resolved over time.
- **Ticket distribution:** by category and by priority.
- **SLA widget:** met / at-risk / breached summary.
- **Team workload:** load per Siyana team.
- **Recent tickets table:** latest tickets with quick status/priority info.
- **Reacts to the global Projects filter** — pick a project and every widget scopes to it.

## 3.3 Create Request — `/console/create`
- Lets staff raise a request on behalf of a government department.
- Uses the same guided request form as the client side.
- The **Project** field defaults to the currently selected project in the global filter.

## 3.4 Ticket Queue — `/console/queue`
- The master list of tickets.
- **Filters:** project, status, priority, date range, assignee.
- **Search + pagination.**
- Scoped by the global Projects filter; when a project is active a filter banner shows on the page.
- Row click opens the ticket workbench.

## 3.5 Ticket Workbench — `/console/tickets/:id`
Three-panel layout:
1. **Ticket info** — number, requester, organization, project, category, priority, SLA, status.
2. **Conversation + Timeline** — client-visible messages and the internal audit timeline; internal notes can be added here (not visible to the client).
3. **Actions** — assign team/user, change priority, change status, request verification, close.

## 3.6 Projects — `/console/projects` and detail `/console/projects/:code`
- List of all projects (name, organization, code, status, owner).
- Project detail: overview, tickets, SLA targets, team.
- Scoped by the global Projects filter.

## 3.7 SLA Monitor — `/console/sla`
- Table of tickets with remaining time and SLA state: **met / at risk / breached**.
- Countdown cell shows time remaining until the SLA deadline.
- Shows a "filtered to …" hint when a project filter is active.

## 3.8 Reports — `/console/reports`
- **Project performance** report.
- **SLA report** (met / at risk / breached over time).
- **Team performance** report.
- Shows a "filtered to …" hint when a project filter is active.

## 3.9 Users — `/console/users`
- User management table: name, email, role, organization, team, status, assigned projects.
- Stat cards at the top; the fourth card counts **Inactive Users**.
- **Invite User** and **Edit User** actions (see doc 05).
- Scoped by the global Projects filter.

## 3.10 Settings — `/console/settings`
- Shared settings module identical to the government Profile page (see doc 07):
  - Personal details
  - Notification preferences
  - Organization card
  - Projects card
  - Security / Change Password

## 3.11 Notifications — `/console/notifications`
- In-app notification feed for the staff user.