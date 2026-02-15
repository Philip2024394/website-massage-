# Proximity / Contact-Sharing Violation Rules

## Overview

IndaStreet may use proximity (distance between guest and provider) as one signal to help detect potential off-platform contact-sharing. The rules below define when tracking is active and how distances map to tiers. **Administrators can override or delete violation counts at any time** in the admin dashboard.

## 1. Grace period: 10 hours after first booking

**Proximity tracking for violation detection is active only after 10 hours have passed since the first completed/online booking between that guest (user) and that therapist or place.**

- Before that: no proximity-based violation is applied, even if both phones are in the same area.
- After 10 hours: distance between guest and provider may be evaluated against the distance tiers below.

Implementation reference: `src/lib/proximityViolationConfig.ts`  
- `PROXIMITY_GRACE_HOURS_AFTER_FIRST_BOOKING = 10`  
- `isProximityTrackingActive(firstBookingCompletedAt)` — returns true only when 10+ hours have passed since that timestamp.

To apply this rule, your system must know the **first completed/confirmed booking** between each (guest, provider) pair (e.g. from your bookings collection).

## 2. Distance tiers: 10 m, 15 m, 20 m → levels 1, 2, 3

| Tier | Distance (meters) | Meaning |
|------|-------------------|--------|
| 1    | Within 20 m       | Farthest tier still considered |
| 2    | Within 15 m       | Mid tier |
| 3    | Within 10 m       | Closest tier |

- **Tier 1** = provider and guest within **20 m** of each other  
- **Tier 2** = within **15 m**  
- **Tier 3** = within **10 m**

Implementation: `getProximityTier(distanceMeters)` in `src/lib/proximityViolationConfig.ts` returns `1`, `2`, or `3`, or `null` if distance &gt; 20 m.

## 3. Commission increase per violation

As per Terms (6b): each verified violation increases commission by a **minimum of 5%** per violation (e.g. 30% → 35% → 40%). Distance tier (1, 2, 3) can be used to prioritise or weight verification; the exact commission logic is at IndaStreet’s discretion.

## 4. Admin override

- In the **Admin Dashboard**, open **Therapist Cards** or **Massage/Facial Place Cards**.
- **Edit** a provider card.
- Under **Contact-sharing violations**: change the number (e.g. set to **0** to clear) or click **Clear violations**, then **Save**.
- This updates the provider’s `contactSharingViolations` in the database. Admins can override or remove violations at any time (e.g. false positives or justified exceptions).

## Summary

| Rule | Value |
|------|--------|
| Grace period before tracking | 10 hours after first booking (guest + provider) |
| Distance tiers | 20 m (tier 1), 15 m (tier 2), 10 m (tier 3) |
| Admin | Can override or delete violation count at any time |
