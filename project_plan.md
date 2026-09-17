# Siyana OneServe

## 1. Project Description

**Siyana OneServe** is a unified Government IT Service Management & Support Portal built by Siyana Info Solutions Pvt. Ltd.

It is **not** a generic complaint portal, a Jira clone, or a project management tool. It is a government-facing IT service management platform with two distinct experiences:

- **Government Client Portal** — government departments raise requests, upload documents, track progress, give clarification, and verify completed work. Feels simple and non-technical.
- **Siyana Internal Operations Console** — Siyana teams manage multiple government projects, review requests, assign teams, resolve issues, track SLA, and maintain audit history.

**Hierarchy:** Siyana OneServe → Government Organization → Project → Service Requests / Tickets → Execution → Verification → Closure

**Target users:**
- Government Requester — creates requests, replies, uploads documents.
- Government Nodal Officer — views project requests, approves, verifies completion.
- Siyana roles — Super Admin, Operations Admin, Project Manager, BA, Developer, Tester.

## 2. Page Structure

### Landing
- `/` — Portal selector (choose Siyana Console or Government Client Portal)

### Siyana Internal Operations Console
- `/console/signin` — Staff login
- `/console/dashboard` — Global Dashboard (KPI cards, charts, SLA widget, recent tickets)
- `/console/queue` — Ticket Queue (filters + table)
- `/console/tickets/:id` — Ticket Workbench (info / conversation+timeline / actions)
- `/console/projects` — Projects
- `/console/sla` — SLA Monitor
- `/console/reports` — Reports
- `/console/users` — Users
- `/console/settings` — Settings

### Government Client Portal
- `/client/signin` — Government login
- `/client/dashboard` — Client dashboard (request KPIs, SLA widget, recent requests)
- `/client/create` — Create Request form (category → sub-category → link / attachment / comment)
- `/client/requests` — My Requests
- `/client/requests/:id` — Ticket detail (Details / Conversation / Timeline)
- `/client/draft-approvals` — Draft Approval Request
- `/client/notifications` — Notifications
- `/client/profile` — Profile

## 3. Core Features

- [x] Portal selector landing
- [x] Siyana staff login (demo)
- [x] Internal console shell (sidebar + topbar)
- [x] Global Dashboard: KPI cards, ticket trend chart, distribution charts, SLA widget, recent tickets
- [x] Ticket Queue with filters (project, status, priority, date, assignee)
- [x] Ticket Workbench: info panel, conversation + timeline, internal notes, actions
- [x] Assignment workflow (team, user, priority)
- [x] SLA Monitor (met / at risk / breached)
- [x] Verification queue
- [x] Reports (project performance, SLA report, team performance)
- [x] Projects, Users, Settings
- [x] Government login (demo)
- [x] Client dashboard
- [x] Guided service catalogue
- [x] Content Update request form (sections, attachment drag & drop)
- [x] Client ticket detail with Details / Conversation / Timeline / Verification tabs
- [x] Notifications, Help, Profile

## 4. Data Model Design

> Not connected yet. Data is served from realistic mock files under `src/mocks/` for design preview.
> When a backend is connected, these tables will be created.

### Table: organizations
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| name | text | e.g. MGSU, HAU |
| type | text | Government organization type |
| created_at | timestamptz | Created time |

### Table: projects
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| organization_id | uuid | FK → organizations |
| name | text | e.g. Website Portal |
| code | text | e.g. MGSU-WEB |
| status | text | active / on_hold / closed |
| owner_id | uuid | FK → users (Project Manager) |

### Table: users
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| full_name | text | Full name |
| email | text | Login email |
| role | text | government_requester / government_nodal_officer / super_admin / ops_admin / project_manager / ba / developer / tester |
| organization_id | uuid | FK → organizations (for government users) |
| team | text | content / development / qa |

### Table: tickets
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| ticket_no | text | e.g. MGSU-2026-00125 |
| organization_id | uuid | FK → organizations |
| project_id | uuid | FK → projects |
| category | text | website_content / software_app / technical_support |
| request_type | text | content_update, bug, access, etc. |
| title | text | Request title |
| description | text | Requirement details |
| status | text | draft / need_approval / new / assigned / in_progress / resolved |
| priority | text | critical / high / normal / low |
| requester_id | uuid | FK → users |
| assignee_id | uuid | FK → users |
| team | text | content / development / qa |
| sla_due_at | timestamptz | SLA deadline |
| created_at | timestamptz | Created time |

### Table: ticket_messages
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| ticket_id | uuid | FK → tickets |
| author_id | uuid | FK → users |
| body | text | Message body |
| visibility | text | client / internal |
| created_at | timestamptz | Created time |

### Table: ticket_events
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| ticket_id | uuid | FK → tickets |
| actor_id | uuid | FK → users |
| event_type | text | created / assigned / status_changed / verification_requested / closed |
| note | text | Audit note |
| created_at | timestamptz | Created time |

### Table: attachments
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| ticket_id | uuid | FK → tickets |
| file_name | text | Original file name |
| file_path | text | Storage path |
| file_size | bigint | Size in bytes |
| uploaded_by | uuid | FK → users |

### Table: project_sla
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| project_id | uuid | FK → projects |
| priority | text | critical / high / normal / low |
| resolution_hours | int | Target resolution hours (set per project) |

## 5. Backend / Third-party Integration Plan

- **Database:** Not connected now — realistic demo data under `src/mocks/`. Can be switched to Readdy Backend or SaaS Supabase later.
- **Authentication:** Not connected now — demo login screens. Will use Backend Auth later (government users vs Siyana staff).
- **File storage:** Not connected now — attachment uploads will use Backend Storage later.
- **Shopify / Stripe / Toss / PayPal:** Not needed.
- **Email:** Not needed yet. May use Resend later for ticket notification emails.

## 6. Development Phase Plan

### Phase 1: Siyana Console — Foundation, Login & Global Dashboard
- Goal: Design system, app shell for the internal console, staff login, and the operational control center.
- Deliverable: Portal selector landing, Siyana staff login, console shell (sidebar + topbar), Global Dashboard with KPI cards, ticket trend chart, ticket distribution charts, SLA widget, and recent tickets table — all on realistic demo data.

### Phase 2: Ticket Queue & Ticket Workbench
- Goal: The core operational screens.
- Deliverable: Ticket Queue with working filters (project, status, priority, assignee, date) + search + pagination, and the 3-panel Ticket Workbench (ticket info, conversation + timeline, actions) with internal notes, status changes, and assignment.

### Phase 3: SLA Monitor, Verification & Reports
- Goal: Service performance and governance.
- Deliverable: SLA Monitor (met / at risk / breached) with remaining-time table, Verification queue with approve / need-changes actions, and Reports (project performance, SLA report, team performance).

### Phase 4: Projects, Users, My Work & Settings
- Goal: Complete the internal console navigation.
- Deliverable: Projects list + project detail, Users management table, My Work queue, and Settings page.

### Phase 5: Government Client Portal — Login, Dashboard & Service Catalogue
- Goal: The government experience, kept simple and non-technical.
- Deliverable: Government login, client dashboard (request KPIs, SLA widget, recent requests), and the guided "What do you need help with?" service catalogue.

### Phase 6: Request Form, Ticket Detail & Support Pages
- Goal: Complete the client journey from submission to verification.
- Deliverable: Content Update request form (all sections + attachment drag & drop), client ticket detail (Details / Conversation / Timeline / Verification), My Requests, Waiting For Me, Notifications, Help, and Profile.