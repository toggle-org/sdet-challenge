import { APIRequestContext } from '@playwright/test';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001/api';

const AUTH_SIGNUP = `${API_BASE}/auth/signup`;
const AUTH_SIGNIN = `${API_BASE}/auth/signin`;
const AUTH_PROFILE = `${API_BASE}/auth/profile`;
const SUBSCRIPTIONS = `${API_BASE}/subscriptions`;
const SUBSCRIPTIONS_SUMMARY = `${API_BASE}/subscriptions/summary`;

export interface AuthUser {
  email: string;
  password: string;
  name: string;
}

export interface SignedInUser extends AuthUser {
  accessToken: string;
  id: string;
}

/** Create account and return token + user. */
export async function signUp(
  request: APIRequestContext,
  user: AuthUser
): Promise<SignedInUser> {
  const res = await request.post(AUTH_SIGNUP, {
    data: {
      email: user.email,
      password: user.password,
      name: user.name,
    },
  });
  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`signUp failed: ${res.status()} ${body}`);
  }
  const body = await res.json();
  return {
    ...user,
    accessToken: body.accessToken,
    id: body.user.id,
  };
}

/** Sign in and return token + user. */
export async function signIn(
  request: APIRequestContext,
  email: string,
  password: string
): Promise<SignedInUser> {
  const res = await request.post(AUTH_SIGNIN, {
    data: { email, password },
  });
  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`signIn failed: ${res.status()} ${body}`);
  }
  const body = await res.json();
  return {
    email,
    password,
    name: body.user.name,
    accessToken: body.accessToken,
    id: body.user.id,
  };
}

/** Auth header for API calls. */
export function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

/** Create a subscription (requires auth). */
export async function createSubscription(
  request: APIRequestContext,
  token: string,
  overrides: Partial<{
    type: string;
    status: string;
    expiredAt: string;
    planMonths: number;
    priceCents: number;
    paymentCardLast4: string;
  }> = {}
) {
  const expiredAt =
    overrides.expiredAt ||
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const res = await request.post(SUBSCRIPTIONS, {
    headers: authHeader(token),
    data: {
      type: 'web',
      status: 'active',
      expiredAt,
      planMonths: 1,
      priceCents: 999,
      paymentCardLast4: '4242',
      ...overrides,
    },
  });
  return res;
}

export { AUTH_SIGNUP, AUTH_SIGNIN, AUTH_PROFILE, SUBSCRIPTIONS, SUBSCRIPTIONS_SUMMARY };
