import { NextResponse } from 'next/server';
import { getNodesWithStats } from '@/lib/db';
import type { ApiResponse, NodeWithStats } from '@/lib/types';

// Force dynamic rendering to prevent stale cache issues on Netlify
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/nodes
 * Returns all nodes in the network with their computed statistics
 */
export async function GET() {
  try {
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
