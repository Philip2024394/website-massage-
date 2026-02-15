/**
 * Contact spam detection for job applications and profile text.
 * Prevents therapists from sharing phone numbers / WhatsApp in free text
 * so employers contact them via the platform.
 */

/** Matches phone-like patterns: 8+ consecutive digits, 08..., +62, 62..., 0xxx-xxx, etc. */
const PHONE_PATTERNS = [
  /\d{8,}/,                                    // 8+ consecutive digits (phone length)
  /0\d{8,}/,                                   // Indonesian 0xxxxxxxx
  /\+62\s*\d{2,}/,                             // +62 xx...
  /62\s*\d{8,}/,                               // 62 xxxxxxxx (no +)
  /\d{3,}[\s\-\.]\d{3,}[\s\-\.]?\d{3,}/,       // 08x-xxx-xxx or similar
  /whatsapp|wa\.me|wa\.me\/\d+/i,              // WhatsApp links
];

/**
 * Returns true if the text appears to contain a contact number or WhatsApp share.
 * Use for experience, specialties, cover letter, description - not for dedicated phone fields.
 */
export function containsContactSpam(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (!trimmed.length) return false;

  for (const pattern of PHONE_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }
  return false;
}

/** User-facing message when contact spam is detected */
export const CONTACT_SPAM_MESSAGE_EN = 'Please do not share contact numbers in your application. Employers will contact you via the platform.';
export const CONTACT_SPAM_MESSAGE_ID = 'Jangan cantumkan nomor kontak dalam lamaran. Employer akan menghubungi Anda melalui platform.';
