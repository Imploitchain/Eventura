import { sql } from 'drizzle-orm';
import { db } from '../client';

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // Max requests per window

// Simple in-memory rate limiting
const rateLimits = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple rate limiter that works with wallet addresses
 * @param walletAddress The wallet address to rate limit
 * @returns True if the request is allowed, false if rate limited
 */
export async function isRateLimited(walletAddress: string): Promise<boolean> {
  const now = Date.now();
  const rateLimit = rateLimits.get(walletAddress);

  if (!rateLimit) {
    // First request from this wallet
    rateLimits.set(walletAddress, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  if (now > rateLimit.resetTime) {
    // Reset the counter if window has passed
    rateLimit.count = 1;
    rateLimit.resetTime = now + RATE_LIMIT_WINDOW_MS;
    return false;
  }

  // Increment the counter
  rateLimit.count++;
  
  // Check if over the limit
  if (rateLimit.count > RATE_LIMIT_MAX_REQUESTS) {
    return true; // Rate limited
  }
  
  return false; // Not rate limited
}

// Clean up old rate limits periodically
setInterval(() => {
  const now = Date.now();
  for (const [wallet, rateLimit] of rateLimits.entries()) {
    if (now > rateLimit.resetTime) {
      rateLimits.delete(wallet);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

/**
 * Middleware to apply rate limiting to API routes
 * @param req The request object
 * @param res The response object
 * @param next The next function in the middleware chain
 */
export async function rateLimitMiddleware(
  walletAddress: string,
  customLimit = RATE_LIMIT_MAX_REQUESTS
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const limited = await isRateLimited(walletAddress);
  if (limited) {
    const rateLimit = rateLimits.get(walletAddress);
    return {
      allowed: false,
      retryAfter: rateLimit ? Math.ceil((rateLimit.resetTime - Date.now()) / 1000) : 60,
    };
  }
  return { allowed: true };
}
