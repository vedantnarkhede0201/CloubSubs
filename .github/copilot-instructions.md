CloudSubs - GitHub Copilot Project Instructions
1. Project Overview
This repository contains a college full-stack DBMS project named:

CloudSubs - SaaS Billing and Subscription Management System

CloudSubs is a full-stack web application for managing:

SaaS clients
Pricing tiers
Subscriptions
Invoices
Invoice items
Payments
Usage records
Subscription tier changes
Billing and subscription reports
The database already exists in MySQL on the local machine.

DO NOT create a replacement database unless explicitly instructed.

The application must connect to the existing MySQL database named:

CloudSubs

2. Required Technology Stack
Frontend
Use:

React
Vite
JavaScript
React Router
Axios
CSS
Do NOT use TypeScript.

Backend
Use:

Node.js
Express.js
mysql2/promise
dotenv
cors
Database
Use:

MySQL
Existing database: CloudSubs
3. Repository Structure
Maintain the following high-level structure:

CloudSubs/ | |-- frontend/ |-- backend/ |-- database/ |-- requirements/ |-- .github/ | -- copilot-instructions.md | |-- .env.example |-- .gitignore -- README.md

Do not unnecessarily reorganise the repository.

4. Existing Database
The existing MySQL database contains these tables:

CLIENT
PRICING_TIER
SUBSCRIPTION
INVOICE
INVOICE_ITEM
PAYMENT
USAGE_RECORD
Preserve these table names exactly.

Preserve the existing database column names.

Do not rename database tables or columns unless explicitly instructed.

Do not replace MySQL data with hard-coded JavaScript arrays.

All application data must ultimately come from the MySQL database through the backend APIs.

5. Existing Database Design
CLIENT
Fields:

Client_ID
Company_Name
Contact_Person
Email
Phone
Signup_Date
Auto_Renew
Primary key:

Client_ID

PRICING_TIER
Fields:

Tier_ID
Tier_Name
Monthly_Rate
Max_Users
Storage_GB
Primary key:

Tier_ID

SUBSCRIPTION
Fields:

Subscription_ID
Client_ID
Tier_ID
Start_Date
End_Date
Status
Primary key:

Subscription_ID

Foreign keys:

Client_ID references CLIENT(Client_ID)
Tier_ID references PRICING_TIER(Tier_ID)
INVOICE
Fields:

Invoice_ID
Subscription_ID
Invoice_Date
Due_Date
Total_Amount
Invoice_Status
Primary key:

Invoice_ID

Foreign key:

Subscription_ID references SUBSCRIPTION(Subscription_ID)

INVOICE_ITEM
Fields:

Item_ID
Invoice_ID
Description
Quantity
Unit_Price
Amount
Primary key:

Item_ID

Foreign key:

Invoice_ID references INVOICE(Invoice_ID)

PAYMENT
Fields:

Payment_ID
Invoice_ID
Payment_Date
Payment_Method
Amount_Paid
Status
Primary key:

Payment_ID

Foreign key:

Invoice_ID references INVOICE(Invoice_ID)

USAGE_RECORD
Fields:

Usage_ID
Subscription_ID
Active_Users
Storage_Used_GB
Usage_Date
Primary key:

Usage_ID

Foreign key:

Subscription_ID references SUBSCRIPTION(Subscription_ID)

6. Architecture Rules
The application architecture must be:

React Frontend | | Axios / HTTP v Node.js + Express Backend | | mysql2/promise v Existing CloudSubs MySQL Database

React must NEVER connect directly to MySQL.

All database operations must pass through the Express backend.

7. Backend Structure
Create and maintain a clean backend architecture.

Preferred structure:

backend/ | |-- config/ | `-- db.js | |-- controllers/ | |-- routes/ | |-- middleware/ | |-- server.js |-- package.json |-- .env

Use a reusable MySQL connection pool.

Use:

mysql2/promise

Use async/await.

Use parameterised SQL queries for user-supplied values.

Never concatenate untrusted request data directly into SQL queries.

8. Environment Variables
Database credentials must be stored in:

backend/.env

Expected variables:

PORT=5000 DB_HOST=localhost DB_PORT=3306 DB_USER=root DB_PASSWORD= DB_NAME=CloudSubs CLIENT_URL=http://localhost:5173

Never hard-code database passwords inside source files.

Never commit the real .env file.

Use .env.example for documentation.

9. Backend Health Check
Create:

GET /api/health

The endpoint must test actual database connectivity.

A successful response should have a structure similar to:

{ "success": true, "message": "CloudSubs backend and database are connected" }

Do not report database connectivity as successful unless an actual MySQL query succeeds.

10. REST API Requirements
Create REST APIs for:

Clients
Pricing tiers
Subscriptions
Invoices
Invoice items where required
Payments
Usage records
Dashboard
Reports
Use /api as the base prefix.

Examples:

GET /api/clients GET /api/clients/:id POST /api/clients PUT /api/clients/:id DELETE /api/clients/:id

Repeat an appropriate CRUD structure for the remaining entities.

11. JSON Response Format
Prefer consistent responses.

Success example:

{ "success": true, "message": "Operation completed successfully", "data": {} }

Failure example:

{ "success": false, "message": "Useful error message" }

Use appropriate HTTP status codes.

Examples:

200 successful read/update
201 successful creation
400 invalid input
404 record not found
409 conflict or dependency problem
500 unexpected server/database error
Do not expose database passwords.

Do not expose unnecessary internal stack traces to the frontend.

12. CRUD Requirements
Where appropriate, application pages must support:

Create
Read
Update
Delete
Validate input in both frontend and backend.

Check foreign-key dependencies before deleting related records.

If a database constraint prevents deletion, return a meaningful message instead of crashing.

13. Faculty Connectivity Requirement
This feature is mandatory.

Scenario Title
Adjust Subscription Tier

Scenario Description
A user downgrades their service plan from Premium to Basic.

Identified Parameters
Subscriber Reference Key
Service Plan Identifier
For CloudSubs:

Subscriber Reference Key should be represented by Subscription_ID.

Service Plan Identifier should be represented by Tier_ID.

Connectivity Objective
Changing an active subscription's pricing tier must update the billing and service-access information associated with the active subscription.

14. Adjust Subscription Tier API
Implement:

PATCH /api/subscriptions/:subscriptionId/tier

Request body:

{ "tierId": "TR001" }

The backend must:

Validate Subscription_ID.
Verify that the subscription exists.
Verify that the subscription status is Active.
Validate Tier_ID.
Verify that the requested pricing tier exists.
Retrieve the current pricing tier.
Update SUBSCRIPTION.Tier_ID.
Retrieve the updated pricing tier information.
Return the updated subscription information.
Preserve previously generated invoice records.
Return information including:

Subscription_ID
Client_ID
Previous pricing tier
Current pricing tier
Monthly_Rate
Max_Users
Storage_GB
Use safe parameterised queries.

Use a transaction where appropriate so the operation can be rolled back if the update fails.

Do not retroactively modify existing paid invoices when a subscription tier changes.

15. Frontend Requirements
Create a professional multi-page SaaS administration interface.

Required pages:

Landing Page
Dashboard
Clients
Pricing Tiers
Subscriptions
Invoices
Payments
Usage Records
Reports
Not Found / 404 Page
Every page must have a working URL.

Do not implement the application as one page that merely hides and shows sections.

Use React Router.

16. Required Routes
Use routes similar to:

/ /dashboard /clients /pricing-tiers /subscriptions /invoices /payments /usage /reports

Invalid routes should display the Not Found page.

Browser back/forward navigation should work correctly.

17. Application Layout
Create reusable components such as:

Sidebar
Header
DashboardCard
DataTable
Modal
Form components
ConfirmDialog
Loading indicator
Empty state
Notification or alert component
Dashboard pages should share the same application layout.

18. Sidebar
The sidebar must contain working navigation for:

Dashboard
Clients
Pricing Tiers
Subscriptions
Invoices
Payments
Usage Records
Reports
Highlight the active route.

Every navigation item must actually navigate using React Router.

19. Dashboard
The dashboard must retrieve actual data from the backend.

Display useful metrics such as:

Total Clients
Total Subscriptions
Active Subscriptions
Total Invoices
Paid Invoices
Total Revenue
Do not hard-code metric values.

The backend should calculate these values from MySQL.

20. Client Management Page
Implement:

Display all clients
Add client
Edit client
Delete client
Search/filter clients
Auto renewal indicator
After create, update, or delete operations, refresh the visible data.

21. Pricing Tier Page
Display plans with:

Tier name
Monthly rate
Maximum users
Storage limit
Support appropriate CRUD operations.

Use the real PRICING_TIER table.

22. Subscription Page
Display subscription information including:

Subscription ID
Client
Pricing tier
Start date
End date
Status
Support:

Add subscription
Edit subscription
Delete subscription where valid
Change subscription tier
The Change Tier operation is one of the most important features of this project.

23. Change Tier User Interface
Create a clear "Change Tier" or "Adjust Tier" button on the subscription page.

When clicked:

Open a modal or dedicated form.
Show the active subscription.
Show the current pricing tier.
Retrieve available pricing tiers from the backend.
Allow the user to select another tier.
Show the selected tier's:
Monthly rate
Maximum users
Storage limit
Ask for confirmation.
Call:
PATCH /api/subscriptions/:subscriptionId/tier

Display a success or error message.
Refresh subscription data immediately.
This workflow must demonstrate frontend-backend-database connectivity.

24. Invoice Page
Display:

Invoice ID
Subscription
Invoice date
Due date
Total amount
Invoice status
Support appropriate:

Create
Read
Update
Delete/View operations
Respect database relationships.

25. Payment Page
Display:

Payment ID
Invoice
Payment date
Payment method
Amount paid
Status
Support appropriate CRUD operations.

26. Usage Records Page
Display:

Usage ID
Subscription
Active users
Storage used
Usage date
Support appropriate CRUD operations.

Make service usage easy to understand visually.

27. Reports Page
Create useful database-driven reporting.

Possible metrics:

Total successful payment amount
Number of active subscriptions
Subscription distribution by status
Invoices by status
Plan distribution
Storage usage
Client subscription information
All report data must come from backend/database queries.

Do not use fake chart values.

If a chart library is unnecessary, use clean cards, tables, and CSS visualisations instead of adding unnecessary dependencies.

28. Frontend API Layer
Create a reusable Axios configuration.

Prefer something such as:

frontend/src/services/api.js

Configure a backend base URL.

Avoid repeating full backend URLs throughout components.

29. User Interface Quality
The UI should look like a modern SaaS administration dashboard.

Requirements:

Responsive layout
Consistent colour palette
Clear typography
Professional sidebar
Cards
Tables
Buttons
Forms
Clear spacing
Status badges
Hover states
Accessible labels
Error states
Loading states
Empty states
Delete confirmation
Success feedback
Avoid unnecessary animations.

Prioritise reliability and clarity.

30. Data Rules
Do NOT use fake arrays as the final source of application data.

Temporary mock data may only be used during isolated UI development and must be removed before completion.

The final application must retrieve data from:

MySQL -> Express -> Axios -> React

31. Error Handling
Handle:

MySQL unavailable
Backend unavailable
Invalid form input
Duplicate email
Invalid foreign key
Missing record
Invalid subscription
Invalid pricing tier
Inactive subscription
Failed deletion
Network errors
The frontend should display understandable error messages.

The application must not fail with a blank page for ordinary API errors.

32. Development Behaviour
Work incrementally.

Do not generate the entire project blindly without testing intermediate stages.

Recommended order:

Inspect existing project files.
Inspect database schema files if available.
Initialise backend.
Install backend dependencies.
Configure MySQL connection.
Implement /api/health.
Verify MySQL connectivity.
Implement backend APIs.
Test APIs.
Initialise React/Vite frontend.
Install frontend dependencies.
Configure React Router.
Build reusable layout.
Implement pages.
Configure Axios.
Connect pages to backend.
Implement CRUD.
Implement Adjust Subscription Tier.
Implement dashboard.
Implement reports.
Test navigation.
Test frontend-backend connectivity.
Test database modifications.
Run frontend build.
Fix errors.
33. Important Safety Rule for Existing Database
The CloudSubs database already contains project data.

Do NOT:

DROP DATABASE CloudSubs
DROP existing tables
TRUNCATE tables
delete all data
reset the database
automatically execute destructive SQL migration scripts
unless the user explicitly requests it.

Preserve existing MySQL data.

34. Testing Requirements
Before considering implementation complete:

Backend must start without errors.
Frontend must start without errors.
MySQL connectivity must succeed.
/api/health must succeed.
Client data must load from MySQL.
Pricing tier data must load from MySQL.
Subscription data must load from MySQL.
Navigation buttons must work.
CRUD operations must function where implemented.
Change Tier must modify the real database.
Updated data must appear in the frontend.
Browser refresh must preserve database-backed changes.
Frontend production build must complete successfully.
Fix discovered compile/runtime errors before finishing.

35. Documentation Requirement
The college project report requires these implementation sections:

FRONT END APPLICATION DESIGN

BACK END DATABASE TABLES

Table Name
Attributes
Datatype
Constraints
Presented in tabular form
FRONT END AND BACK-END CONNECTIVITY PROCEDURE

FULL IMPLEMENTATION CODE

SCREENSHOTS OF THE APPLICATION WITH DATA

CONCLUSION AND FUTURE SCOPE

Structure the source code cleanly so important files can later be included in these report sections.

Do not generate fake screenshots.

Actual screenshots will be taken after the application is running with real MySQL data.

36. Code Quality
Use:

Meaningful variable names
Reusable functions
Reusable components
Async/await
Clear error handling
Consistent formatting
Helpful comments only where necessary
Avoid:

Giant components
Repeated code
Hard-coded database data
Hard-coded credentials
Unused dependencies
Unnecessary frameworks
Unnecessary abstraction
This is an academic full-stack DBMS project.

The implementation should therefore remain understandable enough to explain during a viva.

37. Final Objective
The completed CloudSubs system must demonstrate:

Relational database design.
MySQL database management.
Backend development using Node.js and Express.
RESTful API development.
Frontend development using React.
Multi-page routing.
CRUD operations.
Frontend-backend connectivity.
Backend-database connectivity.
Dynamic retrieval of database records.
Dynamic modification of database records.
Subscription billing management.
SaaS usage management.
The mandatory Adjust Subscription Tier connectivity scenario.
The final application must be demonstrably full-stack and database-driven.