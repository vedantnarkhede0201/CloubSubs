const { HttpError } = require('../middleware/errors');

const placeholderSecret = 'REPLACE_WITH_A_RANDOM_SECRET_OF_AT_LEAST_32_CHARACTERS';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === placeholderSecret || secret.length < 32) {
    throw new HttpError(503, 'Authentication is not configured. Set a private JWT_SECRET of at least 32 characters.');
  }
  return secret;
}

module.exports = { getJwtSecret };
