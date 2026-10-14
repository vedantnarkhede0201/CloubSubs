const resources = {
  clients: {
    table: 'CLIENT',
    primaryKey: 'Client_ID',
    fields: {
      Client_ID: { type: 'string', maxLength: 10 },
      Company_Name: { type: 'string', maxLength: 100 },
      Contact_Person: { type: 'string', maxLength: 50 },
      Email: { type: 'string', maxLength: 100 },
      Phone: { type: 'string', maxLength: 15, nullable: true },
      Signup_Date: { type: 'date' },
      Auto_Renew: { type: 'boolean', nullable: true }
    }
  },
  'pricing-tiers': {
    table: 'PRICING_TIER',
    primaryKey: 'Tier_ID',
    fields: {
      Tier_ID: { type: 'string', maxLength: 10 },
      Tier_Name: { type: 'string', maxLength: 50 },
      Monthly_Rate: { type: 'decimal' },
      Max_Users: { type: 'integer' },
      Storage_GB: { type: 'integer' }
    }
  },
  subscriptions: {
    table: 'SUBSCRIPTION',
    primaryKey: 'Subscription_ID',
    fields: {
      Subscription_ID: { type: 'string', maxLength: 10 },
      Client_ID: { type: 'string', maxLength: 10 },
      Tier_ID: { type: 'string', maxLength: 10 },
      Start_Date: { type: 'date' },
      End_Date: { type: 'date' },
      Status: { type: 'string', maxLength: 20 }
    }
  },
  invoices: {
    table: 'INVOICE',
    primaryKey: 'Invoice_ID',
    fields: {
      Invoice_ID: { type: 'string', maxLength: 10 },
      Subscription_ID: { type: 'string', maxLength: 10 },
      Invoice_Date: { type: 'date' },
      Due_Date: { type: 'date' },
      Total_Amount: { type: 'decimal' },
      Invoice_Status: { type: 'string', maxLength: 20, nullable: true }
    }
  },
  'invoice-items': {
    table: 'INVOICE_ITEM',
    primaryKey: 'Item_ID',
    fields: {
      Item_ID: { type: 'string', maxLength: 10 },
      Invoice_ID: { type: 'string', maxLength: 10 },
      Description: { type: 'string', maxLength: 200 },
      Quantity: { type: 'integer' },
      Unit_Price: { type: 'decimal' },
      Amount: { type: 'decimal' }
    }
  },
  payments: {
    table: 'PAYMENT',
    primaryKey: 'Payment_ID',
    fields: {
      Payment_ID: { type: 'string', maxLength: 10 },
      Invoice_ID: { type: 'string', maxLength: 10 },
      Payment_Date: { type: 'date' },
      Payment_Method: { type: 'string', maxLength: 30, nullable: true },
      Amount_Paid: { type: 'decimal' },
      Status: { type: 'string', maxLength: 20, nullable: true }
    }
  },
  'usage-records': {
    table: 'USAGE_RECORD',
    primaryKey: 'Usage_ID',
    fields: {
      Usage_ID: { type: 'string', maxLength: 10 },
      Subscription_ID: { type: 'string', maxLength: 10 },
      Active_Users: { type: 'integer' },
      Storage_Used_GB: { type: 'decimal', nullable: true },
      Usage_Date: { type: 'date' }
    }
  }
};

module.exports = resources;
