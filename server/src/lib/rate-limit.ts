const buckets = new Map<string, { count: number; reset: number }>();

function sweep(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.reset <= now) buckets.delete(key);
  }
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  sweep(now);
  const current = buckets.get(key);
  if (!current) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true as const };
  }
  if (current.count >= limit) return { ok: false as const };
  current.count += 1;
  return { ok: true as const };
}
