import { test, expect } from '../fixtures/auth.fixture';
import { generateTestUser, ApiClient } from '../utils/api-client';

test.describe('Authentication UI', () => {
  test.describe('Sign Up', () => {
    test('should sign up successfully with valid data', async ({ page }) => {
      const userData = generateTestUser();

      await page.goto('/signup');

      await page.getByPlaceholder('Full name').fill(userData.name);
      await page.getByPlaceholder('Email address').fill(userData.email);
      await page.getByPlaceholder('Password').fill(userData.password);

      await page.getByRole('button', { name: 'Sign up' }).click();

      await expect(page).toHaveURL(/\/home/);
      await expect(page.getByRole('heading', { name: 'Account', exact: true })).toBeVisible();
    });

    test('should show error for duplicate email', async ({ page, request }) => {
      const userData = generateTestUser();

      const apiClient = new ApiClient(request);
      await apiClient.signUp(userData.email, userData.password, userData.name);

      await page.goto('/signup');

      await page.getByPlaceholder('Full name').fill(userData.name);
      await page.getByPlaceholder('Email address').fill(userData.email);
      await page.getByPlaceholder('Password').fill(userData.password);

      await page.getByRole('button', { name: 'Sign up' }).click();

      await expect(page.getByText('already exists')).toBeVisible();
      await expect(page).toHaveURL(/\/signup/);
    });

    test('should prevent form submission with invalid email format', async ({ page }) => {
      await page.goto('/signup');

      await page.getByPlaceholder('Full name').fill('Test User');
      await page.getByPlaceholder('Email address').fill('invalid-email');
      await page.getByPlaceholder('Password').fill('TestPassword123!');

      await page.getByRole('button', { name: 'Sign up' }).click();

      await expect(page).toHaveURL(/\/signup/);
    });

    test('should show validation error for short password', async ({ page }) => {
      await page.goto('/signup');

      await page.getByPlaceholder('Full name').fill('Test User');
      await page.getByPlaceholder('Email address').fill('test@example.com');
      await page.getByPlaceholder('Password').fill('123');

      await page.getByRole('button', { name: 'Sign up' }).click();

      await expect(page.getByText('at least 6 characters')).toBeVisible();
    });

    test('should show validation error for missing name', async ({ page }) => {
      await page.goto('/signup');

      await page.getByPlaceholder('Email address').fill('test@example.com');
      await page.getByPlaceholder('Password').fill('TestPassword123!');

      await page.getByRole('button', { name: 'Sign up' }).click();

      await expect(page.getByText('Name is required')).toBeVisible();
    });

    test('should navigate to sign in page', async ({ page }) => {
      await page.goto('/signup');

      await page.getByRole('link', { name: 'Sign in' }).click();

      await expect(page).toHaveURL(/\/signin/);
      await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    });
  });

  test.describe('Sign In', () => {
    test('should sign in successfully with valid credentials', async ({ loggedInPage }) => {
      const { page } = loggedInPage;
      await expect(page).toHaveURL(/\/home/);
      await expect(page.getByRole('heading', { name: 'Account', exact: true })).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/signin');

      await page.getByPlaceholder('Email address').fill('nonexistent@example.com');
      await page.getByPlaceholder('Password').fill('WrongPassword123!');

      await page.getByRole('button', { name: 'Sign in' }).click();

      await expect(page.getByText('Invalid credentials')).toBeVisible();
    });

    test('should show validation error for missing email', async ({ page }) => {
      await page.goto('/signin');

      await page.getByPlaceholder('Password').fill('TestPassword123!');

      await page.getByRole('button', { name: 'Sign in' }).click();

      await expect(page.getByText('Email is required')).toBeVisible();
    });

    test('should show validation error for missing password', async ({ page }) => {
      await page.goto('/signin');

      await page.getByPlaceholder('Email address').fill('test@example.com');

      await page.getByRole('button', { name: 'Sign in' }).click();

      await expect(page.getByText('Password is required')).toBeVisible();
    });

    test('should navigate to sign up page', async ({ page }) => {
      await page.goto('/signin');

      await page.getByRole('link', { name: 'Sign up' }).click();

      await expect(page).toHaveURL(/\/signup/);
      await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
    });
  });

  test.describe('Sign Out', () => {
    test('should sign out successfully', async ({ loggedInPage }) => {
      const { page } = loggedInPage;
      await expect(page).toHaveURL(/\/home/);

      await page.getByRole('button', { name: 'Sign Out' }).click();

      await expect(page).toHaveURL(/\/signin/);
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to sign in when accessing home without auth', async ({ page }) => {
      await page.goto('/home');

      await expect(page).toHaveURL(/\/signin/);
    });
  });
});
