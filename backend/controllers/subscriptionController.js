const { pool } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { HttpError } = require('../middleware/errors');

const adjustTier = asyncHandler(async (request, response) => {
  const subscriptionId = request.params.subscriptionId.trim();
  if (!subscriptionId || subscriptionId.length > 10) {
    throw new HttpError(400, 'subscriptionId must be a non-empty value of at most 10 characters.');
  }

  const { tierId } = request.body || {};
  if (typeof tierId !== 'string' || !tierId.trim() || tierId.trim().length > 10) {
    throw new HttpError(400, 'tierId is required and must be a non-empty value of at most 10 characters.');
  }
  const requestedTierId = tierId.trim();

  let connection;
  let transactionStarted = false;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const [subscriptions] = await connection.execute(
      `SELECT Subscription_ID, Client_ID, Tier_ID, Status
       FROM SUBSCRIPTION
       WHERE Subscription_ID = ?
       FOR UPDATE`,
      [subscriptionId]
    );

    if (subscriptions.length === 0) {
      throw new HttpError(404, 'Subscription not found.');
    }

    const subscription = subscriptions[0];
    if (subscription.Status !== 'Active') {
      throw new HttpError(409, 'Only active subscriptions can change pricing tier.');
    }

    const [currentTiers] = await connection.execute(
      `SELECT Tier_ID, Tier_Name
       FROM PRICING_TIER
       WHERE Tier_ID = ?`,
      [subscription.Tier_ID]
    );
    if (currentTiers.length === 0) {
      throw new HttpError(500, 'The subscription current pricing tier could not be found.');
    }

    const [requestedTiers] = await connection.execute(
      `SELECT Tier_ID, Tier_Name
       FROM PRICING_TIER
       WHERE Tier_ID = ?`,
      [requestedTierId]
    );
    if (requestedTiers.length === 0) {
      throw new HttpError(404, 'Requested pricing tier not found.');
    }

    if (subscription.Tier_ID === requestedTiers[0].Tier_ID) {
      throw new HttpError(400, 'The requested pricing tier is already assigned to this subscription.');
    }

    const [updateResult] = await connection.execute(
      `UPDATE SUBSCRIPTION
       SET Tier_ID = ?
       WHERE Subscription_ID = ?
         AND Status = 'Active'`,
      [requestedTiers[0].Tier_ID, subscriptionId]
    );

    if (updateResult.affectedRows !== 1) {
      throw new HttpError(409, 'Subscription tier could not be updated because it is no longer active.');
    }

    const [updatedRows] = await connection.execute(
      `SELECT
         subscription.Subscription_ID,
         subscription.Client_ID,
         client.Company_Name,
         ? AS Previous_Tier_ID,
         ? AS Previous_Tier_Name,
         tier.Tier_ID AS Current_Tier_ID,
         tier.Tier_Name AS Current_Tier_Name,
         tier.Monthly_Rate,
         tier.Max_Users,
         tier.Storage_GB
       FROM SUBSCRIPTION AS subscription
       JOIN CLIENT AS client ON client.Client_ID = subscription.Client_ID
       JOIN PRICING_TIER AS tier ON tier.Tier_ID = subscription.Tier_ID
       WHERE subscription.Subscription_ID = ?`,
      [currentTiers[0].Tier_ID, currentTiers[0].Tier_Name, subscriptionId]
    );

    if (updatedRows.length === 0) {
      throw new HttpError(500, 'Updated subscription details could not be retrieved.');
    }

    const data = updatedRows[0];
    data.Monthly_Rate = Number(data.Monthly_Rate);

    await connection.commit();
    transactionStarted = false;

    response.json({
      success: true,
      message: 'Subscription tier updated successfully',
      data
    });
  } catch (error) {
    if (connection && transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(`Subscription tier rollback failed (${rollbackError.code || 'unknown error'}).`);
      }
    }
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

module.exports = { adjustTier };
