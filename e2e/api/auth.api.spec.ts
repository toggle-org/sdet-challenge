import { test, expect } from '@playwright/test';
import { signUp, signIn, AUTH_SIGNUP, AUTH_SIGNIN, AUTH_PROFILE, authHeader } from '../api-helpers';

test.describe('Authentication API', () => {
  test('POST /auth/signup – valid registration returns 201 and token', async ({ request }) => {
    const email = `e2e-signup-${Date.now()}@example.com`;
    const res = await request.post(AUTH_SIGNUP, {
      data: { email, password: 'password123', name: 'E2E User' },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty('accessToken');
    expect(body.accessToken).toBeTruthy();
    expect(body.user).toMatchObject({ email, name: 'E2E User' });
    expect(body.user).toHaveProperty('id');
  });

  test('POST /auth/signup – duplicate email returns 409', async ({ request }) => {
    const email = `e2e-dup-${Date.now()}@example.com`;
    const first = await request.post(AUTH_SIGNUP, {
      data: { email, password: 'password123', name: 'First' },
    });
    expect(first.status()).toBe(201);
    const res = await request.post(AUTH_SIGNUP, {
      data: { email, password: 'otherpassword', name: 'Second' },
    });
    expect(res.status()).toBe(409);
  });

  test('POST /auth/signup – validation: missing email returns 400', async ({ request }) => {
    const res = await request.post(AUTH_SIGNUP, {
      data: { password: 'password123', name: 'User' },
    });
    expect(res.status()).toBe(400);
  });

  test('POST /auth/signin – valid credentials return 200/201 and token', async ({ request }) => {
    const email = `e2e-signin-${Date.now()}@example.com`;
    await signUp(request, { email, password: 'password123', name: 'SignIn User' });
    const res = await request.post(AUTH_SIGNIN, {
      data: { email, password: 'password123' },
    });
    expect([200, 201]).toContain(res.status());
    const body = await res.json();
    expect(body).toHaveProperty('accessToken');
    expect(body.user).toMatchObject({ email });
  });

  test('POST /auth/signin – invalid password returns 401', async ({ request }) => {
    const email = `e2e-badpw-${Date.now()}@example.com`;
    await signUp(request, { email, password: 'correct', name: 'User' });
    const res = await request.post(AUTH_SIGNIN, {
      data: { email, password: 'wrong' },
    });
    expect(res.status()).toBe(401);
  });

  test('POST /auth/signin – unknown email returns 401', async ({ request }) => {
    const res = await request.post(AUTH_SIGNIN, {
      data: { email: 'nonexistent@example.com', password: 'any' },
    });
    expect(res.status()).toBe(401);
  });

  test('GET /auth/profile – with valid token returns 200 and user', async ({ request }) => {
    const user = await signUp(request, {
      email: `e2e-profile-${Date.now()}@example.com`,
      password: 'password123',
      name: 'Profile User',
    });
    const res = await request.get(AUTH_PROFILE, {
      headers: authHeader(user.accessToken),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ email: user.email, name: user.name, id: user.id });
  });

  test('GET /auth/profile – without token returns 401', async ({ request }) => {
    const res = await request.get(AUTH_PROFILE);
    expect(res.status()).toBe(401);
  });

  test('GET /auth/profile – invalid token returns 401', async ({ request }) => {
    const res = await request.get(AUTH_PROFILE, {
      headers: authHeader('invalid-jwt-token'),
    });
    expect(res.status()).toBe(401);
  });
});
