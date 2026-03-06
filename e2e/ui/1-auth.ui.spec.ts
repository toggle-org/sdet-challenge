import { test, expect } from '@playwright/test';
import {
  signUpAndGoToHome,
  signInAndGoToHome,
  validEmail,
} from '../ui-helpers';

test.describe('Authentication UI', () => {
  // Сначала проверки успешного логина (без аккаунта на Sign in не зайти)
  test('successful sign up: home page, Sign Out and Signed in as visible', async ({
    page,
  }) => {
    const email = validEmail('signup');
    await signUpAndGoToHome(page, { email });
    await expect(page.getByRole('complementary').getByText(email)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Subscriptions' })).toBeVisible();
  });

  test('successful sign in: home page and user email visible', async ({
    page,
  }) => {
    const email = validEmail('signin');
    await signUpAndGoToHome(page, { email });
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page).toHaveURL(/\/signin/);
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();

    await signInAndGoToHome(page, email);
    await expect(page.getByRole('complementary').getByText(email)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Subscriptions' })).toBeVisible();
  });

  test('valid sign up redirects to home and shows account', async ({
    page,
  }) => {
    const email = validEmail('ui');
    await signUpAndGoToHome(page, { email, name: 'E2E User' });
    await expect(page).toHaveURL(/\/home/);
    await expect(page.getByRole('heading', { name: 'Account', exact: true })).toBeVisible();
    await expect(page.getByRole('complementary').getByText(email)).toBeVisible();
  });

  test('valid sign in redirects to home', async ({ page }) => {
    const email = validEmail('flow');
    await signUpAndGoToHome(page, { email, name: 'SignIn User' });
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page).toHaveURL(/\/signin/);

    await signInAndGoToHome(page, email, 'password123');
    await expect(page).toHaveURL(/\/home/);
    await expect(page.getByRole('complementary').getByText(email)).toBeVisible();
  });

  test('Sign up link on login page navigates to Create your account', async ({
    page,
  }) => {
    await page.goto('/signin');
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
    await page.getByRole('link', { name: 'Sign up' }).click();
    await expect(page).toHaveURL(/\/signup/);
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
  });

  test('Sign in link on signup page navigates to Sign in to your account', async ({
    page,
  }) => {
    await page.goto('/signup');
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/signin/);
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
  });

  test('unauthenticated user visiting /home redirects to signin', async ({
    page,
  }) => {
    await page.goto('/home');
    await expect(page).toHaveURL(/\/signin/);
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
  });

  test('invalid login shows error toast and stays on signin', async ({
    page,
  }) => {
    await page.goto('/signin');
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
    await page.getByLabel('Email address').fill('nonexistent@test.by');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByRole('status')).toBeVisible();
    await expect(page).toHaveURL(/\/signin/);
  });
});
