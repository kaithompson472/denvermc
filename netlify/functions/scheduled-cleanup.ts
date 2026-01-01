import type { Config } from '@netlify/functions';

export default async function handler() {
  const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL;
  const cleanupSecret = process.env.CLEANUP_SECRET;

  if (!siteUrl || !cleanupSecret) {
    console.error('Missing URL or CLEANUP_SECRET environment variables');
    return new Response('Configuration error', { status: 500 });
  }

  console.log(`Triggering cleanup at ${siteUrl}/api/cleanup`);

  try {
    const response = await fetch(`${siteUrl}/api/cleanup`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cleanupSecret}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success) {
      console.log(
        `Cleanup successful: ${data.packetsDeleted} packets, ${data.dailyStatsDeleted} daily stats deleted`
      );
    } else {
      console.error('Cleanup failed:', data.error);
    }

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to trigger cleanup:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to trigger cleanup' }),
      { status: 500 }
    );
  }
}

// Run daily at 3:00 AM UTC
export const config: Config = {
  schedule: '0 3 * * *',
};
