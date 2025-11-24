#!/usr/bin/env node
/**
 * Audit therapist & place location data: reports counts missing coordinates or using legacy lon field.
 * Run: node scripts/auditProviderLocations.cjs
 */
import { therapistService, placeService } from '../lib/appwriteService.js';

async function run() {
  console.log('🔍 Auditing provider location data...');
  let therapists = [];
  let places = [];
  try { therapists = await therapistService.getAll(); } catch (e) { console.error('Failed fetching therapists', e); }
  try { places = await placeService.getAll(); } catch (e) { console.error('Failed fetching places', e); }

  const therapistReport = therapists.map(t => {
    let parsed; let hasLon=false; let hasLng=false;
    try { if (t.coordinates) { parsed = JSON.parse(String(t.coordinates)); hasLon = parsed && typeof parsed.lon === 'number'; hasLng = parsed && typeof parsed.lng === 'number'; } } catch {}
    return {
      id: t.$id || t.id,
      name: t.name,
      isLive: t.isLive,
      location: t.location || '',
      coordsRaw: t.coordinates || '',
      hasCoords: Boolean(t.coordinates),
      hasLon,
      hasLng,
    };
  });

  const placeReport = places.map(p => {
    let parsed; let hasLon=false; let hasLng=false;
    try { if (p.coordinates) { parsed = JSON.parse(String(p.coordinates)); hasLon = parsed && typeof parsed.lon === 'number'; hasLng = parsed && typeof parsed.lng === 'number'; } } catch {}
    return {
      id: p.$id || p.id,
      name: p.name,
      isLive: p.isLive,
      location: p.location || '',
      coordsRaw: p.coordinates || '',
      hasCoords: Boolean(p.coordinates),
      hasLon,
      hasLng,
    };
  });

  const summary = {
    therapistsTotal: therapists.length,
    therapistsMissingCoords: therapistReport.filter(r=>!r.hasCoords).length,
    therapistsLegacyLon: therapistReport.filter(r=>r.hasLon && !r.hasLng).length,
    placesTotal: places.length,
    placesMissingCoords: placeReport.filter(r=>!r.hasCoords).length,
    placesLegacyLon: placeReport.filter(r=>r.hasLon && !r.hasLng).length,
  };

  console.table(summary);
  console.log('\nSample therapist rows (first 5):');
  console.table(therapistReport.slice(0,5));
  console.log('\nSample place rows (first 5):');
  console.table(placeReport.slice(0,5));

  console.log('\n✅ Audit complete. Consider backfilling legacy lon -> lng and capturing missing coordinates.');
}
run();
