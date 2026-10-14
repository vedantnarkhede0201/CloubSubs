const express = require('express');
const resourcesRouter = require('./resources');
const dashboardRouter = require('./dashboard');
const reportsRouter = require('./reports');

const router = express.Router();

router.use('/', resourcesRouter);
router.use('/dashboard', dashboardRouter);
router.use('/reports', reportsRouter);

module.exports = router;
