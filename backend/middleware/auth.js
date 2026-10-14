const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const asyncHandler = require('./asyncHandler');
const { getJwtSecret } = require('../config/auth');

const cookieName = 'cloudsubs_session';

function readSessionCookie(request) {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) return null;

  const cookie = cookieHeader.split(';').map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`));
  if (!cookie) return null;

  try {
    return decodeURIComponent(cookie.slice(cookieName.length + 1));
  } catch {
    return null;
  }
}

function setSessionCookie(response, token, expiresInSeconds) {
  const options = [
    `${cookieName}=${encodeURIComponent(token)}`,
    'HttpOnly',
    'Path=/api',
    'SameSite=Lax',
    `Max-Age=${expiresInSeconds}`
  ];
  if (process.env.NODE_ENV === 'production') options.push('Secure');
  response.setHeader('Set-Cookie', options.join('; '));
}

function clearSessionCookie(response) {
  const options = [
    `${cookieName}=`,
    'HttpOnly',
    'Path=/api',
    'SameSite=Lax',
    'Max-Age=0'
  ];
  if (process.env.NODE_ENV === 'production') options.push('Secure');
  response.setHeader('Set-Cookie', options.join('; '));
}

const requireAuth = asyncHandler(async (request, response, next) => {
  const token = readSessionCookie(request);
  if (!token) {
    return response.status(401).json({ success: false, message: 'Authentication is required.' });
  }

  const secret = getJwtSecret();
  let claims;
  try {
    claims = jwt.verify(token, secret, {
      algorithms: ['HS256'],
      issuer: 'cloudsubs',
      audience: 'cloudsubs-web'
    });
  } catch {
    return response.status(401).json({ success: false, message: 'Session is invalid or has expired.' });
  }

  if (typeof claims.sub !== 'string' || typeof claims.jti !== 'string') {
    return response.status(401).json({ success: false, message: 'Session is invalid or has expired.' });
  }

  const [admins] = await pool.execute(
    `SELECT admin.Admin_ID, admin.Admin_Name, admin.Email
     FROM ADMIN_USER AS admin
     JOIN ADMIN_SESSION AS session ON session.Admin_ID = admin.Admin_ID
     WHERE admin.Admin_ID = ?
       AND session.Session_ID = ?
       AND session.Expires_At > CURRENT_TIMESTAMP`,
    [claims.sub, claims.jti]
  );
  if (admins.length === 0) {
    return response.status(401).json({ success: false, message: 'Administrator account is unavailable.' });
  }

  request.admin = admins[0];
  return next();
});

module.exports = {
  clearSessionCookie,
  cookieName,
  readSessionCookie,
  requireAuth,
  setSessionCookie
};
