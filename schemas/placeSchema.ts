// Centralized Place schema & sanitizer to prevent unknown attribute errors.
// Only keys listed in PLACE_ALLOWED will be persisted.

export interface PlacePayload {
  id?: string;
  placeId?: string;
  name: string;
  category: string;
  email: string;
  password?: string; // stored separately by Appwrite
  pricing: string; // JSON string
  location: string;
  status: string; // Open / Closed
  isLive: boolean;
  openingTime: string;
  closingTime: string;
  coordinates: any; // Point or [lng, lat]
  hotelId: string;
  description?: string;
}

// Whitelist of attributes allowed to reach Appwrite.
export const PLACE_ALLOWED: (keyof PlacePayload)[] = [
  'id','placeId','name','category','email','password','pricing','location','status','isLive','openingTime','closingTime','coordinates','hotelId','description'
];

// Sanitizer – strips unknown keys and optionally logs removed ones.
export function sanitizePlacePayload(input: Record<string, any>, log: boolean = true): PlacePayload {
  const output: Record<string, any> = {};
  const removed: string[] = [];
  for (const key of Object.keys(input)) {
    if ((PLACE_ALLOWED as string[]).includes(key)) {
      output[key] = input[key];
    } else {
      removed.push(key);
    }
  }
  if (log && removed.length) {
    console.warn('[PLACE_SANITIZER] Removed unknown keys:', removed);
  }
  // Minimal runtime check for required core fields
  const required: (keyof PlacePayload)[] = ['name','category','email','pricing','location','status','isLive','openingTime','closingTime','coordinates','hotelId'];
  const missing = required.filter(r => output[r] === undefined || output[r] === '');
  if (missing.length) {
    console.warn('[PLACE_SANITIZER] Missing required fields (may be filled server-side):', missing);
  }
  return output as PlacePayload;
}

// Helper to build a default initial payload for new place creation.
export function buildDefaultPlacePayload(email: string, placeId: string) : PlacePayload {
  return {
    id: placeId,
    placeId,
    name: email.split('@')[0],
    category: 'massage-place',
    email,
    password: '',
    pricing: JSON.stringify({ '60': 100, '90': 150, '120': 200 }),
    location: 'Location pending setup',
    status: 'Closed',
    isLive: false,
    openingTime: '09:00',
    closingTime: '21:00',
    coordinates: [106.8456, -6.2088],
    hotelId: ''
  };
}