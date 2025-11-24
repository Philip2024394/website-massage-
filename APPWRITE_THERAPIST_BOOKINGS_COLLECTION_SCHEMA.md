# Therapist & Place Bookings Collection Schema (Authoritative Lifecycle)

Collection Name: Bookings (APPWRITE_CONFIG.collections.bookings)
Database: main

Purpose: Persist real-time massage booking requests and lifecycle events (creation, confirmation, completion, decline/timeout/reassignment) for therapists and places. Enables accurate confirmed booking counts, SLA enforcement (10‑minute response window), broadcast fallback, affiliate attribution, analytics (confirmed/completed only), and provider availability control.

## Attributes
| Key | Type | Required | Notes |
|-----|------|----------|-------|
| bookingId | string | yes | Duplicate of $id for compatibility; unique ID. |
| bookingDate | datetime | yes | Created timestamp. |
| providerId | string | yes | Therapist or place document $id. |
| providerType | enum('therapist','place') | yes | Distinguishes collection for joins/queries. |
| providerName | string | yes | Snapshot for analytics & notifications. |
| userId | string | no | End-user (customer) ID if registered. |
| userName | string | no | Snapshot of user name. |
| hotelId | string | no | If initiated by hotel/villa concierge flow. |
| hotelGuestName | string | no | Guest name for concierge initiated bookings. |
| hotelRoomNumber | string | no | Room reference for hotel bookings. |
| service | enum('60','90','120') | yes | Duration tier in minutes. |
| startTime | datetime | yes | Requested start time (ISO). |
| duration | integer | yes | Redundant numeric minutes (parsed from service). |
| totalCost | float | no | Agreed service amount (set later). |
| paymentMethod | string | no | 'Unpaid' initially; updated when charged/recorded. |
| status | enum('Pending','Confirmed','Completed','Cancelled','Expired','Reassigned') | yes | Booking lifecycle state. |
| confirmedAt | datetime | no | Set automatically on transition to Confirmed. |
| completedAt | datetime | no | Set automatically on transition to Completed. |
| cancelledAt | datetime | no | Set automatically on Cancel/Decline. |
| responseDeadline | datetime | no | SLA for provider response (10 minutes from creation). |
| providerResponseStatus | enum('AwaitingResponse','Confirmed','OnTheWay','Declined','TimedOut') | yes | Fine-grained provider action status. |
| cancellationReason | string | no | Optional reason when declined/cancelled. |
| broadcast | boolean | no | Set when expired and rebroadcast to network. |
| broadcastAt | datetime | no | Timestamp of broadcast. |
| broadcastCount | integer | no | Number of providers notified after timeout. |
| affiliateCode | string | no | Attribution code captured at creation (if present). |
| createdAt | datetime | yes | Mirror of bookingDate (anchor for legacy consumers). |
| updatedAt | datetime | no | Last lifecycle mutation timestamp (optional). |

## Index Recommendations
- idx_provider_status: providerId + status (filter active/pending per provider)
- idx_status_deadline: status + responseDeadline (efficient expiration scans)
- idx_created_desc: bookingDate DESC (recent bookings dashboard)
- idx_affiliate_code: affiliateCode + bookingDate (attribution analysis)

## Lifecycle Rules
1. Creation: status=Pending, providerResponseStatus=AwaitingResponse, responseDeadline=now+10m.
2. Confirmation: status=Confirmed, set confirmedAt, providerResponseStatus=Confirmed, fire analytics trackBookingCompleted.
3. Completion: status=Completed, set completedAt, fire analytics trackRevenue (if totalCost>0).
4. Decline: status=Cancelled, providerResponseStatus=Declined, set cancelledAt & optional cancellationReason.
5. Timeout: bookingExpirationService sets status=Expired (or we map to TimedOut internally), providerResponseStatus=TimedOut, then broadcast fallback (broadcast=true).
6. Reassignment: original booking may set status=Reassigned; new booking created referencing original providerId in metadata (future extension).

## Security & Permissions
- Document-level security enabled (documentSecurity=true).
- Read: customers (if userId matches), provider (providerId), admins.
- Write: system functions / provider for confirm/decline restricted via Appwrite permissions (future: use Functions to enforce HMAC token validation).

## Analytics Integrity
- Previous premature tracking (trackBookingCompleted at initiation) removed.
- Only Confirmed or Completed statuses trigger analytics events (booking completed vs revenue).
- Views/impressions separated; confirmed bookings become authoritative metric for provider success.

## Migration Notes
- If legacy booking documents lack lifecycle fields, they remain usable; new fields will be null. Add backfill script to populate responseDeadline (bookingDate+10m) and set providerResponseStatus=Confirmed where status=Confirmed and providerResponseStatus missing.

## Future Extensions
- onTheWayAt timestamp when provider starts travel.
- geo fields (customerLat/customerLng) for proximity metrics.
- commission settlement linkage (commission_records collection).
- referral or loyalty reward linkage on completion.

---
This schema enables accurate confirmed booking counts and controlled provider availability without relying on synthetic or premature metrics.
