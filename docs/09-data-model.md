# 09 — Data Model

> **Not connected yet.** The product currently runs on realistic demo data under `src/mocks/`.
> When a backend is connected (Readdy Backend or SaaS Supabase), these tables will be created with proper Row Level Security.

## 9.1 organizations

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| name | text | e.g. MGSU, HAU, Department of Revenue |
| type | text | Government organization type |
| created_at | timestamptz | Created time |

## 9.2 projects

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| organization_id | uuid | FK → organizations |
| name | text | e.g. Website Portal |
| code | text | e.g. MGSU-WEB |
| status | text | active / on_hold / closed |
| owner_id | uuid | FK → users (Project Manager) |

## 9.3 users

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| full_name | text | Full name |
| email | text | Login email |
| role | text | government_requester / government_nodal_officer / super_admin / ops_admin / project_manager / ba / developer / tester |
| organization_id | uuid | FK → organizations (government users) |
| team | text | content / development / qa — **null for government roles** |
| status | text | **active / inactive only** |
| project_ids | uuid[] | Projects assigned to the user |

> **Notes**
> - `status` is binary only — no "on_leave", no "invited".
> - `team` is only meaningful for Siyana staff; government roles never have a team.
> - `project_ids` drives which projects a client can see in the global filter.

## 9.4 tickets

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
| status | text | draft / need_approval / new / assigned / in_progress / resolved / closed |
| priority | text | critical / high / normal / low |
| requester_id | uuid | FK → users |
| assignee_id | uuid | FK → users |
| team | text | content / development / qa |
| sla_due_at | timestamptz | SLA deadline |
| created_at | timestamptz | Created time |

## 9.5 ticket_messages

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| ticket_id | uuid | FK → tickets |
| author_id | uuid | FK → users |
| body | text | Message body |
| visibility | text | client / internal |
| created_at | timestamptz | Created time |

## 9.6 ticket_events

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| ticket_id | uuid | FK → tickets |
| actor_id | uuid | FK → users |
| event_type | text | created / assigned / status_changed / verification_requested / closed |
| note | text | Audit note |
| created_at | timestamptz | Created time |

## 9.7 attachments

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| ticket_id | uuid | FK → tickets |
| file_name | text | Original file name |
| file_path | text | Storage path |
| file_size | bigint | Size in bytes |
| uploaded_by | uuid | FK → users |

## 9.8 project_sla

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| project_id | uuid | FK → projects |
| priority | text | critical / high / normal / low |
| resolution_hours | int | Target resolution hours (set per project) |

## 9.9 Relationships

```
organizations 1 ──< projects 1 ──< tickets
organizations 1 ──< users
users (requester) ──< tickets
users (assignee)  ──< tickets
tickets 1 ──< ticket_messages
tickets 1 ──< ticket_events
tickets 1 ──< attachments
projects 1 ──< project_sla
```

## 9.10 Integration plan

- **Database:** switch mock files → Readdy Backend or SaaS Supabase tables with RLS.
- **Authentication:** demo login → Backend Auth (separate government vs Siyana staff).
- **File storage:** attachment uploads → Backend Storage.
- **Email:** invitation + ticket notifications → Resend (optional, later).