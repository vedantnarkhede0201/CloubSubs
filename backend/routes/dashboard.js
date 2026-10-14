const express = require('express');
const { pool } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get(
  '/summary',
  asyncHandler(async (request, response) => {
    const [rows] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM CLIENT) AS Total_Clients,
        (SELECT COUNT(*) FROM SUBSCRIPTION) AS Total_Subscriptions,
        (SELECT COUNT(*) FROM SUBSCRIPTION WHERE Status = 'Active') AS Active_Subscriptions,
        (SELECT COUNT(*) FROM INVOICE) AS Total_Invoices,
        (SELECT COUNT(*) FROM INVOICE WHERE Invoice_Status = 'Paid') AS Paid_Invoices,
        (SELECT COALESCE(SUM(Amount_Paid), 0) FROM PAYMENT WHERE Status = 'Success') AS Total_Revenue
    `);

    response.json({
      success: true,
      message: 'Dashboard summary retrieved successfully',
      data: rows[0]
    });
  })
);

module.exports = router;
