// In-process token buckets keyed on ip_hash (§4.1.5). One process, one map;
// sweep() drops idle keys so a day of traffic never grows it.

export interface RateOptions {
  /** Tokens available from a cold start, and the ceiling. */
  burst: number;
  /** Time for the bucket to refill from empty to `burst`. */
  perMs: number;
}

interface Bucket {
  tokens: number;
  at: number;
}

export class RateLimiter {
  private readonly buckets = new Map<string, Bucket>();
  private readonly opts: RateOptions;
  constructor(opts: RateOptions) {
    this.opts = opts;
  }

  /** Take one token for `key` at time `now`; false means over the limit. */
  take(key: string, now = Date.now()): boolean {
    const b = this.buckets.get(key) ?? { tokens: this.opts.burst, at: now };
    const refill = ((now - b.at) / this.opts.perMs) * this.opts.burst;
    b.tokens = Math.min(this.opts.burst, b.tokens + Math.max(0, refill));
    b.at = now;
    const ok = b.tokens >= 1;
    if (ok) b.tokens -= 1;
    this.buckets.set(key, b);
    return ok;
  }

  /** Forget every key that would be full again by now. */
  sweep(now = Date.now()): void {
    for (const [key, b] of this.buckets) if (now - b.at >= this.opts.perMs) this.buckets.delete(key);
  }

  get size(): number {
    return this.buckets.size;
  }
}

const HOUR = 3_600_000;
const MINUTE = 60_000;
const DAY = 24 * HOUR;

/** The plan's numbers: 6 memorial posts/hour, 6 run posts/hour, 20 reports/day, 60 GETs/minute. */
export function standardLimits(): { memorialPost: RateLimiter; runPost: RateLimiter; report: RateLimiter; get: RateLimiter } {
  return {
    memorialPost: new RateLimiter({ burst: 6, perMs: HOUR }),
    runPost: new RateLimiter({ burst: 6, perMs: HOUR }),
    report: new RateLimiter({ burst: 20, perMs: DAY }),
    get: new RateLimiter({ burst: 60, perMs: MINUTE }),
  };
}
