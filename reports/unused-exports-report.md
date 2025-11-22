# Unused Exports Report

Source: ts-prune run on current branch (main)
Date: 2025-11-22

## Summary
The following exports are reported as unused. Items marked (used in module) are referenced only inside their own file and not externally.

## Pages / Components Potentially Removable
- AdminDatabaseManager.tsx.disabled (already disabled)
- MembershipAdminPage.tsx.disabled (already disabled)

## Disabled Files (moved candidates)
These have a `.disabled` suffix and are safe to archive:
- pages/AdminDatabaseManager.tsx.disabled
- pages/MembershipAdminPage.tsx.disabled

## Notable Service / Utility Exports
- constants.ts: calculatePromoterSettlement
- constants.ts: PLACE_SERVICES / ADDITIONAL_SERVICES (duplicate of rootConstants?)
- locations.ts: locations (check if replaced by countries.ts)
- types-enhanced.ts: Message, Conversation, Package, PricingBreakdown, VerificationStatus
- types.ts: Multiple domain types (confirm future roadmap before removal)
- lib/auth.ts: signOut, getCurrentUser (ensure not needed for silent session management)
- lib/googleMapsDistanceService.ts: GoogleMapsDistanceService (possibly superseded by inline Haversine logic)
- lib/membershipReferralService.ts: default (investigate active promoter flows)
- lib/rateLimitService.ts & lib/rateLimitUtils.ts: rate limiting helpers (if API calls no longer centralized)
- lib/seoHelpers.ts: updateHreflangTags / meta / structured data (retain if any SEO head management planned)
- utils/appConfig.ts: functions for saving config values (check if environment variables replaced them)
- utils/therapistImageUtils.ts: random image helpers (partially replaced by imageService)

## Recommendation Categories
1. Archive Immediately (Disabled / Legacy): *.disabled files -> move to deleted/
2. Review Before Removal (Domain Types / Auth / SEO): keep until confirmed not on roadmap.
3. Consolidate Duplicates: PLACE_SERVICES vs rootConstants equivalent; image utils vs imageService.
4. Inline Replacements: GoogleMapsDistanceService replaced by manual Haversine in HomePage.

## Next Steps Proposed
- Move disabled files into `deleted/` folder.
- Create follow-up checklist for Category 2 items; require product confirmation.
- Add TODO comments where an export appears obsolete but not yet removed.

## Raw ts-prune Output (truncated for readability)
```
AppRouter.tsx:205 - AppRouter (used in module)
constants.ts:312 - calculatePromoterSettlement
constants.ts:289 - PLACE_SERVICES
constants.ts:295 - ADDITIONAL_SERVICES
locations.ts:2 - locations
types-enhanced.ts:6 - Message
types-enhanced.ts:21 - Conversation
... (see full terminal output for complete list) ...
```

## Caution Notes
- Type-only exports may be indirectly referenced via serialization or dynamic usage; verify with grep before removal.
- Some default exports (e.g., pages) might be loaded dynamically via router if path-based loading is implemented outside current scan.

## Approval Checklist (to proceed with deeper cleanup)
[ ] Confirm router does not dynamically import now-unused pages.
[ ] Confirm signOut / getCurrentUser replaced by sessionManager fully.
[ ] Confirm no SEO plan requiring seoHelpers.
[ ] Confirm rate limiting now handled upstream (Appwrite or CDN).

---
Generated automatically. Edit as needed to mark decisions.
