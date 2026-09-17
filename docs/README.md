# Siyana OneServe — Requirements Documentation

This folder holds the complete requirement set for **Siyana OneServe**, the Government IT Service Management & Support Portal built by Siyana Info Solutions Pvt. Ltd.

These documents describe the product **as designed and built**, page by page, feature by feature, rule by rule. They are the single source of truth for what the platform must do.

## How to read these docs

| # | Document | What it covers |
|---|----------|----------------|
| 1 | [01-product-overview.md](01-product-overview.md) | Product purpose, hierarchy, the two portals, and the tech/design baseline |
| 2 | [02-roles-and-permissions.md](02-roles-and-permissions.md) | Every user role, what they can see and do, and the rules that follow |
| 3 | [03-admin-console.md](03-admin-console.md) | Every screen in the Siyana Internal Operations Console |
| 4 | [04-client-portal.md](04-client-portal.md) | Every screen in the Government Client Portal |
| 5 | [05-user-management.md](05-user-management.md) | Invite/Edit users, statuses, password rule, invitation mail |
| 6 | [06-project-scope-filtering.md](06-project-scope-filtering.md) | The global Projects selector and how it filters every page |
| 7 | [07-account-settings.md](07-account-settings.md) | The shared Settings / Profile module (both portals) |
| 8 | [08-ticket-lifecycle.md](08-ticket-lifecycle.md) | Ticket states, SLA rules, verification and closure |
| 9 | [09-data-model.md](09-data-model.md) | Tables, fields and relationships |
| 10 | [10-navigation-map.md](10-navigation-map.md) | Full route map for both portals |

## Current status

- **Backend / Auth / Storage:** not connected yet. The product runs on realistic demo data under `src/mocks/`.
- **Email:** not connected yet. Invitation mail content is previewed in-app until an email service (e.g. Resend) is wired up.
- **Design system:** five-role palette (`background`, `primary`, `accent`, `secondary`, `foreground`), built for desktop-first with responsive fallbacks.