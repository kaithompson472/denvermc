import { NextResponse } from 'next/server';
import { getNodeById, getPacketsByNodeId, getDailyStats } from '@/lib/db';
import { isValidNodeId } from '@/lib/validation';
import type { ApiResponse, Node, Packet, NodeStatsDaily } from '@/lib/types';

interface NodeDetailResponse {
  node: Node;
  recent_packets: Packet[];
  daily_stats: NodeStatsDaily[];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate node ID format before database query
    if (!id || !isValidNodeId(id)) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: 'Invalid node ID format',
      }, { status: 400 });
    }

    const node = await getNodeById(id);

    if (!node) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: 'Node not found',
      }, { status: 404 });
    }

    const [recent_packets, daily_stats] = await Promise.all([
      getPacketsByNodeId(id, 50),
      getDailyStats(id, 30),
    ]);

    return NextResponse.json<ApiResponse<NodeDetailResponse>>({
      success: true,
      data: { node, recent_packets, daily_stats },
    });
  } catch (error) {
    console.error('Error fetching node:', error);
    return NextResponse.json<ApiResponse<never>>({
      success: false,
      error: 'Failed to fetch node',
    }, { status: 500 });
  }
}
