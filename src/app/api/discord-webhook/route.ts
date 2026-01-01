import { NextResponse } from 'next/server';
import { getNetworkStatusState, updateNetworkStatusState } from '@/lib/db';
import {
  buildHealthSummaryEmbed,
  buildStatusChangeEmbed,
  buildWebhookPayload,
  sendDiscordWebhook,
  canSendAlert,
  shouldAlert,
} from '@/lib/discord';
import { checkRateLimit, getClientIp, addRateLimitHeaders } from '@/lib/rate-limit';
import type { ApiResponse, HealthStatus, DiscordNotificationType, NetworkHealth } from '@/lib/types';

// Environment variables
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const DISCORD_WEBHOOK_SECRET = process.env.DISCORD_WEBHOOK_SECRET;

// Rate limit: 5 requests per minute (Discord webhook rate limit is 30/min)
const RATE_LIMIT_CONFIG = { limit: 5, windowSeconds: 60 };

interface WebhookRequestBody {
  type?: 'scheduled' | 'status_check';
  force?: boolean;
}

interface WebhookResponseData {
  sent: boolean;
  type: DiscordNotificationType;
  status: HealthStatus;
  score: number;
}

/**
 * Fetch network health from the internal API
 * This reuses the existing health endpoint logic
 */
async function fetchNetworkHealth(baseUrl: string): Promise<NetworkHealth | null> {
  try {
    const response = await fetch(`${baseUrl}/api/health`, {
      next: { revalidate: 0 }, // Don't cache
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.success || !data.data) return null;

    return data.data as NetworkHealth;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  // Verify webhook URL is configured
  if (!DISCORD_WEBHOOK_URL) {
    console.error('DISCORD_WEBHOOK_URL not configured');
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Discord webhook not configured' },
      { status: 500 }
    );
  }

  // Verify authorization
  const authHeader = request.headers.get('authorization');
  if (!DISCORD_WEBHOOK_SECRET) {
    console.error('DISCORD_WEBHOOK_SECRET not configured');
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${DISCORD_WEBHOOK_SECRET}`) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Rate limiting
  const clientIp = getClientIp(request);
  const rateLimitResult = checkRateLimit(`discord-webhook:${clientIp}`, RATE_LIMIT_CONFIG);

  if (!rateLimitResult.success) {
    const response = NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Rate limit exceeded' },
      { status: 429 }
    );
    return addRateLimitHeaders(response, rateLimitResult);
  }

  try {
    // Parse request body
    let body: WebhookRequestBody = { type: 'scheduled' };
    try {
      body = await request.json();
    } catch {
      // Default to scheduled if no body
    }

    // Determine base URL for internal API calls
    const baseUrl =
      process.env.URL ||
      process.env.DEPLOY_URL ||
      `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('host')}`;

    // Fetch current network health
    const currentHealth = await fetchNetworkHealth(baseUrl);

    if (!currentHealth) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Failed to fetch network health' },
        { status: 500 }
      );
    }

    // Get previous state
    const previousState = await getNetworkStatusState();

    let shouldSendWebhook = false;
    let notificationType: DiscordNotificationType = 'scheduled';
    let embed;

    if (body.type === 'scheduled' || body.force) {
      // Scheduled update - always send summary
      embed = buildHealthSummaryEmbed(currentHealth);
      shouldSendWebhook = true;
    } else {
      // Status check - only alert on changes
      if (previousState) {
        const alertCheck = shouldAlert(
          previousState.status,
          previousState.network_score,
          previousState.active_nodes,
          currentHealth
        );

        // Check cooldown
        if (alertCheck.shouldAlert && canSendAlert(previousState.last_alert_sent)) {
          shouldSendWebhook = true;
          notificationType = alertCheck.type;
          embed = buildStatusChangeEmbed(previousState.status, currentHealth, notificationType);
        }
      } else {
        // No previous state - this is the first run, just update state without alerting
        shouldSendWebhook = false;
      }
    }

    // Send to Discord if needed
    let webhookResult: { success: boolean; error?: string } = { success: true };
    if (shouldSendWebhook && embed) {
      // Mention @everyone only for offline status
      const mentionEveryone = currentHealth.status === 'offline';
      const payload = buildWebhookPayload(embed, mentionEveryone);
      webhookResult = await sendDiscordWebhook(DISCORD_WEBHOOK_URL, payload);
    }

    // Update state in database
    await updateNetworkStatusState(
      currentHealth.status,
      currentHealth.network_score ?? 0,
      currentHealth.active_nodes,
      shouldSendWebhook && webhookResult.success
    );

    const response = NextResponse.json<ApiResponse<WebhookResponseData>>({
      success: webhookResult.success,
      data: {
        sent: shouldSendWebhook && webhookResult.success,
        type: notificationType,
        status: currentHealth.status,
        score: currentHealth.network_score ?? 0,
      },
      ...(webhookResult.error && { error: webhookResult.error }),
    });

    return addRateLimitHeaders(response, rateLimitResult);
  } catch (error) {
    console.error('Discord webhook error:', error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  const configured = Boolean(DISCORD_WEBHOOK_URL && DISCORD_WEBHOOK_SECRET);

  return NextResponse.json<ApiResponse<{ configured: boolean }>>({
    success: true,
    data: { configured },
  });
}
