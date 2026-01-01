import { NextResponse } from 'next/server';
import { getNodesWithStats } from '@/lib/db';
import type { ApiResponse, NodeWithStats } from '@/lib/types';

/**
 * GET /api/nodes
 * Returns all nodes in the network with their computed statistics
 */
export async function GET() {
  try {
    const nodes = await getNodesWithStats();

    return NextResponse.json<ApiResponse<NodeWithStats[]>>({
      success: true,
      data: nodes,
    });
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
