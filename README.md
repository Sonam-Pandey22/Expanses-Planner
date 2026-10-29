# Expanse Planner

A responsive personal finance app built with **Next.js + TypeScript**, **Express**, and **MongoDB / Mongoose**. Includes a mint-and-charcoal dashboard, cumulative cash-flow chart, spending breakdown, transaction CRUD and filters, category budgets, savings goals, six-month analytics, CSV export, account registration/sign-in, and light/dark themes.

## Run locally

Requires Node.js 22.12+ and a running local MongoDB server or MongoDB Atlas URI.

```powershell
cd D:\Project\ExpansePlanner
npm.cmd install
Copy-Item backend/.env.example backend/.env
```

Set `MONGODB_URI` and a random `JWT_SECRET` of at least 32 characters in `backend/.env`. With no secret in development, the server generates an in-memory secret; restarting the API signs users out. Production requires an explicit secret.

```powershell
npm.cmd run dev
```

Open **http://localhost:3000**. The API runs on **http://127.0.0.1:4000**. Next.js forwards `/api/*` to Express, keeping browser requests on one origin. Set `API_URL` in `frontend/.env.local` if the backend runs elsewhere. It is a server-only variable.

### Pages

- `/` — public home page with a product preview, features, getting started steps, and FAQs.
- `/login` — dedicated login page.
- `/signup` — dedicated account creation page, including password confirmation.
- `/dashboard` — the finance workspace; guests can explore the local demo, and signed-in users see their MongoDB records.

Successful login and registration redirect to `/dashboard`. Signed-in visitors to the account pages return to their dashboard automatically. The dashboard logo links back to the home page. All pages use a larger, responsive type scale, with 16px inputs on phones.

Use the sun/moon button on the home page, login/signup pages, or dashboard to change themes. The preference is shared across all pages, saved in this browser, and applied before the first paint on reload. Theme changes also synchronize between open tabs.

On Windows use `npm.cmd` if PowerShell blocks `npm.ps1`. On other platforms use `npm`.

### Try the interface without a database

```powershell
npm.cmd run dev -w frontend
```

The app opens with a clearly labeled demo, seeded with six months of sample records relative to the current date. Demo changes persist in this browser’s `localStorage`. Account creation opens a **separate, empty MongoDB workspace**; demo records are never silently copied to your account. Sign out to return to the demo. Registration and sign-in require the API and MongoDB.

## App behavior

- The selected month controls dashboard totals, cash flow, transaction filters, budgets, and exports. The analytics history ends at that selected month.
- “Available this month” is the selected month’s income minus expenses, not a bank account balance or a running balance across months.
- The cash-flow chart shows cumulative income and expenses through each day.
- Budgets are unique for each account, category, and month. Overspending is highlighted.
- Savings goals track total money set aside independently; changing a goal does not create an expense or alter cash flow.
- CSV exports respect month, search, category, and type filters and escape spreadsheet formula prefixes.
- Currency is INR. Dates are stored as calendar dates (`YYYY-MM-DD`).

## Checks

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd test
```

With the app running, run `npm.cmd run test:e2e` for the browser workflow checks (Google Chrome required). For a different port, set `TEST_BASE_URL`, for example `http://localhost:3100`. Set `PLAYWRIGHT_CHANNEL=msedge` to use Microsoft Edge instead. Browser checks include demo CRUD, reload persistence, CSV export, budgets, goals, theme switching, and phone layout. Set `E2E_MONGODB_URI` to the database URI used by the running API to enable the additional account browser test; it removes only its uniquely named account and records after the test.

To additionally run real database integration tests:

```powershell
$env:TEST_MONGODB_URI = 'mongodb://127.0.0.1:27017/expanse_planner_test'
npm.cmd test
```

Integration tests create unique test accounts and delete only their own records. They cover session cookies, account isolation, transaction/budget/goal CRUD, persistence, duplicate budgets, and sign-in/sign-out.

## Structure

```text
frontend/src/app/             Next.js App Router, global responsive styles
frontend/src/components/      Interactive dashboard and forms
frontend/src/lib/             Types, sample data, API client
backend/src/app.js            Express routes, authentication, validation
backend/src/models.js         Mongoose schemas and indexes
backend/src/validation.js     Zod request schemas
backend/src/server.js         MongoDB connection and API lifecycle
backend/test/                 Validation and API integration tests
```

## Deployment

Deploy the frontend to a Node-compatible Next.js host (for example Vercel), the API to a Node server, and use MongoDB Atlas or a managed MongoDB instance. Set `API_URL` on the frontend host. On the API set `MONGODB_URI`, `NODE_ENV=production`, and a strong `JWT_SECRET`. The API binds to loopback by default for local use; set `HOST=0.0.0.0` when your hosting environment needs it. Use HTTPS so production session cookies can be sent.

The app uses bcrypt password hashes, signed expiring HTTP-only SameSite session cookies, per-user database queries, request validation, Helmet, JSON-only mutations, cross-site request checks, and rate limits. This is a personal finance starter; password reset, email verification, bank synchronization, shared accounts, and multi-currency conversion are outside this implementation.

Inspired by the feature scope of [ExpansePlanner](https://github.com/ankitraj061/ExpansePlanner), rebuilt with the requested stack.
