# Appwrite: therapist_menus collection schema

**Collection ID:** `therapist_menus`  
Use underscores only. Do **not** use spaces (e.g. "Therapist Menus" causes 400 errors).

---

## Your collection attributes (confirmed)

| Attribute          | Type     | Required | Size / Constraints | Default | Used by app |
|--------------------|----------|----------|--------------------|---------|-------------|
| **$id**            | string   | -        | -                  | -       | System      |
| **menuId**         | string   | Yes      | 64                 | -       | Create      |
| **menuName**       | string   | No       | 128                | NULL    | No          |
| **menuDescription**| string   | No       | 512                | NULL    | No          |
| **isActive**       | boolean  | Yes      | -                  | -       | Create      |
| **createdDate**    | datetime | Yes      | -                  | -       | Create      |
| **updatedDate**    | datetime | Yes      | -                  | -       | Create/Update|
| **menuItems**      | integer  | No       | Min: 0, Max: 1000  | NULL    | No          |
| **therapistId**    | string   | Yes      | 50                 | -       | Create/Query|
| **menuData**       | string   | No       | 10000              | NULL    | Create/Update/Read |
| **others**         | string   | No       | 200                | NULL    | No          |
| **lastModified**   | string   | No       | 255                | NULL    | No          |
| **status**         | string   | No       | 255                | NULL    | Read (guard)|
| **bookingEnabled** | boolean  | No       | -                  | true    | Read (guard)|
| **scheduleEnabled**| boolean  | No       | -                  | true    | Read (guard)|
| **deactivationReason** | string | No    | 500                | NULL    | Read (guard)|
| **deactivatedAt**  | datetime | No       | -                  | NULL    | No          |
| **planType**       | enum     | No       | -                  | NULL    | Read (guard)|
| **planExpiresAt**  | datetime | No       | -                  | NULL    | Read (guard)|
| **graceUntil**     | datetime | No       | -                  | NULL    | Read (guard)|
| **$createdAt**    | datetime | -        | -                  | -       | System      |
| **$updatedAt**    | datetime | -        | -                  | -       | System      |

---

## How the app uses these

- **Create (new menu):** `menuId`, `therapistId`, `menuData`, `isActive` (true), `createdDate`, `updatedDate`, `status` ('active').
- **Update (existing menu):** `menuData`, `updatedDate`.
- **Read (home/profile/prefetch):** `therapistId`, `menuData` (and `$updatedAt` for ordering).
- **Booking guard** (`bookingAuthGuards.ts`): requires `status === 'active'`, `bookingEnabled !== false`, `scheduleEnabled !== false`; uses `planType`, `planExpiresAt`, `graceUntil` for Pro/Premium checks; uses `deactivationReason` in error message.

So the app **must** set **`status: 'active'`** when creating a menu; otherwise the booking guard blocks the therapist. The app has been updated to set `status: 'active'` on create.

---

## Permissions (recommended)

- **Read:** Role.any() (home/profile load menus without login).
- **Create / Update / Delete:** Role.users() (or your therapist role).

No chart or enum is required for basic menu flow; `planType` enum is optional for guard logic.
