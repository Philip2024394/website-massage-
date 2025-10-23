// Temporarily commented out Appwrite imports to prevent module not found errors
// import { Client, Databases, Account, Storage } from 'appwrite';

// const client = new Client();

// client
//     .setEndpoint('https://syd.cloud.appwrite.io/v1')
//     .setProject('68f23b11000d25eb3664');

// export const databases = new Databases(client);
// export const account = new Account(client);
// export const storage = new Storage(client);

// export { client };

// Database and Collection IDs (you'll need to create these in Appwrite Console)
export const DATABASE_ID = '68f23b11000d25eb3664';
export const COLLECTIONS = {
    THERAPISTS: 'therapists',
    PLACES: 'places',
    USERS: 'users',
    AGENTS: 'agents',
    BOOKINGS: 'bookings',
    REVIEWS: 'reviews',
    ANALYTICS: 'analytics'
};