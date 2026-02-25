import { test, expect } from '../fixtures/auth.fixture';
import { generateTestUser, getFutureDate } from '../utils/api-client';

test.describe('Subscriptions API', () => {
  test.describe('POST /subscriptions', () => {
    test('should create a subscription successfully', async ({ apiClient }) => {
      const userData = generateTestUser();
      const { data: authData } = await apiClient.signUp(userData.email, userData.password, userData.name);
      apiClient.setToken(authData.accessToken);

      const expiredAt = getFutureDate(1);

      const { data, response } = await apiClient.createSubscription({
        type: 'web',
        status: 'active',
        expiredAt: expiredAt,
      });

      expect(response.status()).toBe(201);
      expect(data).toMatchObject({
        type: 'web',
        status: 'active',
        accountId: authData.user.id,
      });
      expect(data.id).toBeDefined();
      expect(data.expiredAt).toBeDefined();
    });

    test('should create subscription with payment method stored', async ({ apiClient }) => {
      const userData = generateTestUser();
      const { data: authData } = await apiClient.signUp(userData.email, userData.password, userData.name);
      apiClient.setToken(authData.accessToken);

      const expiredAt = getFutureDate(1);

      const { data, response } = await apiClient.createSubscription({
        type: 'web',
        status: 'active',
        expiredAt: expiredAt,
        planMonths: 1,
        priceCents: 999,
        paymentCardLast4: '4242',
      });

      expect(response.status()).toBe(201);
      expect(data.paymentCardLast4).toBe('4242');
      expect(data.planMonths).toBe(1);
      expect(data.priceCents).toBe(999);
    });

    test('should enforce single active subscription rule', async ({ apiClient }) => {
      const userData = generateTestUser();
      const { data: authData } = await apiClient.signUp(userData.email, userData.password, userData.name);
      apiClient.setToken(authData.accessToken);

      const expiredAt = getFutureDate(1);

      await apiClient.createSubscription({
        type: 'web',
        status: 'active',
        expiredAt: expiredAt,
      });

      const { data, response } = await apiClient.createSubscription({
        type: 'ios',
        status: 'active',
        expiredAt: expiredAt,
      });

      expect(response.status()).toBe(409);
      expect(data).toHaveProperty('message');
    });

    test('should allow creating subscription after canceling active one', async ({ apiClient }) => {
      const userData = generateTestUser();
      const { data: authData } = await apiClient.signUp(userData.email, userData.password, userData.name);
      apiClient.setToken(authData.accessToken);

      const expiredAt = getFutureDate(1);

      const { data: sub1 } = await apiClient.createSubscription({
        type: 'web',
        status: 'active',
        expiredAt: expiredAt,
      });

      await apiClient.updateSubscription(sub1.id, { status: 'canceled' });

      const { data: sub2, response } = await apiClient.createSubscription({
        type: 'ios',
        status: 'active',
        expiredAt: expiredAt,
      });

      expect(response.status()).toBe(201);
      expect(sub2.type).toBe('ios');
    });

    test('should return 400 when type is invalid', async ({ apiClient }) => {
      const userData = generateTestUser();
      const { data: authData } = await apiClient.signUp(userData.email, userData.password, userData.name);
      apiClient.setToken(authData.accessToken);

      const expiredAt = getFutureDate(1);

      const { response } = await apiClient.post('/subscriptions', {
        type: 'invalid',
        status: 'active',
        expiredAt: expiredAt,
      });

      expect(response.status()).toBe(400);
    });

    test('should return 400 when status is missing', async ({ apiClient }) => {
      const userData = generateTestUser();
      const { data: authData } = await apiClient.signUp(userData.email, userData.password, userData.name);
      apiClient.setToken(authData.accessToken);

      const expiredAt = getFutureDate(1);

      const { response } = await apiClient.post('/subscriptions', {
        type: 'web',
        expiredAt: expiredAt,
      });

      expect(response.status()).toBe(400);
    });

    test('should return 400 when expiredAt is missing', async ({ apiClient }) => {
      const userData = generateTestUser();
      const { data: authData } = await apiClient.signUp(userData.email, userData.password, userData.name);
      apiClient.setToken(authData.accessToken);

      const { response } = await apiClient.post('/subscriptions', {
        type: 'web',
        status: 'active',
      });

      expect(response.status()).toBe(400);
    });

    test('should return 401 when not authenticated', async ({ apiClient }) => {
      apiClient.clearToken();
      const expiredAt = getFutureDate(1);

      const { response } = await apiClient.createSubscription({
        type: 'web',
        status: 'active',
        expiredAt: expiredAt,
      });

      expect(response.status()).toBe(401);
    });
  });

  test.describe('GET /subscriptions', () => {
    test('should return empty array when no subscriptions', async ({ apiClient }) => {
      const userData = generateTestUser();
      const { data: authData } = await apiClient.signUp(userData.email, userData.password, userData.name);
      apiClient.setToken(authData.accessToken);

      const { data, response } = await apiClient.getSubscriptions();

      expect(response.status()).toBe(200);
      expect(data).toEqual([]);
    });

    test('should return all subscriptions for authenticated user', async ({ apiClient }) => {
      const userData = generateTestUser();
      const { data: authData } = await apiClient.signUp(userData.email, userData.password, userData.name);
      apiClient.setToken(authData.accessToken);

      const expiredAt = getFutureDate(1);

      await apiClient.createSubscription({
        type: 'web',
        status: 'active',
        expiredAt: expiredAt,
      });

      const { data, response } = await apiClient.getSubscriptions();

      expect(response.status()).toBe(200);
      expect(data.length).toBe(1);
      expect(data[0].type).toBe('web');
    });

    test('should filter subscriptions by type', async ({ apiClient }) => {
      const userData = generateTestUser();
      const { data: authData } = await apiClient.signUp(userData.email, userData.password, userData.name);
      apiClient.setToken(authData.accessToken);

      const expiredAt = getFutureDate(1);

      await apiClient.createSubscription({
        type: 'web',
        status: 'active',
        expiredAt: expiredAt,
      });

      const { data, response } = await apiClient.getSubscriptions({ type: 'web' });

      expect(response.status()).toBe(200);
      expect(data.length).toBe(1);
      expect(data[0].type).toBe('web');
    });

    test('should filter subscriptions by status', async ({ apiClient }) => {
      const userData = generateTestUser();
      const { data: authData } = await apiClient.signUp(userData.email, userData.password, userData.name);
      apiClient.setToken(authData.accessToken);

      const expiredAt = getFutureDate(1);

      await apiClient.createSubscription({
        type: 'web',
        status: 'active',
        expiredAt: expiredAt,
      });

      const { data, response } = await apiClient.getSubscriptions({ status: 'active' });

      expect(response.status()).toBe(200);
      expect(data.length).toBe(1);
      expect(data[0].status).toBe('active');
    });

    test('should return empty when filter matches nothing', async ({ apiClient }) => {
      const userData = generateTestUser();
      const { data: authData } = await apiClient.signUp(userData.email, userData.password, userData.name);
      apiClient.setToken(authData.accessToken);

      const expiredAt = getFutureDate(1);

      await apiClient.createSubscription({
        type: 'web',
        status: 'active',
        expiredAt: expiredAt,
      });

      const { data, response } = await apiClient.getSubscriptions({ type: 'ios' });

      expect(response.status()).toBe(200);
      expect(data).toEqual([]);
    });
  });

  test.describe('GET /subscriptions/summary', () => {
    test('should return summary with zeros when no subscriptions', async ({ apiClient }) => {
      const userData = generateTestUser();
      const { data: authData } = await apiClient.signUp(userData.email, userData.password, userData.name);
      apiClient.setToken(authData.accessToken);

      const { data, response } = await apiClient.getSubscriptionSummary();

      expect(response.status()).toBe(200);
      expect(data.total).toBe(0);
      expect(data.active).toBe(0);
    });

    test('should return correct summary with subscriptions', async ({ apiClient }) => {
      const userData = generateTestUser();
      const { data: authData } = await apiClient.signUp(userData.email, userData.password, userData.name);
      apiClient.setToken(authData.accessToken);

      const expiredAt = getFutureDate(1);

      await apiClient.createSubscription({
        type: 'web',
        status: 'active',
        expiredAt: expiredAt,
      });

      const { data, response } = await apiClient.getSubscriptionSummary();

      expect(response.status()).toBe(200);
      expect(data.total).toBe(1);
      expect(data.active).toBe(1);
      expect(data.byType.web).toBe(1);
    });
  });

  test.describe('PATCH /subscriptions/:id', () => {
    test('should update subscription status (cancel)', async ({ apiClient }) => {
      const userData = generateTestUser();
      const { data: authData } = await apiClient.signUp(userData.email, userData.password, userData.name);
      apiClient.setToken(authData.accessToken);

      const expiredAt = getFutureDate(1);

      const { data: sub } = await apiClient.createSubscription({
        type: 'web',
        status: 'active',
        expiredAt: expiredAt,
      });

      const { data, response } = await apiClient.updateSubscription(sub.id, {
        status: 'canceled',
      });

      expect(response.status()).toBe(200);
      expect(data.status).toBe('canceled');
    });

    test('should update subscription type', async ({ apiClient }) => {
      const userData = generateTestUser();
      const { data: authData } = await apiClient.signUp(userData.email, userData.password, userData.name);
      apiClient.setToken(authData.accessToken);

      const expiredAt = getFutureDate(1);

      const { data: sub } = await apiClient.createSubscription({
        type: 'web',
        status: 'active',
        expiredAt: expiredAt,
      });

      const { data, response } = await apiClient.updateSubscription(sub.id, {
        type: 'ios',
      });

      expect(response.status()).toBe(200);
      expect(data.type).toBe('ios');
    });

    test('should update subscription expiredAt', async ({ apiClient }) => {
      const userData = generateTestUser();
      const { data: authData } = await apiClient.signUp(userData.email, userData.password, userData.name);
      apiClient.setToken(authData.accessToken);

      const expiredAt = getFutureDate(1);
      const newExpiredAt = getFutureDate(1, 1);

      const { data: sub } = await apiClient.createSubscription({
        type: 'web',
        status: 'active',
        expiredAt: expiredAt,
      });

      const { data, response } = await apiClient.updateSubscription(sub.id, {
        expiredAt: newExpiredAt,
      });

      expect(response.status()).toBe(200);
      expect(new Date(data.expiredAt).getFullYear()).toBe(new Date(newExpiredAt).getFullYear());
    });

    test('should return 404 when updating non-existent subscription', async ({ apiClient }) => {
      const userData = generateTestUser();
      const { data: authData } = await apiClient.signUp(userData.email, userData.password, userData.name);
      apiClient.setToken(authData.accessToken);

      const { response } = await apiClient.updateSubscription('non-existent-id', {
        status: 'canceled',
      });

      expect(response.status()).toBe(404);
    });
  });

  test.describe('DELETE /subscriptions/:id', () => {
    test('should delete subscription successfully', async ({ apiClient }) => {
      const userData = generateTestUser();
      const { data: authData } = await apiClient.signUp(userData.email, userData.password, userData.name);
      apiClient.setToken(authData.accessToken);

      const expiredAt = getFutureDate(1);

      const { data: sub } = await apiClient.createSubscription({
        type: 'web',
        status: 'active',
        expiredAt: expiredAt,
      });

      const { data, response } = await apiClient.deleteSubscription(sub.id);

      expect(response.status()).toBe(200);
      expect(data.success).toBe(true);

      const { data: subs } = await apiClient.getSubscriptions();
      expect(subs.length).toBe(0);
    });

    test('should return 404 when deleting non-existent subscription', async ({ apiClient }) => {
      const userData = generateTestUser();
      const { data: authData } = await apiClient.signUp(userData.email, userData.password, userData.name);
      apiClient.setToken(authData.accessToken);

      const { response } = await apiClient.deleteSubscription('non-existent-id');

      expect(response.status()).toBe(404);
    });
  });

  test.describe('DELETE /subscriptions/:id/payment-method', () => {
    test('should remove payment method successfully', async ({ apiClient }) => {
      const userData = generateTestUser();
      const { data: authData } = await apiClient.signUp(userData.email, userData.password, userData.name);
      apiClient.setToken(authData.accessToken);

      const expiredAt = getFutureDate(1);

      const { data: sub } = await apiClient.createSubscription({
        type: 'web',
        status: 'active',
        expiredAt: expiredAt,
        paymentCardLast4: '4242',
      });

      const { data, response } = await apiClient.removePaymentMethod(sub.id);

      expect(response.status()).toBe(200);
      expect(data.success).toBe(true);

      const { data: subs } = await apiClient.getSubscriptions();
      expect(subs[0].paymentCardLast4).toBeNull();
    });

    test('should return 404 when removing payment method from non-existent subscription', async ({ apiClient }) => {
      const userData = generateTestUser();
      const { data: authData } = await apiClient.signUp(userData.email, userData.password, userData.name);
      apiClient.setToken(authData.accessToken);

      const { response } = await apiClient.removePaymentMethod('non-existent-id');

      expect(response.status()).toBe(404);
    });
  });

  test.describe('Subscription lifecycle', () => {
    test('complete lifecycle: buy -> cancel -> re-buy', async ({ apiClient }) => {
      const userData = generateTestUser();
      const { data: authData } = await apiClient.signUp(userData.email, userData.password, userData.name);
      apiClient.setToken(authData.accessToken);

      const expiredAt = getFutureDate(1);

      const { data: sub1 } = await apiClient.createSubscription({
        type: 'web',
        status: 'active',
        expiredAt: expiredAt,
        paymentCardLast4: '4242',
      });
      expect(sub1.status).toBe('active');

      const { data: sub1Updated } = await apiClient.updateSubscription(sub1.id, {
        status: 'canceled',
      });
      expect(sub1Updated.status).toBe('canceled');

      const { data: sub2, response } = await apiClient.createSubscription({
        type: 'ios',
        status: 'active',
        expiredAt: expiredAt,
      });
      expect(response.status()).toBe(201);
      expect(sub2.status).toBe('active');
      expect(sub2.type).toBe('ios');
    });
  });
});
