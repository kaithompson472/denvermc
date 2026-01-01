import type { Config } from '@netlify/functions';

/**
 * Scheduled function to post network health summary to Discord
 * Runs every 6 hours to provide regular status updates
 */
export default async function handler() {
  const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL;
  const webhookSecret = process.env.DISCORD_WEBHOOK_SECRET;

  if (!siteUrl || !webhookSecret) {
    console.error('Missing URL or DISCORD_WEBHOOK_SECRET environment variables');
    return new Response('Configuration error', { status: 500 });
  }

  console.log(`Sending scheduled Discord update from ${siteUrl}`);

  try {
    const response = await fetch(`${siteUrl}/api/discord-webhook`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${webhookSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'scheduled' }),
    });

    const data = await response.json();

    if (data.success && data.data?.sent) {
      console.log(`Discord scheduled update sent: status=${data.data.status}, score=${data.data.score}`);
    } else if (data.success) {
      console.log('Discord update skipped (no change or not configured)');
    } else {
      console.error('Discord update failed:', data.error);
    }

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to send Discord update:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send Discord update' }),
      { status: 500 }
    );
  }
}

// Run every 6 hours (0:00, 6:00, 12:00, 18:00 UTC)
export const config: Config = {
  schedule: '0 */6 * * *',
};
