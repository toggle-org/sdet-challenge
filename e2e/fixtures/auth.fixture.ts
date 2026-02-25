import { test as base, APIRequestContext, Page, Request } from '@playwright/test';
import { ApiClient, AuthResult, generateTestUser, User } from '../utils/api-client';

type AuthFixture = {
  apiClient: ApiClient;
  createAuthenticatedUser: () => Promise<{ user: User; token: string }>;
  loggedInPage: { page: Page; userData: ReturnType<typeof generateTestUser> };
};

export const test = base.extend<AuthFixture>({
  apiClient: async ({ request }, use) => {
    const client = new ApiClient(request);
    await use(client);
  },

  createAuthenticatedUser: async ({ request }, use) => {
    const createUser = async () => {
      const client = new ApiClient(request);
      const userData = generateTestUser();
      const { data, response } = await client.signUp(userData.email, userData.password, userData.name);
      
      if (!response.ok()) {
        throw new Error(`Failed to create user: ${JSON.stringify(data)}`);
      }
      
      return {
        user: data.user,
        token: data.accessToken,
      };
    };
    await use(createUser);
  },

  loggedInPage: async ({ page, request }, use) => {
    const userData = generateTestUser();
    const apiClient = new ApiClient(request);
    await apiClient.signUp(userData.email, userData.password, userData.name);

    await page.goto('/signin');
    await page.getByPlaceholder('Email address').fill(userData.email);
    await page.getByPlaceholder('Password').fill(userData.password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(/\/home/);

    await use({ page, userData });
  },
});

export { expect } from '@playwright/test';
