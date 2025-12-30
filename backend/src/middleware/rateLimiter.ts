import rateLimit from 'express-rate-limit';

// Rate limiter for chat endpoint
// Allows 10 messages per minute per IP
export const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    error: 'Too many messages sent. Please wait a moment before sending another message.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip successful requests that don't hit the rate limit
  skipSuccessfulRequests: false,
  // Use IP address as identifier
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
});

// Stricter rate limiter for preventing abuse
// Allows 50 messages per hour per IP
export const strictChatRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 requests per hour
  message: {
    error: 'You have exceeded the hourly message limit. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
});
