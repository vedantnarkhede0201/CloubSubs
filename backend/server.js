const express = require('express');
const cors = require('cors');
const { pool, hasConfiguredDatabasePassword } = require('./config/db');
const apiRouter = require('./routes');
const authRouter = require('./routes/auth');
const { requireAuth } = require('./middleware/auth');
const { errorHandler, notFound } = require('./middleware/errors');

const app = express();
const port = Number(process.env.PORT);

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.get('/api/health', async (request, response) => {
  if (!hasConfiguredDatabasePassword) {
    return response.status(503).json({
      success: false,
      message:
        'Database password is not configured. Set DB_PASSWORD in backend/.env to your local MySQL password.'
    });
  }

  try {
    const [rows] = await pool.query('SELECT DATABASE() AS database_name');
    const databaseName = rows[0]?.database_name;

    if (
      typeof databaseName !== 'string' ||
      databaseName.toLowerCase() !== process.env.DB_NAME.toLowerCase()
    ) {
      return response.status(503).json({
        success: false,
        message: 'MySQL responded, but the configured CloudSubs database is not selected.'
      });
    }

    return response.json({
      success: true,
      message: 'CloudSubs backend and database are connected',
      database: process.env.DB_NAME
    });
  } catch (error) {
    console.error(`Database health check failed (${error.code || 'unknown error'}).`);

    return response.status(503).json({
      success: false,
      message:
        'Could not connect to the CloudSubs database. Check that MySQL is running and the backend connection settings are correct.'
    });
  }
});

app.use('/api/auth', authRouter);
app.use('/api', requireAuth, apiRouter);
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`CloudSubs backend listening on port ${port}`);
});
