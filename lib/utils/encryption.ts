/**
 * Message Encryption Utilities
 * Implements AES-256 encryption for message privacy (Facebook/Amazon standards)
 */

import CryptoJS from 'crypto-js';

// Encryption key - in production, use environment variable
const ENCRYPTION_KEY = import.meta.env.VITE_MESSAGE_ENCRYPTION_KEY || 'indastreet-massage-secure-key-2024';

/**
 * Encrypt message content before storing
 */
export function encryptMessage(content: string): string {
    try {
        const encrypted = CryptoJS.AES.encrypt(content, ENCRYPTION_KEY).toString();
        return encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        return content; // Fallback to unencrypted if encryption fails
    }
}

/**
 * Decrypt message content for display
 */
export function decryptMessage(encryptedContent: string): string {
    try {
        const decrypted = CryptoJS.AES.decrypt(encryptedContent, ENCRYPTION_KEY);
        const original = decrypted.toString(CryptoJS.enc.Utf8);
        return original || encryptedContent; // Fallback if decryption fails
    } catch (error) {
        console.error('Decryption error:', error);
        return encryptedContent; // Return as-is if decryption fails
    }
}

/**
 * Hash sensitive data (one-way, for verification)
 */
export function hashData(data: string): string {
    return CryptoJS.SHA256(data).toString();
}

/**
 * Generate unique message ID
 */
export function generateMessageId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}`;
}

/**
 * Check if content appears encrypted
 */
export function isEncrypted(content: string): boolean {
    // Check if content looks like base64 (AES output)
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    return base64Regex.test(content) && content.length > 20;
}
