-- Denver MeshCore Database Schema
-- Nodes, Packets, and Daily Stats tables for the community platform

-- Nodes registered with the community
CREATE TABLE IF NOT EXISTS nodes (
  id TEXT PRIMARY KEY,
  public_key TEXT UNIQUE NOT NULL,
  name TEXT,
  owner_discord_id TEXT,
  latitude REAL,
  longitude REAL,
  node_type TEXT DEFAULT 'node',
  firmware_version TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_seen TEXT
);

-- Packet history from MQTT
CREATE TABLE IF NOT EXISTS packets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  node_id TEXT,
  packet_type TEXT,
  raw_data TEXT,
  snr REAL,
  rssi INTEGER,
  hop_count INTEGER,
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
  origin_key TEXT
);

-- Daily stats aggregations
CREATE TABLE IF NOT EXISTS node_stats_daily (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  node_id TEXT,
  date TEXT,
  packets_rx INTEGER DEFAULT 0,
  packets_tx INTEGER DEFAULT 0,
  uptime_pct REAL,
  avg_snr REAL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_packets_timestamp ON packets(timestamp);
CREATE INDEX IF NOT EXISTS idx_packets_node_id ON packets(node_id);
CREATE INDEX IF NOT EXISTS idx_nodes_last_seen ON nodes(last_seen);
CREATE INDEX IF NOT EXISTS idx_stats_node_date ON node_stats_daily(node_id, date);

-- Unique constraint on origin_key to prevent duplicate packets from multiple observers
CREATE UNIQUE INDEX IF NOT EXISTS idx_packets_origin_key_unique ON packets(origin_key);
