/**
 * Rate limiting for Notion API
 *
 * Notion limit: 3 requests/second
 * Our implementation: 600ms between requests (TokenHunter pattern)
 * This is more conservative than Notion's limit for safety
 */
import pLimit from 'p-limit';

const RATE_LIMIT_MS =
  parseInt(process.env.NOTION_RATE_LIMIT_MS || '600', 10);

// Rate limiter: 3 concurrent requests max
const rateLimiter = pLimit(3);
let lastRequestTime = Date.now();

export async function rateLimitedFetch(
  url: string | URL | Request,
  options?: RequestInit
): Promise<Response> {
  return rateLimiter(async () => {
    // Ensure minimum delay between requests
    const timeSinceLastRequest = Date.now() - lastRequestTime;
    if (timeSinceLastRequest < RATE_LIMIT_MS) {
      const delayNeeded = RATE_LIMIT_MS - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, delayNeeded));
    }

    lastRequestTime = Date.now();

    try {
      const response = await fetch(url, options);

      // Log rate limit headers if available
      const remaining = response.headers.get('x-ratelimit-remaining');
      const reset = response.headers.get('x-ratelimit-reset');

      if (remaining !== null) {
        console.log(`[Rate Limit] ${remaining} requests remaining`);
      }

      return response;
    } catch (error) {
      console.error('[Rate Limit] Fetch error:', error);
      throw error;
    }
  });
}

/**
 * Manual delay function for batch operations
 */
export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get current rate limit configuration
 */
export function getRateLimitConfig(): {
  delayMs: number;
  maxConcurrent: number;
} {
  return {
    delayMs: RATE_LIMIT_MS,
    maxConcurrent: 3,
  };
}
