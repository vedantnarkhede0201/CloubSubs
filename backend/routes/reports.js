const express = require('express');
const { pool } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get(
  '/payment-summary',
  asyncHandler(async (request, response) => {
    const [rows] = await pool.query(`
      SELECT
        Status,
        COUNT(*) AS Payment_Count,
        COALESCE(SUM(Amount_Paid), 0) AS Total_Amount
      FROM PAYMENT
      GROUP BY Status
      ORDER BY Status
    `);
    response.json({ success: true, message: 'Payment report retrieved successfully', data: rows });
  })
);

router.get(
  '/subscriptions-by-status',
  asyncHandler(async (request, response) => {
    const [rows] = await pool.query(`
      SELECT Status, COUNT(*) AS Subscription_Count
      FROM SUBSCRIPTION
      GROUP BY Status
      ORDER BY Status
    `);
    response.json({
      success: true,
      message: 'Subscription status report retrieved successfully',
      data: rows
    });
  })
);

router.get(
  '/invoices-by-status',
  asyncHandler(async (request, response) => {
    const [rows] = await pool.query(`
      SELECT Invoice_Status, COUNT(*) AS Invoice_Count, COALESCE(SUM(Total_Amount), 0) AS Total_Amount
      FROM INVOICE
      GROUP BY Invoice_Status
      ORDER BY Invoice_Status
    `);
    response.json({
      success: true,
      message: 'Invoice status report retrieved successfully',
      data: rows
    });
  })
);

router.get(
  '/plan-distribution',
  asyncHandler(async (request, response) => {
    const [rows] = await pool.query(`
      SELECT
        tier.Tier_ID,
        tier.Tier_Name,
        COUNT(subscription.Subscription_ID) AS Subscription_Count
      FROM PRICING_TIER AS tier
      LEFT JOIN SUBSCRIPTION AS subscription ON subscription.Tier_ID = tier.Tier_ID
      GROUP BY tier.Tier_ID, tier.Tier_Name
      ORDER BY tier.Tier_Name
    `);
    response.json({
      success: true,
      message: 'Plan distribution report retrieved successfully',
      data: rows
    });
  })
);

router.get(
  '/storage-usage',
  asyncHandler(async (request, response) => {
    const [rows] = await pool.query(`
      SELECT
        subscription.Subscription_ID,
        client.Company_Name,
        tier.Tier_Name,
        COALESCE(SUM(usage_record.Storage_Used_GB), 0) AS Total_Storage_Used_GB,
        MAX(usage_record.Usage_Date) AS Latest_Usage_Date
      FROM SUBSCRIPTION AS subscription
      JOIN CLIENT AS client ON client.Client_ID = subscription.Client_ID
      JOIN PRICING_TIER AS tier ON tier.Tier_ID = subscription.Tier_ID
      LEFT JOIN USAGE_RECORD AS usage_record ON usage_record.Subscription_ID = subscription.Subscription_ID
      GROUP BY subscription.Subscription_ID, client.Company_Name, tier.Tier_Name
      ORDER BY client.Company_Name, subscription.Subscription_ID
    `);
    response.json({
      success: true,
      message: 'Storage usage report retrieved successfully',
      data: rows
    });
  })
);

router.get(
  '/client-subscriptions',
  asyncHandler(async (request, response) => {
    const [rows] = await pool.query(`
      SELECT
        client.Client_ID,
        client.Company_Name,
        subscription.Subscription_ID,
        subscription.Status,
        subscription.Start_Date,
        subscription.End_Date,
        tier.Tier_ID,
        tier.Tier_Name,
        tier.Monthly_Rate
      FROM CLIENT AS client
      LEFT JOIN SUBSCRIPTION AS subscription ON subscription.Client_ID = client.Client_ID
      LEFT JOIN PRICING_TIER AS tier ON tier.Tier_ID = subscription.Tier_ID
      ORDER BY client.Company_Name, subscription.Subscription_ID
    `);
    response.json({
      success: true,
      message: 'Client subscription report retrieved successfully',
      data: rows
    });
  })
);

module.exports = router;
