import { describe, it, expect } from 'vitest';
import { sanitizePlacePayload, PLACE_ALLOWED, buildDefaultPlacePayload } from '../schemas/placeSchema';

describe('placeSchema sanitizer', () => {
  it('keeps only allowed keys and drops unknown ones', () => {
    const input = {
      id: 'abc',
      placeId: 'abc',
      name: 'demo',
      category: 'massage-place',
      email: 'demo@example.com',
      pricing: '{}',
      location: 'Somewhere',
      status: 'Open',
      isLive: true,
      openingTime: '09:00',
      closingTime: '21:00',
      coordinates: [100, -6],
      hotelId: '',
      description: 'Desc',
      unknownField: 'SHOULD_REMOVE',
      anotherBad: 123
    };
    const sanitized = sanitizePlacePayload(input, false);
    // Unknown fields gone
    expect((sanitized as any).unknownField).toBeUndefined();
    expect((sanitized as any).anotherBad).toBeUndefined();
    // Allowed fields preserved
    // Only check allowed keys that were in the input; optional ones like password may be absent.
    for (const key of PLACE_ALLOWED) {
      if (key in input) {
        expect(sanitized).toHaveProperty(key);
      }
    }
  });

  it('buildDefaultPlacePayload produces required defaults', () => {
    const payload = buildDefaultPlacePayload('user@example.com', 'pid123');
    expect(payload.name).toBe('user');
    expect(payload.placeId).toBe('pid123');
    expect(payload.isLive).toBe(false);
    expect(() => JSON.parse(payload.pricing)).not.toThrow();
  });
});