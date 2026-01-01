/**
 * Fix duplicate observer nodes by merging packet data
 * Run with: npx tsx src/lib/db/fix-duplicates.ts
 */

import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const CORRECT_OBSERVER_ID = '4D0CC1003DBF678DF420907F9ACD77BD71D9E4C34300F72660F6BA6A2656A868';
const DUPLICATE_OBSERVER_ID = '76ef1d58';

async function fixDuplicates() {
  console.log('Starting duplicate fix migration...');

  // 1. Update packets to point to correct observer
  console.log('Updating packets to point to correct observer...');
  const packetsResult = await db.execute({
    sql: 'UPDATE packets SET node_id = ? WHERE node_id = ?',
    args: [CORRECT_OBSERVER_ID, DUPLICATE_OBSERVER_ID],
  });
  console.log(`Updated ${packetsResult.rowsAffected} packets`);

  // 2. Merge daily stats - add packet counts to correct node
  console.log('Merging daily stats...');
  const statsResult = await db.execute({
    sql: 'UPDATE node_stats_daily SET node_id = ? WHERE node_id = ?',
    args: [CORRECT_OBSERVER_ID, DUPLICATE_OBSERVER_ID],
  });
  console.log(`Updated ${statsResult.rowsAffected} daily stats records`);

  // 3. Delete the duplicate node
  console.log('Deleting duplicate node...');
  const deleteResult = await db.execute({
    sql: 'DELETE FROM nodes WHERE id = ?',
    args: [DUPLICATE_OBSERVER_ID],
  });
  console.log(`Deleted ${deleteResult.rowsAffected} duplicate node(s)`);

  // 4. Verify the fix
  console.log('\nVerifying fix...');
  const nodes = await db.execute('SELECT id, name, node_type FROM nodes');
  console.log('Current nodes:');
  for (const node of nodes.rows) {
    console.log(`  - ${node.name} (${node.id}): ${node.node_type}`);
  }

  console.log('\nDuplicate fix complete!');
}

fixDuplicates().catch(console.error);
