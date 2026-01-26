# Vite HTML Caching Issue - Resolution Summary

**Date**: 2025-01-XX  
**Status**: ✅ RESOLVED with workaround script

## Problem Description

Vite's build process was not detecting changes to `index.html`, specifically:
- Updated splash screen HTML (dancing dots) was in source file
- Production builds (`dist/index.html`) still contained old splash screen ("Loading...")
- Multiple cache clearing attempts failed to resolve the issue
- Problem persisted across multiple builds

## Root Cause

Vite appears to cache the HTML template processing pipeline. Even after:
- Deleting `dist/` folder
- Deleting `node_modules/.vite/` folder  
- Touching source file to update timestamp
- Multiple fresh rebuilds

The built `dist/index.html` continued using stale content.

## Solution Implemented

Created a post-build patch script that runs after Vite completes:

**Script**: `scripts/fix-vite-html-cache.js`  
**Modified**: `package.json` build command

```json
"build": "cross-env ROLLUP_NO_NATIVE=1 ROLLUP_NO_WASM=1 vite build && node scripts/fix-vite-html-cache.js"
```

The script:
1. Reads source `index.html` for splash screen HTML & CSS
2. Reads built `dist/index.html`
3. Replaces stale splash HTML with current version
4. Replaces stale splash CSS with current version
5. Writes corrected content back to `dist/index.html`

## Verification Steps

After running `pnpm run build`, verify:

```powershell
# Check for dancing dots
Select-String -Path "dist\index.html" -Pattern "loading-dot"

# Should find 7 matches:
# - 4 CSS class definitions (.loading-dot, :nth-child variants)
# - 3 HTML span elements
```

## Changes Applied to Splash Screen

### Before (Old Splash):
- Background: `#111827` (dark gray)
- Text: "IndaStreet" in white
- Loading indicator: "Loading..." text
- Logo: 140px

### After (New Splash):
- Background: `linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)` (white)
- Text: "Indastreet" in black (32px, weight 700)
- Loading indicator: 3 dancing black dots with pulse animation
- Logo: 120px
- Animations: `dotPulse` (1.4s) and `fadeIn` (0.8s)

## Files Modified

1. **scripts/fix-vite-html-cache.js** (NEW)
   - Post-build HTML patcher
   - ESM format for compatibility with package.json type: "module"

2. **package.json**
   - Updated build script to run patcher
   - Line 31: Added `&& node scripts/fix-vite-html-cache.js`

3. **index.html** (Already updated in previous commits)
   - Splash screen HTML with dancing dots
   - CSS animations for dot pulse effect
   - White gradient background

## Deployment

✅ **Committed**: Commit 55c326a  
✅ **Pushed**: to main branch  
⏳ **Netlify**: Will auto-build with new script

## Testing

Once Netlify deployment completes:
1. Visit https://www.indastreetmassage.com/
2. Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
3. Should see:
   - White background splash screen
   - "Indastreet" text in black
   - Three dancing dots animation
   - Logo at 120px size

## Future Considerations

This workaround should remain in place until Vite fixes the HTML template caching bug. Potential actions:
- Report issue to Vite GitHub repository
- Monitor Vite release notes for HTML processing fixes
- Consider migrating away from HTML template entirely if issue persists

## Related Commits

- 99b4ccd: FIX: Language type errors in TherapistCard.tsx
- a5d85e8: Remove location display from therapist cards
- 55c326a: BUILD: Add Vite HTML cache workaround script
