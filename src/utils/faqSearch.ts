/**
 * FAQ Search - keyword matching, partial matching, phrase detection
 * Returns items sorted by relevance (priority + match score)
 */

import type { FAQItem } from '../data/faqData';

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function similarityScore(queryTokens: string[], item: FAQItem): number {
  const q = queryTokens.join(' ');
  const question = item.question.toLowerCase();
  const answer = item.answer.toLowerCase();
  const keywords = item.keywords.join(' ').toLowerCase();
  const combined = `${question} ${answer} ${keywords}`;

  let score = 0;

  // Exact phrase match (highest)
  if (combined.includes(q)) {
    score += 50;
  }

  // Individual token matches
  for (const token of queryTokens) {
    if (token.length < 2) continue;
    if (question.includes(token)) score += 15;
    else if (keywords.includes(token)) score += 10;
    else if (answer.includes(token)) score += 5;
  }

  // Boost for high priority
  score += item.priority;

  return score;
}

/**
 * Search FAQ database - returns top N matches sorted by relevance
 */
export function searchFAQ(
  query: string,
  faqItems: FAQItem[],
  limit: number = 5
): FAQItem[] {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const tokens = tokenize(trimmed);
  const scored = faqItems
    .map((item) => ({
      item,
      score: similarityScore(tokens, item),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.item);

  return scored;
}

/**
 * Check if we have a high-confidence match (>70% - heuristic: score > 30)
 */
export function hasHighConfidenceMatch(query: string, faqItems: FAQItem[]): FAQItem | null {
  const results = searchFAQ(query, faqItems, 1);
  if (results.length === 0) return null;
  const top = results[0];
  const score = similarityScore(tokenize(query.trim()), top);
  return score >= 30 ? top : null;
}
