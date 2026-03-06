import { test, expect } from '@playwright/test';
import {
  signUp,
  createSubscription,
  authHeader,
  SUBSCRIPTIONS,
} from '../api-helpers';

test.describe('Payment method API', () => {
  test('payment method stored after purchase and removable', async ({
    request,
  }) => {
    const email = `e2e-payment-${Date.now()}@example.com`;
    const user = await signUp(request, {
      email,
      password: 'password123',
      name: 'Payment User',
    });
    const token = user.accessToken;

    const createRes = await createSubscription(request, token, {
      paymentCardLast4: '4242',
      planMonths: 1,
      priceCents: 999,
    });
    expect(createRes.status()).toBe(201);
    const sub = await createRes.json();
    expect(sub.paymentCardLast4).toBe('4242');

    const listRes = await request.get(SUBSCRIPTIONS, {
      headers: authHeader(token),
    });
    const list = await listRes.json();
    expect(list[0].paymentCardLast4).toBe('4242');

    const removeRes = await request.delete(
      `${SUBSCRIPTIONS}/${sub.id}/payment-method`,
      { headers: authHeader(token) }
    );
    expect(removeRes.status()).toBe(200);

    const listAfter = await request.get(SUBSCRIPTIONS, {
      headers: authHeader(token),
    });
    const listAfterJson = await listAfter.json();
    expect(listAfterJson[0].paymentCardLast4).toBeNull();
  });

  test('DELETE /subscriptions/:id/payment-method – requires auth', async ({
    request,
  }) => {
    const user = await signUp(request, {
      email: `e2e-pm-${Date.now()}@example.com`,
      password: 'password123',
      name: 'Payment Auth User',
    });
    const createRes = await createSubscription(request, user.accessToken, {});
    const sub = await createRes.json();
    const res = await request.delete(
      `${SUBSCRIPTIONS}/${sub.id}/payment-method`
    );
    expect(res.status()).toBe(401);
  });
});
