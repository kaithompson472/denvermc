-- Migration: Add database constraints for data integrity
-- Created: 2024-12-31

-- Add unique constraint on node_stats_daily for upsert operations
-- This enables INSERT ... ON CONFLICT for atomic upserts
CREATE UNIQUE INDEX IF NOT EXISTS idx_stats_node_date_unique ON node_stats_daily(node_id, date);

-- Note: SQLite doesn't support adding foreign keys to existing tables via ALTER TABLE.
-- Foreign keys would need to be added during initial table creation or via table recreation.
--
-- For reference, if recreating tables, the following foreign keys should be added:
--
-- packets.node_id -> nodes.id (ON DELETE SET NULL)
-- node_stats_daily.node_id -> nodes.id (ON DELETE CASCADE)
--
-- Current limitation: Data integrity for node_id references is enforced at application level.
-- Future migration could recreate tables with proper FK constraints if needed.
