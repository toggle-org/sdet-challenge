import { expect, Page } from '@playwright/test';

const HOME_READY_TIMEOUT = 15000;
/** Пароль минимум 6 символов (валидация на форме) */
const DEFAULT_PASSWORD = 'password123';

/** Валидный email по шаблону (типа testio@test.by) */
export function validEmail(prefix = 'e2e'): string {
  return `${prefix}-${Date.now()}@test.by`;
}

/**
 * Проверяем страницу Account по названиям элементов: заголовок Account, кнопка Sign Out, текст Signed in as.
 */
export async function expectHomePageReady(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/home/, { timeout: HOME_READY_TIMEOUT });
  await expect(page.getByRole('heading', { name: 'Account', exact: true })).toBeVisible({
    timeout: HOME_READY_TIMEOUT,
  });
  await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible({
    timeout: HOME_READY_TIMEOUT,
  });
  await expect(page.getByText('Signed in as', { exact: false })).toBeVisible({
    timeout: HOME_READY_TIMEOUT,
  });
}

/** Регистрация: по названиям полей на странице "Create your account" — Full Name, Email address, Password */
export async function signUpAndGoToHome(
  page: Page,
  opts: { email: string; name?: string; password?: string }
): Promise<void> {
  const { email, name = 'E2E User', password = DEFAULT_PASSWORD } = opts;
  await page.goto('/signup');
  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
  await page.getByLabel('Full Name').fill(name);
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password').fill(password);

  const signUpButton = page.getByRole('button', { name: /sign up|creating account/i });
  const [response] = await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().includes('/auth/signup') &&
        resp.request().method() === 'POST',
      { timeout: HOME_READY_TIMEOUT }
    ),
    signUpButton.click(),
  ]);
  if (!response.ok()) {
    const body = await response.text();
    throw new Error(`Signup failed: ${response.status()} ${body}`);
  }
  await expectHomePageReady(page);
}

/** Вход: по названиям полей на странице "Sign in to your account" — Email address, Password */
export async function signInAndGoToHome(
  page: Page,
  email: string,
  password: string = DEFAULT_PASSWORD
): Promise<void> {
  await page.goto('/signin');
  await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in|signing in/i }).click();
  await expectHomePageReady(page);
}
