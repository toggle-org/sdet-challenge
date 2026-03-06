# E2E Testing Suite (Playwright)

End-to-end tests for the SDET Challenge app: **API tests** and **UI tests** using [Playwright](https://playwright.dev/).

## Setup

### Prerequisites

- **Node.js 18+**
- **Backend** and **frontend** running (see main [README](../README.md)):
  - Backend: `http://localhost:3001`
  - Frontend: `http://localhost:3000`

### Install

From the **project root**:

```bash
npm install
npx playwright install
```

`npm install` adds `@playwright/test`. `npx playwright install` downloads browser binaries (Chromium for UI tests).

## Run instructions

Run all E2E tests (API + UI):

```bash
npm run e2e
```

Run only API tests:

```bash
npm run e2e:api
```

Run only UI tests:

```bash
npm run e2e:ui
```

Run UI tests in headed mode (see browser):

```bash
npm run e2e:headed
```

View last HTML report (opens in browser with charts and details):

```bash
npm run e2e:report
```

### Save report to a separate folder (e.g. with date)

To keep a copy of the report without overwriting the last run:

```bash
# Unix/macOS
PLAYWRIGHT_REPORT_DIR="e2e/reports/$(date +%Y-%m-%d_%H-%M)" npm run e2e
npm run e2e:report
# Then copy e2e/playwright-report to e2e/reports/... if you used a custom dir, or open that folder's index.html
```

Or run and then copy the report folder:

```bash
npm run e2e
cp -r e2e/playwright-report e2e/reports/backup-$(date +%Y-%m-%d_%H-%M)
```

### What the HTML report shows

- **Summary**: passed/failed/skipped counts and total time.
- **Charts**: duration by test and status (passed/failed) distribution.
- **Suites**: expandable list of tests; click a test for steps, traces, screenshots (on failure).
- **Traces**: for failed tests you can open a trace (timeline, DOM, console).

Optional env vars (defaults shown):

- `API_BASE_URL=http://localhost:3001/api` — backend API base URL
- `UI_BASE_URL=http://localhost:3000` — frontend base URL

Example:

```bash
API_BASE_URL=http://localhost:3001/api UI_BASE_URL=http://localhost:3000 npm run e2e
```

## Assumptions

- Backend and frontend are already started before running E2E tests.
- No test database; tests use the same backend as dev (unique emails per test to avoid clashes).
- API base URL is `http://localhost:3001/api`, frontend is `http://localhost:3000`.
- Valid test card in UI: `4242424242424242`; invalid: `4000000000000002` (as in the app).
- Default browser for UI tests: Chromium.

## Coverage

| Area | What’s covered |
|------|----------------|
| **Auth API** | Signup (valid, duplicate email, validation), signin (valid, wrong password, unknown user), profile (with token, without token, invalid token) |
| **Subscriptions API** | Full lifecycle (create → single active rule → cancel → re-buy), auth required for create/list/summary |
| **Payment method API** | Payment stored on subscription after create, DELETE payment-method clears it, auth required |
| **Authorization API** | Protected endpoints return 401 without token; user A cannot see/update/delete user B’s subscription (404) |
| **Auth UI** | Valid signup → home, valid signin → home, invalid login → error toast, /home redirects to signin when not logged in, sign up/sign in links |
| **Account tabs UI** | Account info (name, email, user ID), Subscriptions tab (empty/list), Payment methods tab (empty/saved card), tab switching |
| **Subscription flow UI** | Buy (modal, plan, valid card), buy disabled with active sub, cancel then re-buy, payment method visible and removable, invalid card shows error |

## Defects / observations

1. **API docs vs implementation**  
   `API.md` does not document optional subscription fields (`planMonths`, `priceCents`, `paymentCardLast4`) or the `DELETE /subscriptions/:id/payment-method` endpoint. Implementation supports them; docs could be updated.

2. **Single active subscription**  
   Enforced correctly in backend (409 when creating a second active subscription). UI disables “Buy subscription” when there is an active subscription and shows a hint; behavior is consistent.

3. **Validation**  
   Signup/signin validation (email format, required fields) is exercised in API tests; corresponding UI validation (e.g. client-side messages) could be added if desired.

4. **Stability**  
   Tests use unique emails per run to avoid collisions. No shared test user; each test that needs an account creates one. This keeps tests isolated and suitable for parallel execution.

No blocking defects were found for the flows under test; auth, subscription lifecycle, payment method, and user isolation behave as expected.
