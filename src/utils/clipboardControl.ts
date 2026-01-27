// Utility functions to centralize clipboard handling and privacy safeguards

const WHATSAPP_PATTERN = /\+?62\d{6,}|(0)8\d{6,}/;
const PHONE_PATTERN = /\b\d{8,}\b/;
const EMAIL_PATTERN = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const INTERNAL_ID_PATTERN = /^([a-z0-9]{24,})$/i;
const COMMISSION_PATTERN = /commission|payout|admin\s+note/i;
const APPWRITE_ID_PATTERN = /appwrite\/[a-z0-9_-]{10,}/i;

/**
 * Strip any metadata fragments and collapse whitespace so clipboard content looks clean.
 * We purposefully remove trailing metadata lines that might include internal IDs/notes.
 */
export function sanitizeClipboardText(value: string): string {
    return value
        .replace(/\[meta:[^\]]*\]/gi, '')
        .replace(/booking\s*metadata[\s\S]*$/i, '')
        .replace(/(commission|payout|admin note)s?:[^\n]*/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Detect attempts to copy or paste sensitive identifiers or contact numbers.
 */
export function containsRestrictedClipboardContent(value: string): boolean {
    if (!value) {
        return false;
    }

    const trimmed = value.trim();

    return (
        WHATSAPP_PATTERN.test(trimmed) ||
        PHONE_PATTERN.test(trimmed) ||
        EMAIL_PATTERN.test(trimmed) ||
        INTERNAL_ID_PATTERN.test(trimmed) ||
        COMMISSION_PATTERN.test(trimmed) ||
        APPWRITE_ID_PATTERN.test(trimmed)
    );
}
