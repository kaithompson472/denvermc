/**
 * Simple in-memory cache for API routes
 * Reduces Netlify function invocations by caching responses for short periods
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

/**
 * Get cached data or execute the fetcher function
 * @param key - Cache key
 * @param fetcher - Function to fetch data if not cached
 * @param ttlSeconds - Time to live in seconds (default: 30)
 */
export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 30
): Promise<T> {
  const now = Date.now();
  const cached = cache.get(key) as CacheEntry<T> | undefined;

  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const data = await fetcher();

  cache.set(key, {
    data,
    expiresAt: now + ttlSeconds * 1000,
  });

  return data;
}

/**
 * Invalidate a specific cache key
 */
export function invalidateCache(key: string): void {
  cache.delete(key);
}

/**
 * Clear all cached data
 */
export function clearCache(): void {
  cache.clear();
}
