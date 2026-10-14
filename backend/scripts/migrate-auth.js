const fs = require('node:fs/promises');
const path = require('node:path');
const { pool } = require('../config/db');

async function migrateAuth() {
  const migrationPath = path.resolve(__dirname, '..', 'migrations', '001_create_admin_user.sql');
  const migration = await fs.readFile(migrationPath, 'utf8');
  const statements = migration
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await pool.query(statement);
  }
  console.log('Authentication schema is ready.');
}

migrateAuth()
  .catch((error) => {
    console.error(`Authentication migration failed (${error.code || error.name || 'unknown error'}).`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
