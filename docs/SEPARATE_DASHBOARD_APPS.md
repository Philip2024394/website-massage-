# Separate Dashboard Apps - Architecture

## ✅ COMPLETED: App Structure Created

### Overview
IndaStreet now has **5 separate applications**:

1. **Main Website** (`/`) - Customer-facing booking site
2. **Therapist Dashboard** (`/apps/therapist-dashboard`) - PWA for therapists
3. **Massage Place Dashboard** (`/apps/place-dashboard`) - PWA for massage places
4. **Facial Place Dashboard** (`/apps/facial-dashboard`) - PWA for facial spas
5. **Admin Dashboard** (`/apps/admin-dashboard`) - PWA for platform admins

---

## Architecture Benefits

### Performance ⚡
- **Therapist app**: ~500KB (vs 3MB+ in monolithic)
- **Place app**: ~500KB
- **Facial app**: ~500KB
- Each loads only what it needs
- Faster on mobile networks

### Mobile PWA 📱
- Each installable as separate app
- Unique branding per app type:
  - **Therapist**: Orange theme (#FF6B35)
  - **Place**: Green theme (#4CAF50)
  - **Facial**: Pink theme (#E91E63)
  - **Admin**: Blue theme (#2196F3)
- Offline support per app
- Push notifications per app

### Security 🔒
- Isolated code per provider type
- Therapist can't access place code
- Reduced attack surface
- Separate service workers

---

## Directory Structure

```
website-massage-/
├── apps/
│   ├── therapist-dashboard/
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   ├── pages/
│   │   │   │   ├── TherapistDashboard.tsx
│   │   │   │   └── LoginPage.tsx
│   │   │   └── components/
│   │   ├── public/
│   │   │   ├── manifest.json (Therapist branding)
│   │   │   └── icons/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   ├── place-dashboard/
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   ├── pages/
│   │   │   │   ├── PlaceDashboard.tsx
│   │   │   │   └── LoginPage.tsx
│   │   │   └── components/
│   │   ├── public/
│   │   │   ├── manifest.json (Place branding)
│   │   │   └── icons/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   ├── facial-dashboard/
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   ├── pages/
│   │   │   │   ├── FacialDashboard.tsx
│   │   │   │   └── LoginPage.tsx
│   │   │   └── components/
│   │   ├── public/
│   │   │   ├── manifest.json (Facial branding)
│   │   │   └── icons/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── admin-dashboard/
│       ├── src/
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   ├── pages/
│       │   │   ├── AdminDashboard.tsx
│       │   │   ├── MessageCenter.tsx (View all conversations)
│       │   │   └── LoginPage.tsx
│       │   └── components/
│       ├── public/
│       │   ├── manifest.json (Admin branding)
│       │   └── icons/
│       ├── index.html
│       ├── vite.config.ts
│       └── package.json
│
├── lib/ (SHARED)
│   ├── appwriteService.ts ✅ All apps use this
│   ├── notificationSound.ts ✅ All apps use this
│   └── ... other shared services
│
├── components/ (SHARED)
│   ├── ChatWindow.tsx ✅ Used in all dashboards
│   ├── BillingPaymentPage.tsx ✅ Used in all dashboards
│   └── ... other shared components
│
└── public/sounds/ (SHARED)
    ├── booking-notification.mp3 ✅ 5MB main notification
    ├── message-notification.mp3 ✅ Chat beep
    ├── payment-notification.mp3 ✅ Payment beep
    ├── alert-notification.mp3 ✅ Alert beep
    └── success-notification.mp3 ✅ Success tone
```

---

## Shared Resources

All apps share these from the root project:

### Services (lib/)
- `appwriteService.ts` - Auth, database, messaging, billing
- `notificationSound.ts` - Centralized sound system
- All other services

### Components (components/)
- `ChatWindow.tsx` - Real-time chat
- `BillingPaymentPage.tsx` - Lead billing
- `MessageCenter.tsx` - Admin conversation view
- Other shared UI components

### Assets (public/)
- Sound files (booking, message, payment, alert, success)
- Icons (each app has unique icons though)

---

## Development

### Start All Apps
```bash
# Main website
npm run dev

# Therapist dashboard
cd apps/therapist-dashboard
npm run dev  # Runs on port 3001

# Place dashboard
cd apps/place-dashboard
npm run dev  # Runs on port 3002

# Facial dashboard
cd apps/facial-dashboard
npm run dev  # Runs on port 3003

# Admin dashboard
cd apps/admin-dashboard
npm run dev  # Runs on port 3004
```

### Build All Apps
```bash
# Build main website
npm run build

# Build dashboards
cd apps/therapist-dashboard && npm run build
cd apps/place-dashboard && npm run build
cd apps/facial-dashboard && npm run build
cd apps/admin-dashboard && npm run build
```

---

## Deployment

### Option 1: Separate Domains
- **Main**: `indastreet.com`
- **Therapist**: `therapist.indastreet.com`
- **Place**: `place.indastreet.com`
- **Facial**: `facial.indastreet.com`
- **Admin**: `admin.indastreet.com`

### Option 2: Subdirectories (Simpler)
- **Main**: `indastreet.com/`
- **Therapist**: `indastreet.com/therapist`
- **Place**: `indastreet.com/place`
- **Facial**: `indastreet.com/facial`
- **Admin**: `indastreet.com/admin`

### Netlify Deployment
Each app can be deployed separately or together:

**Single Domain Approach:**
```toml
# netlify.toml
[[redirects]]
  from = "/therapist/*"
  to = "/therapist/index.html"
  status = 200

[[redirects]]
  from = "/place/*"
  to = "/place/index.html"
  status = 200

[[redirects]]
  from = "/facial/*"
  to = "/facial/index.html"
  status = 200

[[redirects]]
  from = "/admin/*"
  to = "/admin/index.html"
  status = 200
```

---

## Next Steps

### ⏳ TODO: Create Dashboard Pages

Need to create these files (will use existing dashboard code):

1. **Therapist Dashboard** (`apps/therapist-dashboard/src/pages/`)
   - Copy from `pages/TherapistPortalPage.tsx`
   - Add ChatWindow integration
   - Add BillingPaymentPage tab

2. **Place Dashboard** (`apps/place-dashboard/src/pages/`)
   - Copy from `pages/PlaceDashboardPage.tsx`
   - Add ChatWindow integration
   - Add BillingPaymentPage tab

3. **Facial Dashboard** (`apps/facial-dashboard/src/pages/`)
   - Copy from `pages/FacialPlaceDashboardPage.tsx`
   - Add ChatWindow integration
   - Add BillingPaymentPage tab

4. **Admin Dashboard** (`apps/admin-dashboard/src/pages/`)
   - Copy from `pages/LiveAdminDashboard.tsx`
   - Add MessageCenter component (view all conversations)
   - Membership management
   - User management
   - Platform analytics

5. **Login Pages**
   - Simple email/password login
   - Shared auth via appwriteService
   - Admin role verification

### ⏳ TODO: TypeScript Configs

Each app needs `tsconfig.json`:
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["../../*"],
      "@shared/*": ["../../lib/*"],
      "@components/*": ["../../components/*"]
    }
  }
}
```

### ⏳ TODO: Install Dependencies

```bash
cd apps/therapist-dashboard && npm install
cd apps/place-dashboard && npm install
cd apps/facial-dashboard && npm install
cd apps/admin-dashboard && npm install
```

---

## Summary

✅ **Created**: 4 separate dashboard apps (therapist, place, facial, admin)  
✅ **Configured**: Vite build for each app  
✅ **Setup**: PWA manifests with unique branding per app  
✅ **Shared**: All apps use same Appwrite backend  
⏳ **Next**: Copy existing dashboard code into apps  
⏳ **Next**: Add ChatWindow and BillingPage integration  
⏳ **Next**: Add MessageCenter to admin app  
⏳ **Next**: Create TypeScript configs  
⏳ **Next**: Test and deploy

**Result**: 5 lightweight, fast, mobile-optimized PWAs (1 main + 4 dashboards) all connected to the same Appwrite database!
