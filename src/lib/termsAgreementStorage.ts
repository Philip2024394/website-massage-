/**
 * Persist "has agreed to terms" per user so the first-time terms screen is shown only once.
 * - Provider (therapist/place): STORAGE_KEY_PREFIX + userId
 * - User (client/guest): USER_TERMS_KEY or USER_TERMS_KEY + userId when logged in
 */

const STORAGE_KEY_PREFIX = 'indastreet_terms_agreed_';
const USER_TERMS_KEY = 'indastreet_user_terms_agreed';

export function getTermsAgreed(userId: string | undefined | null): boolean {
  if (typeof window === 'undefined' || !userId) return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY_PREFIX + userId) === '1';
  } catch {
    return false;
  }
}

export function setTermsAgreed(userId: string | undefined | null): void {
  if (typeof window === 'undefined' || !userId) return;
  try {
    window.localStorage.setItem(STORAGE_KEY_PREFIX + userId, '1');
  } catch {
    // ignore
  }
}

/** Key for user (client) terms: by userId if logged in, else 'guest'. */
function getUserTermsKey(userId: string | undefined | null): string {
  return userId ? USER_TERMS_KEY + '_' + userId : USER_TERMS_KEY + '_guest';
}

export function getUserTermsAgreed(userId: string | undefined | null): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(getUserTermsKey(userId)) === '1';
  } catch {
    return false;
  }
}

export function setUserTermsAgreed(userId: string | undefined | null): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(getUserTermsKey(userId), '1');
  } catch {
    // ignore
  }
}
