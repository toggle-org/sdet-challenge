import { test, expect } from '../fixtures/auth.fixture';
import { 
  VALID_CARD, 
  INVALID_CARD,
  buySubscription, 
  cancelSubscription, 
  ensureNoSubscription, 
  ensureActiveSubscription,
  handleDialog
} from '../utils/helpers';

test.describe('Subscription UI', () => {
  test.beforeEach(async ({ loggedInPage }) => {
    const { page } = loggedInPage;
    await page.goto('/home');
    await page.getByRole('button', { name: 'Subscriptions' }).click();
    await expect(page.getByRole('heading', { name: 'Subscriptions' })).toBeVisible();
  });

  test.describe('Buy subscription flow', () => {
    test('should open buy subscription modal', async ({ loggedInPage }) => {
      const { page } = loggedInPage;
      await page.getByRole('button', { name: 'Buy subscription' }).click();

      await expect(page.getByRole('heading', { name: 'Buy subscription' })).toBeVisible();
      await expect(page.getByText('1 month subscription')).toBeVisible();
      await expect(page.getByText('3 month subscription')).toBeVisible();
    });

    test('should buy 1-month subscription successfully', async ({ loggedInPage }) => {
      const { page } = loggedInPage;
      await page.getByRole('button', { name: 'Buy subscription' }).click();

      await page.getByLabel('1 month subscription').check();
      await page.getByPlaceholder('4242424242424242').fill(VALID_CARD);

      await page.getByRole('button', { name: 'Buy', exact: true }).click();

      await expect(page.getByText('Subscription purchased')).toBeVisible();
      await expect(page.getByText('Status')).toBeVisible();
      await expect(page.getByText('active', { exact: true })).toBeVisible();
    });

    test('should buy 3-month subscription successfully', async ({ loggedInPage }) => {
      const { page } = loggedInPage;
      await page.getByRole('button', { name: 'Buy subscription' }).click();

      await page.getByLabel('3 month subscription').check();
      await page.getByPlaceholder('4242424242424242').fill(VALID_CARD);

      await page.getByRole('button', { name: 'Buy', exact: true }).click();

      await expect(page.getByText('Subscription purchased')).toBeVisible();
      await expect(page.getByText('3 month(s)')).toBeVisible();
    });

    test('should show error for invalid card', async ({ loggedInPage }) => {
      const { page } = loggedInPage;
      await page.getByRole('button', { name: 'Buy subscription' }).click();

      await page.getByPlaceholder('4242424242424242').fill(INVALID_CARD);

      await page.getByRole('button', { name: 'Buy', exact: true }).click();

      await expect(page.getByText('Card is invalid')).toBeVisible({ timeout: 5000 });
    });

    test('should show error for incorrect card number', async ({ loggedInPage }) => {
      const { page } = loggedInPage;
      await page.getByRole('button', { name: 'Buy subscription' }).click();

      await page.getByPlaceholder('4242424242424242').fill('1234567890123456');

      await page.getByRole('button', { name: 'Buy', exact: true }).click();

      await expect(page.getByText('Use hardcoded valid card number')).toBeVisible({ timeout: 5000 });
    });

    test('should close modal on cancel', async ({ loggedInPage }) => {
      const { page } = loggedInPage;
      await page.getByRole('button', { name: 'Buy subscription' }).click();

      await page.getByRole('button', { name: 'Cancel' }).click();

      await expect(page.getByRole('heading', { name: 'Buy subscription' })).not.toBeVisible();
    });

    test('should disable buy button when active subscription exists', async ({ loggedInPage }) => {
      const { page } = loggedInPage;
      await ensureActiveSubscription(page, 1);

      await expect(page.getByText('Status')).toBeVisible();
      await expect(page.getByText('active', { exact: true })).toBeVisible();

      const buyButton = page.getByRole('button', { name: 'Buy subscription' });
      await expect(buyButton).toBeDisabled();
      await expect(page.getByText('Cancel active subscription to buy a new one')).toBeVisible();
    });
  });

  test.describe('Cancel subscription', () => {
    test('should cancel subscription successfully', async ({ loggedInPage }) => {
      const { page } = loggedInPage;
      await buySubscription(page, 1);

      await handleDialog(page, 'accept', async () => {
        await cancelSubscription(page);
      });

      await expect(page.getByText('Subscription canceled')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('button', { name: 'Cancel subscription' })).not.toBeVisible();
    });

    test('should not cancel subscription if confirmation is dismissed', async ({ loggedInPage }) => {
      const { page } = loggedInPage;
      await buySubscription(page, 1);

      await handleDialog(page, 'dismiss', async () => {
        await page.getByRole('button', { name: 'Cancel subscription' }).click();
      });

      await expect(page.getByRole('button', { name: 'Cancel subscription' })).toBeVisible();
    });

    test('should allow re-buy after canceling', async ({ loggedInPage }) => {
      const { page } = loggedInPage;
      await buySubscription(page, 1);

      await handleDialog(page, 'accept', async () => {
        await cancelSubscription(page);
      });

      await expect(page.getByText('canceled', { exact: true })).toBeVisible();

      await buySubscription(page, 3);

      await expect(page.getByText('Subscription purchased').first()).toBeVisible();
      await expect(page.getByText('3 month(s)')).toBeVisible();
      await expect(page.getByText('active', { exact: true })).toBeVisible();
    });
  });

  test.describe('Payment methods', () => {
    test('should show payment method after purchase', async ({ loggedInPage }) => {
      const { page } = loggedInPage;
      await ensureActiveSubscription(page, 1);

      await page.getByRole('button', { name: 'Payment methods' }).click();

      await expect(page.getByRole('heading', { name: 'Payment methods' })).toBeVisible();
      await expect(page.getByText('**** **** **** 4242')).toBeVisible();
    });

    test('should remove payment method successfully', async ({ loggedInPage }) => {
      const { page } = loggedInPage;
      await ensureActiveSubscription(page, 1);

      await page.getByRole('button', { name: 'Payment methods' }).click();
      await expect(page.getByRole('heading', { name: 'Payment methods' })).toBeVisible();
      await expect(page.getByText('**** **** **** 4242')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Remove method' })).toBeVisible();
      await page.getByRole('button', { name: 'Remove method' }).click();

      await expect(page.getByText('Payment method removed')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('No payment method saved')).toBeVisible();
    });

    test('should show no payment method before purchase', async ({ loggedInPage }) => {
      const { page } = loggedInPage;
      await ensureNoSubscription(page);

      await page.getByRole('button', { name: 'Payment methods' }).click();

      await expect(page.getByText('No payment method saved')).toBeVisible();
    });
  });

  test.describe('Subscription display', () => {
    test('should display subscription details correctly', async ({ loggedInPage }) => {
      const { page } = loggedInPage;
      await page.getByRole('button', { name: 'Buy subscription' }).click();
      await page.getByLabel('3 month subscription').check();
      await page.getByPlaceholder('4242424242424242').fill(VALID_CARD);
      await page.getByRole('button', { name: 'Buy', exact: true }).click();

      await expect(page.getByText('Subscription purchased')).toBeVisible();

      await expect(page.getByText('Status')).toBeVisible();
      await expect(page.getByText('active', { exact: true })).toBeVisible();
      await expect(page.getByText('Plan')).toBeVisible();
      await expect(page.getByText('3 month(s)')).toBeVisible();
      await expect(page.getByText('Price')).toBeVisible();
      await expect(page.getByText('$24.99')).toBeVisible();
      await expect(page.getByText('Expires')).toBeVisible();
    });
  });

  test.describe('UI/API sync', () => {
    test('should sync subscription to API after UI purchase', async ({ loggedInPage }) => {
      const { page, apiClient } = loggedInPage;
      await page.goto('/home');
      await page.getByRole('button', { name: 'Subscriptions' }).click();

      await buySubscription(page, 1);

      const { data: subscriptions } = await apiClient.getSubscriptions();
      expect(subscriptions.length).toBe(1);
      expect(subscriptions[0].status).toBe('active');
      expect(subscriptions[0].planMonths).toBe(1);
    });

    test('should reflect API cancellation in UI', async ({ loggedInPage }) => {
      const { page, apiClient } = loggedInPage;
      await page.goto('/home');
      await page.getByRole('button', { name: 'Subscriptions' }).click();

      await buySubscription(page, 1);

      const { data: subscriptions } = await apiClient.getSubscriptions();
      expect(subscriptions[0].status).toBe('active');

      await apiClient.updateSubscription(subscriptions[0].id, { status: 'canceled' });

      const { data: updatedSubs } = await apiClient.getSubscriptions();
      expect(updatedSubs[0].status).toBe('canceled');

      await page.goto('/home');
      await page.getByRole('button', { name: 'Subscriptions' }).click();
      await page.waitForLoadState('networkidle');

      await expect(page.getByText('Status')).toBeVisible();
      await expect(page.getByText('canceled', { exact: true })).toBeVisible();
    });
  });
});
