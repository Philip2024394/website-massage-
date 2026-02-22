/**
 * Ensures all side-drawer countries are connected to routes and open the country social page.
 */
import { describe, it, expect } from 'vitest';
import { verifyDrawerCountriesConnection } from '../drawerCountriesVerification';

describe('drawerCountriesVerification', () => {
  it('all drawer countries resolve to a valid social page', () => {
    const { ok, errors } = verifyDrawerCountriesConnection();
    expect(errors, errors.join('\n')).toHaveLength(0);
    expect(ok).toBe(true);
  });
});
