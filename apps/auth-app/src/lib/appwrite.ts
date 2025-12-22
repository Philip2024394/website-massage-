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
    THERAPISTS: 'therapists_collection_id', // Corrected to actual collection ID
    PLACES: '6767038a003b7bdff200',
    USERS: '67670355000b2bc99d43',
    AGENTS: '677a5d1b002097c0b5d6',
    HOTELS: '676701f9001e6dc8b278',
    PARTNERS: '677a5d3f003c4d7e9c1a',
};
