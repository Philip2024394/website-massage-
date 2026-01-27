# 🔒 Platform Privacy Rules

## Critical Privacy Policy: Customer WhatsApp Protection

**RULE: Customer WhatsApp numbers are NEVER shared with therapists or places**

### Access Levels:

1. **Admin Dashboard** ✅
   - Full access to customer WhatsApp for support purposes
   - Can view WhatsApp in booking records
   - Can contact customers for verification or support
   - Location: `apps/admin-dashboard/`

2. **Therapist Dashboard** ❌
   - NO access to customer WhatsApp numbers
   - Must use in-app chat system for communication
   - Calendar shows "Use Chat" instead of WhatsApp button
   - Location: `apps/therapist-dashboard/`

3. **Place Dashboard** ❌
   - NO access to customer WhatsApp numbers
   - Must use in-app chat system for communication
   - Location: `apps/place-dashboard/`, `apps/facial-dashboard/`

### Implementation Details:

#### Database Storage:
```typescript
// Customer WhatsApp is stored in Appwrite database
const bookingDoc = {
  customerName: "Customer Name",
  customerPhone: "+62812345678",      // Admin-only field
  customerWhatsApp: "+62812345678",   // Admin-only field
  // ... other fields
}
```

#### Data Sanitization for Therapists/Places:
```typescript
// When fetching bookings for therapist/place calendars
const sanitizedBooking = {
  customerName: doc.customerName,
  // ❌ customerPhone: REMOVED
  // ❌ customerWhatsApp: REMOVED
  serviceType: doc.serviceType,
  location: doc.location,
  // ... other non-sensitive fields
}
```

#### UI/UX Changes:
- **TherapistCalendar.tsx**: 
  - Removed `<Phone>` icon and phone display
  - Removed WhatsApp contact button
  - Added "Use in-app chat" indicator
  
- **Booking Interfaces**:
  - Therapist/Place booking cards show customer name only
  - All communication routed through chat system
  - No external contact methods visible

### Enforcement Mechanisms:

1. **Code Level**:
   - TypeScript interfaces exclude `customerPhone` in therapist/place contexts
   - Data transformations strip WhatsApp before sending to frontend
   - Privacy comments (`🔒 PRIVACY RULE`) throughout codebase

2. **Database Level**:
   - Appwrite permissions configured for admin-only access to sensitive fields
   - Collection-level security rules

3. **Platform Terms**:
   - Terms of service explicitly prohibit therapists from requesting customer WhatsApp
   - Violation results in immediate account termination
   - See: `ProPlanWarnings.tsx` for enforcement details

### Files Modified:
- ✅ `apps/therapist-dashboard/src/pages/TherapistCalendar.tsx`
- ✅ `src/lib/appwrite/services/booking.service.appwrite.ts`
- ✅ `src/context/PersistentChatProvider.tsx`
- ✅ `src/components/PersistentChatWindow.tsx`

### Testing Checklist:
- [ ] Therapist calendar does not show customer phone/WhatsApp
- [ ] Therapist booking cards do not expose WhatsApp
- [ ] Place calendar does not show customer phone/WhatsApp
- [ ] Admin dashboard CAN access customer WhatsApp
- [ ] In-app chat system works for therapist-customer communication
- [ ] Booking creation still captures WhatsApp in database
- [ ] Support team can contact customers via admin dashboard

### Rationale:
1. **Customer Privacy**: Protects customer contact information
2. **Platform Control**: Ensures all communication happens through app
3. **Revenue Protection**: Prevents therapists from bypassing platform
4. **Safety**: Reduces harassment and unsolicited contact
5. **Compliance**: Aligns with data protection regulations

### Future Enhancements:
- [ ] Add field-level encryption for customer WhatsApp
- [ ] Implement audit logging for WhatsApp access
- [ ] Add admin dashboard filters for WhatsApp-related support tickets
- [ ] Create automated reports for privacy compliance

---

**Last Updated**: January 28, 2026  
**Maintained By**: Platform Development Team  
**Review Schedule**: Quarterly
