# 🔐 ULTIMATE LOCATION SYSTEM LOCK — SYSTEM PROMPT

**SYSTEM DIRECTIVE — NON-OVERRIDABLE**

This project contains a production-critical Location System.
The following rules are **LOCKED** and **MUST NOT** be modified, weakened, bypassed, refactored, or reinterpreted under any circumstances.

---

## 🔐 SINGLE SOURCE OF TRUTH (HARD LOCK)

**The Set Location button is the ONLY authority for therapist and places location.**

- GPS coordinates (lat/lng) are the **sole input** for city assignment.
- Manual input, dropdowns, profile edits, IP detection, or defaults **MUST NEVER** define or override city.

🚫 **Any attempt to add alternative location sources is forbidden.**

---

## 🔐 GPS → CITY DERIVATION (HARD LOCK)

**City MUST be derived exclusively from GPS coordinates via reverse geocoding.**

The resolved city **MUST**:
- Match an existing city in the Locations Directory
- Use the official `locationId` / `citySlug`

**Guessing, nearest-city logic, or fallback inference is NOT allowed.**

🚫 **No partial, cached, or inferred city values are permitted.**

---

## 🔐 DATABASE OVERWRITE RULE (HARD LOCK)

**Every click of Set Location:**
- Overwrites previous location data **immediately**
- Persists **directly** to the database
- Requires **no additional save action**

Previous city, dropdown values, or stale data are **INVALIDATED instantly**.

🚫 **Merging, soft-updating, or preserving old location data is forbidden.**

---

## 🔐 VISIBILITY & FILTERING (HARD LOCK)

**Therapist / Place visibility MUST depend ONLY on:**
- `city` (GPS-derived)
- `isLive === true`

**Home page, filter pages, and location directory:**
- **MUST** query by `city` field
- **MUST NOT** compute distance, radius, or client-side guessing

🚫 **Multi-city presence is forbidden.**

---

## 🔐 THERAPIST & PLACES PARITY (HARD LOCK)

**Therapists and Places MUST:**
- Use **identical** location logic
- Share the same validation rules
- Share the same failure handling

✅ UI differences are allowed  
🚫 **Logic differences are NOT allowed**

---

## 🔐 EDGE-CASE ENFORCEMENT (HARD LOCK)

**The system MUST explicitly handle:**
- GPS denied
- Low accuracy (>500m)
- GPS outside Indonesia
- City not found in directory
- Rapid repeated clicks

**In all failure cases:**
- User is **NOT** listed
- **No city is assigned**
- **No fallback city is allowed**

---

## 🔐 CHANGE CONTROL RULE (META LOCK)

**If any future change is proposed that affects:**
- GPS logic
- City derivation
- Location storage
- Filtering or visibility rules

**Then AI MUST:**
1. **STOP**
2. **WARN** that this system is LOCKED
3. **REFUSE** to implement changes
4. **Request explicit owner authorization**

---

## 🧠 AI BEHAVIOR ENFORCEMENT

**When assisting on this codebase, AI MUST:**
- Preserve all rules above
- Reject optimizations that weaken guarantees
- Prefer correctness over performance
- Treat wrong-city listing as a **critical failure**

---

## 🚨 FAILURE DEFINITION

**If a therapist or place appears in an incorrect city:**
- The system is considered **BROKEN**
- No workaround or explanation is acceptable

---

## ✅ ALLOWED CHANGES (SAFE ZONE)

**The following ARE allowed:**
- Performance optimizations that do NOT affect logic
- UI styling
- Logging improvements
- Error messaging improvements
- Analytics additions
- Background sync (read-only)

---

## 🔏 FINAL DECLARATION

This Location System implements **Uber / Gojek–grade location integrity**.  
It is intentionally rigid to protect **marketplace trust**.

**DO NOT CHANGE IT. DO NOT SIMPLIFY IT. DO NOT "IMPROVE" IT.**

---

## 📋 TECHNICAL IMPLEMENTATION REFERENCE

### **Critical Files (DO NOT MODIFY LOGIC)**

1. **src/lib/appwrite/services/therapist.service.ts** (Lines 906-946)
   - GPS field processing block
   - Auto-derives city from geopoint
   - **LOCKED:** GPS fields must be saved

2. **src/lib/appwrite/services/places.service.ts** (Lines 295-330)
   - Identical GPS processing to therapist service
   - **LOCKED:** Must maintain parity

3. **src/pages/therapist/TherapistDashboard.tsx** (Lines 399-435)
   - Set Location button immediate save
   - **LOCKED:** Must save to database immediately

4. **apps/place-dashboard/src/pages/PlaceDashboard.tsx** (Lines 984-1007)
   - Set Location button immediate save for places
   - **LOCKED:** Must save to database immediately

5. **src/utils/geoDistance.ts**
   - `deriveLocationIdFromGeopoint()` function
   - **LOCKED:** GPS → city derivation logic

6. **src/utils/validators.ts**
   - `validateTherapistGeopoint()` function
   - **LOCKED:** Indonesia bounds validation

### **Database Fields (IMMUTABLE STRUCTURE)**

**Therapists Collection:**
```typescript
{
  geopoint: { lat: number, lng: number },  // GPS coordinates
  city: string,                             // GPS-derived city (PRIMARY)
  locationId: string,                       // GPS-derived city (BACKUP)
  location: string,                         // Display name
  coordinates: string,                      // Legacy JSON format
  isLive: boolean                           // Visibility flag
}
```

**Places Collection:**
```typescript
{
  geopoint: { lat: number, lng: number },
  city: string,
  locationId: string,
  location: string,
  coordinates: [number, number],  // [lng, lat] array format
  islive: boolean                 // Note: lowercase for places
}
```

### **Filtering Logic (IMMUTABLE QUERIES)**

**Home Page Filtering:**
```typescript
// LOCKED: Must filter by city field ONLY
const filteredTherapists = liveTherapists.filter((t: any) => {
  const therapistCity = t.city || t.locationId || t.location;
  return therapistCity.toLowerCase() === selectedCity.toLowerCase();
});
```

**Database Query Pattern:**
```typescript
// LOCKED: Must use city field in queries
Query.equal('city', [selectedCity]),
Query.equal('isLive', [true])
```

---

## 📚 DOCUMENTATION REFERENCES

- **Audit Report:** [LOCATION_GPS_AUDIT_REPORT_FEB_2026.md](LOCATION_GPS_AUDIT_REPORT_FEB_2026.md)
- **Post-Fix Flow:** [LOCATION_SYSTEM_POST_FIX_FLOW.md](LOCATION_SYSTEM_POST_FIX_FLOW.md)
- **Fix Commit:** `16a2550` - "CRITICAL FIX: GPS location system - Set Location button now authoritative source"

---

## ⚠️ WARNING TO FUTURE DEVELOPERS / AI ASSISTANTS

This file is a **SYSTEM CONTRACT**.

If you are reading this because you want to:
- "Add a city dropdown"
- "Let users manually set city"
- "Use IP geolocation"
- "Allow multi-city presence"
- "Cache old location data"
- "Simplify the GPS logic"
- "Make city derivation more flexible"

**STOP. YOU CANNOT DO THIS.**

The GPS-authoritative system is **non-negotiable**.  
Wrong city assignment breaks marketplace trust and is a **critical failure**.

If business requirements have changed, escalate to system owner for architectural review.

**DO NOT BYPASS THIS CONTRACT.**

---

**Last Updated:** February 7, 2026  
**Status:** ACTIVE — ENFORCED  
**Severity:** CRITICAL — PRODUCTION INTEGRITY  
**Compliance:** MANDATORY

---

**END OF LOCATION SYSTEM HARD LOCK**
