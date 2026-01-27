import { Client, Databases, Account, Storage } from 'appwrite';
import { APP_CONFIG } from '../../config';

const client = new Client()
    .setEndpoint(APP_CONFIG.APPWRITE.ENDPOINT)
    .setProject(APP_CONFIG.APPWRITE.PROJECT_ID);

const databases = new Databases(client);
const account = new Account(client);
const storage = new Storage(client);

// Note: localStorage warnings from Appwrite will now display naturally
// This ensures complete console honesty as per system integrity requirements

export const appwriteClient = client;
export const appwriteDatabases = databases;
export const appwriteAccount = account;
export const appwriteStorage = storage;

// Also export individual instances for backward compatibility
export { client, databases, account, storage };
