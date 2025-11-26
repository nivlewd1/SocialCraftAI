import { supabase } from '../config/supabase';
import type { TrendAnalysisResult, GroundingSource } from '../types';

/**
 * Trend Cache Service
 * 
 * CRITICAL COST OPTIMIZATION:
 * Google Search Grounding costs $0.035 per request ($35 per 1,000 requests).
 * This service caches trend results for 24 hours to prevent redundant API calls.
 * 
 * Without caching: 1,000 users searching "AI trends" = $35.00
 * With caching: 1,000 users searching "AI trends" = $0.035 (single API call)
 */

// Simple hash function for cache keys
function hashQuery(query: string): string {
  const normalized = query.toLowerCase().trim().replace(/\s+/g, ' ');
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `trend_${Math.abs(hash).toString(16)}`;
}

interface CachedTrendResult {
  overallSummary: string;
  identifiedTrends: Array<{ trendTitle: string; description: string }>;
  relatedKeywords: string[];
  sources: Array<{ uri: string; title: string }>;
  cachedAt: string;
  expiresAt: string;
}

export const trendCacheService = {
  /**
   * Get cached trend result if available and not expired
   */
  async getCached(query: string): Promise<TrendAnalysisResult | null> {
    const queryHash = hashQuery(query);

    try {
      // Use the database function for atomic check + hit count increment
      const { data, error } = await supabase.rpc('get_cached_trend', {
        p_query_hash: queryHash,
      });

      if (error) {
        console.warn('Cache lookup error:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      // Parse the cached result
      const cached = data as CachedTrendResult;
      
      console.log(`[TrendCache] Cache HIT for query: "${query.substring(0, 50)}..."`);
      
      return {
        overallSummary: cached.overallSummary,
        identifiedTrends: cached.identifiedTrends,
        relatedKeywords: cached.relatedKeywords,
        sources: cached.sources as GroundingSource[],
      };
    } catch (err) {
      console.warn('Cache lookup failed:', err);
      return null;
    }
  },

  /**
   * Store a trend result in cache
   * TTL defaults to 24 hours
   */
  async setCache(
    query: string,
    result: TrendAnalysisResult,
    ttlHours: number = 24
  ): Promise<void> {
    const queryHash = hashQuery(query);

    const cacheData: CachedTrendResult = {
      overallSummary: result.overallSummary,
      identifiedTrends: result.identifiedTrends,
      relatedKeywords: result.relatedKeywords,
      sources: result.sources,
      cachedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString(),
    };

    try {
      const { error } = await supabase.rpc('set_trend_cache', {
        p_query_hash: queryHash,
        p_query_text: query.substring(0, 500), // Limit stored query text
        p_result_json: cacheData,
        p_sources: result.sources,
        p_ttl_hours: ttlHours,
      });

      if (error) {
        console.warn('Cache write error:', error);
        return;
      }

      console.log(`[TrendCache] Cached result for query: "${query.substring(0, 50)}..." (TTL: ${ttlHours}h)`);
    } catch (err) {
      console.warn('Cache write failed:', err);
    }
  },

  /**
   * Invalidate a specific cache entry
   */
  async invalidate(query: string): Promise<void> {
    const queryHash = hashQuery(query);

    try {
      await supabase
        .from('trend_cache')
        .delete()
        .eq('query_hash', queryHash);
    } catch (err) {
      console.warn('Cache invalidation failed:', err);
    }
  },

  /**
   * Get cache statistics (for admin/debugging)
   */
  async getStats(): Promise<{
    totalEntries: number;
    totalHits: number;
    oldestEntry: string | null;
    newestEntry: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('trend_cache')
        .select('created_at, hit_count');

      if (error || !data) {
        return { totalEntries: 0, totalHits: 0, oldestEntry: null, newestEntry: null };
      }

      const totalHits = data.reduce((sum, row) => sum + (row.hit_count || 0), 0);
      const dates = data.map(row => new Date(row.created_at).getTime());

      return {
        totalEntries: data.length,
        totalHits,
        oldestEntry: dates.length > 0 ? new Date(Math.min(...dates)).toISOString() : null,
        newestEntry: dates.length > 0 ? new Date(Math.max(...dates)).toISOString() : null,
      };
    } catch (err) {
      console.warn('Failed to get cache stats:', err);
      return { totalEntries: 0, totalHits: 0, oldestEntry: null, newestEntry: null };
    }
  },

  /**
   * Calculate cost savings from cache hits
   * @param hitCount Number of cache hits
   * @returns Estimated savings in USD
   */
  calculateSavings(hitCount: number): number {
    const COST_PER_GROUNDING_REQUEST = 0.035; // $35 per 1,000 requests
    return hitCount * COST_PER_GROUNDING_REQUEST;
  },
};

/**
 * Wrapper for findTrends that checks cache first
 * Use this instead of calling findTrends directly
 */
export async function findTrendsWithCache(
  query: string,
  findTrendsFn: (query: string) => Promise<TrendAnalysisResult>
): Promise<{ result: TrendAnalysisResult; fromCache: boolean }> {
  // Check cache first
  const cached = await trendCacheService.getCached(query);
  
  if (cached) {
    return { result: cached, fromCache: true };
  }

  // Cache miss - call the actual API
  console.log(`[TrendCache] Cache MISS for query: "${query.substring(0, 50)}..." - calling API`);
  const result = await findTrendsFn(query);

  // Store in cache for future requests
  await trendCacheService.setCache(query, result);

  return { result, fromCache: false };
}
