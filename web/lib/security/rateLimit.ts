// Simple in-memory rate limiter (per IP + key)
// Note: For production use, prefer a shared store (Redis) to avoid resets.

type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

export function rateLimit(ip: string, key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const k = `${key}:${ip}`;
  const bucket = store.get(k);
  if (!bucket || now > bucket.resetAt) {
    const resetAt = now + windowMs;
    store.set(k, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }
  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }
  bucket.count += 1;
  return { allowed: true, remaining: Math.max(0, limit - bucket.count), resetAt: bucket.resetAt };
}

export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for") || headers.get("X-Forwarded-For") || "";
  if (xff) {
    // may contain multiple IPs, left-most is client
    const ip = xff.split(",")[0].trim();
    if (ip) return ip;
  }
  const cfip = headers.get("cf-connecting-ip") || headers.get("CF-Connecting-IP") || "";
  if (cfip) return cfip.trim();
  return "127.0.0.1"; // fallback in dev
}