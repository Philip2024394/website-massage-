/**
 * Phone Number & WhatsApp Detection Utility
 * 
 * Detects phone numbers in various formats to prevent sharing contact information in chat:
 * - Digit sequences: 08123456789, +62812345, 62-812-345-6789
 * - Text numbers: "zero eight one two three" / "nol delapan satu dua tiga"
 * - Mixed formats: "o8 one two 3456", "wa saya nol812345"
 * - WhatsApp mentions: "whatsapp", "wa", "WA saya", "contact me"
 */

interface PhoneDetectionResult {
    isBlocked: boolean;
    reason?: string;
    detectedPattern?: string;
}

// Text number mappings (English and Indonesian)
const textToDigit: Record<string, string> = {
    // English
    'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
    'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
    // Indonesian
    'nol': '0', 'satu': '1', 'dua': '2', 'tiga': '3', 'empat': '4',
    'lima': '5', 'enam': '6', 'tujuh': '7', 'delapan': '8', 'sembilan': '9'
};

/**
 * Converts text numbers to digits
 * Example: "zero eight one two" -> "0812"
 */
function convertTextToDigits(text: string): string {
    const words = text.toLowerCase().split(/\s+/);
    let digits = '';
    
    for (const word of words) {
        if (textToDigit[word]) {
            digits += textToDigit[word];
        }
    }
    
    return digits;
}

/**
 * Main detection function - checks if message contains phone numbers or WhatsApp mentions
 */
export function detectPhoneNumber(message: string): PhoneDetectionResult {
    const lowerMessage = message.toLowerCase();
    
    // 1. Check for WhatsApp mentions (English & Indonesian)
    const whatsappPatterns = [
        /whatsapp/i,
        /\bwa\b/i,
        /w\.a\./i,
        /whatapp/i,
        /whatsap/i,
        /contact me/i,
        /hubungi saya/i,
        /kontak saya/i,
        /nomor saya/i,
        /my number/i,
        /call me/i,
        /telepon saya/i,
        /sms me/i,
        /message me at/i
    ];
    
    for (const pattern of whatsappPatterns) {
        if (pattern.test(message)) {
            return {
                isBlocked: true,
                reason: 'WhatsApp/contact sharing is not allowed. Please communicate through this chat only.',
                detectedPattern: 'WhatsApp mention'
            };
        }
    }
    
    // 2. Check for digit sequences (potential phone numbers)
    // Indonesian numbers: 08xx-xxxx-xxxx, +62-8xx-xxxx-xxxx, 62-8xx-xxxx-xxxx
    const digitPatterns = [
        /\+?62[\s\-]?8\d{2,3}[\s\-]?\d{3,4}[\s\-]?\d{3,4}/g, // +62-812-345-6789
        /\b0?8\d{2}[\s\-]?\d{3,4}[\s\-]?\d{3,4}\b/g,         // 0812-345-6789
        /\b0?8\d{8,10}\b/g,                                   // 08123456789
        /\+?\d{10,13}/g,                                      // Any 10-13 digit sequence
        /\d{3,4}[\s\-]\d{3,4}[\s\-]\d{3,4}/g                 // 812-345-6789
    ];
    
    for (const pattern of digitPatterns) {
        const match = message.match(pattern);
        if (match) {
            // Extract digits only
            const digitsOnly = match[0].replace(/\D/g, '');
            
            // Check if it looks like a valid phone number (8-15 digits)
            if (digitsOnly.length >= 8 && digitsOnly.length <= 15) {
                // Check if starts with common prefixes
                if (digitsOnly.startsWith('0') || digitsOnly.startsWith('62') || digitsOnly.startsWith('8')) {
                    return {
                        isBlocked: true,
                        reason: 'Sharing phone numbers is not allowed. Please use this chat for all communication.',
                        detectedPattern: 'Phone number digits'
                    };
                }
            }
        }
    }
    
    // 3. Check for text numbers (English & Indonesian)
    const textDigits = convertTextToDigits(lowerMessage);
    
    // If we extracted 8+ consecutive text digits, it's likely a phone number
    if (textDigits.length >= 8) {
        return {
            isBlocked: true,
            reason: 'Sharing phone numbers (even in text) is not allowed. Please use this chat only.',
            detectedPattern: 'Text number format'
        };
    }
    
    // 4. Check for mixed format (e.g., "wa saya 0812", "call o8 one two")
    // Look for combinations of "wa", "call", "contact" near numbers
    const suspiciousPatterns = [
        /(wa|call|contact|hubungi|telepon|nomor).*?\d{4,}/i,
        /\d{4,}.*(wa|call|contact|hubungi|telepon)/i,
        /(zero|nol|o)[\s\-]?8[\s\-]?\d/i  // "o8", "zero eight"
    ];
    
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(message)) {
            return {
                isBlocked: true,
                reason: 'Sharing contact information is not allowed. Please communicate here only.',
                detectedPattern: 'Mixed format'
            };
        }
    }
    
    // 5. Check for spacing tricks (e.g., "0 8 1 2 3 4 5 6 7 8 9")
    const spacedDigits = message.replace(/\s/g, '');
    const consecutiveDigits = spacedDigits.match(/\d{8,}/g);
    
    if (consecutiveDigits) {
        for (const digits of consecutiveDigits) {
            if (digits.startsWith('0') || digits.startsWith('62') || digits.startsWith('8')) {
                return {
                    isBlocked: true,
                    reason: 'Phone numbers (even with spaces) are not allowed. Use this chat to communicate.',
                    detectedPattern: 'Spaced digits'
                };
            }
        }
    }
    
    // Message is clean
    return {
        isBlocked: false
    };
}

/**
 * Get user-friendly error message based on language
 */
export function getBlockedMessage(language: 'en' | 'id' = 'en'): string {
    if (language === 'id') {
        return '🚫 Berbagi nomor telepon atau WhatsApp tidak diperbolehkan.\n\n' +
               'Untuk keamanan Anda, harap gunakan chat ini untuk semua komunikasi.\n\n' +
               '⚠️ Pelanggaran berulang dapat mengakibatkan akun ditangguhkan.';
    }
    
    return '🚫 Sharing phone numbers or WhatsApp is not allowed.\n\n' +
           'For your security, please use this chat for all communication.\n\n' +
           '⚠️ Repeated violations may result in account suspension.';
}

/**
 * Test function for development
 */
export function testPhoneDetection() {
    const testCases = [
        'Hello, how are you?', // Clean
        'My number is 08123456789', // Digit phone
        'Call me at +62-812-345-6789', // Formatted phone
        'Contact me: zero eight one two three four five six seven eight nine', // Text numbers
        'wa saya 0812', // WA mention with partial number
        'whatsapp me', // WA mention
        'hubungi saya di 08xx', // Indonesian
        'Price is 125000', // Should NOT block (price)
        'Time: 1030 or 1130', // Should NOT block (time)
        'o8 one two three 456 789', // Mixed format
        '0 8 1 2 3 4 5 6 7 8 9' // Spaced digits
    ];
    
    console.log('🧪 Phone Detection Tests:');
    testCases.forEach((test, i) => {
        const result = detectPhoneNumber(test);
        console.log(`\n${i + 1}. "${test}"`);
        console.log(`   Blocked: ${result.isBlocked}`);
        if (result.isBlocked) {
            console.log(`   Pattern: ${result.detectedPattern}`);
            console.log(`   Reason: ${result.reason}`);
        }
    });
}
