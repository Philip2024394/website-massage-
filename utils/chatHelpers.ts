export const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
};

export const formatPrice = (price: number, discountPercentage?: number, discountActive?: boolean): {
    original: string;
    final: string;
    hasDiscount: boolean;
} => {
    const originalPrice = `Rp ${Math.round(price / 1000)}K`;
    const hasDiscount = !!discountActive && !!discountPercentage && discountPercentage > 0;
    
    if (!hasDiscount) {
        return {
            original: originalPrice,
            final: originalPrice,
            hasDiscount: false
        };
    }

    const discounted = Math.max(0, Math.round(price * (1 - discountPercentage / 100)));
    const finalPrice = `Rp ${Math.round(discounted / 1000)}K`;

    return {
        original: originalPrice,
        final: finalPrice,
        hasDiscount: true
    };
};

export const formatWhatsApp = (whatsapp: string): string => {
    // Remove all non-digit characters
    let cleaned = whatsapp.replace(/\D/g, '');
    
    // Convert to international format
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.substring(1);
    } else if (!cleaned.startsWith('62')) {
        cleaned = '62' + cleaned;
    }
    
    return cleaned;
};

export const validateWhatsApp = (whatsapp: string): boolean => {
    const formatted = formatWhatsApp(whatsapp);
    return formatted.startsWith('62') && formatted.length >= 11 && formatted.length <= 15;
};

export const detectPhoneNumber = (text: string): { isBlocked: boolean; detectedPattern?: string } => {
    // Phone number patterns
    const patterns = [
        /\b\d{10,15}\b/, // 10-15 consecutive digits
        /\b0\d{2,3}[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/, // Indonesian phone format
        /\b\+?62\s?\d{2,3}[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/, // +62 format
        /\bwa\.me\/\d+\b/i, // WhatsApp link
        /\bwhatsapp\b/i, // WhatsApp mention
        /\btelepon\b/i, // Phone mention (Indonesian)
        /\bphone\b/i, // Phone mention (English)
        /\bkontak\b/i // Contact mention (Indonesian)
    ];

    for (const pattern of patterns) {
        if (pattern.test(text)) {
            return { isBlocked: true, detectedPattern: pattern.toString() };
        }
    }

    return { isBlocked: false };
};

export const getBlockedMessage = (language: 'en' | 'id'): string => {
    return language === 'id'
        ? '⚠️ Membagikan nomor telepon atau WhatsApp tidak diizinkan. Silakan berkomunikasi melalui chat in-app.'
        : '⚠️ Sharing phone numbers or WhatsApp is not allowed. Please communicate through in-app chat.';
};

export const generateConversationId = (
    participant1: { id: string; role: string },
    participant2: { id: string; role: string }
): string => {
    const sorted = [participant1, participant2].sort((a, b) => 
        `${a.role}_${a.id}`.localeCompare(`${b.role}_${b.id}`)
    );
    return `${sorted[0].role}_${sorted[0].id}__${sorted[1].role}_${sorted[1].id}`;
};
