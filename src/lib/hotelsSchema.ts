// Browser-safe schema utilities (no fs/path). JSON is bundled statically.
// If schema/hotels.json is empty or missing attributes, sanitation becomes a no-op.

// Import the exported JSON (Vite supports direct JSON import)
// Using relative path from lib/ to schema/
// eslint-disable-next-line @typescript-eslint/no-var-requires
import hotelsSchemaData from '../schema/hotels.json';

interface AttributeDef { key: string; required: boolean; type: string; }
interface HotelsSchema { collectionId: string; name: string; attributes: AttributeDef[]; exportedAt?: string; }

const hotelsSchema: HotelsSchema | null = (hotelsSchemaData && Array.isArray((hotelsSchemaData as any).attributes))
  ? (hotelsSchemaData as HotelsSchema)
  : null;

export function getHotelsSchema(): HotelsSchema | null { return hotelsSchema; }

export function validateHotelsPayload(payload: Record<string, any>) {
  if (!hotelsSchema) return { unknown: [], missingRequired: [] };
  const allowed = new Set(hotelsSchema.attributes.map(a => a.key));
  const required = new Set(hotelsSchema.attributes.filter(a => a.required).map(a => a.key));
  const keys = Object.keys(payload);
  const unknown = keys.filter(k => !allowed.has(k));
  const missingRequired = [...required].filter(k => !(k in payload));
  return { unknown, missingRequired };
}

export function sanitizeHotelsPayload(payload: Record<string, any>) {
  // If schema not loaded OR attributes array empty treat as no-op (avoid nuking payload)
  if (!hotelsSchema || !Array.isArray(hotelsSchema.attributes) || hotelsSchema.attributes.length === 0) {
    return { sanitized: payload, diff: { unknown: [], missingRequired: [] } };
  }
  const { unknown, missingRequired } = validateHotelsPayload(payload);
  // Only remove unknown if there is at least one allowed attribute (prevents deleting everything when misconfigured)
  const allowedCount = hotelsSchema.attributes.length;
  const sanitized = { ...payload };
  if (allowedCount > 0) {
    for (const k of unknown) delete sanitized[k];
  }
  for (const k of missingRequired) sanitized[k] = sanitized[k] ?? 'PENDING';
  return { sanitized, diff: { unknown, missingRequired } };
}

export function buildHotelsPayload(base: { id: string; email: string; type: 'hotel' | 'villa'; userId: string; }) {
  const namePrefix = base.type === 'hotel' ? 'Hotel' : 'Villa';
  // hotelId must be a valid integer per Appwrite schema. We derive one deterministically:
  // Try to extract leading digits from the generated id; if none, fallback to a timestamp.
  const numericHotelId = (() => {
    const digitMatch = base.id.match(/\d+/);
    if (digitMatch) {
      // Limit size to safe 32-bit integer if very long
      const num = parseInt(digitMatch[0], 10);
      return num > 2147483647 ? num % 2147483647 : num;
    }
    // Timestamp fallback (trim to seconds for stability during rapid creations)
    return Math.floor(Date.now() / 1000);
  })();
  const payload: Record<string, any> = {
    id: base.id,
    hotelId: numericHotelId,
    hotelName: `${namePrefix} ${base.email.split('@')[0]}`,
    name: `${namePrefix} ${base.email.split('@')[0]}`,
    type: base.type,
    email: base.email,
    userId: base.userId,
    hotelAddress: 'Address pending',
    address: 'Address pending',
    contactNumber: ''
  };
  return sanitizeHotelsPayload(payload);
}
