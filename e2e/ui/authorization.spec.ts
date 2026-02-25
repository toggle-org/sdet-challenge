import { test, expect } from '../fixtures/auth.fixture';

test.describe('Authorization UI', () => {
  test.describe('Protected routes', () => {
    test('should redirect to sign in when accessing home without auth', async ({ page }) => {
      await page.goto('/home');
      await expect(page).toHaveURL(/\/signin/);
    });

    test('should redirect to sign in when accessing home after sign out', async ({ loggedInPage }) => {
      const { page } = loggedInPage;
      await expect(page).toHaveURL(/\/home/);

      await page.getByRole('button', { name: 'Sign Out' }).click();

      await expect(page).toHaveURL(/\/signin/);

      await page.goto('/home');
      await expect(page).toHaveURL(/\/signin/);
    });

    test('should allow access to signup page without auth', async ({ page }) => {
      await page.goto('/signup');
      await expect(page).toHaveURL(/\/signup/);
      await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
    });

    test('should allow access to signin page without auth', async ({ page }) => {
      await page.goto('/signin');
      await expect(page).toHaveURL(/\/signin/);
      await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    });
  });

  test.describe('User session', () => {
    test('should display correct user info in sidebar', async ({ loggedInPage }) => {
      const { page, userData } = loggedInPage;
      await expect(page.getByText('Signed in as')).toBeVisible();
      await expect(page.getByText(userData.name)).toBeVisible();
    });
  });
});
