# 🔒 THERAPIST LOCK - QUICK REFERENCE

## ⚡ Status

**Locked Files:** Therapist Dashboard, Login, Layout, Bookings, Commission  
**Lock Type:** 🔑 **ADMIN-CONTROLLED** (requires unlock flag)  
**Status:** 🔴 **ACTIVE**

---

## 🚫 Can I modify therapist files?

**NO** - Not without admin unlock flag

**Why?**  
Revenue-critical system. Changes require controlled approval process.

---

## 🔑 How Admin Unlock Works

### Normal Development (No Therapist Changes)
```bash
# Works normally
git commit -m "Add customer feature"
✅ OK
```

### Modifying Therapist Files (BLOCKED)
```bash
# Edit therapist file
vim src/pages/therapist/TherapistDashboardPage.tsx

# Try to commit
git commit -m "Update dashboard"
🚫 THERAPIST SYSTEM IS LOCKED
Admin unlock required: ADMIN_UNLOCK_THERAPIST.flag
```

### With Admin Unlock Flag (ALLOWED)
```bash
# Flag exists (created by owner)
ls ADMIN_UNLOCK_THERAPIST.flag
✅ Present

# Now commit works
git commit -m "Update dashboard [ADMIN APPROVED]"
✅ OK

# MUST remove flag after
git rm ADMIN_UNLOCK_THERAPIST.flag
git commit -m "Remove admin unlock"
```

---

## 📋 Requesting Admin Unlock

### Step 1: Open GitHub Issue
```
Title: [ADMIN UNLOCK] Fix commission calculation

Body:
Reason: Commission display showing incorrect percentages
Files: CommissionPayment.tsx
Impact: Display fix only, no data changes
Testing: Tested locally
Rollback: Git revert if issues
```

### Step 2: Wait for Approval
Owner reviews and either:
- ✅ Creates `ADMIN_UNLOCK_THERAPIST.flag` → You can proceed
- ❌ Declines → Explains why

### Step 3: Make Changes (With Flag)
```bash
git pull  # Get unlock flag
# Make approved changes
git commit -m "Fix commission [APPROVED]"
```

### Step 4: Remove Flag
```bash
git rm ADMIN_UNLOCK_THERAPIST.flag
git commit -m "Remove unlock"
git push
```

---

## ✅ What Therapists Can Still Do

**All normal actions work:**
- ✅ Upload profile data
- ✅ Update services & prices
- ✅ Update availability
- ✅ Upload images
- ✅ View bookings
- ✅ View commission
- ✅ Receive updates

**Only CODE changes are locked.**

---

## 🚨 Emergency Bypass

**Only for production-down scenarios:**

```bash
# Create emergency flag
cat > ADMIN_UNLOCK_THERAPIST.flag << EOF
ADMIN_UNLOCK=true
SCOPE=THERAPIST_DASHBOARD
ISSUED_BY=@Philip2024394
DATE=$(date +%Y-%m-%d)
REASON=EMERGENCY: Production down - therapist login broken
EMERGENCY=true
EOF

# Make fix
git add .
git commit -m "EMERGENCY FIX: therapist login"
git push

# Notify owner IMMEDIATELY
# Remove flag IMMEDIATELY after deployed
git rm ADMIN_UNLOCK_THERAPIST.flag
git commit -m "Remove emergency unlock"
git push
```

**Use only when:**
- Production is down
- Therapists cannot login
- Revenue is blocked
- Cannot wait for approval

---

## 🧪 Testing the Lock

### Test Lock Active
```bash
# No flag present
rm ADMIN_UNLOCK_THERAPIST.flag 2>/dev/null

# Modify therapist file
echo "// test" >> src/pages/therapist/TherapistDashboardPage.tsx

# Try commit
git add .
git commit -m "test"
# 🚫 THERAPIST SYSTEM IS LOCKED

# Cleanup
git restore src/pages/therapist/TherapistDashboardPage.tsx
```

### Test Unlock Works
```bash
# Create flag
echo "ADMIN_UNLOCK=true" > ADMIN_UNLOCK_THERAPIST.flag

# Same commit now works
git add .
git commit -m "test"
# ✅ Admin unlock detected - allowed

# Cleanup
git reset HEAD~1
rm ADMIN_UNLOCK_THERAPIST.flag
```

---

## 📁 Locked Files List

### Authentication
- `src/pages/auth/TherapistLoginPage.tsx`

### Dashboard Core
- `src/pages/therapist/TherapistDashboardPage.tsx`
- `src/components/therapist/TherapistLayout.tsx`
- `src/components/TherapistDashboardGuard.tsx`

### Data Display
- `src/pages/therapist/TherapistBookingsPage.tsx`
- `src/pages/therapist/CommissionPayment.tsx`
- `src/pages/therapist/MyBookings.tsx`

---

## 📚 Full Documentation

- `PRODUCTION_LOCK_THERAPIST.md` - Complete guide
- `ADMIN_UNLOCK_THERAPIST.flag.template` - Unlock flag template
- `CODEOWNERS` - File ownership rules

---

## ❓ FAQ

**Q: Can I fix a bug in therapist dashboard?**  
A: Request admin unlock via GitHub Issue.

**Q: Can I add a feature to therapist area?**  
A: Request admin unlock via GitHub Issue.

**Q: Can I update therapist translations?**  
A: Request admin unlock (or if it's just text, ask owner).

**Q: Production is down, what do I do?**  
A: Use emergency bypass, notify owner immediately.

**Q: I got unlock approval, what's next?**  
A: Make changes, commit, remove flag, push.

**Q: I forgot to remove unlock flag!**  
A: Remove it ASAP: `git rm ADMIN_UNLOCK_THERAPIST.flag && git commit -m "Remove unlock" && git push`

---

## 🎯 Key Points

1. **Therapist files are locked** - Cannot be modified without flag
2. **Admin creates unlock flag** - After approving your request
3. **You make approved changes** - Only those discussed
4. **You remove flag immediately** - System re-locks automatically
5. **Therapist features still work** - Users not affected

---

🔒 **Therapist system uses Uber/Gojek pattern: Lock UI, allow data, control changes.**
