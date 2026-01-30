# 🛡️ PROTECTION TIER SYSTEM - QUICK REFERENCE

## IMMEDIATE RECOGNITION GUIDE

When you see this phrase in ANY file: 
> **"This dashboard is a sealed operational surface; do not modify unless explicitly instructed by the owner."**

**→ IMMEDIATE ACTION: STOP ALL MODIFICATIONS**

---

## PROTECTION TIERS

### **TIER 0**: System Infrastructure 
**NEVER TOUCH**
- `MainLandingPage.tsx` ← SEALED, UNREADABLE
- Core routing engine
- Database schema
- Appwrite configuration

### **TIER 1**: Sealed Therapist Operational Dashboard (STOD)
**OWNER-AUTHORIZED ONLY**
- `apps/therapist-dashboard/src/` 
- `src/components/therapist/`
- `src/pages/therapist/`
- `TherapistLayout.tsx`, `ChatWindow.tsx`, `FloatingChat.tsx`

### **TIER 2**: Marketing/Landing 
**FLEXIBLE**
- Landing pages
- Marketing components  
- Public-facing content

---

## QUICK DECISION TREE

```
Is this a therapist dashboard file?
├─ YES → Check for STOD protection phrase
│  ├─ Found → STOP, request owner authorization
│  └─ Not found → Still be cautious, minimal changes only
└─ NO → Check if it's MainLandingPage.tsx
   ├─ YES → ABSOLUTELY FORBIDDEN, find alternative
   └─ NO → Normal development allowed
```

---

## EMERGENCY CONTACTS

- **STOD Protection**: `AI_BEHAVIOR_CONTRACT_STOD_PROTECTION.md`
- **Full Contract**: `AI_BEHAVIOR_CONTRACT_PERMANENT.md` 
- **STOD Details**: `SEALED_THERAPIST_OPERATIONAL_DASHBOARD_CONTRACT.md`

---

**Remember**: When in doubt, DON'T MODIFY. Escalate to owner instead.