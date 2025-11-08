// Utility functions for handling therapist pricing data
export const pricingUtils = {
    // Convert separate price fields to display format
    formatPriceForDisplay: (price60: string, price90: string, price120: string) => {
        return {
            "60": price60 ? `${price60}k` : "Contact",
            "90": price90 ? `${price90}k` : "Contact", 
            "120": price120 ? `${price120}k` : "Contact"
        };
    },

    // Convert input values to save format (removes 'k', validates)
    preparePriceForSave: (inputValue: string) => {
        const cleanValue = inputValue.toLowerCase().replace(/[^\d]/g, '');
        if (cleanValue.length >= 1 && cleanValue.length <= 3) {
            return cleanValue;
        }
        return '';
    },

    // Get pricing from therapist object (handles both old and new format)
    getTherapistPricing: (therapist: any) => {
        // Try new separate fields first
        if (therapist.price60 !== undefined || therapist.price90 !== undefined || therapist.price120 !== undefined) {
            return {
                "60": therapist.price60 || '',
                "90": therapist.price90 || '',
                "120": therapist.price120 || ''
            };
        }

        // Fallback to old JSON format
        if (therapist.pricing) {
            try {
                const pricing = typeof therapist.pricing === 'string' 
                    ? JSON.parse(therapist.pricing) 
                    : therapist.pricing;
                return {
                    "60": pricing["60"] ? Math.round(pricing["60"] / 1000).toString() : '',
                    "90": pricing["90"] ? Math.round(pricing["90"] / 1000).toString() : '',
                    "120": pricing["120"] ? Math.round(pricing["120"] / 1000).toString() : ''
                };
            } catch {
                // Return empty if parsing fails
            }
        }

        // Default empty pricing
        return {
            "60": '',
            "90": '',
            "120": ''
        };
    },

    // Check if therapist has any valid pricing
    hasValidPricing: (therapist: any) => {
        const pricing = pricingUtils.getTherapistPricing(therapist);
        return pricing["60"] !== '' || pricing["90"] !== '' || pricing["120"] !== '';
    },

    // Convert pricing for card display (shows 'Contact' if no pricing)
    formatPriceForCard: (therapist: any, duration: "60" | "90" | "120") => {
        const pricing = pricingUtils.getTherapistPricing(therapist);
        const price = pricing[duration];
        return price ? `${price}k` : 'Contact';
    }
};