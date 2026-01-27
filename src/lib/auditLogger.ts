// Audit logger: writes immutable audit trail events.
// Requires Appwrite collection: auditEvents with fields: action(string), actorId(string), hotelId(string), details(json), createdAt(datetime)

import { databases, ID } from './appwrite';
import { APPWRITE_CONFIG } from './appwrite.config';

interface AuditEventInput {
  action: string;
  actorId: string;
  hotelId?: string;
  details?: any;
}

export const logAuditEvent = async (event: AuditEventInput) => {
  try {
    // Note: auditEvents collection not configured in APPWRITE_CONFIG - hotel features removed
    console.warn('[AuditLogger] Audit logging disabled - collection not configured');
    // await databases.createDocument(
    //   APPWRITE_CONFIG.databaseId,
    //   APPWRITE_CONFIG.collections.auditEvents,
    //   ID.unique(),
    //   {
    //     action: event.action,
    //     actorId: event.actorId,
    //     hotelId: event.hotelId || null,
    //     details: event.details || {},
    //     createdAt: new Date().toISOString(),
    //   }
    // );
  } catch (e) {
    console.warn('[AuditLogger] Failed to record audit event', event.action, e);
  }
};

export type { AuditEventInput };