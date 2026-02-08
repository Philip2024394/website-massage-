# 🔒 PRODUCTION LOCK — THERAPIST SYSTEM

**Status:** ACTIVE — ADMIN-CONTROLLED LOCK  
**Owner:** @Philip2024394  
**Last Verified:** February 9, 2026

---

## ⚠️ CRITICAL PRODUCTION LOCK

The Therapist Dashboard and Sign-In system is **LIVE and REVENUE-CRITICAL**.  
These areas previously caused instability when changed.  
They are now **WORKING and LOCKED**.

**Admin Unlock Required** for any modifications.

---

## 🔐 LOCKED FILES (ADMIN UNLOCK REQUIRED)

### Therapist Authentication
- `src/pages/auth/TherapistLoginPage.tsx` - Sign-in page
- `src/lib/auth.ts` - Therapist auth functions (therapistAuth section)

### Therapist Dashboard Core
- `src/pages/therapist/TherapistDashboardPage.tsx` - Main dashboard
- `src/components/therapist/TherapistLayout.tsx` - Dashboard layout & navigation
- `src/components/TherapistDashboardGuard.tsx` - Error boundary

### Data Display Components
- `src/pages/therapist/TherapistBookingsPage.tsx` - Booking list UI
- `src/pages/therapist/CommissionPayment.tsx` - Commission display
- `src/pages/therapist/MyBookings.tsx` - Booking management

---

## ❌ PROHIBITED WITHOUT ADMIN UNLOCK

**DO NOT:**
- ❌ Change layouts or render order
- ❌ Refactor hooks or state management
- ❌ Add new effects or lifecycle logic
- ❌ Change auth flow or validation
- ❌ Change route guards or navigation
- ❌ Modify dashboard navigation structure
- ❌ Add business logic to UI components
- ❌ Make direct database calls from UI
- ❌ Change component mounting behavior

---

## ✅ ALWAYS ALLOWED (NO UNLOCK NEEDED)

### Therapist Actions
Therapists can **ALWAYS** do these actions (data only):
- ✅ Upload profile data
- ✅ Update services & prices
- ✅ Update availability schedule
- ✅ Upload profile images
- ✅ Receive and view bookings
- ✅ View commission due
- ✅ Receive admin updates
- ✅ Update contact information

### Data Flow
Data **ALWAYS** flows through services:
- ✅ Booking → Therapist dashboard
- ✅ Booking → Admin dashboard
- ✅ Commission → Admin → Therapist
- ✅ Status updates (pending/completed/paid)

**Architecture Rule:**  
```
UI → Service Layer → Backend
UI NEVER → Backend directly
```

---

## 🔑 ADMIN UNLOCK MECHANISM

### How It Works

Changes to locked files are **BLOCKED** unless an admin unlock flag is present.

### Creating Admin Unlock

**File:** `ADMIN_UNLOCK_THERAPIST.flag`

```plaintext
ADMIN_UNLOCK=true
SCOPE=THERAPIST_DASHBOARD
ISSUED_BY=@Philip2024394
DATE=2026-02-09
REASON=Fix critical commission calculation bug
DEVELOPER=JohnDoe
EXPIRES=2026-02-10
```

**Rules:**
1. ✅ Flag file present = changes allowed
2. ✅ After change completed = **MUST remove flag**
3. ✅ Removal = automatic re-lock
4. 🚫 No flag = commits blocked

---

## 🛡️ PROTECTION LAYERS

### Layer 1: In-Code Comments
Each locked file has a warning at the top.

### Layer 2: Git Pre-Commit Hook
- Checks for `ADMIN_UNLOCK_THERAPIST.flag`
- If flag missing and therapist files modified → **BLOCK COMMIT**
- Bypass only possible with flag present

### Layer 3: CI/CD Check
- Runs on every push/PR
- Checks for admin unlock flag
- **Blocks deployment** if flag missing and files modified
- Posts PR comment explaining violation

### Layer 4: CODEOWNERS
- Requires @Philip2024394 approval
- Cannot merge PR without owner review

---

## 📋 CHANGE CONTROL PROCESS

### Step 1: Request Admin Unlock

```bash
# Open GitHub Issue
Title: [ADMIN UNLOCK] Fix therapist commission display
Body:
- Reason: Commission calculation showing incorrect values
- Files: TherapistDashboardPage.tsx, CommissionPayment.tsx
- Expected impact: Fix display only, no data changes
- Testing: Already tested locally
- Rollback plan: Git revert if issues
```

### Step 2: Owner Review & Approval

Owner reviews and either:
- ✅ **Approves** - Creates unlock flag
- ❌ **Rejects** - Explains why

### Step 3: Make Changes (With Flag Present)

```bash
# Clone repo (flag should be present)
git pull

# Verify flag exists
ls ADMIN_UNLOCK_THERAPIST.flag

# Make approved changes
# Edit files...

# Commit (will pass pre-commit hook)
git add .
git commit -m "Fix commission display [ADMIN APPROVED]"
```

### Step 4: Remove Unlock Flag

```bash
# CRITICAL: Remove flag immediately after change
git rm ADMIN_UNLOCK_THERAPIST.flag
git commit -m "Remove admin unlock - changes complete"
git push
```

**System is now re-locked automatically.**

---

## 🚨 EMERGENCY BYPASS (CRITICAL ONLY)

If absolutely critical (production down):

```bash
# 1. Create emergency flag yourself
echo "ADMIN_UNLOCK=true
SCOPE=THERAPIST_DASHBOARD
ISSUED_BY=@Philip2024394
DATE=$(date +%Y-%m-%d)
REASON=EMERGENCY: Production down
EMERGENCY=true" > ADMIN_UNLOCK_THERAPIST.flag

# 2. Make fix
git add .
git commit -m "EMERGENCY FIX: [describe issue]"
git push

# 3. Notify owner IMMEDIATELY
# 4. Remove flag IMMEDIATELY after fix deployed

# 5. Document in audit trail
```

**Use only when:**
- Production is down
- Revenue is blocked
- Users cannot access system
- Cannot wait for owner approval

**Do NOT use for:**
- Features
- Refactors
- Minor bugs
- Improvements

---

## 🔍 VERIFICATION CHECKLIST

Before removing admin unlock flag:

- [ ] All approved changes completed
- [ ] Changes tested locally
- [ ] No UI breaks or navigation issues
- [ ] Auth flow still works
- [ ] Dashboard renders correctly
- [ ] Bookings display correctly
- [ ] Commission displays correctly
- [ ] No console errors
- [ ] Changes documented in PR/commit
- [ ] Owner notified of completion

---

## 🧪 TESTING ADMIN UNLOCK

### Test Lock is Active

```bash
# 1. Ensure no flag exists
rm ADMIN_UNLOCK_THERAPIST.flag

# 2. Modify a locked file
echo "// test" >> src/pages/therapist/TherapistDashboardPage.tsx

# 3. Try to commit
git add .
git commit -m "test"
# Should show: 🚫 THERAPIST SYSTEM IS LOCKED - Admin unlock required
```

### Test Unlock Works

```bash
# 1. Create flag
echo "ADMIN_UNLOCK=true" > ADMIN_UNLOCK_THERAPIST.flag

# 2. Try same commit
git add .
git commit -m "test"
# Should succeed ✅

# 3. Cleanup
git reset HEAD~1
rm ADMIN_UNLOCK_THERAPIST.flag
git restore src/pages/therapist/TherapistDashboardPage.tsx
```

---

## 🎯 ARCHITECTURE GUARANTEES

### UI Separation
```typescript
// ✅ CORRECT: Service layer handles logic
const bookings = await bookingService.getTherapistBookings(therapistId);
setBookings(bookings);

// ❌ WRONG: UI component has business logic
const bookings = data.filter(b => b.status === 'active')
  .map(b => calculateCommission(b))
  .sort(...);
```

### Data Resilience
```typescript
// UI must render even if data fails
{loading ? (
  <SkeletonLoader />
) : error ? (
  <ErrorFallback message="Unable to load bookings" />
) : (
  <BookingList bookings={bookings} />
)}
```

### No Direct DB Access
```typescript
// ❌ FORBIDDEN in UI components
import { databases } from '../lib/appwrite';
const response = await databases.listDocuments(...);

// ✅ REQUIRED: Use service layer
import { bookingService } from '../services/bookingService';
const bookings = await bookingService.getBookings();
```

---

## 📊 ADMIN UNLOCK AUDIT TRAIL

| Date | Issued By | Developer | Reason | Files | Removed |
|------|-----------|-----------|--------|-------|---------|
| 2026-02-09 | @Philip2024394 | - | Lock established | All therapist files | N/A |
| | | | | | |
| | | | | | |

**Format for new entries:**
```
| YYYY-MM-DD | @Owner | DeveloperName | Brief reason | File1.tsx, File2.tsx | YYYY-MM-DD |
```

---

## 🚫 FAILURE SCENARIOS

### What Happens on Lock Violation

**Local (pre-commit):**
```
❌ THERAPIST SYSTEM IS LOCKED
Admin unlock required to modify dashboard or sign-in.

Required file: ADMIN_UNLOCK_THERAPIST.flag
Modified files:
  - src/pages/therapist/TherapistDashboardPage.tsx

To proceed:
1. Request admin unlock via GitHub Issue
2. Wait for flag to be added
3. Retry commit
```

**CI/CD:**
```
❌ CI FAILED: THERAPIST LOCK VIOLATION

Therapist dashboard files modified without admin unlock flag.

This system is revenue-critical and must not change accidentally.

Required actions:
1. Revert changes or create GitHub Issue
2. Get admin unlock approval
3. Retry deployment with flag present
```

**GitHub PR:**
- Cannot merge without owner approval
- Bot posts comment explaining lock
- Flags must be resolved before merge

---

## 📞 SUPPORT

**Questions about therapist lock:**
- Open GitHub Issue with tag: `therapist-lock`
- Tag @Philip2024394
- Include: What you want to change and why

**Emergency production issues:**
- Follow emergency bypass process
- Notify @Philip2024394 immediately
- Document everything in audit trail

---

## 🔐 WHY THIS MODEL (UBER/GOJEK PATTERN)

### Industry Standard Approach

**What Uber/Gojek/Grab do:**
1. Lock UI + auth flows
2. Allow data movement via APIs
3. Changes only via explicit release process
4. Auto-relock after changes

**What we're doing (same pattern):**
1. Lock therapist UI + auth
2. Allow data updates via services
3. Changes only via admin unlock flag
4. Auto-relock when flag removed

**Result:** Stable production system with controlled change management.

---

## ✅ FINAL GUARANTEES

**System Guarantees:**
- ✅ Therapist can upload & update data
- ✅ Bookings always flow to dashboard
- ✅ Commission updates always sync
- ✅ Admin controls payouts & status
- ✅ UI will not randomly break
- ✅ Changes require explicit admin intent
- ✅ System auto-relocks after updates
- ✅ Unauthorized changes are blocked

**User Experience:**
- ✅ Therapists have full access to features
- ✅ Dashboard always loads
- ✅ Data always displays
- ✅ No sudden UI changes
- ✅ Stable authentication

---

🔒 **Therapist system is infrastructure. Stable, reliable, admin-controlled.**
