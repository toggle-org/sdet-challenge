import { test, expect } from '@playwright/test';
import {
  signUp,
  createSubscription,
  authHeader,
  SUBSCRIPTIONS,
  SUBSCRIPTIONS_SUMMARY,
  AUTH_PROFILE,
} from '../api-helpers';

test.describe('Authorization and user isolation', () => {
  test('protected endpoints return 401 without token', async ({ request }) => {
    const endpoints = [
      { method: 'GET', url: AUTH_PROFILE },
      { method: 'GET', url: SUBSCRIPTIONS },
      { method: 'GET', url: SUBSCRIPTIONS_SUMMARY },
      { method: 'POST', url: SUBSCRIPTIONS, data: {} },
    ];
    for (const { method, url, data } of endpoints) {
      const res =
        method === 'GET'
          ? await request.get(url)
          : await request.post(url, { data: data || {} });
      expect(res.status(), `${method} ${url} should be 401`).toBe(401);
    }
  });

  test('user A cannot see or modify user B subscription', async ({
    request,
  }) => {
    const userA = await signUp(request, {
      email: `e2e-userA-${Date.now()}@example.com`,
      password: 'password123',
      name: 'User A',
    });
    const userB = await signUp(request, {
      email: `e2e-userB-${Date.now()}@example.com`,
      password: 'password123',
      name: 'User B',
    });

    const createRes = await createSubscription(request, userB.accessToken, {});
    expect(createRes.status()).toBe(201);
    const subB = await createRes.json();

    const listAsA = await request.get(SUBSCRIPTIONS, {
      headers: authHeader(userA.accessToken),
    });
    expect(listAsA.status()).toBe(200);
    const listA = await listAsA.json();
    expect(listA.find((s: { id: string }) => s.id === subB.id)).toBeUndefined();

    const patchAsA = await request.patch(`${SUBSCRIPTIONS}/${subB.id}`, {
      headers: authHeader(userA.accessToken),
      data: { status: 'canceled' },
    });
    expect(patchAsA.status()).toBe(404);

    const deleteAsA = await request.delete(`${SUBSCRIPTIONS}/${subB.id}`, {
      headers: authHeader(userA.accessToken),
    });
    expect(deleteAsA.status()).toBe(404);

    const removePmAsA = await request.delete(
      `${SUBSCRIPTIONS}/${subB.id}/payment-method`,
      { headers: authHeader(userA.accessToken) }
    );
    expect(removePmAsA.status()).toBe(404);
  });
});
