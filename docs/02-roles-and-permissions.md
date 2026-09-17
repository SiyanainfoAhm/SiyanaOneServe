# 02 — Roles & Permissions

## 2.1 Role list

| Role key | Display name | Side | Belongs to a Team? |
|----------|--------------|------|--------------------|
| `government_requester` | Government Requester | Client | **No** |
| `government_nodal_officer` | Government Nodal Officer | Client | **No** |
| `super_admin` | Super Admin | Console | Yes |
| `ops_admin` | Operations Admin | Console | Yes |
| `project_manager` | Project Manager | Console | Yes |
| `ba` | Business Analyst | Console | Yes |
| `developer` | Developer | Console | Yes |
| `tester` | Tester | Console | Yes |

## 2.2 Government roles

### Government Requester
- Creates service requests (via the guided catalogue).
- Replies on their own tickets, uploads documents.
- Tracks progress and status of their own requests.
- Sees only the projects they are assigned to.
- **Cannot** be assigned to a Siyana team.

### Government Nodal Officer
- Sees all requests within the project(s) assigned to them.
- Approves draft requests raised by requesters.
- Verifies and confirms completed work.
- Sees only the projects they are assigned to.
- **Cannot** be assigned to a Siyana team.

## 2.3 Siyana roles

| Role | Scope |
|------|-------|
| **Super Admin** | Full access to every organization, project, user, ticket, SLA and report. Manages users and settings. |
| **Operations Admin** | Day-to-day operations: queue, assignment, SLA, reports. Manages users. |
| **Project Manager** | Owns assigned projects; reviews tickets, assigns teams, monitors SLA. |
| **Business Analyst (BA)** | Requirement analysis, clarification with the client, documentation on tickets. |
| **Developer** | Works assigned tickets, updates status, adds internal notes. |
| **Tester** | Verifies resolved tickets, raises issues back when needed. |

## 2.4 Rule: Team is only for Siyana staff

> **This is a hard rule throughout the product.**

Government roles (`government_requester`, `government_nodal_officer`) do **not** belong to any Siyana team.

Wherever a **Team** selector appears:
- For a Siyana staff role → the Team dropdown is shown normally.
- For a government role → the Team field is **hidden automatically**, replaced by a short note explaining that government roles are not part of a team.

This applies to both the **Invite User** form and the **Edit User** form. Nobody can accidentally assign a team to a government user.

## 2.5 Rule: Project visibility

- A **Siyana** user sees **all** projects in the Projects selector.
- A **Government** user sees **only the projects they are assigned to** in the Projects selector.

This is enforced by the global project scope (see doc 06).

## 2.6 Rule: User status is binary

A user account has exactly **two** states:

- **Active** — the user can sign in and work.
- **Inactive** — access is disabled.

There is **no** "On Leave" or "Invited" state anywhere in the product. Newly invited users land as **Active**. See [05-user-management.md](05-user-management.md).