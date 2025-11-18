# Feature Branch Workflow - Quick Start Guide

## 🚀 Load Helper Commands

Every time you open PowerShell in this project:

```powershell
. .\git-helpers.ps1
```

Then run `git-help` to see all commands.

---

## 📖 Daily Workflow Example

### **Scenario 1: Working on Therapist Dashboard**

```powershell
# 1. Load helpers
. .\git-helpers.ps1

# 2. Start working on therapist dashboard
work-on therapist

# 3. Make your changes to TherapistDashboardPage.tsx
# Edit files normally in VS Code...

# 4. Test your changes
pnpm dev

# 5. When done and tested, merge back
merge-work
```

### **Scenario 2: Working on Promoter Dashboard**

```powershell
# Start work
work-on promoter

# Edit PromoterLiveMenuPage.tsx and related files...

# Save progress during work
savepoint

# Continue editing...

# When finished
merge-work
```

### **Scenario 3: Working on Multiple Dashboards**

```powershell
# Morning: Work on promoter
work-on promoter
# Edit promoter files...
# Don't merge yet!

# Afternoon: Need to quickly fix therapist
work-on therapist
# Edit therapist files...
merge-work  # Merge therapist fixes

# Back to promoter work
git checkout work/promoter-dashboard-1118
# Continue promoter work...
merge-work  # Merge when done
```

---

## 🛟 Emergency Recovery

### **Dashboard is Broken**

```powershell
# Restore specific dashboard from backup
restore-dashboard therapist
```

### **Everything is Broken**

```powershell
# Undo recent uncommitted changes
undo
# Choose option 1

# OR go back to stable version
git checkout production-stable
```

### **Need to See What Changed**

```powershell
see-changes
```

---

## 💡 Best Practices

### **Before Starting Work Each Day**

```powershell
# Load helpers
. .\git-helpers.ps1

# Create morning backup
savepoint

# Start working
work-on therapist  # or promoter, place, admin, customer
```

### **During Work**

```powershell
# Save progress every 30 minutes
savepoint

# Check what you changed
see-changes
```

### **After Finishing Work**

```powershell
# Merge your changes
merge-work

# Update stable backup (once a day)
update-stable
```

---

## 🔍 Command Reference

| Command | What It Does | Example |
|---------|--------------|---------|
| `work-on <dashboard>` | Start working on specific dashboard | `work-on therapist` |
| `merge-work` | Merge your work back to main | `merge-work` |
| `savepoint` | Quick save with timestamp | `savepoint` |
| `undo` | Undo recent changes (interactive) | `undo` |
| `restore-dashboard <name>` | Restore from backup | `restore-dashboard therapist` |
| `see-changes` | Show what changed | `see-changes` |
| `quick-backup` | Create timestamped backup | `quick-backup` |
| `list-work` | Show all work branches | `list-work` |
| `update-stable` | Update production-stable | `update-stable` |
| `git-help` | Show all commands | `git-help` |

---

## 📚 Understanding the Workflow

### **What Happens Behind the Scenes**

When you run `work-on therapist`:
1. ✅ Saves any uncommitted work
2. ✅ Creates branch like `work/therapist-dashboard-1118`
3. ✅ Switches to that branch
4. ✅ You edit files in isolation

When you run `merge-work`:
1. ✅ Commits your changes
2. ✅ Switches back to main
3. ✅ Merges your work branch into main
4. ✅ Pushes to GitHub
5. ✅ Optionally deletes work branch

### **Branch Protection**

Your dashboards are protected by:
- `production-stable` - Last known good state
- `protect/therapist-dashboard` - Therapist backup
- Feature branches - Isolated work

### **Why This Works**

✅ Each dashboard edit is isolated  
✅ Can work on multiple dashboards  
✅ Easy to undo mistakes  
✅ Always have backup  
✅ Industry standard practice

---

## 🎯 Quick Examples

### **Example 1: Quick Fix**
```powershell
work-on therapist
# Fix bug in TherapistDashboardPage.tsx
merge-work
```

### **Example 2: Major Feature**
```powershell
work-on promoter
# Add new feature...
savepoint  # Save progress
# Add more features...
savepoint  # Save again
# Test everything
merge-work
```

### **Example 3: Undo Mistake**
```powershell
work-on admin
# Oh no, broke something!
undo  # Choose option 1 to restore
# Or start over:
restore-dashboard admin
```

---

## 🔧 Setup in PowerShell Profile (Optional)

To load helpers automatically every time you open PowerShell:

1. Edit your profile:
```powershell
notepad $PROFILE
```

2. Add this line:
```powershell
Set-Location "C:\Users\Victus\Downloads\website-massage-FRESH\website-massage--new"
. .\git-helpers.ps1
```

3. Save and restart PowerShell

Now helpers load automatically!

---

## 📞 Need Help?

Run `git-help` anytime to see all commands.

For Git basics:
- `git status` - See what changed
- `git log --oneline -10` - See recent commits
- `git branch` - See all branches
