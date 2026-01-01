/**
 * Denver MeshCore MQTT Collector
 *
 * Connects to HiveMQ Cloud broker, subscribes to MeshCore topics,
 * and stores packets in the Turso database.
 */

import mqtt, { type MqttClient } from 'mqtt';
import { initDb, closeDb, upsertNode } from './db.js';
import { handlePacket, handleStatus, getStats } from './packet-handler.js';
import type { NodeData, MeshcoreBotContact } from './types.js';

// Configuration from environment
const config = {
  mqtt: {
    brokerUrl: process.env.MQTT_BROKER_URL || '',
    port: parseInt(process.env.MQTT_PORT || '8883', 10),
    username: process.env.MQTT_USERNAME || '',
    password: process.env.MQTT_PASSWORD || '',
  },
  meshcoreBot: {
    apiUrl: process.env.MESHCORE_BOT_API_URL || 'http://10.0.0.222:8081',
    syncInterval: parseInt(process.env.MESHCORE_BOT_SYNC_INTERVAL || '60000', 10), // 1 minute
  },
};

// Topics to subscribe to (using wildcards to match mctomqtt's topic pattern)
// mctomqtt publishes to: meshcore/{IATA}/{PUBLIC_KEY}/packets
const TOPICS = {
  PACKETS: 'meshcore/+/+/packets',
  STATUS: 'meshcore/+/+/status',
  DEBUG: 'meshcore/+/+/debug',
  RAW: 'meshcore/+/+/raw',
};

let client: MqttClient | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 1000; // 1 second

/**
 * Validate required environment variables
 */
function validateConfig(): void {
  const required = [
    'MQTT_BROKER_URL',
    'MQTT_USERNAME',
    'MQTT_PASSWORD',
    'TURSO_DATABASE_URL',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing.join(', '));
    console.error('\nRequired variables:');
    console.error('  MQTT_BROKER_URL   - HiveMQ cluster URL (e.g., xxx.hivemq.cloud)');
    console.error('  MQTT_PORT         - MQTT port (default: 8883)');
    console.error('  MQTT_USERNAME     - HiveMQ username');
    console.error('  MQTT_PASSWORD     - HiveMQ password');
    console.error('  TURSO_DATABASE_URL - Turso database URL');
    console.error('  TURSO_AUTH_TOKEN  - Turso auth token (optional for local dev)');
    process.exit(1);
  }
}

/**
 * Calculate reconnect delay with exponential backoff
 */
function getReconnectDelay(): number {
  const delay = BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts);
  return Math.min(delay, 60000); // Max 60 seconds
}

/**
 * Connect to the MQTT broker
 */
function connect(): void {
  const brokerUrl = `mqtts://${config.mqtt.brokerUrl}:${config.mqtt.port}`;

  console.log(`[MQTT] Connecting to ${brokerUrl}...`);

  client = mqtt.connect(brokerUrl, {
    username: config.mqtt.username,
    password: config.mqtt.password,
    clientId: `denvermc-collector-${Date.now()}`,
    clean: true,
    reconnectPeriod: 0, // We handle reconnection manually
    connectTimeout: 30000,
    rejectUnauthorized: true, // Verify TLS certificates
  });

  // Connection established
  client.on('connect', () => {
    console.log('[MQTT] Connected successfully!');
    reconnectAttempts = 0;

    // Subscribe to topics
    const topics = [TOPICS.PACKETS, TOPICS.STATUS];
    client?.subscribe(topics, { qos: 0 }, (err, granted) => {
      if (err) {
        console.error('[MQTT] Subscribe error:', err);
        return;
      }
      console.log('[MQTT] Subscribed to topics:', granted?.map((g) => g.topic).join(', '));
    });
  });

  // Message received
  client.on('message', async (topic: string, payload: Buffer) => {
    try {
      // Match topic patterns (e.g., meshcore/DEN/PUBKEY/packets)
      if (topic.endsWith('/packets') || topic.endsWith('/raw')) {
        await handlePacket(topic, payload);
      } else if (topic.endsWith('/status')) {
        await handleStatus(topic, payload);
      }
    } catch (error) {
      console.error('[MQTT] Error handling message:', error);
    }
  });

  // Connection error
  client.on('error', (err) => {
    console.error('[MQTT] Connection error:', err.message);
  });

  // Disconnected
  client.on('close', () => {
    console.log('[MQTT] Connection closed');

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      const delay = getReconnectDelay();
      console.log(`[MQTT] Reconnecting in ${delay / 1000}s (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
      setTimeout(connect, delay);
    } else {
      console.error('[MQTT] Max reconnection attempts reached. Exiting.');
      process.exit(1);
    }
  });

  // Offline
  client.on('offline', () => {
    console.log('[MQTT] Client offline');
  });
}

/**
 * Map meshcore-bot role to our node type
 */
function mapRoleToNodeType(role: string): NodeData['nodeType'] {
  switch (role.toLowerCase()) {
    case 'companion':
      return 'companion';
    case 'repeater':
      return 'repeater';
    case 'roomserver':
      return 'room_server';
    default:
      return 'node';
  }
}

/**
 * Sync node data from meshcore-bot API
 * This fetches parsed ADVERT data including lat/lng
 */
async function syncFromMeshcoreBot(): Promise<void> {
  try {
    const response = await fetch(`${config.meshcoreBot.apiUrl}/api/contacts`);

    if (!response.ok) {
      console.error(`[Sync] Failed to fetch from meshcore-bot: ${response.status}`);
      return;
    }

    const data = await response.json() as { tracking_data: MeshcoreBotContact[] };
    const contacts = data.tracking_data || [];

    let syncedCount = 0;
    for (const contact of contacts) {
      // Skip contacts without valid data
      if (!contact.user_id || !contact.username) continue;

      // Skip 0,0 coordinates (hidden/not set)
      const hasValidLocation = contact.latitude && contact.longitude &&
        !(contact.latitude === 0 && contact.longitude === 0);

      // Normalize ID to lowercase for consistency
      const normalizedId = contact.user_id.toLowerCase();
      const nodeData: NodeData = {
        id: normalizedId,
        publicKey: normalizedId,
        name: contact.username,
        nodeType: mapRoleToNodeType(contact.role),
        lastSeen: contact.last_seen || new Date().toISOString(),
        latitude: hasValidLocation ? contact.latitude : null,
        longitude: hasValidLocation ? contact.longitude : null,
        city: contact.city || null,
        state: contact.state || null,
        country: contact.country || null,
      };

      await upsertNode(nodeData);
      syncedCount++;
    }

    console.log(`[Sync] Synced ${syncedCount} nodes from meshcore-bot API`);
  } catch (error) {
    console.error('[Sync] Error syncing from meshcore-bot:', error);
  }
}

/**
 * Start periodic sync from meshcore-bot
 */
function startMeshcoreBotSync(): void {
  // Initial sync
  syncFromMeshcoreBot();

  // Periodic sync
  setInterval(syncFromMeshcoreBot, config.meshcoreBot.syncInterval);
  console.log(`[Sync] Meshcore-bot sync started (interval: ${config.meshcoreBot.syncInterval / 1000}s)`);
}

/**
 * Graceful shutdown
 */
function shutdown(signal: string): void {
  console.log(`\n[Main] Received ${signal}, shutting down...`);

  const stats = getStats();
  console.log(`[Main] Final stats: ${stats.processed} packets processed, ${stats.errors} errors`);

  if (client) {
    client.end(true, () => {
      console.log('[MQTT] Client disconnected');
      closeDb();
      process.exit(0);
    });
  } else {
    closeDb();
    process.exit(0);
  }
}

/**
 * Main entry point
 */
function main(): void {
  console.log('='.repeat(50));
  console.log('Denver MeshCore MQTT Collector');
  console.log('='.repeat(50));

  // Validate configuration
  validateConfig();

  // Initialize database
  initDb();

  // Connect to MQTT
  connect();

  // Start meshcore-bot sync
  startMeshcoreBotSync();

  // Handle shutdown signals
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  console.log('[Main] Collector started. Press Ctrl+C to stop.');
}

// Run
main();
