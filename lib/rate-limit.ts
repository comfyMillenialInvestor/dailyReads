/**
 * Simple in-memory rate limiter for API routes
 * For production at scale, consider using Redis-based solutions like @upstash/ratelimit
 */

interface RateLimitRecord {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up expired entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
        if (now > record.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

interface RateLimitOptions {
    /** Maximum number of requests allowed in the window */
    limit: number;
    /** Time window in seconds */
    windowSeconds: number;
}

interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetIn: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (e.g., IP address or user ID)
 * @param options - Rate limit configuration
 */
export function rateLimit(
    identifier: string,
    options: RateLimitOptions = { limit: 5, windowSeconds: 60 }
): RateLimitResult {
    const now = Date.now();
    const windowMs = options.windowSeconds * 1000;
    const key = identifier;

    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
        // First request or window expired - create new record
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + windowMs,
        });
        return {
            success: true,
            remaining: options.limit - 1,
            resetIn: options.windowSeconds,
        };
    }

    if (record.count >= options.limit) {
        // Rate limit exceeded
        return {
            success: false,
            remaining: 0,
            resetIn: Math.ceil((record.resetTime - now) / 1000),
        };
    }

    // Increment counter
    record.count++;
    return {
        success: true,
        remaining: options.limit - record.count,
        resetIn: Math.ceil((record.resetTime - now) / 1000),
    };
}

/**
 * Get client IP from request headers
 */
export function getClientIP(headers: Headers): string {
    return (
        headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        headers.get('x-real-ip') ||
        'unknown'
    );
}
