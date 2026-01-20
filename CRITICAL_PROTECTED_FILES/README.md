# 🔒 CRITICAL PROTECTED FILES - DO NOT DELETE

## ⚠️ PRODUCTION APP WITH ACTIVE MEMBERS

This directory contains **BACKUP COPIES** of mission-critical files that must NEVER be accidentally modified or deleted.

**Members are actively using the app. Changes to these files can break the production system.**

---

## 📋 Protected Files

### Authentication (auth/)
- ✅ `CreateAccountPage.BACKUP.tsx` - Member account creation
- ✅ `LoginPage.BACKUP.tsx` - Member login system

### Dashboards (dashboards/)
- ✅ `TherapistDashboard.BACKUP.tsx` - Therapist profile and settings
- ✅ `TherapistLayout.BACKUP.tsx` - Header with burger menu and navigation

### Booking System (booking/)
- ✅ `TherapistBookings.BACKUP.tsx` - Booking management for therapists

### Chat System (chat/)
- ✅ `PersistentChatProvider.BACKUP.tsx` - Facebook Messenger-style chat

---

## 🚨 EMERGENCY RECOVERY PROCEDURE

If any critical file gets corrupted or accidentally modified:

### Step 1: Stop Immediately
```bash
# Don't commit anything
# Don't push anything
```

### Step 2: Compare with Backup
```bash
# Check differences
code --diff "path/to/broken/file.tsx" "CRITICAL_PROTECTED_FILES/category/file.BACKUP.tsx"
```

### Step 3: Restore from Backup
```bash
# Copy backup over broken file
Copy-Item "CRITICAL_PROTECTED_FILES\category\file.BACKUP.tsx" "path\to\broken\file.tsx" -Force
```

### Step 4: Verify
```bash
# Test the app immediately
pnpm run dev
```

### Step 5: Commit Recovery
```bash
git add path/to/restored/file.tsx
git commit -m "EMERGENCY: Restored critical file from backup"
git push origin main
```

---

## 📅 Backup Update Schedule

**Update backups ONLY when files are confirmed stable in production:**

```bash
# After successful deployment and testing
Copy-Item "pages\auth\CreateAccountPage.tsx" "CRITICAL_PROTECTED_FILES\auth\CreateAccountPage.BACKUP.tsx" -Force
Copy-Item "pages\auth\LoginPage.tsx" "CRITICAL_PROTECTED_FILES\auth\LoginPage.BACKUP.tsx" -Force
Copy-Item "apps\therapist-dashboard\src\pages\TherapistDashboard.tsx" "CRITICAL_PROTECTED_FILES\dashboards\TherapistDashboard.BACKUP.tsx" -Force
Copy-Item "apps\therapist-dashboard\src\components\TherapistLayout.tsx" "CRITICAL_PROTECTED_FILES\dashboards\TherapistLayout.BACKUP.tsx" -Force
Copy-Item "apps\therapist-dashboard\src\pages\TherapistBookings.tsx" "CRITICAL_PROTECTED_FILES\booking\TherapistBookings.BACKUP.tsx" -Force
Copy-Item "context\PersistentChatProvider.tsx" "CRITICAL_PROTECTED_FILES\chat\PersistentChatProvider.BACKUP.tsx" -Force

# Then commit updated backups
git add CRITICAL_PROTECTED_FILES/
git commit -m "chore: update critical file backups after successful deployment"
git push origin main
```

---

## 🛡️ File Protection Rules

### ❌ NEVER:
- Auto-format these files
- Auto-refactor these files
- Let extensions modify these files
- Delete these backups
- Overwrite without testing

### ✅ ALWAYS:
- Test changes in development first
- Create git commit before modifying
- Compare with backup after changes
- Update backups after confirmed stable deployment
- Keep at least 2 working versions

---

## 📞 If Something Breaks

1. **STOP** - Don't make it worse
2. **RESTORE** from backup immediately
3. **TEST** the app works
4. **INVESTIGATE** what went wrong
5. **PREVENT** it from happening again

---

**Last Updated:** January 20, 2026  
**Status:** ✅ All critical files backed up  
**Active Members:** Using production app NOW
