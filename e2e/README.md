# E2E Test Suite

End-to-end testing suite using Playwright for the SDET Challenge application.

**Total Tests:** 60+ (API + UI)

## Prerequisites

- Node.js 18+
- npm

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

### Run All Tests

```bash
# Run all tests (API + UI)
npm test

# Run with UI (interactive mode)
npm run test:ui

# Run specific project
npm run test:api       # API tests only
npm run test:chromium  # UI tests only

# View test report
npm run test:report
```

### Run Specific Test Files

```bash
npx playwright test e2e/api/auth.spec.ts
npx playwright test e2e/ui/subscription.spec.ts
```

### Debug Tests

```bash
npx playwright test --debug
```

## Test Structure

```
e2e/
├── api/
│   ├── auth.spec.ts          # Authentication API tests
│   ├── subscriptions.spec.ts # Subscription CRUD tests
│   └── authorization.spec.ts # Security/isolation tests
├── ui/
│   ├── auth.spec.ts          # Sign in/up UI tests
│   ├── account-tabs.spec.ts  # Account tab navigation
│   └── subscription.spec.ts  # Subscription purchase flow
├── fixtures/
│   └── auth.fixture.ts       # Auth helpers and fixtures
└── utils/
    ├── api-client.ts         # Reusable API client
    └── helpers.ts           # UI test helpers
```

## Test Coverage

### API Tests

| Area | Coverage |
|------|----------|
| **Authentication** | |
| POST /auth/signup | Valid signup, duplicate email (409), validation errors (400) |
| POST /auth/signin | Valid signin, invalid credentials (401), validation errors (400) |
| GET /auth/profile | Valid token, no token (401), invalid token (401) |
| **Subscriptions** | |
| POST /subscriptions | Create, with payment method, single active rule (409), re-buy after cancel |
| GET /subscriptions | List all, filter by type, filter by status |
| GET /subscriptions/summary | Dashboard metrics |
| PATCH /subscriptions/:id | Update status/type/expiry, not found (404) |
| DELETE /subscriptions/:id | Delete, not found (404) |
| DELETE /subscriptions/:id/payment-method | Remove payment method |
| **Authorization** | |
| Protected endpoints | All endpoints require authentication |
| User isolation | Users cannot access other users' data |

### UI Tests

| Area | Coverage |
|------|----------|
| **Sign Up** | Valid signup flow, duplicate email error, validation errors, navigation |
| **Sign In** | Valid signin flow, invalid credentials, validation errors, navigation |
| **Sign Out** | Sign out flow, redirect to signin |
| **Protected Routes** | Redirect unauthenticated users |
| **Account Tabs** | Tab navigation, user info display, active state |
| **Subscription Purchase** | Modal open, 1m/3m plans, card validation, buy flow |
| **Cancel Subscription** | Cancel with confirmation, dismiss confirmation, re-buy after cancel |
| **Payment Methods** | Display after purchase, remove method |

## Assumptions

1. **Test Data Isolation**: Each test creates a unique user with a timestamp-based email to ensure isolation
2. **Database State**: Tests assume a fresh database or rely on unique identifiers to avoid conflicts
3. **Server Availability**: Tests expect backend at `localhost:3001` and frontend at `localhost:3000`
4. **Card Validation**: The UI uses hardcoded card numbers for testing:
   - Valid: `4242424242424242`
   - Invalid: `4000000000000002`

## Defects Found

### 1. Status Field Lacks Enum Validation
- **Location**: `POST /api/subscriptions`, `PATCH /api/subscriptions/:id`
- **Issue**: The `status` field accepts any string value, not just defined statuses like "active", "canceled", "expired"
- **Impact**: Inconsistent data in database, potential bugs in business logic
- **Recommendation**: Add enum validation for status field

### 2. No Validation on expiredAt Being in the Past
- **Location**: `POST /api/subscriptions`, `PATCH /api/subscriptions/:id`
- **Issue**: Can create subscriptions with expiry dates in the past
- **Impact**: Confusing UX, may cause issues with "expiring soon" calculations
- **Recommendation**: Add validation to ensure expiredAt is in the future

### 3. Payment Method Per Subscription (Not Per Account)
- **Location**: Subscription entity
- **Issue**: Payment method is stored on subscription, not account
- **Impact**: If user has multiple subscriptions (after cancel/re-buy), they may have multiple "saved" cards shown
- **Recommendation**: Consider storing payment methods at account level

### 4. No Rate Limiting on Auth Endpoints
- **Location**: `POST /api/auth/signin`, `POST /api/auth/signup`
- **Issue**: No rate limiting or brute force protection
- **Impact**: Vulnerable to credential stuffing attacks
- **Recommendation**: Add rate limiting middleware

### 5. Generic Error Messages
- **Location**: Auth endpoints
- **Issue**: "Invalid credentials" for both wrong email and wrong password
- **Note**: This is actually a security best practice (prevents email enumeration)

### 6. Case-Sensitive Status Check
- **Location**: Frontend `Home.tsx` line 41, 271
- **Issue**: Uses `toLowerCase().trim()` for status comparison, but API stores as-is
- **Impact**: Minor inconsistency, but frontend handles it
- **Note**: Works correctly due to frontend normalization

## Configuration

The test suite uses `playwright.config.ts` with:
- API base URL: `http://localhost:3001/api`
- UI base URL: `http://localhost:3000`
- HTML reporter with trace on first retry
- Parallel test execution
- Auto-starting web servers (backend on port 3001, frontend on port 3000)
- Web servers reuse existing instances when not in CI

## Troubleshooting

### Tests fail to start
- Ensure Playwright browsers are installed: `npx playwright install`
- Check that ports 3000 and 3001 are available

### Flaky UI tests
- Check for proper `await` usage
- Increase timeouts for slow environments
- Use `--workers=1` for sequential execution

### Database conflicts
- Delete `backend/database.sqlite` and restart backend
- Each test uses unique email addresses, so conflicts should be rare
