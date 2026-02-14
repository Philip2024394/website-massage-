/**
 * Contact Form Service
 * Submits contact/support form data to Appwrite for IndaStreet
 */

import { databases, ID } from '../appwrite';
import { APPWRITE_CONFIG } from '../appwrite.config';
import { logger } from '../../utils/logger';

const CONTACT_INQUIRIES_COLLECTION = 'contact_inquiries';
const SUPPORT_EMAIL = 'indastreet.id@gmail.com';

export interface ContactFormData {
  fullName?: string;
  email: string;
  phone?: string;
  country?: string;
  message: string;
  subject?: string;
  userRole?: string;
  issueCategory?: string;
  department?: string; // booking-support | finance | therapist-support | admin | compliance
  screenshots?: string[]; // Optional: URLs if file upload implemented later
}

export interface ContactSubmitResult {
  success: boolean;
  id?: string;
  error?: string;
  mailtoUrl?: string; // Fallback when Appwrite fails
}

/**
 * Submit contact form to Appwrite contact_inquiries collection
 * Requires: Create a collection "contact_inquiries" in Appwrite with:
 * - email (string, required)
 * - phone (string)
 * - country (string)
 * - message (string, required)
 * - userRole (string)
 * - issueCategory (string)
 * Permissions: Create for "any" (public form)
 */
export async function submitContactForm(data: ContactFormData): Promise<ContactSubmitResult> {
  try {
    const payload = {
      fullName: (data.fullName || '').trim(),
      email: data.email.trim(),
      phone: (data.phone || '').trim(),
      country: (data.country || 'ID').trim(),
      subject: (data.subject || '').trim(),
      message: data.message.trim(),
      userRole: data.userRole || '',
      issueCategory: data.issueCategory || '',
      department: data.department || 'admin',
      submittedAt: new Date().toISOString(),
      status: 'open',
      priority: 'normal',
    };

    const databaseId = APPWRITE_CONFIG.databaseId;
    const collectionId = APPWRITE_CONFIG.collections.contactInquiries || CONTACT_INQUIRIES_COLLECTION;

    const doc = await databases.createDocument(
      databaseId,
      collectionId,
      ID.unique(),
      payload
    );

    logger.debug('Contact form submitted successfully:', doc.$id);
    return { success: true, id: doc.$id };
  } catch (error) {
    const err = error as Error;
    logger.error('Contact form submission failed:', err);
    const mailtoUrl = getContactMailtoUrl(data);
    return {
      success: false,
      error: err.message,
      mailtoUrl,
    };
  }
}

/**
 * Get mailto URL for fallback when Appwrite is unavailable
 */
export function getContactMailtoUrl(data: ContactFormData): string {
  const subject = data.subject || 'IndaStreet Support Request';
  const body = [
    `Full Name: ${data.fullName || 'Not provided'}`,
    `Message: ${data.message}`,
    `Subject: ${data.subject || 'Not specified'}`,
    `Department: ${data.department || 'Not specified'}`,
    `Role: ${data.userRole || 'Not specified'}`,
    `Category: ${data.issueCategory || 'Not specified'}`,
    `Phone: ${data.phone || 'Not provided'}`,
    `Country: ${data.country || 'ID'}`,
  ].join('\n\n');
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
