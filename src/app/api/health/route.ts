import { NextResponse } from 'next/server';
import { getNetworkHealth, db } from '@/lib/db';
import type { ApiResponse, NetworkHealth } from '@/lib/types';

// Force dynamic rendering to prevent stale cache issues on Netlify
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// meshcore-bot API URL (configured via environment variable)
const BOT_API_URL = process.env.BOT_API_URL;

// Cloudflare Access Service Token for bot API authentication
const CF_ACCESS_CLIENT_ID = process.env.CF_ACCESS_CLIENT_ID || '';
const CF_ACCESS_CLIENT_SECRET = process.env.CF_ACCESS_CLIENT_SECRET || '';

interface BotStats {
  contacts_24h: number;
  contacts_7d: number;
  messages_24h: number;
  total_messages: number;
  avg_hop_count: number;
  max_hop_count: number;
  bot_reply_rate_24h: number;
  top_users: Array<{ user: string; count: number }>;
  avg_response_time_ms?: number;
}

interface GeoData {
  geo_spread_km: number;
  nodes_with_location: number;
}

async function fetchBotStats(): Promise<BotStats | null> {
  if (!BOT_API_URL) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout for external request

    // Build headers - include Cloudflare Access service token if configured
    const headers: Record<string, string> = {};
    if (CF_ACCESS_CLIENT_ID && CF_ACCESS_CLIENT_SECRET) {
      headers['CF-Access-Client-Id'] = CF_ACCESS_CLIENT_ID;
      headers['CF-Access-Client-Secret'] = CF_ACCESS_CLIENT_SECRET;
    }

    const res = await fetch(BOT_API_URL, {
      signal: controller.signal,
      headers,
      next: { revalidate: 30 },
    });

    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();

    return {
      contacts_24h: data.contacts_24h || 0,
      contacts_7d: data.contacts_7d || 0,
      messages_24h: data.messages_24h || 0,
      total_messages: data.total_messages || 0,
      avg_hop_count: data.avg_hop_count || 0,
      max_hop_count: data.max_hop_count || 0,
      bot_reply_rate_24h: data.bot_reply_rate_24h || 0,
      top_users: data.top_users || [],
      avg_response_time_ms: data.avg_response_time_ms,
    };
  } catch {
    return null;
  }
}

/**
 * Calculate geographic spread of nodes with location data
 * Uses Haversine formula to calculate distance between furthest nodes
 */
async function calculateGeoSpread(): Promise<GeoData> {
  try {
    const result = await db.execute({
      sql: `
        SELECT latitude, longitude
        FROM nodes
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      `,
      args: [],
    });

    const nodes = result.rows.map(row => ({
      lat: row.latitude as number,
      lon: row.longitude as number,
    }));

    if (nodes.length < 2) {
      return { geo_spread_km: 0, nodes_with_location: nodes.length };
    }

    // Calculate max distance between any two nodes (Haversine formula)
    let maxDistance = 0;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const distance = haversineDistance(
          nodes[i].lat, nodes[i].lon,
          nodes[j].lat, nodes[j].lon
        );
        if (distance > maxDistance) {
          maxDistance = distance;
        }
      }
    }

    return {
      geo_spread_km: Math.round(maxDistance * 10) / 10,
      nodes_with_location: nodes.length,
    };
  } catch {
    return { geo_spread_km: 0, nodes_with_location: 0 };
  }
}

/**
 * Haversine formula to calculate distance between two lat/lon points in km
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate comprehensive network health score (0-100)
 * Based on 10 weighted components
 */
function calculateNetworkScore(
  health: NetworkHealth,
  botStats: BotStats | null,
  geoData: GeoData
): { score: number; breakdown: NonNullable<NetworkHealth['score_breakdown']> } {
  const breakdown = {
    status: 0,
    uptime: 0,
    signal: 0,
    activity: 0,
    responsiveness: 0,
    reach: 0,
    recency: 0,
    diversity: 0,
    geo_coverage: 0,
    latency: 0,
  };

  // 1. Status (0-10 points) - requires healthy status AND multiple active nodes
  if (health.status === 'healthy' && health.active_nodes >= 10) breakdown.status = 10;
  else if (health.status === 'healthy' && health.active_nodes >= 5) breakdown.status = 8;
  else if (health.status === 'healthy') breakdown.status = 6;
  else if (health.status === 'degraded') breakdown.status = 3;

  // 2. Uptime (0-10 points) - requires very high uptime
  if (health.uptime_pct >= 99) breakdown.uptime = 10;
  else if (health.uptime_pct >= 95) breakdown.uptime = 8;
  else if (health.uptime_pct >= 90) breakdown.uptime = 6;
  else if (health.uptime_pct >= 80) breakdown.uptime = 4;
  else if (health.uptime_pct >= 50) breakdown.uptime = 2;
  else breakdown.uptime = 1;

  // 3. Signal Quality - SNR (0-10 points) - much higher thresholds
  if (health.avg_snr !== null) {
    if (health.avg_snr >= 15) breakdown.signal = 10;
    else if (health.avg_snr >= 12) breakdown.signal = 8;
    else if (health.avg_snr >= 8) breakdown.signal = 6;
    else if (health.avg_snr >= 5) breakdown.signal = 4;
    else if (health.avg_snr >= 0) breakdown.signal = 2;
    else breakdown.signal = 1;
  }

  // 4. Recency - time since last packet (0-10 points) - tighter windows
  if (health.last_packet_at) {
    const minutesSincePacket = (Date.now() - new Date(health.last_packet_at).getTime()) / 60000;
    if (minutesSincePacket < 1) breakdown.recency = 10;
    else if (minutesSincePacket < 5) breakdown.recency = 8;
    else if (minutesSincePacket < 15) breakdown.recency = 6;
    else if (minutesSincePacket < 30) breakdown.recency = 4;
    else if (minutesSincePacket < 60) breakdown.recency = 2;
    else breakdown.recency = 1;
  }

  // 5. Geographic Coverage (0-10 points)
  // Goal: Fort Collins to Colorado Springs (~160km)
  if (geoData.geo_spread_km >= 150) breakdown.geo_coverage = 10;
  else if (geoData.geo_spread_km >= 100) breakdown.geo_coverage = 8;
  else if (geoData.geo_spread_km >= 60) breakdown.geo_coverage = 6;
  else if (geoData.geo_spread_km >= 30) breakdown.geo_coverage = 4;
  else if (geoData.geo_spread_km > 0) breakdown.geo_coverage = 2;

  if (botStats) {
    // 6. Activity (0-10 points) - require much more activity
    // Need 1000+ messages/day and 50+ contacts for max
    const msgScore = Math.min(5, Math.log10(botStats.messages_24h + 1) * 1.5);
    const contactScore = Math.min(5, Math.log10(botStats.contacts_24h + 1) * 1.5);
    breakdown.activity = Math.round(msgScore + contactScore);

    // 7. Bot Responsiveness (0-10 points) - require near-perfect
    if (botStats.bot_reply_rate_24h >= 99) breakdown.responsiveness = 10;
    else if (botStats.bot_reply_rate_24h >= 95) breakdown.responsiveness = 8;
    else if (botStats.bot_reply_rate_24h >= 90) breakdown.responsiveness = 6;
    else if (botStats.bot_reply_rate_24h >= 80) breakdown.responsiveness = 4;
    else if (botStats.bot_reply_rate_24h >= 50) breakdown.responsiveness = 2;
    else breakdown.responsiveness = 1;

    // 8. Network Reach - hop count (0-10 points)
    // Goal: multi-hop network spanning Front Range
    if (botStats.max_hop_count >= 8) breakdown.reach = 10;
    else if (botStats.max_hop_count >= 6) breakdown.reach = 8;
    else if (botStats.max_hop_count >= 4) breakdown.reach = 6;
    else if (botStats.avg_hop_count >= 2.5) breakdown.reach = 4;
    else if (botStats.avg_hop_count >= 1.5) breakdown.reach = 2;
    else breakdown.reach = 1;

    // 9. User Diversity (0-10 points)
    // Goal: thriving community with 50+ active users
    const uniqueUsers = botStats.top_users.length;
    breakdown.diversity = Math.min(10, Math.round(uniqueUsers / 5));

    // 10. Latency (0-10 points) - easy to achieve, LoRa is slow by nature
    if (botStats.avg_response_time_ms !== undefined) {
      if (botStats.avg_response_time_ms < 5000) breakdown.latency = 10;
      else if (botStats.avg_response_time_ms < 10000) breakdown.latency = 8;
      else if (botStats.avg_response_time_ms < 30000) breakdown.latency = 6;
      else if (botStats.avg_response_time_ms < 60000) breakdown.latency = 4;
      else breakdown.latency = 2;
    } else {
      // Estimate from hop count if no direct latency data - be generous
      if (botStats.avg_hop_count <= 3) breakdown.latency = 10;
      else if (botStats.avg_hop_count <= 5) breakdown.latency = 8;
      else breakdown.latency = 6;
    }
  } else {
    // Fallback scoring if bot is offline
    if (health.active_nodes > 0) {
      breakdown.activity = 2;
      breakdown.reach = 2;
    }
  }

  // Calculate total score
  const totalScore = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

  return {
    score: Math.round(Math.min(100, Math.max(0, totalScore))),
    breakdown,
  };
}

/**
 * Update observer node's last_seen timestamp when bot is active
 */
async function updateObserverLastSeen(): Promise<void> {
  try {
    await db.execute({
      sql: `UPDATE nodes SET last_seen = datetime('now') WHERE name LIKE '%Observer%' OR node_type = 'room_server'`,
      args: [],
    });
  } catch {
    // Ignore errors - not critical
  }
}

export async function GET() {
  try {
    // Fetch DB health, bot stats, and geo data in parallel
    const [dbHealth, botStats, geoData] = await Promise.all([
      getNetworkHealth(),
      fetchBotStats(),
      calculateGeoSpread(),
    ]);

    // If bot is active, update observer's last_seen
    if (botStats && botStats.messages_24h > 0) {
      updateObserverLastSeen(); // Fire and forget
    }

    // Merge all stats into health
    const health: NetworkHealth = {
      ...dbHealth,
      ...(botStats && {
        contacts_24h: botStats.contacts_24h,
        contacts_7d: botStats.contacts_7d,
        messages_24h: botStats.messages_24h,
        avg_hop_count: botStats.avg_hop_count,
        max_hop_count: botStats.max_hop_count,
        bot_reply_rate: botStats.bot_reply_rate_24h,
        unique_contributors: botStats.top_users.length,
        avg_response_time_ms: botStats.avg_response_time_ms,
      }),
      geo_spread_km: geoData.geo_spread_km,
      nodes_with_location: geoData.nodes_with_location,
    };

    // Re-evaluate status and uptime using bot metrics
    if (botStats && botStats.messages_24h > 0) {
      // Bot is receiving messages = network is up
      // Calculate uptime based on bot reply rate (if bot responds, broker is up)
      health.uptime_pct = Math.round(botStats.bot_reply_rate_24h);

      // At least 1 active node if bot is working
      if (health.active_nodes === 0) {
        health.active_nodes = 1;
      }

      // Determine status based on bot activity
      if (botStats.bot_reply_rate_24h >= 80 && botStats.contacts_24h >= 3) {
        health.status = 'healthy';
      } else if (botStats.bot_reply_rate_24h >= 50 || botStats.contacts_24h >= 1) {
        health.status = 'degraded';
      }
    }

    // Calculate comprehensive network score
    const { score, breakdown } = calculateNetworkScore(health, botStats, geoData);
    health.network_score = score;
    health.score_breakdown = breakdown;

    const response = NextResponse.json<ApiResponse<NetworkHealth>>({
      success: true,
      data: health,
    });

    // Disable CDN caching for real-time data (Cloudflare + Netlify)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('CDN-Cache-Control', 'no-store');
    response.headers.set('Netlify-CDN-Cache-Control', 'no-store, durable=false');
    response.headers.set('Cloudflare-CDN-Cache-Control', 'no-store');

    return response;
  } catch (error) {
    console.error('Error fetching network health:', error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: 'Failed to fetch network health',
      },
      { status: 500 }
    );
  }
}
