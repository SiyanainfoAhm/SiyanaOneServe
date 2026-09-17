# 05 — User Management (Invite / Edit)

Screen: `/console/users`

## 5.1 Overview

The Users screen is the place Siyana admins manage people. It contains:
- Stat cards at the top (the fourth counts **Inactive Users**).
- A searchable table: **Name, Email, Role, Organization, Team, Status, assigned Projects**.
- Row actions: **Edit** (opens the Edit User form).
- Primary action: **Invite User** (opens the Invite User form).

Both forms share one component so **Invite** and **Edit** behave identically.

## 5.2 Status — binary only

A user is either:

- **Active**
- **Inactive**

> There is **no** "On Leave" and **no** "Invited" status anywhere in the product. The table badge and the Edit form status dropdown only ever show Active / Inactive. Newly invited users land as **Active**.

## 5.3 Invite User form — fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Full name | text | Yes | |
| Email | email | Yes | Login email |
| Role | dropdown | Yes | All roles from doc 02 |
| Organization | dropdown | Yes | Built from the real organization list (Siyana + MGSU, HAU, Department of Revenue, State Health Mission, etc.) so it stays in sync with projects |
| Team | dropdown | Conditional | **Hidden** for government roles (see 5.5). Shown for Siyana staff. |
| Assign projects | multi-checkbox | No | Every project (name + org · code). Header shows how many are selected. |

### Layout note
- **Organization** sits next to **Role**.
- **Assign projects** renders as a checkbox list of all projects.

## 5.4 Unique invitation password rule

The system auto-generates a unique password for each invited user using this exact rule:

```
first 3 letters of Organization
+ first 3 letters of first name
+ "@"
+ today's day-of-month
```

**Example:** Name **Mihir**, Organization **Siyana**, invited on the 16th →
> `SiyMih@16`

- "Siy" = first 3 of *Siyana*, "Mih" = first 3 of *Mihir*, "@" separator, "16" = today's date.
- The day changes automatically each day.
- The generator lives in `src/utils/credentials.ts`.

## 5.5 Rule: hide Team for government roles

When **Government Nodal Officer** or **Government Requester** is selected as the role:
- The **Team** dropdown disappears.
- A short note explains that government roles do not belong to a Siyana team.

For every Siyana staff role the Team dropdown shows normally. Applies to both Invite and Edit.

## 5.6 Invitation mail content

After pressing **Send Invitation**, a confirmation screen shows the exact mail content that goes to the user, including:

- **Name**
- **Email**
- **Organization**
- **Unique password** (highlighted)
- **Assigned projects**

> **Note:** With no email service connected, the mail content is shown in-app in that confirmation screen rather than physically delivered. To actually deliver it, an email service (e.g. Resend) must be wired up.

## 5.7 Edit User form

The Edit User form:
- Comes **pre-filled** with the selected user's details.
- Contains the same fields as Invite, plus a **Status** dropdown (Active / Inactive).
- Lets the admin change role, team, organization, assigned projects and status.
- On **Save Changes**, the row updates instantly with a confirmation toast.

## 5.8 Table display

- Each government user shows a small **Projects** badge next to their organization indicating assigned projects.
- The table reacts to the global Projects filter (see doc 06).