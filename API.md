# API Documentation

## Base URL

```
http://localhost:3001/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /auth/signup

Create a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Status Codes:**

- `201` - Created successfully
- `400` - Validation error
- `409` - Email already exists

#### POST /auth/signin

Sign in with existing credentials.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Status Codes:**

- `200` - Success
- `401` - Invalid credentials

#### GET /auth/profile

Get current user profile. Requires authentication.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Status Codes:**

- `200` - Success
- `401` - Unauthorized

### Subscriptions

#### POST /subscriptions

Create a new subscription. Requires authentication.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "type": "web",
  "status": "active",
  "expiredAt": "2024-12-31T23:59:59.000Z",
  "accountId": "some-uuid"
}
```

**Response:**

```json
{
  "id": "uuid",
  "type": "web",
  "status": "active",
  "expiredAt": "2024-12-31T23:59:59.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "accountId": "uuid"
}
```

**Status Codes:**

- `201` - Created successfully
- `400` - Validation error
- `401` - Unauthorized

#### GET /subscriptions

Get all subscriptions for the authenticated user.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "id": "uuid",
    "type": "web",
    "status": "active",
    "expiredAt": "2024-12-31T23:59:59.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "accountId": "uuid"
  }
]
```

**Status Codes:**

- `200` - Success
- `401` - Unauthorized

## Data Types

### Subscription Types

- `web` - Web subscription
- `ios` - iOS mobile subscription
- `android` - Android mobile subscription

## Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## Example Usage

### Complete Authentication Flow

```bash
# 1. Sign up
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# 2. Sign in (if already have account)
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# 3. Create subscription (use token from signup/signin)
curl -X POST http://localhost:3001/api/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "type": "web",
    "status": "active",
    "expiredAt": "2024-12-31T23:59:59.000Z"
  }'

# 4. Get subscriptions
curl -X GET http://localhost:3001/api/subscriptions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
