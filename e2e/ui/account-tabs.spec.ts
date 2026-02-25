import { test, expect } from '../fixtures/auth.fixture';

test.describe('Account Tabs UI', () => {
  test.beforeEach(async ({ loggedInPage }) => {
    await loggedInPage.page.goto('/home');
  });

  test('should display Account info tab by default', async ({ loggedInPage }) => {
    const { page } = loggedInPage;
    await expect(page.getByRole('heading', { name: 'Account info' })).toBeVisible();
    await expect(page.getByText('Name')).toBeVisible();
    await expect(page.getByText('Email')).toBeVisible();
    await expect(page.getByText('User ID')).toBeVisible();
  });

  test('should navigate to Subscriptions tab', async ({ loggedInPage }) => {
    const { page } = loggedInPage;
    await page.getByRole('button', { name: 'Subscriptions' }).click();

    await expect(page.getByRole('heading', { name: 'Subscriptions' })).toBeVisible();
    await expect(page.getByText('No subscriptions yet')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Buy subscription' })).toBeVisible();
  });

  test('should navigate to Payment methods tab', async ({ loggedInPage }) => {
    const { page } = loggedInPage;
    await page.getByRole('button', { name: 'Payment methods' }).click();

    await expect(page.getByRole('heading', { name: 'Payment methods' })).toBeVisible();
    await expect(page.getByText('No payment method saved')).toBeVisible();
  });

  test('should display correct user info in sidebar', async ({ loggedInPage }) => {
    const { page } = loggedInPage;
    await expect(page.getByText('Signed in as')).toBeVisible();
  });

  test('should highlight active tab', async ({ loggedInPage }) => {
    const { page } = loggedInPage;
    await expect(page.getByRole('heading', { name: 'Account info' })).toBeVisible();

    await page.getByRole('button', { name: 'Subscriptions' }).click();
    await expect(page.getByRole('heading', { name: 'Subscriptions' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Account info' })).not.toBeVisible();

    await page.getByRole('button', { name: 'Account info' }).click();
    await expect(page.getByRole('heading', { name: 'Account info' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Subscriptions' })).not.toBeVisible();
  });

  test('should persist tab selection across page reloads (stored in state)', async ({ loggedInPage }) => {
    const { page } = loggedInPage;
    await page.getByRole('button', { name: 'Subscriptions' }).click();
    await expect(page.getByRole('heading', { name: 'Subscriptions' })).toBeVisible();

    await page.reload();

    await expect(page.getByRole('heading', { name: 'Account info' })).toBeVisible();
  });
});
