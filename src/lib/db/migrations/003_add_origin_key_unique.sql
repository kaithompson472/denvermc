-- Migration: Add unique constraint on origin_key to prevent duplicate packets
-- Created: 2026-01-02
--
-- Problem: When multiple observers see the same packet, it gets inserted multiple times,
-- inflating packet counts. The origin_key field contains the packet hash which should be unique.
--
-- Solution: Add unique index on origin_key and use ON CONFLICT DO NOTHING in insertPacket()

-- First, remove any existing duplicates (keep the first occurrence by id)
DELETE FROM packets WHERE id NOT IN (
  SELECT MIN(id) FROM packets WHERE origin_key IS NOT NULL GROUP BY origin_key
) AND origin_key IS NOT NULL;

-- Add unique constraint on origin_key
CREATE UNIQUE INDEX IF NOT EXISTS idx_packets_origin_key_unique ON packets(origin_key);
