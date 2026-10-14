class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function notFound(request, response, next) {
  next(new HttpError(404, `Route not found: ${request.method} ${request.originalUrl}`));
}

function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    return next(error);
  }

  if (error.type === 'entity.parse.failed') {
    return response.status(400).json({
      success: false,
      message: 'Request body must contain valid JSON.'
    });
  }

  if (error.type === 'entity.too.large') {
    return response.status(413).json({
      success: false,
      message: 'Request body is too large.'
    });
  }

  let status = Number.isInteger(error.status) ? error.status : 500;
  let message = status >= 500 ? 'An unexpected server or database error occurred.' : error.message;

  switch (error.code) {
    case 'ER_DUP_ENTRY':
      status = 409;
      message = 'A record with a duplicate unique value already exists.';
      break;
    case 'ER_NO_REFERENCED_ROW':
    case 'ER_NO_REFERENCED_ROW_2':
      status = 400;
      message = 'One or more referenced records do not exist.';
      break;
    case 'ER_ROW_IS_REFERENCED':
    case 'ER_ROW_IS_REFERENCED_2':
      status = 409;
      message = 'This record is still referenced by other records and cannot be deleted.';
      break;
    case 'ER_CHECK_CONSTRAINT_VIOLATED':
    case 'ER_CONSTRAINT_FAILED':
      status = 400;
      message = 'The submitted values violate a database constraint.';
      break;
    case 'ER_BAD_NULL_ERROR':
    case 'ER_DATA_TOO_LONG':
    case 'ER_TRUNCATED_WRONG_VALUE':
      status = 400;
      message = 'One or more submitted values are invalid for this record.';
      break;
    default:
      if (error.errno === 3819 || error.errno === 4025) {
        status = 400;
        message = 'The submitted values violate a database constraint.';
      }
  }

  if (status >= 500) {
    console.error(`Request failed (${error.code || error.name || 'unknown error'}).`);
    message = 'An unexpected server or database error occurred.';
  }

  return response.status(status).json({ success: false, message });
}

module.exports = { HttpError, notFound, errorHandler };
