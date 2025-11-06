/**
 * Chat Message Validation Utilities
 * Prevents phone number sharing between users and service providers
 */

// Number words mapping
const numberWords: { [key: string]: number } = {
    'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
    'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
};

/**
 * Check if message contains more than 5 consecutive digits
 */
export const containsPhoneDigits = (message: string): boolean => {
    // Remove spaces and common separators to catch hidden phone numbers
    const normalized = message.replace(/[\s\-().]/g, '');
    
    // Check for 6+ consecutive digits
    const digitSequences = normalized.match(/\d{6,}/g);
    return digitSequences !== null && digitSequences.length > 0;
};

/**
 * Check if message contains number words that could form a phone number
 */
export const containsNumberWords = (message: string): boolean => {
    const words = message.toLowerCase().split(/\s+/);
    let consecutiveNumberWords = 0;
    let totalNumberWords = 0;

    for (const word of words) {
        // Remove punctuation
        const cleanWord = word.replace(/[^\w]/g, '');
        
        if (Object.prototype.hasOwnProperty.call(numberWords, cleanWord)) {
            consecutiveNumberWords++;
            totalNumberWords++;
            
            // If we find 6+ number words in a row, likely a phone number
            if (consecutiveNumberWords >= 6) {
                return true;
            }
        } else {
            consecutiveNumberWords = 0;
        }
    }

    // Also check if there are many number words scattered (8+ total)
    return totalNumberWords >= 8;
};

/**
 * Check for common phone number patterns with words
 * E.g., "call me at zero eight one two three..."
 */
export const containsPhonePattern = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    
    // Common phone-related keywords
    const phoneKeywords = [
        'call me', 'phone', 'whatsapp', 'wa me', 'contact me',
        'my number', 'reach me', 'text me', 'message me'
    ];
    
    // Check if message contains phone keywords + number words
    const hasKeyword = phoneKeywords.some(keyword => lowerMessage.includes(keyword));
    
    if (hasKeyword) {
        // If phone keyword found, be more strict about number detection
        const words = lowerMessage.split(/\s+/);
        let numberWordCount = 0;
        
        for (const word of words) {
            const cleanWord = word.replace(/[^\w]/g, '');
            if (Object.prototype.hasOwnProperty.call(numberWords, cleanWord)) {
                numberWordCount++;
            }
        }
        
        // If we see phone keyword + 4+ number words, flag it
        return numberWordCount >= 4;
    }
    
    return false;
};

/**
 * Check for alternative number representations
 * E.g., "o8i2345678" (o=zero, i=one)
 */
export const containsAlternativeNumbers = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    
    // Common letter-to-number substitutions
    const substitutions: { [key: string]: string } = {
        'o': '0',
        'i': '1',
        'l': '1',
        'z': '2',
        's': '5',
        'g': '9',
        'b': '8'
    };
    
    let convertedMessage = lowerMessage;
    for (const [letter, digit] of Object.entries(substitutions)) {
        convertedMessage = convertedMessage.replace(new RegExp(letter, 'g'), digit);
    }
    
    return containsPhoneDigits(convertedMessage);
};

/**
 * Main validation function
 * Returns { valid: boolean, error?: string }
 */
export interface ValidationResult {
    valid: boolean;
    error?: string;
}

export const validateChatMessage = (
    message: string,
    senderType: string,
    recipientType: string
): ValidationResult => {
    // Admin can send anything
    if (senderType === 'admin' || recipientType === 'admin') {
        return { valid: true };
    }

    // Check for digit sequences (>5 consecutive)
    if (containsPhoneDigits(message)) {
        return {
            valid: false,
            error: '⚠️ Cannot share phone numbers. Please contact through the platform.'
        };
    }

    // Check for number words
    if (containsNumberWords(message)) {
        return {
            valid: false,
            error: '⚠️ Cannot share contact information using number words.'
        };
    }

    // Check for phone patterns with keywords
    if (containsPhonePattern(message)) {
        return {
            valid: false,
            error: '⚠️ Cannot share contact details. Use platform messaging only.'
        };
    }

    // Check for alternative number representations
    if (containsAlternativeNumbers(message)) {
        return {
            valid: false,
            error: '⚠️ Cannot share phone numbers in any format.'
        };
    }

    return { valid: true };
};

/**
 * Clean/sanitize message for display
 */
export const sanitizeMessage = (message: string): string => {
    // Basic HTML sanitization
    return message
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};
