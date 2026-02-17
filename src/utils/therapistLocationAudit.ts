/**
 * Therapist location audit – run against live Appwrite data.
 * Use to confirm: how many therapists are live, and whether all have locations
 * that match the app's main landing page / dropdown / filter options.
 *
 * Run from browser console: window.runTherapistLocationAudit?.()
 * Or call runTherapistLocationAudit() from an admin/debug page.
 */

import { therapistService } from '../lib/appwrite/services/therapist.service';

export interface TherapistLocationAuditResult {
  total: number;
  liveCount: number;
  withCorrectLocation: number;
  incorrectOrMissingLocation: number;
  incorrectDetails: Array<{ id: string; name: string; city: string }>;
}

export async function runTherapistLocationAudit(): Promise<TherapistLocationAuditResult> {
  const result = await therapistService.getTherapistLocationAudit();
  const lines = [
    '——— Therapist location audit (live Appwrite) ———',
    `Total therapists: ${result.total}`,
    `Live on app (isLive = true): ${result.liveCount}`,
    `With location matching app dropdown/filter: ${result.withCorrectLocation}`,
    `Incorrect or missing location: ${result.incorrectOrMissingLocation}`,
  ];
  if (result.incorrectDetails.length > 0) {
    lines.push('Details (id, name, city):');
    result.incorrectDetails.slice(0, 50).forEach((d) => {
      lines.push(`  ${d.id} | ${d.name} | ${d.city}`);
    });
    if (result.incorrectDetails.length > 50) {
      lines.push(`  ... and ${result.incorrectDetails.length - 50} more`);
    }
  }
  lines.push('————————————————————————————————————————————');
  console.log(lines.join('\n'));
  return result;
}

/**
 * Get only live therapist count (real-time from Appwrite).
 */
export async function getLiveTherapistCount(): Promise<number> {
  return therapistService.getLiveTherapistCount();
}
