/**
 * 🚫 DO NOT MODIFY - BOOKING IDENTITY RESOLVER
 * 
 * Booking identity is resolved exclusively via resolveBookingIdentity().
 * customerName is safety-critical and must never be optional.
 * 
 * Single source of truth for resolving customer identity in bookings
 * Ensures consistent customerName population across all booking creation paths
 * 
 * 🔒 FROZEN - Any changes require human approval
 */

interface BookingIdentity {
  customerName: string; // REQUIRED - Canonical booking identity field
  userName: string;     // OPTIONAL - Compatibility field only
}

interface UserProfile {
  fullName?: string;
  name?: string;
  displayName?: string;
  email?: string;
  username?: string;
}

/**
 * Resolves booking identity from authenticated user profile
 * 
 * @param user - Primary user object (from account.get() or similar)
 * @param authUser - Secondary auth user object (fallback)
 * @returns BookingIdentity with guaranteed customerName
 */
export function resolveBookingIdentity(
  user?: UserProfile | null,
  authUser?: UserProfile | null
): BookingIdentity {
  // Canonical fallback order for customerName (REQUIRED)
  const customerName = 
    user?.fullName ?? 
    user?.name ?? 
    authUser?.displayName ?? 
    authUser?.name ??
    authUser?.email ?? 
    "Guest Customer";

  // userName is derived from same source but remains optional
  const userName = customerName;

  // 🚨 DEVELOPMENT-TIME INVARIANT CHECK
  if (process.env.NODE_ENV === 'development') {
    if (!customerName || customerName.trim() === '') {
      throw new Error('❌ INVARIANT VIOLATION: customerName cannot be empty in booking identity resolution');
    }
  }

  return {
    customerName,
    userName
  };
}

/**
 * Validates that booking identity is properly resolved before write
 * Throws error if customerName is missing (fail-fast approach)
 */
export function validateBookingIdentity(identity: { customerName?: string }): void {
  if (!identity.customerName || identity.customerName.trim() === '') {
    throw new Error('❌ BOOKING WRITE BLOCKED: customerName is required for all booking operations');
  }
}