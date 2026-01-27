// Rate limit utilities stub
export function checkRateLimit(userId: string): boolean {
  return true;
}

export function formatRateLimitError(error: any): string {
  return error?.message || 'Rate limit exceeded';
}

export function handleAppwriteError(error: any): never {
  throw new Error(error?.message || 'Appwrite error');
}
