# 🛡️ AUTO-PROTECT SYSTEM - QUICK REFERENCE GUIDE

## 🚀 **SETUP (One-time)**
```powershell
# 1. Enable the protection system
.\auto-protect.ps1 enable

# 2. Start auto-lock watchers (files lock automatically after save)
.\auto-protect.ps1 start-watcher
```

## 📝 **DAILY WORKFLOW**
```powershell
# 1. Check what's locked
.\auto-protect.ps1 status

# 2. Unlock a file for editing
.\auto-protect.ps1 unlock HomePage
.\auto-protect.ps1 unlock MassagePlaceProfile
.\auto-protect.ps1 unlock TherapistStatus

# 3. Edit in VS Code and save - file AUTO-LOCKS! 🔒
```

## 🔧 **DEVELOPMENT COMMANDS**
```powershell
# Start dev server (works with auto-protection)
.\build-hook.ps1 dev

# Build and auto-lock all files
.\build-hook.ps1 build

# Or use regular npm commands
npm run dev
npm run build
```

## ⚡ **QUICK COMMANDS**
```powershell
.\auto-protect.ps1 lock-all          # Lock all 223 files
.\auto-protect.ps1 unlock-all        # Unlock all (with confirmation)
.\auto-protect.ps1 start-watcher     # Enable auto-lock on save
.\auto-protect.ps1 stop-watcher      # Disable auto-lock
.\auto-protect.ps1 status            # Show protection status
```

## 🎯 **CURRENT STATUS**
- **Total files:** 223 (pages + components)
- **Currently locked:** 9 files
- **File watchers:** ✅ ACTIVE (223 watchers)
- **Auto-lock on save:** ✅ ENABLED

## 🔒 **LOCKED FILES**
1. `AcceptBookingPage.tsx`
2. `AdminDashboardPage.tsx`
3. `HomePage.tsx` (just unlocked for demo)
4. `LandingPage.tsx`
5. `MassagePlaceProfilePage.tsx`
6. `TherapistStatusPage.tsx`
7. `HeroSection.tsx`
8. `DashboardComponents.tsx`
9. `AppDrawer.tsx`

## 💡 **BENEFITS**
✅ **Automatic Protection:** All files auto-lock after saves  
✅ **Selective Unlock:** Unlock only what you need to edit  
✅ **Zero Accidents:** No accidental edits to wrong files  
✅ **Full Coverage:** Protects 223 files across pages & components  
✅ **Easy Workflow:** Simple unlock → edit → auto-lock cycle  

## 🆘 **EMERGENCY COMMANDS**
```powershell
# If watchers get stuck
.\auto-protect.ps1 stop-watcher
.\auto-protect.ps1 start-watcher

# Emergency unlock everything
.\auto-protect.ps1 force-unlock-all

# Disable entire system
.\auto-protect.ps1 disable
```

---
**🎉 Your files are now automatically protected! Edit with confidence knowing everything locks after saves!**