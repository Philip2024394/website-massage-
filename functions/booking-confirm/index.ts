import crypto from 'crypto';
import { Client, Databases } from 'appwrite';

interface EnvConfig {
  APPWRITE_ENDPOINT?: string;
  APPWRITE_PROJECT_ID?: string;
  APPWRITE_API_KEY?: string;
  BOOKING_TOKEN_SECRET?: string; // HMAC secret
  APPWRITE_DATABASE_ID?: string;
  BOOKINGS_COLLECTION_ID?: string;
}

function getEnv(): EnvConfig {
  return {
    APPWRITE_ENDPOINT: process.env.APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID: process.env.APPWRITE_PROJECT_ID,
    APPWRITE_API_KEY: process.env.APPWRITE_API_KEY,
    BOOKING_TOKEN_SECRET: process.env.BOOKING_TOKEN_SECRET,
    APPWRITE_DATABASE_ID: process.env.APPWRITE_DATABASE_ID,
    BOOKINGS_COLLECTION_ID: process.env.BOOKINGS_COLLECTION_ID
  };
}

function verifyToken(secret: string, bookingId: string, providerId: string, token: string): boolean {
  const payload = `${bookingId}:${providerId}`;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}

async function confirmBooking(bookingId: string, providerId: string) {
  const env = getEnv();
  if (!env.APPWRITE_ENDPOINT || !env.APPWRITE_PROJECT_ID || !env.APPWRITE_API_KEY) {
    throw new Error('Missing Appwrite configuration environment variables');
  }
  if (!env.APPWRITE_DATABASE_ID || !env.BOOKINGS_COLLECTION_ID) {
    throw new Error('Missing database or collection env configuration');
  }

  const client = new Client()
    .setEndpoint(env.APPWRITE_ENDPOINT)
    .setProject(env.APPWRITE_PROJECT_ID);
  // Cast to any to accommodate SDK typings if setKey unavailable
  (client as any).setKey?.(env.APPWRITE_API_KEY);

  const databases = new Databases(client);

  // Minimal timestamp logic (mirrors bookingService.updateStatus)
  const nowIso = new Date().toISOString();
  return databases.updateDocument(env.APPWRITE_DATABASE_ID, env.BOOKINGS_COLLECTION_ID, bookingId, {
    status: 'Confirmed',
    confirmedAt: nowIso,
    providerResponseStatus: 'Confirmed'
  });
}

export default async function (req: any, res: any): Promise<void> {
  try {
    const { bookingId, providerId, token } = req.query || {};
    if (!bookingId || !providerId || !token) {
      res.status(400).json({ error: 'bookingId, providerId and token are required' });
      return;
    }

    const env = getEnv();
    if (!env.BOOKING_TOKEN_SECRET) {
      res.status(500).json({ error: 'Token secret not configured' });
      return;
    }

    if (!verifyToken(env.BOOKING_TOKEN_SECRET, bookingId, providerId, token)) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    const result = await confirmBooking(bookingId, providerId);
    res.status(200).json({ success: true, booking: result });
  } catch (e: any) {
    console.error('Booking confirm error:', e);
    res.status(500).json({ error: e.message || 'Internal error' });
  }
}
