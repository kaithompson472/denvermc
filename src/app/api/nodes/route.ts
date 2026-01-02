import { NextResponse } from 'next/server';
import { getNodesWithStats, db } from '@/lib/db';
import type { ApiResponse, NodeWithStats } from '@/lib/types';

/**
 * Update observer/gateway node's last_seen timestamp
 * Matches by node_type OR name patterns (case-insensitive, handles leetspeak)
 */
async function updateObserverLastSeen(): Promise<void> {
  try {
    await db.execute({
      sql: `UPDATE nodes SET last_seen = datetime('now')
            WHERE node_type = 'gateway'
               OR LOWER(name) LIKE '%observer%'
               OR LOWER(name) LIKE '%0bserver%'
               OR LOWER(name) LIKE '%obs3rver%'
               OR LOWER(name) LIKE '%0bs3rver%'
               OR LOWER(name) LIKE '%gateway%'`,
      args: [],
    });
  } catch {
    // Ignore errors - not critical
  }
}

// Force dynamic rendering to prevent stale cache issues on Netlify
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/nodes
 * Returns all nodes in the network with their computed statistics
 */
export async function GET() {
  try {
    // Update observer last_seen before fetching
    await updateObserverLastSeen();

    const nodes = await getNodesWithStats();

    const response = NextResponse.json<ApiResponse<NodeWithStats[]>>({
      success: true,
      data: nodes,
    });

    // Disable CDN caching for real-time data (Cloudflare + Netlify)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('CDN-Cache-Control', 'no-store');
    response.headers.set('Netlify-CDN-Cache-Control', 'no-store, durable=false');
    response.headers.set('Cloudflare-CDN-Cache-Control', 'no-store');

    return response;
  } catch (error) {
    console.error('Error fetching nodes:', error);

    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: 'Failed to fetch nodes',
      },
      { status: 500 }
    );
  }
}
