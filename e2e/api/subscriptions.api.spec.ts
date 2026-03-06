import { test, expect } from '@playwright/test';
import {
  signUp,
  signIn,
  createSubscription,
  authHeader,
  SUBSCRIPTIONS,
  SUBSCRIPTIONS_SUMMARY,
} from '../api-helpers';

test.describe('Subscriptions API', () => {
  test('subscription lifecycle: buy, single active rule, cancel, re-buy', async ({
    request,
  }) => {
    const email = `e2e-lifecycle-${Date.now()}@example.com`;
    const user = await signUp(request, {
      email,
      password: 'password123',
      name: 'Lifecycle User',
    });
    const token = user.accessToken;

    const expiredAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const createRes = await createSubscription(request, token, { expiredAt });
    expect(createRes.status()).toBe(201);
    const sub = await createRes.json();
    expect(sub.status).toBe('active');
    expect(sub.type).toBe('web');
    expect(sub.accountId).toBe(user.id);

    const listRes = await request.get(SUBSCRIPTIONS, {
      headers: authHeader(token),
    });
    expect(listRes.status()).toBe(200);
    const list = await listRes.json();
    expect(list.length).toBe(1);
    expect(list[0].id).toBe(sub.id);

    const secondCreate = await createSubscription(request, token, {
      expiredAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    });
    expect(secondCreate.status()).toBe(409);
    const conflictBody = await secondCreate.json();
    expect(conflictBody.message).toContain('active');

    const patchRes = await request.patch(`${SUBSCRIPTIONS}/${sub.id}`, {
      headers: authHeader(token),
      data: { status: 'canceled' },
    });
    expect(patchRes.status()).toBe(200);

    const afterCancel = await request.get(SUBSCRIPTIONS, {
      headers: authHeader(token),
    });
    const listAfter = await afterCancel.json();
    expect(listAfter[0].status).toBe('canceled');

    const reBuyRes = await createSubscription(request, token, {
      expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
    expect(reBuyRes.status()).toBe(201);
    const reBuy = await reBuyRes.json();
    expect(reBuy.status).toBe('active');
  });

  test('POST /subscriptions – requires auth (401)', async ({ request }) => {
    const res = await request.post(SUBSCRIPTIONS, {
      data: {
        type: 'web',
        status: 'active',
        expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
    expect(res.status()).toBe(401);
  });

  test('GET /subscriptions and GET /subscriptions/summary – require auth', async ({
    request,
  }) => {
    const getRes = await request.get(SUBSCRIPTIONS);
    expect(getRes.status()).toBe(401);
    const summaryRes = await request.get(SUBSCRIPTIONS_SUMMARY);
    expect(summaryRes.status()).toBe(401);
  });

  test('summary returns counts', async ({ request }) => {
    const user = await signUp(request, {
      email: `e2e-summary-${Date.now()}@example.com`,
      password: 'password123',
      name: 'Summary User',
    });
    const summaryRes = await request.get(SUBSCRIPTIONS_SUMMARY, {
      headers: authHeader(user.accessToken),
    });
    expect(summaryRes.status()).toBe(200);
    const body = await summaryRes.json();
    expect(body).toHaveProperty('total');
    expect(body).toHaveProperty('active');
    expect(body).toHaveProperty('byType');
  });
});
