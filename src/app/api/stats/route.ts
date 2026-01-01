import { NextResponse } from 'next/server';
import { getCommunityStats } from '@/lib/db';
import type { ApiResponse, CommunityStats } from '@/lib/types';

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
}

async function fetchBotStats(): Promise<BotStats | null> {
  if (!BOT_API_URL) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    // Build headers - include Cloudflare Access service token if configured
    const headers: Record<string, string> = {};
    if (CF_ACCESS_CLIENT_ID && CF_ACCESS_CLIENT_SECRET) {
      headers['CF-Access-Client-Id'] = CF_ACCESS_CLIENT_ID;
      headers['CF-Access-Client-Secret'] = CF_ACCESS_CLIENT_SECRET;
    }

    const res = await fetch(BOT_API_URL, {
      signal: controller.signal,
      headers,
      next: { revalidate: 60 },
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
    };
  } catch {
    console.warn('Failed to fetch bot stats (bot may be offline)');
    return null;
  }
}

export async function GET() {
  try {
    // Fetch both DB stats and bot stats in parallel
    const [dbStats, botStats] = await Promise.all([
      getCommunityStats(),
      fetchBotStats(),
    ]);

    // Merge stats
    const stats: CommunityStats = {
      ...dbStats,
      ...(botStats && {
        contacts_24h: botStats.contacts_24h,
        contacts_7d: botStats.contacts_7d,
        messages_24h: botStats.messages_24h,
        total_messages: botStats.total_messages,
        avg_hop_count: botStats.avg_hop_count,
        max_hop_count: botStats.max_hop_count,
        bot_reply_rate_24h: botStats.bot_reply_rate_24h,
        top_users: botStats.top_users,
      }),
    };

    const response = NextResponse.json<ApiResponse<CommunityStats>>({
      success: true,
      data: stats,
    });

    // Disable CDN caching for real-time data (Cloudflare + Netlify)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('CDN-Cache-Control', 'no-store');
    response.headers.set('Netlify-CDN-Cache-Control', 'no-store, durable=false');
    response.headers.set('Cloudflare-CDN-Cache-Control', 'no-store');

    return response;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: 'Failed to fetch community stats',
      },
      { status: 500 }
    );
  }
}
