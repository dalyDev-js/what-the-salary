import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let submitLimiter: Ratelimit | null = null;

export function getSubmitLimiter(): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  if (!submitLimiter) {
    submitLimiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(3, '24 h'),
      analytics: true,
    });
  }
  return submitLimiter;
}
