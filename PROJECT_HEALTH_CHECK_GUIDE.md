# 🏥 Project Health Check & Cleanup Guide

## Overview

This tool performs comprehensive health checks on your project and helps maintain code quality by:
- Identifying deprecated/unused files
- Scanning for large files that may affect performance
- Checking configuration integrity
- Providing actionable recommendations
- Optionally cleaning up old files

---

## 🚀 Quick Start

### Run Health Check (Safe - No Changes)

```powershell
npx tsx scripts/projectHealthCheck.ts
```

This will:
- ✅ Scan for deprecated files
- ✅ Find large files (>500KB)
- ✅ Check configuration files
- ✅ Analyze dependencies
- ✅ Generate recommendations
- ❌ **NOT delete or modify anything**

### Clean Up Deprecated Files

⚠️ **WARNING**: This will permanently delete files!

```powershell
npx tsx scripts/projectHealthCheck.ts --cleanup
```

### Archive Completed Documentation

```powershell
npx tsx scripts/projectHealthCheck.ts --archive-docs
```

### Full Cleanup (Files + Docs)

```powershell
npx tsx scripts/projectHealthCheck.ts --cleanup --archive-docs
```

---

## 📋 What Gets Checked

### 1. **Deprecated Files**

Files that are no longer used and can be safely deleted:

| File | Reason | Safe to Delete? |
|------|--------|-----------------|
| `pages/TherapistJobsPage.tsx` | Replaced by `MassageJobsPage.tsx` | ✅ Yes |
| `translations-backup.ts` | Old backup of translations | ✅ Yes |
| `test-chat-connection.ts` | Development test script | ⚠️ Keep for testing |

### 2. **Development-Only Files**

Files used for testing/development:

| File | Purpose | Production? |
|------|---------|-------------|
| `sound-test.html` | Testing notification sounds | ❌ Dev only |
| `agent-visits-schema-chart.html` | Database schema visualization | ❌ Dev only |

**Recommendation**: Keep these during development, remove before final production build.

### 3. **Large Files (>500KB)**

The tool scans these directories:
- `pages/` - Page components
- `components/` - React components
- `lib/` - Libraries and services
- `utils/` - Utility functions
- `services/` - Service modules

Large files may indicate:
- Missing code splitting
- Opportunity for lazy loading
- Duplicated code
- Unoptimized images or assets

### 4. **Configuration Files**

Checks for essential config files:
- ✅ `package.json` - Dependencies and scripts
- ✅ `tsconfig.json` - TypeScript configuration
- ✅ `vite.config.ts` - Vite build configuration
- ✅ `.env.example` - Environment variables template

### 5. **Unused Dependencies**

Scans for potentially unused packages:
- `moment` (often replaced by date-fns or native Date)
- `lodash` (check if fully utilized)
- `jquery` (rarely needed in React)

---

## 📊 Example Output

```
🏥 Project Health Check

═══════════════════════════════════════════════════

🔍 Scanning for deprecated files...
   ⚠️  Found: pages/TherapistJobsPage.tsx
   ❌ Found 1 deprecated file(s)

🔍 Scanning for development-only files...
   ⚠️  Found: sound-test.html
   ⚠️  Found 1 development file(s) (can keep for testing)

🔍 Scanning for large files (>500KB)...
   ⚠️  Found 2 large file(s):
      pages/RewardBannersTestPage.tsx (567.23 KB)
      lib/coinServiceTests.ts (523.45 KB)

🔍 Checking configuration files...
   ✅ All configuration files present

🔍 Checking for potential unused dependencies...
   ✅ No obvious unused dependencies

📊 HEALTH REPORT SUMMARY
═══════════════════════════════════════════════════
Deprecated files:         1
Development files:        1
Large files (>500KB):     2
Configuration issues:     0
Potential unused deps:    0
═══════════════════════════════════════════════════

💡 RECOMMENDATIONS
═══════════════════════════════════════════════════
1. 🗑️  Remove deprecated files to clean up the codebase
2. 📦 Review large files - consider code splitting or lazy loading
3. 📚 Consider organizing completed documentation into an /archive folder
4. 🧪 Run tests before deployment: npm test
5. 📊 Check bundle size: npm run build
6. 🔒 Review .env files - ensure no secrets are committed
7. 🚀 Run linter: npm run lint (if configured)
═══════════════════════════════════════════════════

💡 To remove deprecated files, run with --cleanup flag
💡 To archive completed docs, run with --archive-docs flag

🏥 OVERALL HEALTH SCORE
═══════════════════════════════════════════════════
Score: 85/100
Status: 🟢 Excellent - Project is in great shape!
═══════════════════════════════════════════════════
```

---

## 🎯 Health Score Calculation

The tool calculates an overall health score (0-100):

```
Starting Score: 100

Deductions:
- Each deprecated file: -5 points
- Each config issue: -10 points
- Each large file: -2 points (max -20)
```

### Score Ranges:

| Score | Status | Meaning |
|-------|--------|---------|
| 90-100 | 🟢 Excellent | Project is in great shape |
| 70-89 | 🟡 Good | Minor issues to address |
| 50-69 | 🟠 Fair | Some cleanup recommended |
| 0-49 | 🔴 Needs Attention | Multiple issues found |

---

## 🗑️ What Gets Deleted (--cleanup)

### Safe to Delete:

✅ **pages/TherapistJobsPage.tsx**
- Reason: Replaced by `MassageJobsPage.tsx`
- Impact: None (no longer referenced)
- Last used: Before migration to unified jobs page

✅ **translations-backup.ts**
- Reason: Old backup file
- Impact: None (current translations in `translations/index.ts`)
- Can be restored from git history if needed

### NOT Deleted Automatically:

❌ Development test files (kept for debugging)
❌ Documentation files (must use `--archive-docs`)
❌ Any file actively imported by the codebase

---

## 📚 Documentation Archiving (--archive-docs)

### Files That Get Archived:

Completed feature documentation files are moved to `docs/archive/`:

- `ACTIVATION_COMPLETE.md`
- `ADMIN_DASHBOARD_COMPLETE.md`
- `ADMIN_FIXES_COMPLETE.md`
- `BACKEND_COMPLETE.md`
- `FIXES_AND_ENHANCEMENTS_COMPLETE.md`
- `FINAL_STATUS_REPORT.md`
- `INTEGRATION_GUIDE.md`
- `MIGRATION_COMPLETE.md`
- `SCHEMA_ALIGNMENT_COMPLETE.md`
- `MASSAGE_TYPES_COMPLETE.md`
- `LOYALTY_SYSTEM_COMPLETE.md`
- `CUSTOMER_SYSTEM_CONFIRMATION.md`

These are historical documentation about completed features. They remain accessible in the archive but don't clutter the root directory.

---

## 🔍 Manual Cleanup Checklist

After running the automated health check, consider these manual steps:

### Code Quality

- [ ] Run ESLint: `npm run lint`
- [ ] Run Prettier: `npm run format` (if configured)
- [ ] Check TypeScript errors: `npx tsc --noEmit`
- [ ] Review unused imports (TypeScript will warn)

### Build Optimization

- [ ] Build production bundle: `npm run build`
- [ ] Analyze bundle size: `npx vite-bundle-visualizer`
- [ ] Check for duplicate dependencies: `npm dedupe`
- [ ] Update outdated packages: `npm outdated`

### Security

- [ ] Run security audit: `npm audit`
- [ ] Fix vulnerabilities: `npm audit fix`
- [ ] Review `.env` files - ensure no secrets committed
- [ ] Check `.gitignore` is properly configured

### Performance

- [ ] Test loading speed: Lighthouse audit
- [ ] Check image optimization
- [ ] Review lazy loading implementation
- [ ] Verify code splitting in routes

### Documentation

- [ ] Update README.md with current features
- [ ] Document new environment variables
- [ ] Update deployment instructions
- [ ] Add JSDoc comments to complex functions

---

## 🛡️ Safety Features

### Dry Run by Default
The script **NEVER** deletes files unless you explicitly add the `--cleanup` flag.

### Detailed Reporting
Every file operation is logged with success/failure status.

### Git Safety
Before running cleanup:
1. Ensure all changes are committed
2. Create a backup branch: `git checkout -b backup-before-cleanup`
3. Run health check first
4. Review what will be deleted
5. Then run with `--cleanup`

### Recovery
If you accidentally delete something:
```powershell
# Restore from git
git checkout HEAD -- path/to/deleted/file

# Or restore from previous commit
git log --all --full-history -- path/to/deleted/file
git checkout <commit-hash> -- path/to/deleted/file
```

---

## 📅 Recommended Schedule

### Weekly

```powershell
# Quick health check
npx tsx scripts/projectHealthCheck.ts
```

### Monthly

```powershell
# Full cleanup and documentation archive
npx tsx scripts/projectHealthCheck.ts --cleanup --archive-docs
npm audit
npm outdated
```

### Before Major Releases

```powershell
# Comprehensive cleanup
npx tsx scripts/projectHealthCheck.ts --cleanup --archive-docs
npm run build
npm test
npm audit fix
```

---

## 🔧 Troubleshooting

### Error: Cannot find file to delete

**Problem**: File was already deleted or path is incorrect

**Solution**: Re-run health check to get current state

### Error: Permission denied

**Problem**: File is in use or locked

**Solution**:
1. Close all editors/IDEs
2. Stop dev server
3. Try again

### Large files detected but seem necessary

**Problem**: Files like test pages are large but needed

**Solution**: These are informational warnings. Review if:
- Code can be split into smaller modules
- Lazy loading can be applied
- File contains duplicated code

### Configuration file missing

**Problem**: Essential config file not found

**Solution**: Check if file exists in a different location or was accidentally deleted. Restore from git or recreate.

---

## 📞 Integration with Other Tools

### Combine with Storage Cleanup

```powershell
# Clean project files
npx tsx scripts/projectHealthCheck.ts --cleanup

# Clean Appwrite storage
$env:APPWRITE_API_KEY="your-key"
npx tsx scripts/cleanupUnusedFiles.ts --delete

# Total cleanup!
```

### Before Git Push

Add to your workflow:
```powershell
# Health check
npx tsx scripts/projectHealthCheck.ts

# Build test
npm run build

# Then commit and push
git add -A
git commit -m "Clean up project"
git push origin main
```

### CI/CD Integration

Add to GitHub Actions:
```yaml
- name: Health Check
  run: npx tsx scripts/projectHealthCheck.ts
  
- name: Check for deprecated files
  run: |
    if npx tsx scripts/projectHealthCheck.ts | grep "Deprecated files:.*[1-9]"; then
      echo "Warning: Deprecated files found"
      exit 1
    fi
```

---

## 📊 Understanding Large Files

### What is considered "large"?

**Threshold**: 500 KB (500,000 bytes)

### Why does it matter?

Large files can:
- Slow down IDE performance
- Increase bundle size
- Make code harder to maintain
- Indicate architectural issues

### Common causes:

1. **Test files with many examples** (e.g., `RewardBannersTestPage.tsx`)
   - Solution: Split into multiple test files
   
2. **Service files with embedded data** (e.g., `coinServiceTests.ts`)
   - Solution: Move test data to separate JSON files
   
3. **Components with many variants**
   - Solution: Extract sub-components
   
4. **Utility files with many functions**
   - Solution: Split by functionality

### Example refactoring:

**Before** (large file):
```tsx
// RewardBannersTestPage.tsx (567 KB)
const RewardBannersTestPage = () => {
  // 50+ modal variants inline
}
```

**After** (modular):
```tsx
// RewardBannersTestPage.tsx (100 KB)
import { DailyRewardModals } from './components/DailyRewardModals';
import { BookingRewardModals } from './components/BookingRewardModals';
import { MilestoneRewardModals } from './components/MilestoneRewardModals';
```

---

## 🎯 Best Practices

### Keep It Clean

- Run health check weekly
- Address issues promptly
- Archive completed documentation
- Remove deprecated code immediately

### Document Changes

- Update CHANGELOG.md when removing files
- Add comments explaining why code was removed
- Keep git history clean with meaningful commits

### Test After Cleanup

```powershell
# After cleanup, always test:
npm run dev         # Dev server starts
npm run build       # Production build works
npm test           # Tests pass (if configured)
```

### Communicate with Team

Before major cleanup:
1. Notify team members
2. Ensure all branches are up to date
3. Run cleanup on a separate branch first
4. Review changes together
5. Merge after approval

---

## 📝 Quick Reference

| Command | Action |
|---------|--------|
| `npx tsx scripts/projectHealthCheck.ts` | Health check only (safe) |
| `npx tsx scripts/projectHealthCheck.ts --cleanup` | Delete deprecated files |
| `npx tsx scripts/projectHealthCheck.ts --archive-docs` | Move completed docs |
| `npx tsx scripts/projectHealthCheck.ts --cleanup --archive-docs` | Full cleanup |

**Cleanup Score Impact:**
- Deprecated file: -5 points each
- Config issue: -10 points each
- Large file: -2 points each (max -20)

---

**Last Updated**: October 31, 2025  
**Script Location**: `scripts/projectHealthCheck.ts`  
**Maintenance**: Run weekly, cleanup monthly
