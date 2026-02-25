import { test, expect } from '../fixtures/auth.fixture';
import { generateTestUser, getFutureDate } from '../utils/api-client';

test.describe('Authorization API', () => {
  test.describe('Protected endpoints without authentication', () => {
    test('should return 401 for GET /subscriptions without token', async ({ apiClient }) => {
      const { response } = await apiClient.getSubscriptions();
      expect(response.status()).toBe(401);
    });

    test('should return 401 for GET /subscriptions/summary without token', async ({ apiClient }) => {
      const { response } = await apiClient.getSubscriptionSummary();
      expect(response.status()).toBe(401);
    });

    test('should return 401 for POST /subscriptions without token', async ({ apiClient }) => {
      const expiredAt = getFutureDate(1);

      const { response } = await apiClient.createSubscription({
        type: 'web',
        status: 'active',
        expiredAt: expiredAt,
      });
      expect(response.status()).toBe(401);
    });

    test('should return 401 for PATCH /subscriptions/:id without token', async ({ apiClient }) => {
      const { response } = await apiClient.updateSubscription('any-id', { status: 'canceled' });
      expect(response.status()).toBe(401);
    });

    test('should return 401 for DELETE /subscriptions/:id without token', async ({ apiClient }) => {
      const { response } = await apiClient.deleteSubscription('any-id');
      expect(response.status()).toBe(401);
    });

    test('should return 401 for DELETE /subscriptions/:id/payment-method without token', async ({ apiClient }) => {
      const { response } = await apiClient.removePaymentMethod('any-id');
      expect(response.status()).toBe(401);
    });
  });

  test.describe('User isolation', () => {
    test('user cannot access another user\'s subscriptions', async ({ apiClient }) => {
      const user1Data = generateTestUser();
      const user2Data = generateTestUser();

      const { data: user1Auth } = await apiClient.signUp(user1Data.email, user1Data.password, user1Data.name);
      const { data: user2Auth } = await apiClient.signUp(user2Data.email, user2Data.password, user2Data.name);

      apiClient.setToken(user1Auth.accessToken);

      const expiredAt = getFutureDate(1);

      const { data: sub } = await apiClient.createSubscription({
        type: 'web',
        status: 'active',
        expiredAt: expiredAt,
        paymentCardLast4: '4242',
      });

      apiClient.setToken(user2Auth.accessToken);
      const { data: user2Subs } = await apiClient.getSubscriptions();
      expect(user2Subs.length).toBe(0);
    });

    test('user cannot update another user\'s subscription', async ({ apiClient }) => {
      const user1Data = generateTestUser();
      const user2Data = generateTestUser();

      const { data: user1Auth } = await apiClient.signUp(user1Data.email, user1Data.password, user1Data.name);
      const { data: user2Auth } = await apiClient.signUp(user2Data.email, user2Data.password, user2Data.name);

      apiClient.setToken(user1Auth.accessToken);

      const expiredAt = getFutureDate(1);

      const { data: sub } = await apiClient.createSubscription({
        type: 'web',
        status: 'active',
        expiredAt: expiredAt,
      });

      apiClient.setToken(user2Auth.accessToken);
      const { response } = await apiClient.updateSubscription(sub.id, { status: 'canceled' });
      expect(response.status()).toBe(404);

      apiClient.setToken(user1Auth.accessToken);
      const { data: originalSubs } = await apiClient.getSubscriptions();
      expect(originalSubs[0].status).toBe('active');
    });

    test('user cannot delete another user\'s subscription', async ({ apiClient }) => {
      const user1Data = generateTestUser();
      const user2Data = generateTestUser();

      const { data: user1Auth } = await apiClient.signUp(user1Data.email, user1Data.password, user1Data.name);
      const { data: user2Auth } = await apiClient.signUp(user2Data.email, user2Data.password, user2Data.name);

      apiClient.setToken(user1Auth.accessToken);

      const expiredAt = getFutureDate(1);

      const { data: sub } = await apiClient.createSubscription({
        type: 'web',
        status: 'active',
        expiredAt: expiredAt,
      });

      apiClient.setToken(user2Auth.accessToken);
      const { response } = await apiClient.deleteSubscription(sub.id);
      expect(response.status()).toBe(404);

      apiClient.setToken(user1Auth.accessToken);
      const { data: originalSubs } = await apiClient.getSubscriptions();
      expect(originalSubs.length).toBe(1);
    });

    test('user cannot remove payment method from another user\'s subscription', async ({ apiClient }) => {
      const user1Data = generateTestUser();
      const user2Data = generateTestUser();

      const { data: user1Auth } = await apiClient.signUp(user1Data.email, user1Data.password, user1Data.name);
      const { data: user2Auth } = await apiClient.signUp(user2Data.email, user2Data.password, user2Data.name);

      apiClient.setToken(user1Auth.accessToken);

      const expiredAt = getFutureDate(1);

      const { data: sub } = await apiClient.createSubscription({
        type: 'web',
        status: 'active',
        expiredAt: expiredAt,
        paymentCardLast4: '4242',
      });

      apiClient.setToken(user2Auth.accessToken);
      const { response } = await apiClient.removePaymentMethod(sub.id);
      expect(response.status()).toBe(404);

      apiClient.setToken(user1Auth.accessToken);
      const { data: originalSubs } = await apiClient.getSubscriptions();
      expect(originalSubs[0].paymentCardLast4).toBe('4242');
    });

    test('user cannot access another user\'s summary', async ({ apiClient }) => {
      const user1Data = generateTestUser();
      const user2Data = generateTestUser();

      const { data: user1Auth } = await apiClient.signUp(user1Data.email, user1Data.password, user1Data.name);
      const { data: user2Auth } = await apiClient.signUp(user2Data.email, user2Data.password, user2Data.name);

      apiClient.setToken(user1Auth.accessToken);

      const expiredAt = getFutureDate(1);

      await apiClient.createSubscription({
        type: 'web',
        status: 'active',
        expiredAt: expiredAt,
      });

      const { data: user1Summary } = await apiClient.getSubscriptionSummary();

      apiClient.setToken(user2Auth.accessToken);
      const { data: user2Summary } = await apiClient.getSubscriptionSummary();

      expect(user1Summary.total).toBe(1);
      expect(user2Summary.total).toBe(0);
    });
  });

  test.describe('Token validation', () => {
    test('should reject expired token gracefully', async ({ apiClient }) => {
      apiClient.setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
      
      const { response } = await apiClient.getProfile();
      expect(response.status()).toBe(401);
    });

    test('should reject token with invalid signature', async ({ apiClient }) => {
      apiClient.setToken('invalid.token.here');
      
      const { response } = await apiClient.getProfile();
      expect(response.status()).toBe(401);
    });

    test('should reject empty token', async ({ apiClient }) => {
      apiClient.setToken('');
      
      const { response } = await apiClient.getProfile();
      expect(response.status()).toBe(401);
    });
  });
});
