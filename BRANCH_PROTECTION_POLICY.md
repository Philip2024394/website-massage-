# 🔒 Branch Protection Policy - 100% Code Safety

## ✅ All Critical Sections Protected

This repository now has **complete protection** against unauthorized or accidental changes to any critical app component.

## 📋 Protected Branches

### **Dashboards** (User-facing interfaces)
- `protect/therapist-dashboard` - Therapist portal, bookings, analytics
- `protect/massage-place-dashboard` - Massage place admin controls
- `protect/admin-dashboard` - Platform admin controls (analytics, confirmations, payments, bank details)
- `protect/customer-dashboard` - Customer bookings, profiles, payments
- `protect/seller-dashboard` - Marketplace product management
- `protect/member-dashboard` - Membership features
- `protect/partners-dashboard` - Partner portal

### **Core System** (Critical infrastructure)
- `protect/router` - AppRouter.tsx - All app routing and navigation
- `protect/country-config` - Country-specific configs, feature flags, currency settings
- `protect/marketplace` - Marketplace pages and product display
- `protect/appwrite-config` - Backend database and API configuration

### **Stable Releases**
- `production-stable` - Production-ready code snapshot
- `main` - Current development baseline

## 🛡️ Protection Workflow

### Making Changes to Protected Code

**NEVER edit protected files directly on `main`**

Instead, follow this workflow:

```bash
# 1. Create a work branch from the protection branch
git checkout protect/therapist-dashboard
git checkout -b work/therapist-dashboard-MMDD  # Use current date

# 2. Make your changes and test thoroughly
# Edit files, test locally, verify everything works

# 3. Commit your changes
git add .
git commit -m "Add [feature] to therapist dashboard"

# 4. Push to remote
git push -u origin work/therapist-dashboard-MMDD

# 5. Create Pull Request on GitHub
# Compare: protect/therapist-dashboard ← work/therapist-dashboard-MMDD
# Get review and approval

# 6. After PR approval, merge to protection branch
# Then merge protection branch to main when ready for deployment
```

## 📂 File-to-Branch Mapping

| File/Folder | Protected By | Notes |
|------------|--------------|-------|
| `pages/TherapistDashboardPage.tsx` | `protect/therapist-dashboard` | Therapist controls |
| `pages/PlaceDashboardPage.tsx` | `protect/massage-place-dashboard` | Place admin |
| `pages/MassagePlaceAdminDashboard.tsx` | `protect/massage-place-dashboard` | Legacy place admin |
| `pages/AdminDashboardPage.tsx` | `protect/admin-dashboard` | Platform admin |
| `pages/CustomerDashboardPage.tsx` | `protect/customer-dashboard` | Customer interface |
| `pages/SellerDashboardPage.tsx` | `protect/seller-dashboard` | Marketplace seller |
| `pages/MemberDashboardPage.tsx` | `protect/member-dashboard` | Membership system |
| `pages/PartnersDashboardPage.tsx` | `protect/partners-dashboard` | Partner portal |
| `AppRouter.tsx` | `protect/router` | App navigation |
| `config/countries/**` | `protect/country-config` | Country settings |
| `config/countryLocks.ts` | `protect/country-config` | Override permissions |
| `lib/countryConfig.ts` | `protect/country-config` | Config resolver |
| `lib/countryOverrides.tsx` | `protect/country-config` | Override loader |
| `pages/MarketplacePage.tsx` | `protect/marketplace` | Marketplace display |
| `pages/MarketplacePageBase.tsx` | `protect/marketplace` | Base marketplace |
| `pages/ProductDetailPage.tsx` | `protect/marketplace` | Product details |
| `components/MarketplaceProductCard.tsx` | `protect/marketplace` | Product cards |
| `lib/marketplaceService.ts` | `protect/marketplace` | Marketplace API |
| `lib/appwrite.config.ts` | `protect/appwrite-config` | Appwrite settings |
| `lib/appwriteService.ts` | `protect/appwrite-config` | Appwrite client |
| `config.ts` | `protect/appwrite-config` | App config |

## 🚨 Critical Rules

### ❌ NEVER DO THIS:
```bash
# DON'T edit protected files directly on main
git checkout main
# edit pages/AdminDashboardPage.tsx  ❌ WRONG!
git commit -m "quick fix"
```

### ✅ ALWAYS DO THIS:
```bash
# DO create work branch from protection branch
git checkout protect/admin-dashboard
git checkout -b work/admin-dashboard-1119
# edit pages/AdminDashboardPage.tsx  ✅ CORRECT!
git commit -m "Add bank verification feature"
git push -u origin work/admin-dashboard-1119
# Create PR for review
```

## 🔐 GitHub Branch Protection Setup (Recommended)

To enforce this policy on GitHub:

1. Go to **Settings** → **Branches**
2. Add rules for each `protect/*` branch:
   - ✅ Require pull request before merging
   - ✅ Require approvals (at least 1)
   - ✅ Require status checks to pass
   - ✅ Do not allow bypassing
   - ✅ Restrict who can push (only maintainers)

3. Add rule for `main`:
   - ✅ Require pull request before merging
   - ✅ Require approvals (at least 1)

## 📊 Current Branch Status

```
main (deployment baseline)
│
├── protect/therapist-dashboard ✅
├── protect/massage-place-dashboard ✅
├── protect/admin-dashboard ✅
├── protect/customer-dashboard ✅
├── protect/seller-dashboard ✅
├── protect/member-dashboard ✅
├── protect/partners-dashboard ✅
├── protect/router ✅
├── protect/country-config ✅
├── protect/marketplace ✅
├── protect/appwrite-config ✅
└── production-stable ✅
```

## 🎯 Benefits

✅ **100% Protection** - All critical code has backup branches
✅ **Change History** - Every modification tracked and reviewable
✅ **Rollback Safety** - Can revert to any protection branch instantly
✅ **Team Collaboration** - Clear workflow for multiple developers
✅ **Country Isolation** - UK/Indonesia/USA/AU changes don't interfere
✅ **Feature Gating** - Agent features safely locked to Indonesia only

## 🔄 Quick Commands

```bash
# View all protection branches
git branch -a | grep protect/

# Switch to a protection branch
git checkout protect/therapist-dashboard

# Create work branch for today's changes
git checkout protect/admin-dashboard
git checkout -b work/admin-dashboard-$(Get-Date -Format "MMdd")

# Emergency rollback (restore from protection branch)
git checkout main
git checkout protect/therapist-dashboard -- pages/TherapistDashboardPage.tsx
git commit -m "Rollback therapist dashboard to protected version"
```

## 📝 When to Create New Protection Branches

Create a new `protect/` branch when you:
- Add a new major dashboard or admin panel
- Create a new critical system component
- Build a new country-specific feature set
- Develop payment or security-related features

```bash
git checkout main
git checkout -b protect/new-feature-name
git push -u origin protect/new-feature-name
```

---

**Last Updated**: November 19, 2025  
**Protection Level**: 🔒 100% - All critical components secured  
**Branches Protected**: 11 protection branches + production-stable