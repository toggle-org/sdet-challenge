import { test, expect } from '@playwright/test';
import { signUpAndGoToHome, validEmail } from '../ui-helpers';

test.describe('Account tabs UI', () => {
  test.beforeEach(async ({ page }) => {
    await signUpAndGoToHome(page, { email: validEmail('tabs'), name: 'Tabs User' });
  });

  test('Account info tab shows name, email, user ID', async ({ page }) => {
    await page.getByRole('button', { name: 'Account info' }).click();
    await expect(page.getByText('Account info').first()).toBeVisible();
    await expect(page.getByText('Tabs User').first()).toBeVisible();
    await expect(page.getByText('Name').first()).toBeVisible();
    await expect(page.getByText('Email').first()).toBeVisible();
    await expect(page.getByText('User ID').first()).toBeVisible();
  });

  test('Subscriptions tab shows empty state or list', async ({ page }) => {
    await page.getByRole('button', { name: 'Subscriptions' }).click();
    await expect(page.getByText('Subscriptions').first()).toBeVisible();
    await expect(
      page.getByText('No subscriptions yet.').or(page.getByRole('button', { name: 'Buy subscription' })).first()
    ).toBeVisible();
  });

  test('Payment methods tab shows empty state when no card', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Payment methods' }).click();
    await expect(page.getByText('Payment methods').first()).toBeVisible();
    await expect(page.getByText('No payment method saved.')).toBeVisible();
  });

  test('tab selection persists when switching', async ({ page }) => {
    await page.getByRole('button', { name: 'Subscriptions' }).click();
    await expect(page.getByText('Subscriptions').first()).toBeVisible();
    await page.getByRole('button', { name: 'Payment methods' }).click();
    await expect(page.getByText('No payment method saved.')).toBeVisible();
    await page.getByRole('button', { name: 'Account info' }).click();
    await expect(page.getByText('User ID').first()).toBeVisible();
  });
});
