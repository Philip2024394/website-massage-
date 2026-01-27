type PiiType = 'phone' | 'email' | 'url';

interface PhoneDetectionResult {
    isBlocked: boolean;
    reason?: string;
    detectedPattern?: string;
}

export interface PiiDetectionResult {
    isBlocked: boolean;
    type?: PiiType;
    reason?: string;
    detectedPattern?: string;
    excerpt?: string;
}

// Text number mappings (English + Indonesian)
const textToDigit: Record<string, string> = {
    zero: '0', one: '1', two: '2', three: '3', four: '4',
    five: '5', six: '6', seven: '7', eight: '8', nine: '9',
    nol: '0', satu: '1', dua: '2', tiga: '3', empat: '4',
    lima: '5', enam: '6', tujuh: '7', delapan: '8', sembilan: '9'
};

const EMAIL_PATTERN = /[\w.+-]+@[\w-]+\.[\w.-]+/i;
const URL_PATTERN = /https?:\/\/[\S]+|www\.[\S]+|wa\.me\/\S+|t\.me\/\S+|telegram\.me\/\S+/i;
const HANDLE_PATTERN = /@(wa|whatsapp|telegram|line|instagram|tiktok|snapchat|contact|admin)\b/i;
const CONTACT_KEYWORDS = /(wa|whatsapp|line|telegram|contact|admin|instagram|tiktok)/i;

function convertTextToDigits(text: string): string {
    return text
        .toLowerCase()
        .split(/\s+/)
        .map(word => textToDigit[word] || '')
        .join('');
}

export function detectPhoneNumber(message: string): PhoneDetectionResult {
    const lower = message.toLowerCase();

    const whatsappPatterns = [
        /whatsapp/i,
        /\bwa\b/i,
        /w\.a\./i,
        /whatapp/i,
        /whatsap/i,
        /wa\s*:\s*[\w\d\s\.\-]+/i,
        /whatsapp\s*:\s*[\w\d\s\.\-]+/i,
        /(contact|hubungi|kontak|telepon|call|sms)\s*(saya|kamu|kita)?/i
    ];

    for (const pattern of whatsappPatterns) {
        if (pattern.test(lower)) {
            return {
                isBlocked: true,
                reason: 'Sharing WhatsApp/contact details is not allowed. Use this chat only.',
                detectedPattern: 'WhatsApp mention'
            };
        }
    }

    const digitPatterns = [
        /\+?62[\s\-]?8\d{2,3}[\s\-]?\d{3,4}[\s\-]?\d{3,4}/g,
        /\b0?8\d{2}[\s\-]?\d{3,4}[\s\-]?\d{3,4}\b/g,
        /\b0?8\d{8,10}\b/g,
        /\+?\d{10,13}/g,
        /\d{3,4}[\s\-]\d{3,4}[\s\-]\d{3,4}/g
    ];

    for (const pattern of digitPatterns) {
        const match = message.match(pattern);
        if (match) {
            const digitsOnly = match[0].replace(/\D/g, '');
            if (digitsOnly.length >= 8 && digitsOnly.length <= 15) {
                if (digitsOnly.startsWith('0') || digitsOnly.startsWith('62') || digitsOnly.startsWith('8')) {
                    return {
                        isBlocked: true,
                        reason: 'Phone numbers cannot be shared. Continue communicating here.',
                        detectedPattern: 'Phone digits'
                    };
                }
            }
        }
    }

    const mixedPatterns = [
        /(wa|call|contact|hubungi|telepon|nomor).*?\d{4,}/i,
        /\d{4,}.*(wa|call|contact|hubungi|telepon)/i,
        /(zero|nol|o)[\s\-]?8[\s\-]?\d+/i
    ];

    for (const pattern of mixedPatterns) {
        if (pattern.test(message)) {
            return {
                isBlocked: true,
                reason: 'Sharing contact information (even disguised) is blocked.',
                detectedPattern: 'Mixed format'
            };
        }
    }

    const textDigits = convertTextToDigits(lower);
    if (textDigits.length >= 8) {
        return {
            isBlocked: true,
            reason: 'Phone numbers written as words are still considered contact info.',
            detectedPattern: 'Text number format'
        };
    }

    const spacedDigits = message.replace(/\s+/g, '');
    const consecutiveDigits = spacedDigits.match(/\d{8,}/g);
    if (consecutiveDigits) {
        for (const digits of consecutiveDigits) {
            if (digits.startsWith('0') || digits.startsWith('62') || digits.startsWith('8')) {
                return {
                    isBlocked: true,
                    reason: 'Phone numbers (even with spaces) are blocked.',
                    detectedPattern: 'Spaced digits'
                };
            }
        }
    }

    return { isBlocked: false };
}

export function detectPIIContent(text: string): PiiDetectionResult {
    const trimmed = text.trim();
    if (!trimmed) {
        return { isBlocked: false };
    }

    const phoneResult = detectPhoneNumber(trimmed);
    if (phoneResult.isBlocked) {
        return {
            isBlocked: true,
            type: 'phone',
            reason: phoneResult.reason,
            detectedPattern: phoneResult.detectedPattern,
            excerpt: trimmed
        };
    }

    const emailMatch = trimmed.match(EMAIL_PATTERN);
    if (emailMatch) {
        return {
            isBlocked: true,
            type: 'email',
            reason: 'Email addresses cannot be shared. Please stay inside this chat.',
            detectedPattern: 'Email',
            excerpt: emailMatch[0]
        };
    }

    const urlMatch = trimmed.match(URL_PATTERN);
    if (urlMatch) {
        return {
            isBlocked: true,
            type: 'url',
            reason: 'External URLs/handles are blocked to keep communication inside the app.',
            detectedPattern: 'URL',
            excerpt: urlMatch[0]
        };
    }

    if (HANDLE_PATTERN.test(trimmed)) {
        return {
            isBlocked: true,
            type: 'url',
            reason: 'External handles or contact shortcuts are not allowed.',
            detectedPattern: 'Handle reference',
            excerpt: trimmed.match(HANDLE_PATTERN)?.[0]
        };
    }

    if (CONTACT_KEYWORDS.test(trimmed) && trimmed.length < 30) {
        return {
            isBlocked: true,
            type: 'url',
            reason: 'References to other contact methods are blocked.',
            detectedPattern: 'Contact keyword',
            excerpt: trimmed
        };
    }

    return { isBlocked: false };
}

export function getBlockedMessage(language: 'en' | 'id' = 'en'): string {
    if (language === 'id') {
        return 'Untuk keamanan dan privasi Anda, berbagi nomor kontak tidak diperbolehkan. Silakan lanjutkan percakapan di sini.';
    }

    return 'For your safety and privacy, sharing contact details is not allowed. Please continue here.';
}

export type { PiiType };
