# 07 — Account Settings (Shared Module)

## 7.1 One module, two portals

The **Settings** experience is built **once** as a shared module (`src/components/feature/AccountSettings.tsx`) and reused by:

| Portal | Route | Seen as |
|--------|-------|---------|
| Siyana Console | `/console/settings` | Settings |
| Government Client Portal | `/client/profile` | Profile |

> The two pages must be **identical in UI and features**: same layout, same cards, same behaviour. Only the surrounding header and sidebar differ, because each portal has its own navigation.

## 7.2 Sections

### 1) Personal details
- Editable **name**.
- Locked fields: **role**, **email**, **designation** (not editable, shown for reference).

### 2) Notification preferences
- **Email** toggle.
- **In-app** toggle.
- Toggles reflect and update the user's preference state.

### 3) Organization card
- Shows the user's organization.

### 4) Projects card
- Shows the projects the user is associated with.

### 5) Security — Change Password
- **Change Password** flow with:
  - Field validation.
  - Mismatch check (new password vs confirm).
  - Success toast on completion.

## 7.3 Consistency requirement

If a feature exists on the console Settings page it must also exist on the client Profile page (and vice-versa). They are two views of the same component — never two separate implementations.