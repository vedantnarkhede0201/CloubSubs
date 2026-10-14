const text = (label, options = {}) => ({ label, type: 'text', ...options });
const date = (label) => ({ label, type: 'date' });
const number = (label, options = {}) => ({ label, type: 'number', min: '0', step: '1', ...options });
const amount = (label, options = {}) => number(label, { step: '0.01', ...options });
const choice = (label, options, extra = {}) => ({ label, type: 'select', options, ...extra });

export const resources = {
  clients: {
    title: 'Clients',
    singular: 'client',
    description: 'Manage customer accounts and renewal preferences.',
    endpoint: '/clients',
    primaryKey: 'Client_ID',
    columns: [
      { key: 'Client_ID', label: 'Client ID' },
      { key: 'Company_Name', label: 'Company' },
      { key: 'Contact_Person', label: 'Contact person' },
      { key: 'Email', label: 'Email' },
      { key: 'Phone', label: 'Phone' },
      { key: 'Signup_Date', label: 'Signup date', type: 'date' },
      { key: 'Auto_Renew', label: 'Auto renew', type: 'boolean' }
    ],
    fields: {
      Client_ID: text('Client ID', { required: true, maxLength: 10 }),
      Company_Name: text('Company name', { required: true, maxLength: 100 }),
      Contact_Person: text('Contact person', { required: true, maxLength: 50 }),
      Email: text('Email', { required: true, type: 'email', maxLength: 100 }),
      Phone: text('Phone', { maxLength: 15, nullable: true }),
      Signup_Date: date('Signup date'),
      Auto_Renew: choice('Auto renew', [
        { value: '1', label: 'Enabled' },
        { value: '0', label: 'Disabled' }
      ], { nullable: true })
    }
  },
  'pricing-tiers': {
    title: 'Pricing tiers',
    singular: 'pricing tier',
    description: 'Review plan pricing, included users and storage limits.',
    endpoint: '/pricing-tiers',
    primaryKey: 'Tier_ID',
    columns: [
      { key: 'Tier_ID', label: 'Tier ID' },
      { key: 'Tier_Name', label: 'Plan' },
      { key: 'Monthly_Rate', label: 'Monthly rate', type: 'currency' },
      { key: 'Max_Users', label: 'Maximum users' },
      { key: 'Storage_GB', label: 'Storage (GB)' }
    ],
    fields: {
      Tier_ID: text('Tier ID', { required: true, maxLength: 10 }),
      Tier_Name: text('Tier name', { required: true, maxLength: 50 }),
      Monthly_Rate: amount('Monthly rate'),
      Max_Users: number('Maximum users'),
      Storage_GB: number('Storage (GB)')
    }
  },
  subscriptions: {
    title: 'Subscriptions',
    singular: 'subscription',
    description: 'Track service terms, plan assignments and active status.',
    endpoint: '/subscriptions',
    primaryKey: 'Subscription_ID',
    columns: [
      { key: 'Subscription_ID', label: 'Subscription ID' },
      { key: 'Client_ID', label: 'Client ID' },
      { key: 'Tier_ID', label: 'Tier ID' },
      { key: 'Start_Date', label: 'Start date', type: 'date' },
      { key: 'End_Date', label: 'End date', type: 'date' },
      { key: 'Status', label: 'Status', type: 'status' }
    ],
    fields: {
      Subscription_ID: text('Subscription ID', { required: true, maxLength: 10 }),
      Client_ID: text('Client ID', { required: true, maxLength: 10 }),
      Tier_ID: text('Tier ID', { required: true, maxLength: 10 }),
      Start_Date: date('Start date'),
      End_Date: date('End date'),
      Status: choice('Status', [
        { value: 'Active', label: 'Active' },
        { value: 'Expired', label: 'Expired' },
        { value: 'Cancelled', label: 'Cancelled' }
      ])
    }
  },
  invoices: {
    title: 'Invoices',
    singular: 'invoice',
    description: 'Review billing dates, invoice balances and payment status.',
    endpoint: '/invoices',
    primaryKey: 'Invoice_ID',
    columns: [
      { key: 'Invoice_ID', label: 'Invoice ID' },
      { key: 'Subscription_ID', label: 'Subscription ID' },
      { key: 'Invoice_Date', label: 'Invoice date', type: 'date' },
      { key: 'Due_Date', label: 'Due date', type: 'date' },
      { key: 'Total_Amount', label: 'Total', type: 'currency' },
      { key: 'Invoice_Status', label: 'Status', type: 'status' }
    ],
    fields: {
      Invoice_ID: text('Invoice ID', { required: true, maxLength: 10 }),
      Subscription_ID: text('Subscription ID', { required: true, maxLength: 10 }),
      Invoice_Date: date('Invoice date'),
      Due_Date: date('Due date'),
      Total_Amount: amount('Total amount'),
      Invoice_Status: text('Invoice status', { maxLength: 20, nullable: true })
    }
  },
  'invoice-items': {
    title: 'Invoice items',
    singular: 'invoice item',
    description: 'Review the line items associated with generated invoices.',
    endpoint: '/invoice-items',
    primaryKey: 'Item_ID',
    columns: [
      { key: 'Item_ID', label: 'Item ID' },
      { key: 'Invoice_ID', label: 'Invoice ID' },
      { key: 'Description', label: 'Description' },
      { key: 'Quantity', label: 'Quantity' },
      { key: 'Unit_Price', label: 'Unit price', type: 'currency' },
      { key: 'Amount', label: 'Amount', type: 'currency' }
    ],
    fields: {
      Item_ID: text('Item ID', { required: true, maxLength: 10 }),
      Invoice_ID: text('Invoice ID', { required: true, maxLength: 10 }),
      Description: text('Description', { required: true, maxLength: 200 }),
      Quantity: number('Quantity'),
      Unit_Price: amount('Unit price'),
      Amount: amount('Amount')
    }
  },
  payments: {
    title: 'Payments',
    singular: 'payment',
    description: 'Review successful and pending invoice payments.',
    endpoint: '/payments',
    primaryKey: 'Payment_ID',
    columns: [
      { key: 'Payment_ID', label: 'Payment ID' },
      { key: 'Invoice_ID', label: 'Invoice ID' },
      { key: 'Payment_Date', label: 'Payment date', type: 'date' },
      { key: 'Payment_Method', label: 'Method' },
      { key: 'Amount_Paid', label: 'Amount paid', type: 'currency' },
      { key: 'Status', label: 'Status', type: 'status' }
    ],
    fields: {
      Payment_ID: text('Payment ID', { required: true, maxLength: 10 }),
      Invoice_ID: text('Invoice ID', { required: true, maxLength: 10 }),
      Payment_Date: date('Payment date'),
      Payment_Method: text('Payment method', { maxLength: 30, nullable: true }),
      Amount_Paid: amount('Amount paid'),
      Status: text('Status', { maxLength: 20, nullable: true })
    }
  },
  'usage-records': {
    title: 'Usage records',
    singular: 'usage record',
    description: 'Monitor active users and storage consumption by subscription.',
    endpoint: '/usage-records',
    primaryKey: 'Usage_ID',
    columns: [
      { key: 'Usage_ID', label: 'Usage ID' },
      { key: 'Subscription_ID', label: 'Subscription ID' },
      { key: 'Active_Users', label: 'Active users' },
      { key: 'Storage_Used_GB', label: 'Storage used (GB)' },
      { key: 'Usage_Date', label: 'Usage date', type: 'date' }
    ],
    fields: {
      Usage_ID: text('Usage ID', { required: true, maxLength: 10 }),
      Subscription_ID: text('Subscription ID', { required: true, maxLength: 10 }),
      Active_Users: number('Active users'),
      Storage_Used_GB: amount('Storage used (GB)', { nullable: true }),
      Usage_Date: date('Usage date')
    }
  }
};

export const routeResources = {
  '/clients': 'clients',
  '/pricing-tiers': 'pricing-tiers',
  '/subscriptions': 'subscriptions',
  '/invoices': 'invoices',
  '/payments': 'payments',
  '/usage': 'usage-records'
};
