/**
 * Core Appwrite Configuration and Client Setup
 * Base configuration shared across all services
 */

import { Client, Databases, Account, Storage, Functions } from 'appwrite';

// Appwrite configuration
export const APPWRITE_CONFIG = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || 'your-project-id',
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || 'your-database-id',
  bucketId: import.meta.env.VITE_APPWRITE_BUCKET_ID || 'your-bucket-id',
  collections: {
    therapists: import.meta.env.VITE_APPWRITE_COLLECTION_THERAPISTS || 'therapists',
    places: import.meta.env.VITE_APPWRITE_COLLECTION_PLACES || 'places',
    facial_places: import.meta.env.VITE_APPWRITE_COLLECTION_FACIAL_PLACES || 'facial_places',
    bookings: import.meta.env.VITE_APPWRITE_COLLECTION_BOOKINGS || 'bookings',
    reviews: import.meta.env.VITE_APPWRITE_COLLECTION_REVIEWS || 'reviews',
    users: import.meta.env.VITE_APPWRITE_COLLECTION_USERS || 'users',
    payments: import.meta.env.VITE_APPWRITE_COLLECTION_PAYMENTS || 'payments',
    membershipUpgrades: import.meta.env.VITE_APPWRITE_COLLECTION_MEMBERSHIP_UPGRADES || 'membership_upgrades',
    deactivationRequests: import.meta.env.VITE_APPWRITE_COLLECTION_DEACTIVATION_REQUESTS || 'deactivation_requests',
    leadGenerations: import.meta.env.VITE_APPWRITE_COLLECTION_LEAD_GENERATIONS || 'lead_generations',
    membershipAgreements: import.meta.env.VITE_APPWRITE_COLLECTION_MEMBERSHIP_AGREEMENTS || 'membership_agreements',
    leads: import.meta.env.VITE_APPWRITE_COLLECTION_LEADS || 'leads',
  },
};

// Initialize Appwrite client
export const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

// Initialize services
export const databases = new Databases(client);
export const account = new Account(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Export configured instances
export const appwriteClient = client;
export const appwriteDatabases = databases;
export const appwriteAccount = account;
export const appwriteStorage = storage;
export const appwriteFunctions = functions;

// Rate-limited database instance (alias for now)
export const rateLimitedDb = databases;

// Stub services for future implementation
// @ts-ignore - Service stubs
export const notificationService = {
  create: async (data: any) => console.warn('notificationService.create not implemented', data),
};

// @ts-ignore - Service stubs
export const paymentService = {
  createPayment: async (data: any) => console.warn('paymentService.createPayment not implemented', data),
};

// @ts-ignore - Service stubs
export const leadGenerationService = {
  markLeadsPaid: async (memberId: string, month: string, amount: number) => 
    console.warn('leadGenerationService.markLeadsPaid not implemented', { memberId, month, amount }),
};

// @ts-ignore - Service stubs
export const sendAdminNotification = async (data: any) => 
  console.warn('sendAdminNotification not implemented', data);

// @ts-ignore - Service stubs
export const getNonRepeatingMainImage = (index: number) => 
  `https://via.placeholder.com/400x300?text=Therapist+${index + 1}`;