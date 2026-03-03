export function sanitizePriceCardTitle(raw: string | null | undefined): string {
    const trimmed = String(raw ?? '').trim();
    if (!trimmed) return '';

    // Replace restricted words with neutral alternatives.
    let out = trimmed
        .replace(/\bmassage\b/gi, 'Session')
        .replace(/\bwellness\b/gi, 'Relaxation')
        .replace(/\btherapy\b/gi, 'Treatment');

    // Clean up leftover punctuation/connectors & extra whitespace.
    out = out
        .replace(/\s{2,}/g, ' ')
        .replace(/^[&·•\-–—\s]+/g, '')
        .replace(/[&·•\-–—\s]+$/g, '')
        .trim();

    return out;
}

export function getPriceCardTitle(raw: string | null | undefined, fallback = 'Service'): string {
    const cleaned = sanitizePriceCardTitle(raw);
    return cleaned || fallback;
}

