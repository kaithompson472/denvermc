/**
 * Database operations for the MQTT collector
 * Uses Turso/libSQL for storage
 */

import { createClient, type Client } from '@libsql/client';
import type { ParsedPacket, NodeData, NodeStatusUpdate } from './types.js';

let db: Client | null = null;

/**
 * Initialize the database client
 */
export function initDb(): Client {
  if (db) return db;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error('TURSO_DATABASE_URL environment variable is required');
  }

  db = createClient({
    url,
    authToken,
  });

  console.log('[DB] Connected to Turso database');
  return db;
}

/**
 * Get the database client
 */
export function getDb(): Client {
  if (!db) {
    return initDb();
  }
  return db;
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Insert a new packet into the database with all fields
 * Uses ON CONFLICT to skip duplicate packets (same origin_key from multiple observers)
 */
export async function insertPacket(packet: ParsedPacket): Promise<void> {
  const client = getDb();

  await client.execute({
    sql: `
      INSERT INTO packets (
        node_id, packet_type, raw_data, snr, rssi, hop_count, origin_key, timestamp,
        score, duration, route, len, payload_len, direction
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(origin_key) DO NOTHING
    `,
    args: [
      packet.nodeId,
      packet.packetType,
      packet.rawData,
      packet.snr,
      packet.rssi,
      packet.hopCount,
      packet.originKey,
      packet.timestamp,
      packet.score,
      packet.duration,
      packet.route,
      packet.len,
      packet.payloadLen,
      packet.direction,
    ],
  });
}

/**
 * Upsert a node (insert or update) with extended fields
 */
export async function upsertNode(node: NodeData): Promise<void> {
  const client = getDb();

  await client.execute({
    sql: `
      INSERT INTO nodes (id, public_key, name, node_type, last_seen, latitude, longitude, city, state, country, model, hardware_version, radio_config, client_version)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = COALESCE(excluded.name, nodes.name),
        node_type = COALESCE(excluded.node_type, nodes.node_type),
        last_seen = excluded.last_seen,
        latitude = COALESCE(excluded.latitude, nodes.latitude),
        longitude = COALESCE(excluded.longitude, nodes.longitude),
        city = COALESCE(excluded.city, nodes.city),
        state = COALESCE(excluded.state, nodes.state),
        country = COALESCE(excluded.country, nodes.country),
        model = COALESCE(excluded.model, nodes.model),
        hardware_version = COALESCE(excluded.hardware_version, nodes.hardware_version),
        radio_config = COALESCE(excluded.radio_config, nodes.radio_config),
        client_version = COALESCE(excluded.client_version, nodes.client_version)
    `,
    args: [
      node.id,
      node.publicKey,
      node.name,
      node.nodeType,
      node.lastSeen,
      node.latitude ?? null,
      node.longitude ?? null,
      node.city ?? null,
      node.state ?? null,
      node.country ?? null,
      node.model ?? null,
      node.hardwareVersion ?? null,
      node.radioConfig ?? null,
      node.clientVersion ?? null,
    ],
  });
}

/**
 * Update node status from STATUS messages (battery, uptime, errors, etc.)
 */
export async function updateNodeStatus(status: NodeStatusUpdate): Promise<void> {
  const client = getDb();

  await client.execute({
    sql: `
      UPDATE nodes SET
        battery_mv = COALESCE(?, battery_mv),
        noise_floor = COALESCE(?, noise_floor),
        uptime_secs = COALESCE(?, uptime_secs),
        error_count = COALESCE(?, error_count),
        queue_len = COALESCE(?, queue_len),
        tx_air_secs = COALESCE(?, tx_air_secs),
        rx_air_secs = COALESCE(?, rx_air_secs),
        last_seen = ?
      WHERE id = ?
    `,
    args: [
      status.batteryMv,
      status.noiseFloor,
      status.uptimeSecs,
      status.errorCount,
      status.queueLen,
      status.txAirSecs,
      status.rxAirSecs,
      new Date().toISOString(),
      status.nodeId,
    ],
  });
}

/**
 * Update a node's last_seen timestamp
 */
export async function updateNodeLastSeen(nodeId: string): Promise<void> {
  const client = getDb();

  await client.execute({
    sql: 'UPDATE nodes SET last_seen = ? WHERE id = ?',
    args: [new Date().toISOString(), nodeId],
  });
}

/**
 * Get a node by name (for looking up by origin)
 */
export async function getNodeByName(name: string): Promise<{ id: string } | null> {
  const client = getDb();

  const result = await client.execute({
    sql: 'SELECT id FROM nodes WHERE name = ? LIMIT 1',
    args: [name],
  });

  if (result.rows.length === 0) return null;
  return { id: result.rows[0].id as string };
}

/**
 * Get a node by public key
 */
export async function getNodeByPublicKey(publicKey: string): Promise<{ id: string } | null> {
  const client = getDb();

  const result = await client.execute({
    sql: 'SELECT id FROM nodes WHERE public_key = ? LIMIT 1',
    args: [publicKey],
  });

  if (result.rows.length === 0) return null;
  return { id: result.rows[0].id as string };
}

/**
 * Increment the daily packet count for a node
 */
export async function incrementDailyPacketCount(
  nodeId: string,
  type: 'rx' | 'tx' = 'rx'
): Promise<void> {
  const client = getDb();
  const today = getTodayDateString();
  const rxIncrement = type === 'rx' ? 1 : 0;
  const txIncrement = type === 'tx' ? 1 : 0;

  // Try to update existing row first
  const result = await client.execute({
    sql: `
      UPDATE node_stats_daily
      SET packets_rx = packets_rx + ?, packets_tx = packets_tx + ?
      WHERE node_id = ? AND date = ?
    `,
    args: [rxIncrement, txIncrement, nodeId, today],
  });

  // If no row was updated, insert a new one
  if (result.rowsAffected === 0) {
    await client.execute({
      sql: `
        INSERT INTO node_stats_daily (node_id, date, packets_rx, packets_tx)
        VALUES (?, ?, ?, ?)
      `,
      args: [nodeId, today, rxIncrement, txIncrement],
    });
  }
}

/**
 * Close the database connection
 */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
    console.log('[DB] Connection closed');
  }
}
