import { Client, Databases, Account, Storage } from 'appwrite';
import { APP_CONFIG } from '../../config';

const client = new Client()
    .setEndpoint(APP_CONFIG.APPWRITE.ENDPOINT)
    .setProject(APP_CONFIG.APPWRITE.PROJECT_ID);

const databases = new Databases(client);
const account = new Account(client);
const storage = new Storage(client);

// Suppress Appwrite localStorage warning (we've disabled localStorage globally)
if (typeof window !== 'undefined') {
    const originalWarn = console.warn;
    console.warn = (...args: any[]) => {
        if (typeof args[0] === 'string' && args[0].includes('Appwrite is using localStorage')) {
            return; // Suppress: localStorage disabled globally via disableLocalStorage.ts
        }
        originalWarn.apply(console, args);
    };
}

export const appwriteClient = client;
export const appwriteDatabases = databases;
export const appwriteAccount = account;
export const appwriteStorage = storage;

// Also export individual instances for backward compatibility
export { client, databases, account, storage };
