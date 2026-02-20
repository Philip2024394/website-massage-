/**
 * Service category constants – same "therapists" collection can offer multiple services.
 * Used for: Home tab filtering (massage vs facial), future services (e.g. "reflexology").
 * Add new service IDs here and filter in useHomePageLocation + HomePage tabs.
 */
export const SERVICE_TYPES = {
    MASSAGE: 'massage',
    FACIAL: 'facial',
    BEAUTICIAN: 'beautician',
} as const;

export type ServiceTypeId = (typeof SERVICE_TYPES)[keyof typeof SERVICE_TYPES];

/** Check if therapist offers a given service (uses servicesOffered array in Appwrite). Handles JSON string from API. */
export function therapistOffersService(therapist: { servicesOffered?: string[] | string }, serviceId: string): boolean {
    let offered = therapist.servicesOffered;
    if (offered == null) return false;
    if (typeof offered === 'string') {
        try {
            offered = JSON.parse(offered) as string[];
        } catch {
            offered = offered.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
    }
    return Array.isArray(offered) && offered.includes(serviceId);
}

/** Whether therapist should appear in "Facial Therapist" listing: offers facial OR beautician with paid Facial upgrade (active & not expired). */
export function shouldAppearInFacialListing(therapist: {
    servicesOffered?: string[] | string;
    facialTherapistListingActive?: boolean;
    facialTherapistListingExpiresAt?: string | null;
}): boolean {
    if (therapistOffersService(therapist, SERVICE_TYPES.FACIAL)) return true;
    if (!therapistOffersService(therapist, SERVICE_TYPES.BEAUTICIAN)) return false;
    if (!(therapist as any).facialTherapistListingActive) return false;
    const expiresAt = (therapist as any).facialTherapistListingExpiresAt;
    if (!expiresAt) return true;
    try {
        return new Date(expiresAt) > new Date();
    } catch {
        return false;
    }
}
