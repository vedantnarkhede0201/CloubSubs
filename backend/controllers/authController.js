const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');
const { pool } = require('../config/db');
const { getJwtSecret } = require('../config/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { HttpError } = require('../middleware/errors');
const { clearSessionCookie, setSessionCookie } = require('../middleware/auth');

const sessionDurationSeconds = 8 * 60 * 60;

const login = asyncHandler(async (request, response) => {
  const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : '';
  const password = typeof request.body?.password === 'string' ? request.body.password : '';
  if (!email || !password) {
    throw new HttpError(400, 'Email and password are required.');
  }

  const [admins] = await pool.execute(
    `SELECT Admin_ID, Admin_Name, Email, Password_Hash
     FROM ADMIN_USER
     WHERE Email = ?
     LIMIT 1`,
    [email]
  );
  const admin = admins[0];
  const passwordHash = admin ? admin.Password_Hash : await bcrypt.hash(password, 12);
  const validPassword = await bcrypt.compare(password, passwordHash);

  if (!admin || !validPassword) {
    throw new HttpError(401, 'Email or password is incorrect.');
  }

  const sessionId = randomUUID();
  const token = jwt.sign(
    { sub: admin.Admin_ID, jti: sessionId },
    getJwtSecret(),
    {
      algorithm: 'HS256',
      expiresIn: sessionDurationSeconds,
      issuer: 'cloudsubs',
      audience: 'cloudsubs-web'
    }
  );
  await pool.execute(
    `INSERT INTO ADMIN_SESSION (Session_ID, Admin_ID, Expires_At)
     VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? SECOND))`,
    [sessionId, admin.Admin_ID, sessionDurationSeconds]
  );
  setSessionCookie(response, token, sessionDurationSeconds);
  response.json({
    success: true,
    message: 'Login successful',
    data: {
      admin: {
        Admin_ID: admin.Admin_ID,
        Admin_Name: admin.Admin_Name,
        Email: admin.Email
      }
    }
  });
});

const logout = asyncHandler(async (request, response) => {
  const token = require('../middleware/auth').readSessionCookie(request);
  if (token) {
    try {
      const claims = jwt.verify(token, getJwtSecret(), {
        algorithms: ['HS256'],
        issuer: 'cloudsubs',
        audience: 'cloudsubs-web'
      });
      if (typeof claims.jti === 'string') {
        await pool.execute('DELETE FROM ADMIN_SESSION WHERE Session_ID = ?', [claims.jti]);
      }
    } catch (error) {
      if (error.name !== 'JsonWebTokenError' && error.name !== 'TokenExpiredError') {
        throw error;
      }
    }
  }
  clearSessionCookie(response);
  response.json({ success: true, message: 'Logout successful' });
});

const me = asyncHandler(async (request, response) => {
  response.json({
    success: true,
    message: 'Authenticated administrator retrieved successfully',
    data: { admin: request.admin }
  });
});

module.exports = { login, logout, me };
