const { pool } = require('../config/db');
const { HttpError } = require('../middleware/errors');

function validateField(fieldName, value, definition) {
  if (value === null) {
    if (definition.nullable) {
      return null;
    }
    throw new HttpError(400, `${fieldName} cannot be null.`);
  }

  switch (definition.type) {
    case 'string': {
      if (typeof value !== 'string' || value.trim().length === 0) {
        throw new HttpError(400, `${fieldName} must be a non-empty string.`);
      }
      const normalized = value.trim();
      if (normalized.length > definition.maxLength) {
        throw new HttpError(
          400,
          `${fieldName} must be no longer than ${definition.maxLength} characters.`
        );
      }
      return normalized;
    }
    case 'date': {
      if (
        typeof value !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
        Number.isNaN(Date.parse(`${value}T00:00:00Z`)) ||
        new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value
      ) {
        throw new HttpError(400, `${fieldName} must be a valid date in YYYY-MM-DD format.`);
      }
      return value;
    }
    case 'integer': {
      const number = typeof value === 'number' ? value : Number(value);
      if (!Number.isSafeInteger(number) || number < 0) {
        throw new HttpError(400, `${fieldName} must be a non-negative integer.`);
      }
      return number;
    }
    case 'decimal': {
      const number = typeof value === 'number' ? value : Number(value);
      if (!Number.isFinite(number) || number < 0) {
        throw new HttpError(400, `${fieldName} must be a non-negative number.`);
      }
      return number;
    }
    case 'boolean': {
      if (value === true || value === 1 || value === '1') {
        return 1;
      }
      if (value === false || value === 0 || value === '0') {
        return 0;
      }
      throw new HttpError(400, `${fieldName} must be true, false, 1, or 0.`);
    }
    default:
      throw new Error(`Unsupported field type for ${fieldName}.`);
  }
}

function validateBody(resource, body, { creating }) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Request body must be a JSON object.');
  }

  const allowedFields = Object.keys(resource.fields).filter(
    (field) => creating || field !== resource.primaryKey
  );
  const unknownFields = Object.keys(body).filter((field) => !allowedFields.includes(field));
  if (unknownFields.length) {
    throw new HttpError(400, `Unknown or immutable field: ${unknownFields.join(', ')}.`);
  }

  if (creating) {
    const missingFields = Object.keys(resource.fields).filter(
      (field) => !resource.fields[field].nullable && !Object.hasOwn(body, field)
    );
    if (missingFields.length) {
      throw new HttpError(400, `Missing required fields: ${missingFields.join(', ')}.`);
    }
  } else if (Object.keys(body).length === 0) {
    throw new HttpError(400, 'Provide at least one field to update.');
  }

  return Object.fromEntries(
    Object.entries(body).map(([field, value]) => [
      field,
      validateField(field, value, resource.fields[field])
    ])
  );
}

function createResourceController(resource) {
  const { table, primaryKey } = resource;
  const selectAll = `SELECT * FROM \`${table}\``;

  return {
    list: async (request, response) => {
      const [rows] = await pool.query(`${selectAll} ORDER BY \`${primaryKey}\``);
      response.json({ success: true, message: 'Records retrieved successfully', data: rows });
    },

    get: async (request, response) => {
      const [rows] = await pool.execute(
        `${selectAll} WHERE \`${primaryKey}\` = ?`,
        [request.params.id]
      );
      if (rows.length === 0) {
        throw new HttpError(404, 'Record not found.');
      }
      response.json({ success: true, message: 'Record retrieved successfully', data: rows[0] });
    },

    create: async (request, response) => {
      const values = validateBody(resource, request.body, { creating: true });
      const fields = Object.keys(values);
      const columns = fields.map((field) => `\`${field}\``).join(', ');
      const placeholders = fields.map(() => '?').join(', ');
      const params = fields.map((field) => values[field]);
      await pool.execute(
        `INSERT INTO \`${table}\` (${columns}) VALUES (${placeholders})`,
        params
      );
      const [rows] = await pool.execute(
        `${selectAll} WHERE \`${primaryKey}\` = ?`,
        [values[primaryKey]]
      );
      response.status(201).json({
        success: true,
        message: 'Record created successfully',
        data: rows[0]
      });
    },

    update: async (request, response) => {
      const values = validateBody(resource, request.body, { creating: false });
      const fields = Object.keys(values);
      const assignments = fields.map((field) => `\`${field}\` = ?`).join(', ');
      const params = fields.map((field) => values[field]);
      params.push(request.params.id);
      const [result] = await pool.execute(
        `UPDATE \`${table}\` SET ${assignments} WHERE \`${primaryKey}\` = ?`,
        params
      );
      if (result.affectedRows === 0) {
        throw new HttpError(404, 'Record not found.');
      }
      const [rows] = await pool.execute(
        `${selectAll} WHERE \`${primaryKey}\` = ?`,
        [request.params.id]
      );
      response.json({
        success: true,
        message: 'Record updated successfully',
        data: rows[0]
      });
    },

    remove: async (request, response) => {
      const [result] = await pool.execute(
        `DELETE FROM \`${table}\` WHERE \`${primaryKey}\` = ?`,
        [request.params.id]
      );
      if (result.affectedRows === 0) {
        throw new HttpError(404, 'Record not found.');
      }
      response.json({ success: true, message: 'Record deleted successfully' });
    }
  };
}

module.exports = { createResourceController };
