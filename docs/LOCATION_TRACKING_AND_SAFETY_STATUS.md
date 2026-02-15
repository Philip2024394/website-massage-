# Location Tracking & Safety Monitoring – Status

## Summary

- **Terms:** Therapists (and places/skin care clinics) now **agree in the Terms & Conditions** that IndaStreet may collect and use their location/GPS while their profile is active and during service sessions, for client and provider safety, and that this data may be monitored by admin when needed.
- **Current implementation:** One-time “Set GPS Location” in therapist dashboard; position is saved to the database (`geopoint`, `coordinates`, `locationId`, `city`) for marketplace visibility and city filtering. **No continuous/live tracking.**
- **Not yet implemented:** Live GPS during sessions, admin dashboard view of therapist location. These are intended for full safety monitoring and can be added later.

---

## 1. Consent in Terms (Done)

In **Service Terms** (shown to therapists/places on first dashboard visit and in legal pages):

- **Section 6a. Location and Safety Monitoring (Service Providers)**  
  By keeping an active profile, providers agree that IndaStreet may:
  - Collect, use, and store location data (including GPS) while the profile is active and during service sessions or travel to/from bookings.
  - Use this for **safety of clients** (e.g. women booking in-home/hotel) and **safety of providers**.
  - **Monitor or access** such data when needed for safety support, incident response, or platform administration.

So: **Yes – in their profile/terms flow, therapists (and places/skin care clinics) agree that IndaStreet can track their location while their profile is active and that it can be monitored when needed.**

---

## 2. Current Technical Implementation

| Feature | Status | Where |
|--------|--------|--------|
| Therapist sets GPS once | ✅ Implemented | Therapist dashboard → “Set GPS Location” → `geopoint`, `coordinates`, `locationId`, `city` saved to DB |
| Location used for search/filter | ✅ Implemented | Home/listings use `geopoint`/`coordinates` for city/area and distance |
| **Live/continuous GPS during session** | ❌ Not implemented | Would require app/PWA to send location periodically during “on the way” / “in session” |
| **Admin dashboard: view therapist location** | ❌ Not implemented | Admin can see therapist list/data but not a map or live last-known position |

So **monitoring in the sense of “see where they are when needed”** (e.g. in admin) is **not** yet built; the **legal basis** (consent in terms) is in place.

---

## 3. Is It Possible to Monitor for Safety? (Yes)

- **Legally:** Consent is covered by the new clause in the Terms.
- **Technically:** You can add:
  1. **Live/periodic location** during active bookings (e.g. therapist app sends GPS when status is “on the way” or “in session”).
  2. **Admin dashboard:** Screen that shows last-known (or live) position of a therapist when needed for safety/incidents (e.g. by booking or therapist ID), with access control and audit.

That would give “100% can be monitored if needed in admin dashboard” once implemented.

---

## 4. FAQ Alignment

The FAQ states: *“GPS tracking during sessions, 24/7 emergency support hotline, therapist check-ins, client verification, and immediate incident response protocols. All sessions are logged and monitored.”*

- **Terms and consent:** Aligned (providers agree to location collection and monitoring).
- **In-product behaviour:** “GPS tracking during sessions” and “monitored” in admin are **not yet implemented**; the FAQ describes the intended safety model. Implementing live session location and admin location view would bring the product in line with the FAQ.

---

## 5. Files Touched (consent & docs)

- **Terms (EN/ID):** `src/translations/index.ts` – `locationTrackingTitle`, `locationTrackingContent`.
- **Terms page:** `src/pages/ServiceTermsPage.tsx` – new section 6a rendered after “Service Provider Rights and Safety”.
- **Status doc:** `docs/LOCATION_TRACKING_AND_SAFETY_STATUS.md` (this file).

No changes were made to therapist dashboard GPS flow or admin dashboard; those remain as-is until live tracking and admin location view are built.
