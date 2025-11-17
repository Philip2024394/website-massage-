import { databases } from './appwrite';
import { APPWRITE_CONFIG } from './appwrite.config';
import { Query } from 'appwrite';

export type PromoterDiagnostics = { ok: boolean; messages: string[] };

export async function runPromoterDiagnostics(): Promise<PromoterDiagnostics> {
  const messages: string[] = [];
  const dbId = APPWRITE_CONFIG.databaseId;
  const promotersCol = (APPWRITE_CONFIG.collections as any)?.promoters;

  if (!dbId) {
    messages.push('APPWRITE_CONFIG.databaseId is empty. Set a valid database ID.');
  }
  if (!promotersCol) {
    messages.push('APPWRITE_CONFIG.collections.promoters is empty. Map it to your real collection (agents_collection_id).');
  }

  // Probe collection reachability and read permission with a tiny list query
  if (dbId && promotersCol) {
    try {
      await databases.listDocuments(dbId, promotersCol, [Query.limit(1)]);
    } catch (e: any) {
      const msg = (e?.message || String(e)).toLowerCase();
      if (msg.includes('not found') || msg.includes('unknown') || msg.includes('does not exist')) {
        messages.push(`Collection '${promotersCol}' cannot be found in database '${dbId}'. Verify the ID in Appwrite Console.`);
      } else if (msg.includes('permission') || msg.includes('unauthorized') || msg.includes('forbidden') || e?.code === 401 || e?.code === 403) {
        messages.push('Missing read permission on promoters collection for the current user. Enable read for Role.users() or a specific role/team.');
      } else {
        messages.push(`Unexpected error when listing promoters: ${e?.message || String(e)}`);
      }
    }
  }

  // Provide static guidance for create/update perms. We avoid test writes to keep diagnostics side-effect free.
  messages.push('Ensure Document Security is ON and that create/update permissions are granted to Role.users() to allow profile creation and updates.');
  messages.push('Promoter profile documents are created with ID = userId. Confirm Appwrite allows custom IDs and creation by authenticated users.');

  const ok = messages.length === 0;
  return { ok, messages };
}
