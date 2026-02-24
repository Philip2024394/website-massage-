/**
 * Core Appwrite Configuration and Client Setup
 * Base configuration shared across all services
 */

import { Client, Databases, Account, Storage, Functions } from 'appwrite';
import { handleAppwriteError } from '../globalErrorHandler';

const CRASH_CODE = 536870904;
function isCrashCode(e: unknown): boolean {
  if (e == null || typeof e !== 'object') return false;
  const c = (e as { code?: number | string }).code;
  return c === CRASH_CODE || c === '536870904';
}

/** Wrap a Databases method so 536870904 is caught and rethrown as a safe Error (prevents app crash). */
function wrapDatabasesMethod<T extends (...args: any[]) => Promise<any>>(fn: T, name: string): T {
  return (function (...args: any[]) {
    return fn.apply(this, args).catch((err: unknown) => {
      if (isCrashCode(err)) {
        console.warn(`🛡️ [databases.${name}] Caught 536870904 - converting to safe error`);
        handleAppwriteError(err, `databases.${name}`);
        return Promise.reject(new Error('Connection or service error. Please try again.'));
      }
      return Promise.reject(err);
    });
  } as T);
}

/**
 * Get required environment variable or throw
 */
function requireEnv(key: string, fallback?: string): string {
  const value = import.meta.env[key] || fallback;
  
  // STEP 1: ENVIRONMENT VARIABLES CHECK - Log all checks
  console.log(`[APPWRITE CONFIG] Checking ${key}:`, value ? '✅ LOADED' : '❌ MISSING');
  
  if (!value || value === '') {
    const error = `❌ MISSING CONFIG: ${key} is required but not set in environment variables`;
    console.error(`[APPWRITE CONFIG] ${error}`);
    console.error(`[APPWRITE CONFIG] Available env keys:`, Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));
    throw new Error(error);
  }
  
  console.log(`[APPWRITE CONFIG] ${key} = ${value}`);
  return value;
}

/**
 * Get optional environment variable (for disabled collections)
 * Returns empty string if not configured
 */
function optionalEnv(key: string): string {
  return import.meta.env[key] || '';
}

// Lazy-loaded configuration to avoid TDZ errors during module initialization
let _config: any = null;

function getConfig() {
  if (!_config) {
    _config = {
      endpoint: requireEnv('VITE_APPWRITE_ENDPOINT', 'https://syd.cloud.appwrite.io/v1'),
      projectId: requireEnv('VITE_APPWRITE_PROJECT_ID', '68f23b11000d25eb3664'),
      databaseId: requireEnv('VITE_APPWRITE_DATABASE_ID', '68f76ee1000e64ca8d05'),
      bucketId: requireEnv('VITE_APPWRITE_BUCKET_ID', '68f76bdd002387590584'),
      collections: {
        // Core collections - REQUIRED (Appwrite collection ID for therapists)
        therapists: (() => {
          const envId = import.meta.env.VITE_THERAPISTS_COLLECTION_ID;
          const v = envId && String(envId).trim() !== '' ? envId : requireEnv('VITE_THERAPISTS_COLLECTION_ID', 'therapists_collection_id');
          // Only warn when env is missing (using fallback) and fallback might be wrong for their project
          if (envId === undefined || envId === '') {
            console.warn(
              '[APPWRITE CONFIG] VITE_THERAPISTS_COLLECTION_ID not set; using fallback "therapists_collection_id". If your Appwrite collection has a different ID, set it in .env.'
            );
          }
          return v;
        })(),
        places: requireEnv('VITE_PLACES_COLLECTION_ID', 'places_collection_id'),
        facial_places: requireEnv('VITE_FACIAL_PLACES_COLLECTION_ID', 'facial_places_collection'),
        bookings: requireEnv('VITE_BOOKINGS_COLLECTION_ID', 'bookings'), // ✅ VERIFIED: Actual collection ID is 'bookings'
        reviews: requireEnv('VITE_REVIEWS_COLLECTION_ID', 'reviews_collection_id'),
        locations: requireEnv('VITE_LOCATIONS_COLLECTION_ID', 'locations'),
        
        // Communication - REQUIRED
        messages: requireEnv('VITE_MESSAGES_COLLECTION_ID', 'chat_messages'),
        chatMessages: requireEnv('VITE_CHAT_MESSAGES_COLLECTION_ID', 'chat_messages'),
        chatRooms: requireEnv('VITE_CHAT_ROOMS_COLLECTION_ID', 'chat_rooms'),
        chatAuditLogs: requireEnv('VITE_CHAT_AUDIT_LOGS_COLLECTION_ID', 'chat_audit_logs'),
        chatSessions: requireEnv('VITE_CHAT_SESSIONS_COLLECTION_ID', 'chat_sessions'),
        
        // Analytics - REQUIRED
        analytics: 'Analytics',
        analyticsEvents: 'Analytics Events',
        agentVisits: 'Agent Visits',
        
        // Communication - OPTIONAL
        chatTranslations: 'Chat Translations',
        
        // Core collections - DISABLED (return empty string, force-fail will catch usage)
        users: optionalEnv('VITE_USERS_COLLECTION_ID'),
        agents: optionalEnv('VITE_AGENTS_COLLECTION_ID'),
        admins: optionalEnv('VITE_ADMINS_COLLECTION_ID'),
        notifications: optionalEnv('VITE_NOTIFICATIONS_COLLECTION_ID'),
        
        // Business - OPTIONAL
        hotels: requireEnv('VITE_HOTELS_COLLECTION_ID', 'hotels_collection_id'),
        hotelBookings: requireEnv('VITE_HOTEL_BOOKINGS_COLLECTION_ID', 'hotel_bookings'),
        partners: import.meta.env.VITE_PARTNERS_COLLECTION_ID || 'Partners',
        
        // Content - OPTIONAL (Massage Directory page uses static MASSAGE_TYPES_CATEGORIZED; this is for optional CMS)
        massageTypes: import.meta.env.VITE_MASSAGE_TYPES_COLLECTION_ID || 'Massage Types',
        customLinks: optionalEnv('VITE_CUSTOM_LINKS_COLLECTION_ID'),
        imageAssets: import.meta.env.VITE_IMAGE_ASSETS_COLLECTION_ID || 'Image Assets',
        loginBackgrounds: import.meta.env.VITE_LOGIN_BACKGROUNDS_COLLECTION_ID || 'Login Backgrounds',
        translations: optionalEnv('VITE_TRANSLATIONS_COLLECTION_ID'),
        
        // Pricing & Payments - OPTIONAL
        membershipPricing: 'Membership Pricing',
        pricing: 'Pricing',
        commissionRecords: 'Commission Records',
        payments: 'Payments',
        
        // Membership & Leads - OPTIONAL
        leadGenerations: import.meta.env.VITE_LEAD_GENERATIONS_COLLECTION_ID || 'Lead Generations',
        membershipAgreements: import.meta.env.VITE_MEMBERSHIP_AGREEMENTS_COLLECTION_ID || 'Membership Agreements',
        membershipUpgrades: import.meta.env.VITE_MEMBERSHIP_UPGRADES_COLLECTION_ID || 'Membership Upgrades',
        deactivationRequests: import.meta.env.VITE_DEACTIVATION_REQUESTS_COLLECTION_ID || 'Deactivation Requests',
        leads: optionalEnv('VITE_LEADS_COLLECTION_ID'),
        contactInquiries: import.meta.env.VITE_CONTACT_INQUIRIES_COLLECTION_ID || 'contact_inquiries',
        
        // Jobs - OPTIONAL
        employerJobPostings: 'Employer Job Postings',
        therapistJobListings: 'Therapist Job Listings',
        therapistMenus: 'therapist_menus',
        
        // Therapist Dashboard Data - KTP, Bank Details, Payment Proofs
        therapistDashboard: 'therapist_dashboard_',
        
        // Other - OPTIONAL
        verifications: 'Verifications',
        pushSubscriptions: 'Push Subscriptions',
        appConfig: 'App Config',
        uiConfig: 'UI Config',
        attributes: 'ATTRIBUTES',
        emergency_alerts: import.meta.env.VITE_EMERGENCY_ALERTS_COLLECTION_ID || 'emergency_alerts'
      }
    };
  }
  return _config;
}

// Export config via Proxy for backward compatibility
export const APPWRITE_CONFIG = new Proxy({} as any, {
  get(_, prop) {
    return getConfig()[prop];
  }
});

// Lazy-initialize Appwrite client to avoid TDZ errors
let _client: Client | null = null;
let _databases: Databases | null = null;
let _account: Account | null = null;
let _storage: Storage | null = null;
let _functions: Functions | null = null;

export function getClient(): Client {
  if (!_client) {
    const config = getConfig();
    _client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.projectId);
    
    // STEP 2: APPWRITE CLIENT AUTH CHECK - Log client initialization
    console.log('[APPWRITE CONFIG] ✅ Appwrite Client initialized');
    console.log('[APPWRITE CONFIG] Endpoint:', config.endpoint);
    console.log('[APPWRITE CONFIG] Project ID:', config.projectId);
    console.log('[APPWRITE CONFIG] Database ID:', config.databaseId);
  }
  return _client;
}

// Initialize services lazily - export getter functions
function getDatabasesRaw(): Databases {
  if (!_databases) {
    _databases = new Databases(getClient());
  }
  return _databases;
}

let _databasesWrapped: Databases | null = null;

/** Returns a Databases-like object that catches error 536870904 and rethrows a safe Error. */
export function getDatabases(): Databases {
  if (_databasesWrapped) return _databasesWrapped;
  const raw = getDatabasesRaw() as any;
  _databasesWrapped = new Proxy(raw, {
    get(target, prop: string) {
      const val = target[prop];
      if (typeof val === 'function') {
        return wrapDatabasesMethod(val.bind(target), prop);
      }
      return val;
    }
  }) as Databases;
  return _databasesWrapped;
}

export function getAccount(): Account {
  if (!_account) {
    _account = new Account(getClient());
  }
  return _account;
}

export function getStorage(): Storage {
  if (!_storage) {
    _storage = new Storage(getClient());
  }
  return _storage;
}

export function getFunctions(): Functions {
  if (!_functions) {
    _functions = new Functions(getClient());
  }
  return _functions;
}

// Legacy exports for backward compatibility - these call the getters
export const client = new Proxy({} as Client, {
  get(_, prop) {
    return (getClient() as any)[prop];
  }
});

export const databases = new Proxy({} as Databases, {
  get(_, prop) {
    return (getDatabases() as any)[prop];
  }
});

export const account = new Proxy({} as Account, {
  get(_, prop) {
    return (getAccount() as any)[prop];
  }
});

export const storage = new Proxy({} as Storage, {
  get(_, prop) {
    return (getStorage() as any)[prop];
  }
});

export const functions = new Proxy({} as Functions, {
  get(_, prop) {
    return (getFunctions() as any)[prop];
  }
});

// Verify user session before any database operations
async function validateSession() {
  try {
    const session = await getAccount().get();
    console.log('[APPWRITE CONFIG] ✅ User session active - User ID:', session.$id);
    return session;
  } catch (error) {
    console.warn('[APPWRITE CONFIG] ⚠️ No active session - Guest mode');
    return null;
  }
}

// Export session validator
export { validateSession };

// Rate-limited database instance (alias for databases)
export const rateLimitedDb = databases;

// Export configured instances (aliases for compatibility)
export const appwriteClient = client;
export const appwriteDatabases = databases;
export const appwriteAccount = account;
export const appwriteStorage = storage;
export const appwriteFunctions = functions;