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
    THERAPISTS: 'THERAPISTS_COLLECTION_ID',
    PLACES: 'PLACES_COLLECTION_ID',
    USERS: 'USERS_COLLECT',
    AGENTS: 'AGENTS_COLLECTION_ID',
    HOTELS: 'HOTELS_COLLECTION_ID',
    PARTNERS: '677a5d3f003c4d7e9c1a',
};
