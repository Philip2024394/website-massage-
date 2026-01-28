# ⚠️ THERAPIST DASHBOARD - INTEGRATION ONLY

## Important Notice

This therapist dashboard is **ONLY accessible through the main website integration**.

### ✅ Correct Usage

```bash
# Run the main website
pnpm dev

# Navigate to: http://localhost:3000/
# Login as a therapist
# Dashboard loads automatically
```

### ❌ Standalone Mode DISABLED

The standalone development server on port 3001 has been **permanently disabled**.

**Why?**
- Prevents confusion between standalone and integrated versions
- Ensures single source of truth for routing
- All therapist features must work through main website
- Consistent authentication and state management

### Accessing Features

All therapist features (including MoreCustomersPage, Analytics, Legal, etc.) are accessible through:
1. Login to main website as therapist
2. Therapist dashboard loads automatically
3. Use side menu to navigate to features

### Development

When making changes to therapist dashboard components:
1. Edit files in `apps/therapist-dashboard/src/`
2. Test through main website (pnpm dev)
3. Login as therapist to see changes
4. Hot reload works through main website integration

### Build Process

The therapist dashboard is built as part of the main website:
```bash
pnpm build
```

For Netlify deployment:
```bash
pnpm build:netlify
```

---

**Last Updated:** January 28, 2026
**Status:** Integration-only mode enforced
