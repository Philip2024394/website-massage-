# THERAPIST TERMS & CONDITIONS - INTEGRATION GUIDE

**Created:** January 1, 2026  
**Status:** ✅ COMPLETE - Ready for Integration

---

## 📄 WHAT WAS CREATED

### Legal Terms & Conditions Page

**File:** `src/pages/TherapistTermsAndConditions.tsx`  
**Styles:** `src/pages/TherapistTermsAndConditions.css`  
**URL:** `/?page=therapist-terms-and-conditions` or `/?page=therapist-terms`

---

## 📜 LEGAL CLAUSES INCLUDED

### 1. Mandatory Booking Response Obligation
- **5-minute response requirement**
- Definition of "Missed Booking"
- Legal justification for requirement
- Customer expectation framework

### 2. Notification Responsibility & Device Readiness
- Technology acknowledgment (PWA, Push, Email)
- Sole therapist responsibility for:
  - Active login session
  - Push notification permissions
  - Device configuration (not on silent)
  - Internet connectivity
  - Browser compatibility
- **Platform non-liability** for device/network issues
- "I didn't hear it" is NOT a valid defense

### 3. Performance-Based Availability Scoring System
- Score calculation (0-100 points)
- Detailed scoring table:
  - Accept <1min: +7 points
  - Accept 1-5min: +5 points
  - Miss >5min: -10 points
  - Miss 3+: -20 points (exponential)
- Search visibility multipliers (0.3x-1.5x)
- Badge system (Elite, Excellent, Good, Fair, Poor)
- **Automated & non-negotiable** enforcement

### 4. Penalties for Missed Bookings & Non-Responsiveness
- **Four-tier progressive enforcement:**
  1. Visibility reduction (automatic)
  2. Booking suspension (24-72 hours)
  3. Extended suspension (7-30 days)
  4. Permanent account termination
- Enforcement criteria (frequency, severity, pattern)
- **No refunds or compensation** upon termination
- Chronic non-responsiveness = permanent removal

### 5. Platform-Only Communication Policy
- **Strict prohibition** on external contact
- No WhatsApp, phone, email sharing
- All communication through platform only
- **Violation consequences table:**
  - 1st offense: 7-30 day suspension
  - 2nd offense: Permanent termination
  - Bypass pattern: Termination + legal action
- Monitoring & enforcement disclosure

### 6. Platform Authority & Final Determination
- **Platform has final authority** on all decisions
- Evidence standards (system logs, timestamps)
- Limited appeal rights (only for system errors)
- Waiver of legal claims
- Independent contractor status
- No obligation to provide bookings

### 7. Additional Terms
- Modification rights
- Severability clause
- Governing law (Republic of Indonesia)
- Dispute resolution (BANI arbitration, Bali)
- Entire agreement clause

---

## 🔗 WHERE TO LINK THIS PAGE

### 1. **REGISTRATION FLOW (CRITICAL - HIGHEST PRIORITY)**

**Location:** Therapist/Place/Facial registration form

**Implementation:**
```tsx
// Before submitting registration
<div className="terms-acceptance">
  <label>
    <input 
      type="checkbox" 
      required 
      name="acceptTerms"
      checked={acceptedTerms}
      onChange={(e) => setAcceptedTerms(e.target.checked)}
    />
    I have read and agree to the{' '}
    <a 
      href="/?page=therapist-terms-and-conditions" 
      target="_blank"
      rel="noopener noreferrer"
    >
      Therapist Terms & Conditions
    </a>
    {' '}including the booking response requirements, 
    availability scoring system, and platform-only communication policy.
  </label>
  {!acceptedTerms && submitted && (
    <span className="error">
      You must accept the Terms & Conditions to register
    </span>
  )}
</div>

// In submit handler
if (!acceptedTerms) {
  alert('Please read and accept the Therapist Terms & Conditions');
  return;
}

// Store acceptance in database
await databases.createDocument(
  databaseId,
  'therapists',
  therapistId,
  {
    ...therapistData,
    termsAccepted: true,
    termsAcceptedDate: new Date().toISOString(),
    termsVersion: '2.0'
  }
);
```

---

### 2. **THERAPIST DASHBOARD (HIGH PRIORITY)**

**Location:** Therapist dashboard sidebar or settings menu

**Implementation:**
```tsx
// Add to dashboard navigation
<nav className="dashboard-nav">
  <a href="/?page=therapist-dashboard">Dashboard</a>
  <a href="/?page=therapist-bookings">My Bookings</a>
  <a href="/?page=therapist-earnings">Earnings</a>
  <a href="/?page=therapist-schedule">Schedule</a>
  <a href="/?page=therapist-settings">Settings</a>
  <a 
    href="/?page=therapist-terms-and-conditions" 
    target="_blank"
    className="legal-link"
  >
    📜 Terms & Conditions
  </a>
</nav>
```

---

### 3. **FORCED BOOKING MODAL (HIGH PRIORITY)**

**Location:** `src/components/therapist/ForcedBookingModal.tsx`

**Implementation:**
```tsx
// Add reference in modal footer
<div className="platform-notice">
  <p>
    🔒 All communication through platform messaging only
  </p>
  <p>
    💰 Commission protected • No external contact sharing
  </p>
  <p className="terms-reference">
    By responding, you acknowledge acceptance of the{' '}
    <a 
      href="/?page=therapist-terms-and-conditions" 
      target="_blank"
      rel="noopener noreferrer"
    >
      Therapist Terms & Conditions
    </a>
  </p>
</div>
```

---

### 4. **AVAILABILITY SCORE DASHBOARD (MEDIUM PRIORITY)**

**Location:** Therapist performance/score page

**Implementation:**
```tsx
// Add to availability score display
<div className="score-dashboard">
  <h2>Your Availability Score: {score}/100</h2>
  <p>Rank: {rank}</p>
  
  <div className="learn-more">
    <p>
      Learn more about how scores are calculated and their impact:
    </p>
    <a 
      href="/?page=therapist-terms-and-conditions#performance-based-availability-scoring-system"
      target="_blank"
      className="btn-secondary"
    >
      📊 Read Scoring Policy
    </a>
  </div>
</div>
```

---

### 5. **NOTIFICATION SETTINGS PAGE (MEDIUM PRIORITY)**

**Location:** Therapist notification preferences

**Implementation:**
```tsx
// Add reminder about notification responsibility
<div className="notification-settings">
  <h3>Push Notification Settings</h3>
  
  <div className="settings-warning">
    <strong>⚠️ Important:</strong> You are responsible for ensuring 
    notifications are enabled and your device is configured to receive them.
    <br />
    <a 
      href="/?page=therapist-terms-and-conditions#notification-responsibility-device-readiness"
      target="_blank"
    >
      Read Full Notification Policy →
    </a>
  </div>
  
  {/* Notification toggle switches */}
</div>
```

---

### 6. **ACCOUNT SUSPENSION/WARNING MESSAGES (HIGH PRIORITY)**

**Location:** Displayed when penalties are applied

**Implementation:**
```tsx
// When account is suspended
<div className="account-suspended-notice">
  <h2>⚠️ Account Temporarily Suspended</h2>
  <p>
    Your account has been suspended for {suspensionDays} days due to 
    repeated missed bookings and poor availability score.
  </p>
  
  <div className="policy-reference">
    <strong>Policy Violation:</strong> Section 4 - Penalties for Missed Bookings
    <br />
    <a 
      href="/?page=therapist-terms-and-conditions#penalties-for-missed-bookings-non-responsiveness"
      target="_blank"
    >
      Review Full Policy →
    </a>
  </div>
  
  <p>
    To avoid future suspensions, please:
  </p>
  <ul>
    <li>Respond to bookings within 5 minutes</li>
    <li>Keep your availability status accurate</li>
    <li>Enable push notifications</li>
  </ul>
</div>
```

---

### 7. **FOOTER LINKS (LOW PRIORITY)**

**Location:** Global footer

**Implementation:**
```tsx
// Add to legal links section
<footer className="global-footer">
  <div className="footer-section">
    <h4>Legal</h4>
    <a href="/?page=privacy-policy">Privacy Policy</a>
    <a href="/?page=terms-of-service">Terms of Service</a>
    <a href="/?page=mobile-terms-and-conditions">Mobile App Terms</a>
    <a href="/?page=therapist-terms-and-conditions">
      Therapist Terms & Conditions
    </a>
    <a href="/?page=cookies-policy">Cookies Policy</a>
  </div>
</footer>
```

---

### 8. **EMAIL NOTIFICATIONS (MEDIUM PRIORITY)**

**Location:** `src/lib/transactionalEmailService.ts`

**Implementation:**
```html
<!-- Add to booking notification email footer -->
<div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
  <p>
    <strong>Reminder:</strong> You must respond within 5 minutes to maintain your availability score.
  </p>
  <p>
    <a href="https://indastreet.com/?page=therapist-terms-and-conditions" style="color: #3b82f6;">
      Review Therapist Terms & Conditions
    </a>
  </p>
</div>
```

---

### 9. **ONBOARDING FLOW (MEDIUM PRIORITY)**

**Location:** New therapist onboarding/welcome screen

**Implementation:**
```tsx
// Welcome screen after registration
<div className="onboarding-welcome">
  <h2>Welcome to IndaStreet! 🎉</h2>
  <p>Before you start receiving bookings, please review:</p>
  
  <div className="important-docs">
    <a 
      href="/?page=therapist-terms-and-conditions"
      target="_blank"
      className="doc-link priority"
    >
      <span className="icon">📜</span>
      <strong>Therapist Terms & Conditions</strong>
      <p>Booking requirements, scoring system, penalties</p>
    </a>
    
    <a 
      href="/?page=therapist-guide"
      target="_blank"
      className="doc-link"
    >
      <span className="icon">📚</span>
      <strong>Therapist Guide</strong>
      <p>How to maximize bookings and earnings</p>
    </a>
  </div>
</div>
```

---

## 🎯 IMPLEMENTATION PRIORITIES

### Phase 1 (Launch Critical)
1. ✅ **Registration flow** - Terms acceptance checkbox (MUST HAVE)
2. ✅ **Forced booking modal** - Terms reference in footer
3. ✅ **Account suspension notices** - Policy violation links

### Phase 2 (Week 1)
4. ⏳ **Dashboard navigation** - Add Terms link to sidebar
5. ⏳ **Availability score page** - Link to scoring policy
6. ⏳ **Email notifications** - Add Terms reminder in footer

### Phase 3 (Month 1)
7. ⏳ **Notification settings** - Add responsibility reminder
8. ⏳ **Onboarding flow** - Welcome screen with Terms
9. ⏳ **Footer links** - Add to global footer

---

## 📊 TRACKING ACCEPTANCE

### Database Schema Update

**Collection:** `therapists`

**New Fields:**
```typescript
{
  termsAccepted: boolean,           // Must be true to register
  termsAcceptedDate: string,        // ISO timestamp
  termsVersion: string,             // e.g., "2.0"
  termsLastViewedDate: string,      // Track when they last viewed
  termsAcknowledgments: [           // Track each time they acknowledge
    {
      date: string,
      version: string,
      trigger: string               // e.g., "registration", "policy-update"
    }
  ]
}
```

### Version Control

When terms are updated:
1. Increment version (2.0 → 2.1)
2. Update `last-updated` date in document
3. Send notification to all therapists
4. Require re-acceptance for material changes

---

## 🔍 COMPLIANCE CHECKLIST

Before going live:

- [ ] Terms page displays correctly on desktop
- [ ] Terms page displays correctly on mobile
- [ ] All 7 legal sections are complete
- [ ] Tables render properly (scoring, violations, ranges)
- [ ] Links work (internal anchors)
- [ ] Registration requires terms acceptance
- [ ] Terms acceptance stored in database
- [ ] Forced booking modal references terms
- [ ] Suspension notices link to relevant sections
- [ ] Email notifications include terms reminder
- [ ] Version number and date are current
- [ ] Governing law specified (Indonesia)
- [ ] Dispute resolution method specified (BANI)

---

## ⚖️ LEGAL VALIDITY

These terms are designed to be:

✅ **Enforceable** - Clear, specific, industry-standard language  
✅ **Defensible** - Justified by legitimate business interests  
✅ **Fair** - Applied equally to all therapists  
✅ **Transparent** - Clear scoring rules and penalties  
✅ **Reasonable** - 5-minute response time is industry standard  
✅ **Necessary** - Protects platform operations and customer trust  

---

## 🎓 THERAPIST EDUCATION

**Recommended:**
1. Create short video explaining key terms (3-5 minutes)
2. Add tooltips/popups for first-time users
3. Send welcome email with Terms summary
4. Display Terms reminder when availability status changed
5. Show Terms excerpt in forced booking modal

**Key Messages to Emphasize:**
- "5 minutes to respond - set timers if needed"
- "Your score affects your search ranking"
- "Platform-only communication protects your commission"
- "Missed bookings hurt your visibility"
- "Keep notifications enabled and volume up"

---

## 📞 SUPPORT RESOURCES

**For Therapists with Questions:**
- FAQ section about Terms
- Live chat support
- Email: support@indastreet.com
- Phone: [Your support number]

**Common Questions:**
1. "What happens if I miss one booking?" → -10 points, minor impact
2. "Can I appeal a suspension?" → Only if system error proven
3. "Why can't I use WhatsApp?" → Commission protection policy
4. "What if my phone dies?" → Your responsibility per Section 2
5. "Is 5 minutes enough time?" → Yes, industry standard (Uber, DoorDash)

---

**✅ SUMMARY:**

The Therapist Terms & Conditions page is complete and ready for integration. Priority is adding it to the **registration flow with mandatory acceptance checkbox**. This legally protects the platform's right to enforce availability scoring, visibility adjustments, and platform-only communication policies.

All clauses are written to be enforceable in Indonesian courts under Republic of Indonesia law with BANI arbitration for disputes.
