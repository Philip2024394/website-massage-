/**
 * Content Moderation Utilities
 * Implements Facebook/Amazon-style content filtering and safety standards
 */

// Profanity and inappropriate content list (Indonesian and English)
const PROFANITY_LIST = [
    // English
    'fuck', 'shit', 'damn', 'bitch', 'ass', 'bastard', 'crap', 'dick', 
    'pussy', 'cock', 'nigger', 'whore', 'slut', 'fag', 'retard',
    // Indonesian
    'anjing', 'babi', 'kontol', 'memek', 'jancok', 'bangsat', 'tolol',
    'bodoh', 'goblok', 'asu', 'bajingan', 'kampret', 'tai', 'ngentot'
];

// Spam patterns
const SPAM_PATTERNS = [
    /\b(buy|purchase|sale|discount|offer|deal)\s+(now|here|today)\b/i,
    /\b(click|visit|check)\s+(here|link|website)\b/i,
    /\b(earn|make)\s+(\$|money|cash)\b/i,
    /(http|https|www\.)\S+/gi, // URLs (except in official context)
    /\b\d{10,}\b/g, // Long numbers (phone numbers, cards)
    /(.)\1{4,}/g // Repeated characters (spam)
];

// Personal information patterns (PII detection)
const PII_PATTERNS = [
    /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, // Credit card numbers
    /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g, // SSN-like patterns
    /\b\d{16}\b/g, // 16-digit numbers
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi // Email addresses (outside official use)
];

export interface ModerationResult {
    isClean: boolean;
    score: number; // 0-100, higher is more problematic
    violations: string[];
    sanitizedContent: string;
    hasProfanity: boolean;
    hasSpam: boolean;
    hasPII: boolean;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Moderate message content
 */
export function moderateContent(content: string): ModerationResult {
    let score = 0;
    const violations: string[] = [];
    let sanitizedContent = content;
    
    // Check for profanity
    const hasProfanity = PROFANITY_LIST.some(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        if (regex.test(content)) {
            violations.push(`Profanity detected: ${word}`);
            sanitizedContent = sanitizedContent.replace(regex, '***');
            score += 30;
            return true;
        }
        return false;
    });
    
    // Check for spam patterns
    const hasSpam = SPAM_PATTERNS.some(pattern => {
        if (pattern.test(content)) {
            violations.push('Spam pattern detected');
            score += 25;
            return true;
        }
        return false;
    });
    
    // Check for PII
    const hasPII = PII_PATTERNS.some(pattern => {
        if (pattern.test(content)) {
            violations.push('Personal information detected');
            sanitizedContent = sanitizedContent.replace(pattern, '[REDACTED]');
            score += 20;
            return true;
        }
        return false;
    });
    
    // Check for excessive caps (shouting/spam)
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.6 && content.length > 10) {
        violations.push('Excessive capital letters');
        score += 15;
    }
    
    // Check for excessive punctuation (spam)
    const punctuationCount = (content.match(/[!?]{3,}/g) || []).length;
    if (punctuationCount > 0) {
        violations.push('Excessive punctuation');
        score += 10;
    }
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (score >= 70) riskLevel = 'critical';
    else if (score >= 50) riskLevel = 'high';
    else if (score >= 25) riskLevel = 'medium';
    else riskLevel = 'low';
    
    return {
        isClean: score < 25,
        score,
        violations,
        sanitizedContent,
        hasProfanity,
        hasSpam,
        hasPII,
        riskLevel
    };
}

/**
 * Rate limiting check for spam prevention
 */
const messageTimestamps = new Map<string, number[]>();

export function checkRateLimit(userId: string, maxMessages: number = 10, timeWindowMs: number = 60000): boolean {
    const now = Date.now();
    const userTimestamps = messageTimestamps.get(userId) || [];
    
    // Remove timestamps outside the time window
    const recentTimestamps = userTimestamps.filter(ts => now - ts < timeWindowMs);
    
    // Check if user has exceeded rate limit
    if (recentTimestamps.length >= maxMessages) {
        return false; // Rate limit exceeded
    }
    
    // Add current timestamp
    recentTimestamps.push(now);
    messageTimestamps.set(userId, recentTimestamps);
    
    return true; // Within rate limit
}

/**
 * Sanitize content for display (remove harmful elements)
 */
export function sanitizeForDisplay(content: string): string {
    let sanitized = content;
    
    // Remove script tags
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove inline javascript
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    
    // Remove iframe tags
    sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    
    return sanitized;
}

/**
 * Detect language (basic Indonesian vs English detection)
 */
export function detectLanguage(content: string): 'id' | 'en' | 'mixed' {
    const indonesianWords = ['yang', 'untuk', 'dengan', 'dari', 'ini', 'itu', 'dan', 'atau', 'ada', 'tidak'];
    const englishWords = ['the', 'is', 'are', 'for', 'with', 'from', 'this', 'that', 'and', 'or'];
    
    const lowerContent = content.toLowerCase();
    const idCount = indonesianWords.filter(word => lowerContent.includes(word)).length;
    const enCount = englishWords.filter(word => lowerContent.includes(word)).length;
    
    if (idCount > enCount) return 'id';
    if (enCount > idCount) return 'en';
    return 'mixed';
}
