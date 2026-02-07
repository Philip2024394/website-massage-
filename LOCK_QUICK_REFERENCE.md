# 🔒 CORE SYSTEM LOCK - QUICK REFERENCE

**Status**: ✅ **ACTIVE AND ENFORCED**  
**For full documentation**: See [CORE_SYSTEM_LOCK.md](CORE_SYSTEM_LOCK.md)

---

## 🚨 CRITICAL BOUNDARIES

### ❌ **ABSOLUTELY PROHIBITED CHANGES**:

1. **Default Menu System**:
   - 50 service definitions in `defaultMenuService.ts`
   - Service names, descriptions, pricing structure
   - Category distribution (5 categories × 10 services)
   - Badge assignment logic and popularity scoring

2. **Slider Behavior**:
   - Single active window enforcement
   - Countdown timer functionality  
   - Auto-collapse and state management
   - Service expansion/collapse rules

3. **Booking Integration**:
   - Appwrite backend connectivity
   - Live booking functionality for default services **WHEN REQUIREMENTS MET**
   - Customer data validation and storage
   - Collections: `messages`, `chat_sessions`, `bookings`
   
   **✅ BOOKING STILL WORKS WHEN**:
   - KTP (Indonesian ID) photo uploaded (`ktpPhotoUrl`)
   - Bank details complete (`bankName`, `accountName`, `accountNumber`)  
   - Profile completed with therapist name
   - Account status is `active` and `bookingEnabled = true`

   **✅ SHARED PROFILE PAGES ARE FULLY FUNCTIONAL**:
   - Active social media icons with working links
   - Complete booking system (Book Now + Scheduled Booking)
   - Interactive menu slider with service selection
   - All default menu features (50 services, badges, timers)
   - Live conversion capability from shared links

4. **Dynamic Logic**:
   - Auto-hiding when real menu items uploaded
   - Badge generation and rotation algorithms
   - Menu state persistence in localStorage
   - Service randomization distribution

5. **SEO System Architecture**:
   - Unique titles, H1s, meta descriptions per therapist
   - Location schema (LocalBusiness) with micro-targeting
   - Canonical URLs and indexing directives
   - NO hashtags for SEO (visual only)
   - Each therapist has unique keyword set

---

### ✅ **SAFE TO MODIFY**:

1. **Visual Styling**:
   - Colors, gradients, themes
   - Typography and font sizes
   - Spacing, padding, margins
   - Border radius and shadows

2. **Layout & Animation**:
   - Card layouts and positioning
   - Hover effects and transitions  
   - Badge placement and animations
   - Responsive breakpoints

3. **Dashboard Elements**:
   - Info box/notice styling at top
   - Icon styling and placement
   - Help text and tooltip design
   - Loading states and micro-interactions

4. **SEO-Safe UI Changes**:
   - Profile page visual design and layout
   - Badge styling and positioning
   - Performance optimizations
   - Mobile responsiveness
   - **AS LONG AS**: SEO structure stays intact

---

## 🛡️ PROTECTED FILES

### 🔒 **MAXIMUM PROTECTION** (Core Logic):
- `src/services/defaultMenuService.ts` - 50 service definitions
- `src/services/enhancedMenuDataService.ts` - Menu management & badges
- `src/components/therapist/TherapistMenuManager.tsx` - Main component
- `src/hooks/useEnhancedMenuData.ts` - Data management hooks

### 🚨 **HIGH PROTECTION** (Integration):
- Appwrite booking integration code
- Badge assignment algorithms
- Slider state management logic
- Menu hiding/showing conditions

### ✅ **UI ONLY** (Safe):
- CSS files and styling components
- Animation definitions
- Layout components
- Theme configuration

---

## 🎯 **QUICK CHECK**: "Can I modify this?"

**ASK YOURSELF**:
1. Does it change service definitions, names, or pricing? → **❌ NO**
2. Does it alter slider behavior or countdown timers? → **❌ NO**  
3. Does it affect badge assignment or booking logic? → **❌ NO**
4. Does it modify backend integration or data flow? → **❌ NO**
5. Does it remove/change SEO elements (titles, H1s, schema)? → **❌ NO**
6. Does it use hashtags for SEO ranking? → **❌ NO**
7. Is it purely visual styling or layout? → **✅ YES**

---

## 🚨 **EMERGENCY PROTOCOL**

If core functionality breaks:
1. **STOP** all modifications immediately
2. Check `CORE_SYSTEM_LOCK.md` for violation details
3. Restore from last known working state
4. Test full booking flow and slider behavior
5. Verify all 50 default services are displaying correctly

---

**🔒 REMEMBER**: UI flexibility, core functionality protection!**