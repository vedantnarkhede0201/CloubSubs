const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const requiredVariables = ['ADMIN_ID', 'ADMIN_NAME', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];

function validateBootstrapConfiguration() {
  const missing = requiredVariables.filter((name) => !process.env[name]?.trim());
  if (missing.length > 0) {
    throw new Error(`Set these variables in backend/.env before creating the administrator: ${missing.join(', ')}.`);
  }

  if (process.env.ADMIN_ID.length > 20) {
    throw new Error('ADMIN_ID must not exceed 20 characters.');
  }
  if (process.env.ADMIN_NAME.length > 100) {
    throw new Error('ADMIN_NAME must not exceed 100 characters.');
  }
  if (process.env.ADMIN_EMAIL.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.ADMIN_EMAIL)) {
    throw new Error('ADMIN_EMAIL must be a valid email address of at most 254 characters.');
  }
  if (process.env.ADMIN_PASSWORD.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters long.');
  }
}

async function createAdmin() {
  validateBootstrapConfiguration();

  const [existingAdmins] = await pool.query('SELECT COUNT(*) AS admin_count FROM ADMIN_USER');
  if (Number(existingAdmins[0].admin_count) > 0) {
    throw new Error('An administrator already exists. Bootstrap is one-time and will not add another account.');
  }

  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  await pool.execute(
    `INSERT INTO ADMIN_USER (Admin_ID, Admin_Name, Email, Password_Hash)
     VALUES (?, ?, ?, ?)`,
    [
      process.env.ADMIN_ID.trim(),
      process.env.ADMIN_NAME.trim(),
      process.env.ADMIN_EMAIL.trim().toLowerCase(),
      passwordHash
    ]
  );
  console.log('Administrator account created. Keep the configured credentials private.');
}

createAdmin()
  .catch((error) => {
    console.error(`Administrator bootstrap failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
