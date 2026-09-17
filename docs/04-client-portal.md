# 04 — Government Client Portal

Base path: `/client`. Entry via `/client/signin`. Default landing: `/client/dashboard`.

The client shell mirrors the console shell (248px sidebar + top bar) but with client navigation. The top bar carries the global **Projects** selector (default **All Projects**), scoped to only the projects the client is assigned to.

## 4.1 Sign in — `/client/signin`
- Government login screen (demo credentials, backend Auth later).

## 4.2 Dashboard — `/client/dashboard`
- Request KPIs (open, in progress, resolved, etc.).
- **SLA widget** (met / at risk / breached).
- **Recent requests table**.
- Reacts to the global Projects filter.

## 4.3 Create Request — `/client/create`
The guided catalogue, kept simple and non-technical:
- "What do you need help with?" → pick a **category** → pick a **sub-category**.
- Fill in the guided request form (title, description, link, attachments, comment).
- **Attachment drag & drop** supported.
- The **Project** field defaults to the currently selected project in the global filter.

## 4.4 My Requests — `/client/requests`
- List of the requester's requests with status, priority, SLA.
- Scoped by the global Projects filter.
- Row click opens the request detail.

## 4.5 Request detail — `/client/requests/:id`
Tabs:
- **Details** — full request info.
- **Conversation** — client ↔ Siyana messages.
- **Timeline** — progress history.
- **Verification** — when work is ready, the client reviews and verifies / requests changes.

## 4.6 Draft Approval Request — `/client/draft-approvals`
- For draft requests raised by requesters that a **Nodal Officer** must approve before they go live.
- The sidebar shows a live count badge of items pending approval.

## 4.7 Notifications — `/client/notifications`
- In-app notification feed for the client user.

## 4.8 Profile — `/client/profile`
- The **exact same settings module** as the console Settings page (see doc 07):
  - Personal details
  - Notification preferences (Email + In-app toggles)
  - Organization card
  - Projects card
  - Security / Change Password flow
- Only the surrounding header/sidebar differ between the two portals — the content and behaviour are 1:1.