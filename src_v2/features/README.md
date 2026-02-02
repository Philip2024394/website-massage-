/**
 * ============================================================================
 * 🚫 FEATURE BOUNDARY ENFORCEMENT - README
 * ============================================================================
 * 
 * HARD BOUNDARIES FOR /src_v2/features/*
 * 
 * ✅ ALLOWED:
 * - Export React components
 * - Export action functions
 * - Export selector functions
 * - Export TypeScript types/interfaces
 * - Import from other features (controlled)
 * - Import from /src_v2/ui (design system)
 * 
 * 🚫 FORBIDDEN:
 * - Define routes (routing is in /src_v2/shell/routes.tsx)
 * - Control layout/scroll (layout is in /src_v2/shell/AppShell.tsx)
 * - Create Appwrite clients (clients live in /src_v2/core)
 * - Define global styles (styles go in /src_v2/ui)
 * - Access DOM directly for layout changes
 * - Import from /src (legacy isolation)
 * 
 * STANDARD STRUCTURE:
 * 
 * /features/[feature-name]/
 *   index.ts        ← Export everything
 *   View.tsx        ← Main component
 *   actions.ts      ← Action functions (optional)
 *   selectors.ts    ← Data selectors (optional)
 *   types.ts        ← TypeScript types (optional)
 * 
 * ISOLATION GUARANTEE:
 * If one feature breaks → only that feature breaks
 * Shell remains stable, other features unaffected
 * 
 * EXAMPLES:
 * ✅ export const BookingForm = () => <div>...</div>
 * ✅ export const acceptBooking = async (id: string) => {...}
 * ✅ export const selectBookingData = (raw: any) => {...}
 * 
 * 🚫 const router = createRouter()
 * 🚫 document.body.style.overflow = 'hidden'
 * 🚫 const client = new Client().setEndpoint(...)
 * 🚫 import { something } from '../../../src/legacy'
 * 
 * ============================================================================
 */

// This file serves as documentation and enforcement reference
export const FEATURE_BOUNDARY_RULES = {
  ALLOWED: [
    'Export React components',
    'Export action functions', 
    'Export selector functions',
    'Export TypeScript types',
    'Import from /src_v2/ui',
    'Import from other features (controlled)'
  ],
  
  FORBIDDEN: [
    'Define routes',
    'Control layout/scroll',
    'Create Appwrite clients',
    'Define global styles',
    'Access DOM for layout',
    'Import from /src legacy'
  ],
  
  VIOLATION_RESPONSE: 'Change rejected: shell/core are sealed.'
} as const;