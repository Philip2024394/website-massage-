# Emergency Alerts (Therapist/Place Safety)

## Overview

Therapists and places can trigger an **emergency alert** from the status page (under Available / Busy / Offline) by **tapping the emergency button 3 times** within 4 seconds. The alert sends the provider’s location, time, date, and booking context (who they’re with) to the admin dashboard. An **alert sound plays on the admin side** until an admin opens the dashboard and **acknowledges** the notification.

## When the emergency button is active

The button is **only active** (tappable) when:

- **1 hour before** a scheduled booking start, or  
- **During** a book-now/order-now or scheduled session, or  
- **Up to 3 hours after** the end of a book-now/order-now or scheduled booking.

Each new book-now/order-now extends the “active” window (3 hours after that session).

## Flow

1. **Therapist/place**  
   - On the **Status** page (Available / Busy / Offline), a large **Emergency** button is shown below the three status buttons.  
   - When the button is active, the provider taps it **3 times** within about 4 seconds.  
   - The app gets GPS location and sends an emergency alert (therapist/place id, name, lat/lng, time, current/relevant booking info).

2. **Backend**  
   - Alert is stored in the **emergency_alerts** Appwrite collection with status `pending`.

3. **Admin**  
   - **Emergency Alerts** in the admin dashboard lists pending (and optionally all) alerts.  
   - **Alert sound** (e.g. `/sounds/alert-notification.mp3`) plays in a loop while there is at least one **pending** alert.  
   - When an admin opens the dashboard and clicks **Acknowledge** on an alert, its status is set to `acknowledged` and the sound stops once there are no more pending alerts.

## Appwrite: `emergency_alerts` collection

Create a collection **emergency_alerts** (or set `VITE_EMERGENCY_ALERTS_COLLECTION_ID` to your ID) with these attributes:

| Attribute       | Type   | Required |
|----------------|--------|----------|
| therapistId    | string | yes      |
| therapistName  | string | yes      |
| providerType   | string | yes      |
| lat            | double | no       |
| lng            | double | no       |
| triggeredAt    | string | yes      |
| bookingId      | string | no       |
| customerName   | string | no       |
| bookingSummary | string | no       |
| status         | string | yes      |
| acknowledgedAt | string | no       |

- **status**: `pending` or `acknowledged`.  
- Admin dashboard queries `status = pending` for “pending” list and updates to `acknowledged` with `acknowledgedAt` when acknowledged.

## Admin dashboard

- **Sidebar**: **Emergency Alerts** (red button).  
- **View**: Lists alerts with therapist name, time, “With: [customer]”, booking summary, and “View location on map” (Google Maps).  
- **Acknowledge**: Button per pending alert; once all are acknowledged, the alert sound stops.

## Sound

- Admin app expects an alert sound at **`/sounds/alert-notification.mp3`** (or the same path you use for urgent notifications).  
- If the admin app is deployed separately, ensure that path is available or set `EMERGENCY_SOUND_URL` in `AdminEmergencyAlerts.tsx` to a URL that is.

## Safety extras (already in place)

- **3-tap** requirement reduces accidental triggers.  
- **Active window** limited to booking-related times.  
- **Location + booking context** sent so admin can act quickly.  
- **Sound until acknowledge** so admins are clearly notified.
