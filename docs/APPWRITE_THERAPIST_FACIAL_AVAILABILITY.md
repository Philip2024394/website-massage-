# Appwrite Settings: Therapists & Facial Home Service — Available Until Booking

This doc confirms how the app and Appwrite are aligned so **all therapist and facial profiles are visible** and display as **Available** until the customer does **Book now**, **Order now**, or **Scheduled booking**.

---

## 1. App behavior (what we enforce in code)

- **Therapist and facial home service** cards show **Available** for every live profile.
- There is **no rotation** to Busy; only providers that are offline/not live show as Busy.
- A provider can show as **Busy** when they have an active booking (Book now / Order now / Scheduled) if the app or a function updates their status in Appwrite.

So in the app:

- **All approved, live therapists** → listed and shown as **Available**.
- **All facial places** → listed and shown as **Available** (unless `status`/`availability` in Appwrite is explicitly set to busy/offline).

---

## 2. Appwrite: Therapists collection

**Collection ID:** from env `VITE_THERAPISTS_COLLECTION_ID` (e.g. `therapists_collection_id`).

### 2.1 Attributes the app uses

| Attribute       | Type    | Purpose |
|----------------|---------|--------|
| `approved`      | Boolean | If `true`, therapist can appear on consumer lists. Use `true` for all profiles that should be visible. |
| `status`       | String  | Stored **lowercase**: `"available"`, `"busy"`, `"offline"`. App treats `available`/`online` as bookable and shows **Available**; others as **Busy**. |
| `availability` | String  | Display value: `"Available"` or `"Busy"`. App normalizes from `status` if needed. |
| `isLive`        | Boolean | If `true`, therapist is included in live listing. Set `true` for all profiles that should be visible. |
| `isOnline`     | Boolean | Optional; can follow `status === 'available'`. |
| `city` / `locationId` / `location` | String | Used for city filter (e.g. Yogyakarta). At least one should match app cities. |

### 2.2 Recommended values so all profiles are visible and Available

- **approved:** `true`
- **status:** `"available"` (lowercase)
- **availability:** `"Available"` (capitalized) or leave empty; app normalizes from `status`
- **isLive:** `true`

Indexes and permissions:

- **Index** on `approved` (Key, ASC) if you use `Query.equal('approved', true)`.
- **Read** permission: **Role: Any** or **Role: Users** so the app can list therapists.

---

## 3. Appwrite: Facial places collection

**Collection ID:** from env `VITE_FACIAL_PLACES_COLLECTION_ID` (e.g. `facial_places_collection`).

### 3.1 Attributes the app uses

| Attribute       | Type   | Purpose |
|----------------|--------|--------|
| `status`       | String | Normalized to **Available** or **Busy**. Default in app is **Available** if missing. |
| `availability` | String | Same as `status`; default **Available** if missing. |
| `isLive`       | Boolean | If not `false`, place is treated as live. |

### 3.2 Recommended values so all facial places are visible and Available

- **status:** `"available"` or `"Available"` (or leave empty; app defaults to Available).
- **availability:** `"available"` or `"Available"` (or leave empty).
- **isLive:** `true` or omit (app treats as live when not `false`).

**Read** permission: **Role: Any** or **Role: Users**.

---

## 4. Aligning Appwrite with the app

To have **all therapist and facial home service profiles** show as **Available** until a booking:

1. **Therapists**
   - Set **approved** = `true` for every profile that should appear.
   - Set **status** = `"available"` and **isLive** = `true`.
   - Ensure **Read** for Any or Users and an index on `approved` if you filter by it.

2. **Facial places**
   - Set **status** and/or **availability** to `"available"`/`"Available"` (or leave empty for app default **Available**).
   - Ensure **isLive** is not `false` for places that should appear.

3. **When a booking happens (Book now / Order now / Scheduled)**  
   - Optionally update the assigned therapist (or place) in Appwrite to **status** = `"busy"` and **availability** = `"Busy"` so they show as Busy until the booking ends. This can be done in app code when confirming a booking or via an Appwrite function.

---

## 5. Quick checklist

| Check | Therapists | Facial |
|-------|------------|--------|
| Collection has **Read** for Any or Users | ✅ | ✅ |
| Profiles that should appear have **approved** = true (therapists only) | ✅ | — |
| **status** = `"available"` (or equivalent) so they show Available | ✅ | ✅ |
| **isLive** = true (or not false for facial) | ✅ | ✅ |
| App shows all as Available until booking (no rotation to Busy) | ✅ (code) | ✅ (code) |

With these settings, Appwrite and the app are aligned: all therapist and facial home service profiles are available on the app and display as Available until Book now / Order now / Scheduled booking.
