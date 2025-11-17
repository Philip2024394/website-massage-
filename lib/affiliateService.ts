import { Client, Databases, ID } from 'appwrite';
import { APPWRITE_CONFIG } from './appwrite.config';

// Commission config (global 10%)
export const COMMISSION_RATE = 0.10;

let databases: Databases | null = null;

function getDb(): Databases | null {
  try {
    if (databases) return databases;
    const client = new Client();
    client
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId);
    databases = new Databases(client);
    return databases;
  } catch {
    return null;
  }
}

export async function recordAttribution(opts: {
  bookingId: string;
  providerId: string;
  providerType: 'therapist' | 'place';
  providerName?: string;
  affiliateCode: string;
  totalCost?: number;
  venueContext?: { hotelVillaId?: string; hotelVillaName?: string; hotelVillaType?: 'hotel' | 'villa' };
}) {
  try {
    // Guard: ensure collection exists in config
    const collectionId = (APPWRITE_CONFIG.collections as any)?.affiliateAttributions;
    if (!collectionId) {
      console.warn('⚠️ affiliateAttributions collection not configured - attribution recorded client-side only', opts);
      return;
    }
    const db = getDb();
    if (!db) {
      console.warn('⚠️ Appwrite DB unavailable for attribution');
      return;
    }

    const amount = Math.max(0, Math.round(((opts.totalCost || 0) * COMMISSION_RATE) * 100) / 100);

    await db.createDocument(
      APPWRITE_CONFIG.databaseId,
      collectionId,
      ID.unique(),
      {
        bookingId: opts.bookingId,
        providerId: opts.providerId,
        providerType: opts.providerType,
        providerName: opts.providerName || '',
        affiliateCode: opts.affiliateCode,
        commissionRate: COMMISSION_RATE,
        commissionAmount: amount,
        commissionStatus: 'pending',
        source: 'link_or_qr',
        venueId: opts.venueContext?.hotelVillaId || '',
        venueName: opts.venueContext?.hotelVillaName || '',
        venueType: opts.venueContext?.hotelVillaType || '',
        createdAt: new Date().toISOString()
      }
    );
  } catch (e) {
    console.error('Error recording affiliate attribution:', e);
  }
}
