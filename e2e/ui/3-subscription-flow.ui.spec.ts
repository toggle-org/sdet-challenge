import { test, expect } from '@playwright/test';
import { signUpAndGoToHome, validEmail } from '../ui-helpers';

const VALID_CARD = '4242424242424242';

test.describe('Subscription purchase flow UI', () => {
  test.beforeEach(async ({ page }) => {
    await signUpAndGoToHome(page, { email: validEmail('sub'), name: 'Sub User' });
  });

  test('user is logged in and sees Subscriptions tab', async ({ page }) => {
    await expect(page).toHaveURL(/\/home/);
    await page.getByRole('button', { name: 'Subscriptions' }).click();
    await expect(page.getByRole('button', { name: 'Buy subscription' })).toBeVisible();
  });

  test('buy subscription: open modal, choose plan, pay with valid card', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Subscriptions' }).click();
    await page.getByRole('button', { name: 'Buy subscription' }).click();

    await expect(page.getByRole('heading', { name: 'Buy subscription' })).toBeVisible();
    await expect(page.getByText('Choose plan and enter card number')).toBeVisible();
    await expect(page.getByText('1 month subscription — $9.99')).toBeVisible();
    await expect(page.getByText('3 month subscription — $24.99')).toBeVisible();
    await expect(page.getByLabel('Card number')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Buy', exact: true })).toBeVisible();

    await page.getByLabel('1 month subscription — $9.99').click();
    await page.getByLabel('Card number').fill(VALID_CARD);
    await page.getByRole('button', { name: 'Buy', exact: true }).click();

    await expect(page.getByText('Subscription purchased').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('active', { exact: true }).first()).toBeVisible({ timeout: 5000 });
  });

  test('buy button disabled when user has active subscription', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Subscriptions' }).click();
    await page.getByRole('button', { name: 'Buy subscription' }).click();
    await page.getByLabel('Card number').fill(VALID_CARD);
    await page.getByRole('button', { name: 'Buy', exact: true }).click();
    await expect(page.getByText('Subscription purchased').first()).toBeVisible({ timeout: 10000 });

    await expect(page.getByRole('button', { name: 'Buy subscription' })).toBeDisabled();
    await expect(page.getByText('Cancel active subscription to buy a new one')).toBeVisible();
  });

  test('cancel subscription then re-buy', async ({ page }) => {
    await page.getByRole('button', { name: 'Subscriptions' }).click();
    await page.getByRole('button', { name: 'Buy subscription' }).click();
    await page.getByLabel('Card number').fill(VALID_CARD);
    await page.getByRole('button', { name: 'Buy', exact: true }).click();
    await expect(page.getByText('Subscription purchased').first()).toBeVisible({ timeout: 10000 });

    page.on('dialog', (d) => d.accept());
    await page.getByRole('button', { name: 'Cancel subscription' }).click();
    await expect(page.getByText('Subscription canceled')).toBeVisible({ timeout: 5000 });

    await expect(page.getByRole('button', { name: 'Buy subscription' })).toBeEnabled();
    await page.getByRole('button', { name: 'Buy subscription' }).click();
    await page.getByLabel('Card number').fill(VALID_CARD);
    await page.getByRole('button', { name: 'Buy', exact: true }).click();
    await expect(page.getByText('Subscription purchased').first()).toBeVisible({ timeout: 10000 });
  });

  test('payment method shown after purchase and removable', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Subscriptions' }).click();
    await page.getByRole('button', { name: 'Buy subscription' }).click();
    await page.getByLabel('Card number').fill(VALID_CARD);
    await page.getByRole('button', { name: 'Buy', exact: true }).click();
    await expect(page.getByText('Subscription purchased').first()).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: 'Payment methods' }).click();
    await expect(page.getByText('4242')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Remove method' })).toBeVisible();

    await page.getByRole('button', { name: 'Remove method' }).click();
    await expect(page.getByText('Payment method removed')).toBeVisible();
    await expect(page.getByText('No payment method saved.')).toBeVisible();
  });

  test('invalid card shows error and does not create subscription', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Subscriptions' }).click();
    await page.getByRole('button', { name: 'Buy subscription' }).click();
    await expect(page.getByRole('heading', { name: 'Buy subscription' })).toBeVisible();
    await page.getByLabel('Card number').fill('4000000000000002');
    await page.getByRole('button', { name: 'Buy', exact: true }).click();

    await expect(page.getByText('Card is invalid')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Buy subscription' })).toBeVisible();
  });
});
