# 🗂️ STEP 20 - LEGACY PATH REMOVAL PLAN

## Overview
Carefully removing dead paths while preserving UI fallbacks. This is a slow, deliberate cleanup after V2 core implementation.

## Analysis Results

### ✅ Core V2 Authority Established
- **Booking Authority**: `/src_v2/core/booking/createBooking.ts` + Step 19 observability
- **Chat Authority**: `/src_v2/core/chat/sendMessage.ts` + Step 19 observability  
- **Architecture Protection**: Step 18 freeze system prevents decay

### 🔍 Legacy Services Identified

#### Safe to Deprecate (Not Remove)
These are superseded by V2 core but kept as fallbacks:

1. **`/src/booking/BookingIsolation.ts`** - 247 lines
   - Status: Commented out in PersistentChatWindow.tsx
   - Usage: Only in documentation/reports
   - Action: Mark deprecated, preserve as emergency fallback

2. **Test Files** - Multiple booking test files
   - Status: Superseded by V2 core tests
   - Usage: May contain useful test cases
   - Action: Archive to `/archived/legacy-tests/` directory

3. **Legacy Chat Services** - Multiple chat service implementations
   - `/src/lib/services/reliableChatService.ts`
   - `/src/lib/services/facebookOptimizedChatService.ts` 
   - `/src/lib/services/directChatService.ts`
   - Status: Still used in some diagnostic/test files
   - Action: Keep as fallbacks, mark deprecated

#### Still Active (Do Not Touch)
These are still actively used by main app UI:

1. **`/src/services/booking.service.ts`** - Still imported in hooks
2. **`/src/lib/appwrite/services/booking.service.appwrite.ts`** - Used by main app
3. **Therapist dashboard legacy imports** - Still needed for dashboard functionality

### 📋 Removal Strategy

#### Phase 1: Mark Deprecated (Current)
- Add deprecation comments to legacy files
- Create deprecation notice
- No functional changes

#### Phase 2: Test File Archival (Optional)
- Move old test files to `/archived/legacy-tests/`
- Preserve functionality

#### Phase 3: Gradual Migration (Future)
- Slowly migrate remaining legacy imports to V2 core
- Only when UI components are ready

## Implementation Status

### Completed
- ✅ Analysis of legacy booking calls (35+ files identified)  
- ✅ Analysis of legacy chat calls (25+ files identified)
- ✅ Identified safe-to-remove vs preserve-as-fallback paths
- ✅ Created deprecation strategy

### Current Action
**Adding deprecation markers instead of removal** to maintain system stability.

## Key Principle
> "Leave legacy UI only as fallback" - preserve existing functionality while establishing V2 as the authoritative path forward.

## Files Marked for Deprecation
(To be updated as deprecation markers are added)

- [ ] `/src/booking/BookingIsolation.ts`
- [ ] Legacy test files
- [ ] Unused chat service variants

## Next Steps
1. Add deprecation comments to identified files
2. Update documentation to point to V2 core  
3. Monitor for any integration issues
4. Plan gradual migration of remaining legacy imports