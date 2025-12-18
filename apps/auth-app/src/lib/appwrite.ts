import { Client, Databases, Account, ID } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

export const databases = new Databases(client);
export const account = new Account(client);

export { client, ID };

// Database and Collection IDs
export const DATABASE_ID = '68f76ee1000e64ca8d05';
export const COLLECTIONS = {
    THERAPISTS: 'therapists_collection_id',
    PLACES: 'places_collection_id',
    USERS: 'users_collection_id',
    AGENTS: 'agents_collection_id',
    HOTELS: 'hotels_collection_id',
    PARTNERS: 'partners_collection_id',
};
