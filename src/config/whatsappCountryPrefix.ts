/**
 * WhatsApp country dial prefixes for therapist, facial, and place dashboards.
 * Ensures saved numbers always have country prefix so tourists can contact from any country.
 */

export const WHATSAPP_COUNTRY_PREFIXES: Record<string, { dial: string; label: string }> = {
  ID: { dial: '+62', label: 'Indonesia' },
  GB: { dial: '+44', label: 'UK' },
  US: { dial: '+1', label: 'USA' },
  AU: { dial: '+61', label: 'Australia' },
  DE: { dial: '+49', label: 'Germany' },
  VN: { dial: '+84', label: 'Vietnam' },
  MY: { dial: '+60', label: 'Malaysia' },
  SG: { dial: '+65', label: 'Singapore' },
  PH: { dial: '+63', label: 'Philippines' },
  TH: { dial: '+66', label: 'Thailand' },
  NL: { dial: '+31', label: 'Netherlands' },
  FR: { dial: '+33', label: 'France' },
  JP: { dial: '+81', label: 'Japan' },
  CN: { dial: '+86', label: 'China' },
  IN: { dial: '+91', label: 'India' },
  AE: { dial: '+971', label: 'UAE' },
  SA: { dial: '+966', label: 'Saudi Arabia' },
};

/** Country codes that use admin WhatsApp for booking (Indonesia only). */
export const BOOKING_USE_ADMIN_COUNTRY_CODES = ['ID'] as const;

export function isBookingUseAdminCountry(countryOrCode: string | undefined): boolean {
  if (!countryOrCode) return true; // default to admin (Indonesia behaviour)
  const upper = String(countryOrCode).toUpperCase().trim();
  if (upper === 'INDONESIA' || upper === 'ID') return true;
  return BOOKING_USE_ADMIN_COUNTRY_CODES.includes(upper as any);
}

/** Get dial prefix for country code (e.g. ID -> +62). Default +62 if unknown. */
export function getWhatsAppPrefixForCountry(countryCode: string | undefined): string {
  if (!countryCode) return '+62';
  const entry = WHATSAPP_COUNTRY_PREFIXES[String(countryCode).toUpperCase()];
  return entry?.dial ?? '+62';
}

/** Normalize WhatsApp number to digits only (for wa.me). Keeps leading country code. */
export function normalizeWhatsAppToDigits(fullNumber: string): string {
  return String(fullNumber || '').replace(/\D/g, '').trim();
}
