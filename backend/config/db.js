const path = require('node:path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const passwordPlaceholder = 'REPLACE_WITH_YOUR_LOCAL_MYSQL_PASSWORD';
const password = process.env.DB_PASSWORD;
const hasConfiguredDatabasePassword =
  Boolean(password) && password !== passwordPlaceholder;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = { pool, hasConfiguredDatabasePassword };
