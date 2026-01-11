# 🍽️ THERAPIST MENU SYSTEM - INTEGRATION LOCK FILE

## ✅ VERIFIED WORKING CONFIGURATION

### Collection Configuration (LOCKED)
```typescript
// lib/appwrite.config.ts
collections: {
    therapistMenus: 'therapist_menus', // ✅ WORKING - DO NOT CHANGE
}
```

### Service Integration (LOCKED)  
```typescript
// lib/appwriteService.LEGACY.ts
export const therapistMenusService = {
    getByTherapistId(therapistId: string): Promise<any | null>
    saveMenu(therapistId: string, menuData: string): Promise<any>
    deleteMenu(therapistId: string): Promise<void>
}
```

### Dashboard Integration (LOCKED)
```typescript
// apps/therapist-dashboard/src/pages/TherapistMenu.tsx
const menuDoc = await therapistMenusService.getByTherapistId(therapistId);
await therapistMenusService.saveMenu(therapistId, JSON.stringify(menuItems));
```

### Display Integration (LOCKED)
```tsx
// components/TherapistCard.tsx  
const menuDoc = await therapistMenusService.getByTherapistId(therapistId);
if (menuDoc?.menuData) {
    const parsed = JSON.parse(menuDoc.menuData);
    setMenuData(Array.isArray(parsed) ? parsed : []);
}
```

## 🛡️ CRITICAL REQUIREMENTS (NEVER CHANGE)

### 1. Collection ID Format
- ✅ **MUST USE:** `therapist_menus` (underscores)
- ❌ **NEVER USE:** `Therapist Menus` (spaces cause 400 errors)
- ❌ **NEVER USE:** `therapist-menus` (hyphens not standard)

### 2. Data Format
- Menu data stored as JSON string in `menuData` field
- Each menu item: `{ name: string, price: number, description?: string }`
- Array format: `[{...}, {...}, {...}]`

### 3. Error Handling  
- Service returns `null` if no menu found
- Components check `menuDoc?.menuData` before parsing
- Graceful degradation if collection unavailable

## 🔒 LOCKED DATA FLOW

```
Therapist Dashboard Menu Page
    ↓ (therapistMenusService.saveMenu)
Appwrite Collection: 'therapist_menus' 
    ↓ (therapistMenusService.getByTherapistId)
TherapistCard Component
    ↓ (Menu Button Click)
Menu Display in Slider/Modal
```

## 🚨 DANGER ZONE - WHAT NOT TO CHANGE

### DON'T TOUCH:
- Collection ID `therapist_menus` in appwrite.config.ts
- Service method names in therapistMenusService
- Menu data JSON structure format
- Error handling in TherapistCard.tsx

### IF YOU MUST CHANGE:
1. Run validation script: `node scripts/validate-collection-ids.mjs`
2. Test complete flow: Dashboard save → Card display
3. Check console for 400/404 errors
4. Update this lock file with new configuration

## ✅ VALIDATION CHECKPOINT

### To verify system is working:
```bash
# 1. Run validation script
node scripts/validate-collection-ids.mjs

# 2. Manual test checklist
# □ Therapist can add menu items in dashboard
# □ Menu items save without console errors  
# □ Menu button appears on therapist cards
# □ Clicking menu shows actual menu content
# □ No 400/404 errors in browser console
```

### Expected Results:
- ✅ All collection IDs valid (50 valid, 6 disabled, 0 invalid)
- ✅ No hardcoded collection issues found
- ✅ All safeguards validated successfully

## 📋 SCHEMA REQUIREMENTS (LOCKED)

### Appwrite Collection: `therapist_menus`
```javascript
// Required Attributes:
{
    menuId: "string",           // Unique identifier
    therapistId: "string",      // Links to therapist
    menuData: "string",         // JSON array of menu items  
    isActive: "boolean",        // Controls visibility
    createdDate: "datetime",    // Creation timestamp
    updatedDate: "datetime"     // Last modification
}

// Permissions:
[
    Permission.read(Role.any()),     // Public read
    Permission.update(Role.users()), // Therapists update
    Permission.delete(Role.users())  // Therapists delete
]
```

## 📞 EMERGENCY CONTACTS

If therapist menus stop working:

1. **Check Console Errors:** Look for 400/404 Appwrite errors
2. **Verify Collection ID:** Ensure no spaces in `therapist_menus`
3. **Run Validation:** `node scripts/validate-collection-ids.mjs`
4. **Check This File:** Ensure configuration matches locked settings

---

**Lock Date:** November 2024  
**Status:** 🔒 PRODUCTION LOCKED  
**Last Validation:** ✅ All systems operational  
**Next Review:** Only when modifying menu system