import { NextResponse } from 'next/server';
import { runDataCleanup } from '@/lib/db';

// Secret key for authorization (set in Netlify environment variables)
const CLEANUP_SECRET = process.env.CLEANUP_SECRET;

export async function POST(request: Request) {
  // Verify authorization
  const authHeader = request.headers.get('authorization');

  if (!CLEANUP_SECRET) {
    console.error('CLEANUP_SECRET not configured');
    return NextResponse.json(
      { success: false, error: 'Cleanup not configured' },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${CLEANUP_SECRET}`) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    console.log('Running scheduled data cleanup...');
    const result = await runDataCleanup();

    console.log(
      `Cleanup complete: ${result.packetsDeleted} packets deleted, ` +
        `${result.dailyStatsDeleted} daily stats deleted`
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Cleanup failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
