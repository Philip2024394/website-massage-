const KEY = 'affiliate_code_v1';
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export type AffiliateCache = {
  code: string;
  ts: number;
};

function now() {
  return Date.now();
}

export function captureFromUrl(loc: Location = window.location) {
  try {
    // Support ?aff=CODE and /r/CODE style routes
    const params = new URLSearchParams(loc.search || '');
    let code = params.get('aff') || '';
    if (!code) {
      const m = loc.pathname.match(/\/r\/([A-Za-z0-9_-]+)/);
      if (m) code = m[1];
    }
    if (code) setCode(code);
  } catch {}
}

export function setCode(code: string) {
  try {
    const cleaned = code.trim();
    if (!cleaned) return;
    const payload: AffiliateCache = { code: cleaned, ts: now() };
    localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {}
}

export function getCode(): string | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const payload = JSON.parse(raw) as AffiliateCache;
    if (!payload?.code || !payload?.ts) return null;
    if (now() - payload.ts > TTL_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return payload.code;
  } catch {
    return null;
  }
}

export function clearCode() {
  try { localStorage.removeItem(KEY); } catch {}
}
