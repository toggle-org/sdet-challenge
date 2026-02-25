import { test, expect } from '../fixtures/auth.fixture';
import { generateTestUser, generateUniqueEmail } from '../utils/api-client';

test.describe('Authentication API', () => {
  test.describe('POST /auth/signup', () => {
    test('should create a new user account successfully', async ({ apiClient }) => {
      const userData = generateTestUser();
      const { data, response } = await apiClient.signUp(userData.email, userData.password, userData.name);

      expect(response.status()).toBe(201);
      expect(data.accessToken).toBeDefined();
      expect(data.user).toMatchObject({
        email: userData.email,
        name: userData.name,
      });
      expect(data.user.id).toBeDefined();
    });

    test('should return 409 when signing up with existing email', async ({ apiClient }) => {
      const userData = generateTestUser();
      
      await apiClient.signUp(userData.email, userData.password, userData.name);
      
      const { data, response } = await apiClient.signUp(userData.email, userData.password, userData.name);

      expect(response.status()).toBe(409);
      expect(data).toHaveProperty('message');
    });

    test('should return 400 when email is missing', async ({ apiClient }) => {
      const { response } = await apiClient.post('/auth/signup', {
        password: 'TestPassword123!',
        name: 'Test User',
      });

      expect(response.status()).toBe(400);
    });

    test('should return 400 when password is missing', async ({ apiClient }) => {
      const { response } = await apiClient.post('/auth/signup', {
        email: generateUniqueEmail(),
        name: 'Test User',
      });

      expect(response.status()).toBe(400);
    });

    test('should return 400 when name is missing', async ({ apiClient }) => {
      const { response } = await apiClient.post('/auth/signup', {
        email: generateUniqueEmail(),
        password: 'TestPassword123!',
      });

      expect(response.status()).toBe(400);
    });

    test('should return 400 when email format is invalid', async ({ apiClient }) => {
      const { response } = await apiClient.post('/auth/signup', {
        email: 'invalid-email',
        password: 'TestPassword123!',
        name: 'Test User',
      });

      expect(response.status()).toBe(400);
    });
  });

  test.describe('POST /auth/signin', () => {
    test('should sign in with valid credentials', async ({ apiClient }) => {
      const userData = generateTestUser();
      await apiClient.signUp(userData.email, userData.password, userData.name);

      const { data, response } = await apiClient.signIn(userData.email, userData.password);

      expect(response.status()).toBe(201);
      expect(data.accessToken).toBeDefined();
      expect(data.user).toMatchObject({
        email: userData.email,
        name: userData.name,
      });
    });

    test('should return 401 when signing in with wrong password', async ({ apiClient }) => {
      const userData = generateTestUser();
      await apiClient.signUp(userData.email, userData.password, userData.name);

      const { data, response } = await apiClient.signIn(userData.email, 'WrongPassword123!');

      expect(response.status()).toBe(401);
      expect(data).toHaveProperty('message');
    });

    test('should return 401 when signing in with non-existent email', async ({ apiClient }) => {
      const { data, response } = await apiClient.signIn('nonexistent@example.com', 'TestPassword123!');

      expect(response.status()).toBe(401);
      expect(data).toHaveProperty('message');
    });

    test('should return 400 when email is missing', async ({ apiClient }) => {
      const { response } = await apiClient.post('/auth/signin', {
        password: 'TestPassword123!',
      });

      expect(response.status()).toBe(400);
    });

    test('should return 400 when password is missing', async ({ apiClient }) => {
      const { response } = await apiClient.post('/auth/signin', {
        email: generateUniqueEmail(),
      });

      expect(response.status()).toBe(400);
    });
  });

  test.describe('GET /auth/profile', () => {
    test('should return user profile with valid token', async ({ apiClient, request }) => {
      const userData = generateTestUser();
      const { data: signUpData } = await apiClient.signUp(userData.email, userData.password, userData.name);
      
      apiClient.setToken(signUpData.accessToken);

      const { data, response } = await apiClient.getProfile();

      expect(response.status()).toBe(200);
      expect(data).toMatchObject({
        email: userData.email,
        name: userData.name,
      });
    });

    test('should return 401 when accessing profile without token', async ({ apiClient }) => {
      const { response } = await apiClient.getProfile();

      expect(response.status()).toBe(401);
    });

    test('should return 401 when accessing profile with invalid token', async ({ apiClient }) => {
      apiClient.setToken('invalid-token-12345');
      const { response } = await apiClient.getProfile();

      expect(response.status()).toBe(401);
    });

    test('should return 401 when accessing profile with malformed token', async ({ apiClient }) => {
      apiClient.setToken('Bearer malformed');
      const { response } = await apiClient.getProfile();

      expect(response.status()).toBe(401);
    });
  });
});
