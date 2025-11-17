#!/usr/bin/env node
// Validates sample hotel & villa payloads against exported schema/hotels.json
import fs from 'fs';
import path from 'path';

const schemaPath = path.join(process.cwd(), 'schema', 'hotels.json');
if (!fs.existsSync(schemaPath)) {
  console.error('❌ schema/hotels.json not found. Export first: pnpm schema:export:hotels');
  process.exit(1);
}
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const attributes = schema.attributes || [];
const allowed = new Set(attributes.map(a => a.key));
const required = new Set(attributes.filter(a => a.required).map(a => a.key));

function analyze(label, payload) {
  const keys = Object.keys(payload);
  const unknown = keys.filter(k => !allowed.has(k));
  const missing = [...required].filter(k => !(k in payload));
  return { label, unknown, missing };
}

// Sample construction mirrors current auth.ts implementation
function buildHotelSample(email) {
  const id = 'SAMPLE_HOTEL_ID';
  return {
    id,
    hotelId: id,
    hotelName: `Hotel ${email.split('@')[0]}`,
    name: `Hotel ${email.split('@')[0]}`,
    type: 'hotel',
    email,
    createdAt: new Date().toISOString(),
    userId: 'SAMPLE_USER_ID',
    partnerTherapists: JSON.stringify([]),
    discountRate: 0,
    hotelAddress: 'Address pending',
    address: 'Address pending',
    contactNumber: ''
  };
}

function buildVillaSample(email) {
  const id = 'SAMPLE_VILLA_ID';
  return {
    id,
    hotelId: id,
    hotelName: `Villa ${email.split('@')[0]}`,
    name: `Villa ${email.split('@')[0]}`,
    type: 'villa',
    email,
    createdAt: new Date().toISOString(),
    userId: 'SAMPLE_USER_ID',
    partnerTherapists: JSON.stringify([]),
    discountRate: 0,
    hotelAddress: 'Address pending',
    address: 'Address pending',
    contactNumber: ''
  };
}

const hotelResult = analyze('hotel', buildHotelSample('hotel@example.com'));
const villaResult = analyze('villa', buildVillaSample('villa@example.com'));

function print(result) {
  console.log(`\n=== ${result.label.toUpperCase()} PAYLOAD CHECK ===`);
  if (result.unknown.length === 0) console.log('✅ No unknown attributes');
  else console.log('⚠️ Unknown attributes:', result.unknown.join(', '));
  if (result.missing.length === 0) console.log('✅ No missing required attributes');
  else console.log('❌ Missing required attributes:', result.missing.join(', '));
}

print(hotelResult);
print(villaResult);

const failures = [hotelResult, villaResult].filter(r => r.unknown.length || r.missing.length);
if (failures.length) {
  console.error('\n❌ Validation failed. Fix payload construction before signup.');
  process.exit(1);
}
console.log('\n✅ All sample payloads are compliant.');