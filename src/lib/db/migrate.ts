import { createClient } from '@libsql/client';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Execute SQL statements from a file
 */
async function executeSqlFile(
  client: ReturnType<typeof createClient>,
  filePath: string,
  fileName: string
): Promise<void> {
  console.log(`\nProcessing: ${fileName}`);

  const sql = readFileSync(filePath, 'utf-8');

  // Remove comment-only lines but preserve the structure
  const cleanedSql = sql
    .split('\n')
    .map((line) => {
      // Remove full-line comments
      if (line.trim().startsWith('--')) return '';
      return line;
    })
    .join('\n');

  // Split into individual statements by semicolon
  const statements = cleanedSql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`  Found ${statements.length} statements to execute`);

  // Execute each statement
  for (const statement of statements) {
    const preview = statement.substring(0, 60).replace(/\n/g, ' ');
    console.log(`  Executing: ${preview}...`);
    await client.execute(statement);
  }

  console.log(`  ✓ ${fileName} completed`);
}

async function migrate() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error('Error: TURSO_DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  if (!authToken) {
    console.error('Error: TURSO_AUTH_TOKEN environment variable is not set');
    process.exit(1);
  }

  console.log('Connecting to Turso database...');

  const client = createClient({
    url,
    authToken,
  });

  try {
    // Step 1: Run the main schema file
    const schemaPath = join(__dirname, 'schema.sql');
    await executeSqlFile(client, schemaPath, 'schema.sql');

    // Step 2: Run any migration files in order
    const migrationsDir = join(__dirname, 'migrations');

    if (existsSync(migrationsDir)) {
      const migrationFiles = readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort(); // Sort to ensure order (001_, 002_, etc.)

      if (migrationFiles.length > 0) {
        console.log(`\nFound ${migrationFiles.length} migration file(s)`);

        for (const migrationFile of migrationFiles) {
          const migrationPath = join(migrationsDir, migrationFile);
          await executeSqlFile(client, migrationPath, migrationFile);
        }
      }
    }

    console.log('\n✓ Migration completed successfully!');

    // Verify tables were created
    const tables = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    console.log(
      '\nTables in database:',
      tables.rows.map((r) => r.name)
    );

    // Verify indexes were created
    const indexes = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    );
    console.log(
      'Indexes in database:',
      indexes.rows.map((r) => r.name)
    );
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.close();
  }
}

migrate();
