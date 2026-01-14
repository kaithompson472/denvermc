import { NextResponse } from 'next/server';
import { getNodesWithStats, db } from '@/lib/db';
import { getCachedOrFetch } from '@/lib/cache';
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

// Allow ISR caching for 30 seconds
export const revalidate = 30;

/**
 * GET /api/nodes
 * Returns all nodes in the network with their computed statistics
 */
export async function GET() {
  try {
    // Use in-memory cache to reduce function invocations (30 second TTL)
    const nodes = await getCachedOrFetch<NodeWithStats[]>('nodes', async () => {
      // Update observer last_seen before fetching
      await updateObserverLastSeen();
      return getNodesWithStats();
    }, 30);

    const response = NextResponse.json<ApiResponse<NodeWithStats[]>>({
      success: true,
      data: nodes,
    });

    // Allow short caching to reduce function invocations
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');

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
