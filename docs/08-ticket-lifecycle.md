# 08 — Ticket Lifecycle, SLA & Verification

## 8.1 Ticket states

| State | Meaning |
|-------|---------|
| `draft` | Created by a requester, not yet submitted |
| `need_approval` | Waiting for Nodal Officer approval |
| `new` | Submitted, not yet assigned |
| `assigned` | Assigned to a team/user |
| `in_progress` | Being worked on |
| `resolved` | Work done, awaiting verification |
| `closed` | Verified and closed |

Additional display states used in the client portal include **Need Approval** (drives the sidebar badge on Draft Approval Request).

## 8.2 Priorities
- Critical
- High
- Normal
- Low

Priority drives the SLA target and the queue ordering.

## 8.3 SLA rules

- Each **project** defines SLA target hours **per priority** (critical / high / normal / low).
- Each ticket gets an `sla_due_at` deadline based on its priority.
- SLA states: **met**, **at risk**, **breached**.
- The **SLA Monitor** (`/console/sla`) lists tickets with a live countdown to the deadline.

## 8.4 Assignment workflow

On the ticket workbench, staff set:
- **Team** (content / development / qa) — Siyana tickets only.
- **Assignee** (a specific user).
- **Priority**.

Assignment events are recorded in the ticket timeline for audit.

## 8.5 Verification & closure

1. Staff mark a ticket **resolved**.
2. It enters the **verification** queue.
3. The **Nodal Officer** (client side) reviews the **Verification** tab and either:
   - **Verifies** → ticket moves to **closed**, or
   - **Requests changes** → ticket goes back for rework.
4. Every step is written to the ticket **timeline** for a full audit trail.

## 8.6 Conversation vs internal notes

- **Conversation:** messages visible to the client (`visibility = client`).
- **Internal notes:** Siyana-only notes (`visibility = internal`), never shown to the client.

## 8.7 Timeline / audit events

Recorded event types include: `created`, `assigned`, `status_changed`, `verification_requested`, `closed` (and approval events). Each event stores the actor and a note.