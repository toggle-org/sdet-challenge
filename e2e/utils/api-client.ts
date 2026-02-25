import { APIRequestContext, APIResponse } from '@playwright/test';

export const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPassword123!';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResult {
  user: User;
  accessToken: string;
}

export interface Subscription {
  id: string;
  type: 'web' | 'ios' | 'android';
  status: string;
  expiredAt: string;
  createdAt: string;
  updatedAt: string;
  accountId: string;
  planMonths?: number | null;
  priceCents?: number | null;
  paymentCardLast4?: string | null;
}

export interface SubscriptionSummary {
  total: number;
  active: number;
  expired: number;
  expiringSoon: number;
  byType: {
    web: number;
    ios: number;
    android: number;
  };
}

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private request: APIRequestContext;

  constructor(request: APIRequestContext, baseUrl?: string) {
    this.request = request;
    this.baseUrl = baseUrl || process.env.API_BASE_URL || 'http://localhost:3001/api';
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async post<T>(path: string, body: object): Promise<{ data: T; response: APIResponse }> {
    const response = await this.request.post(`${this.baseUrl}${path}`, {
      headers: this.getHeaders(),
      data: body,
    });
    let data: T;
    try {
      data = await response.json();
    } catch {
      data = {} as T;
    }
    return { data, response };
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<{ data: T; response: APIResponse }> {
    const response = await this.request.get(`${this.baseUrl}${path}`, {
      headers: this.getHeaders(),
      params,
    });
    let data: T;
    try {
      data = await response.json();
    } catch {
      data = {} as T;
    }
    return { data, response };
  }

  async patch<T>(path: string, body: object): Promise<{ data: T; response: APIResponse }> {
    const response = await this.request.patch(`${this.baseUrl}${path}`, {
      headers: this.getHeaders(),
      data: body,
    });
    let data: T;
    try {
      data = await response.json();
    } catch {
      data = {} as T;
    }
    return { data, response };
  }

  async delete<T>(path: string): Promise<{ data: T; response: APIResponse }> {
    const response = await this.request.delete(`${this.baseUrl}${path}`, {
      headers: this.getHeaders(),
    });
    let data: T;
    try {
      data = await response.json();
    } catch {
      data = {} as T;
    }
    return { data, response };
  }

  async signUp(email: string, password: string, name: string): Promise<{ data: AuthResult; response: APIResponse }> {
    return this.post<AuthResult>('/auth/signup', { email, password, name });
  }

  async signIn(email: string, password: string): Promise<{ data: AuthResult; response: APIResponse }> {
    return this.post<AuthResult>('/auth/signin', { email, password });
  }

  async getProfile(): Promise<{ data: User; response: APIResponse }> {
    return this.get<User>('/auth/profile');
  }

  async createSubscription(data: {
    type: 'web' | 'ios' | 'android';
    status: string;
    expiredAt: string;
    planMonths?: number;
    priceCents?: number;
    paymentCardLast4?: string;
  }): Promise<{ data: Subscription; response: APIResponse }> {
    return this.post<Subscription>('/subscriptions', data);
  }

  async getSubscriptions(params?: { type?: string; status?: string }): Promise<{ data: Subscription[]; response: APIResponse }> {
    return this.get<Subscription[]>('/subscriptions', params);
  }

  async getSubscriptionSummary(): Promise<{ data: SubscriptionSummary; response: APIResponse }> {
    return this.get<SubscriptionSummary>('/subscriptions/summary');
  }

  async updateSubscription(id: string, data: {
    type?: 'web' | 'ios' | 'android';
    status?: string;
    expiredAt?: string;
  }): Promise<{ data: Subscription; response: APIResponse }> {
    return this.patch<Subscription>(`/subscriptions/${id}`, data);
  }

  async deleteSubscription(id: string): Promise<{ data: { success: boolean }; response: APIResponse }> {
    return this.delete<{ success: boolean }>(`/subscriptions/${id}`);
  }

  async removePaymentMethod(id: string): Promise<{ data: { success: boolean }; response: APIResponse }> {
    return this.delete<{ success: boolean }>(`/subscriptions/${id}/payment-method`);
  }
}

export function generateUniqueEmail(): string {
  const uuid = crypto.randomUUID();
  const timestamp = Date.now();
  return `test-${uuid}-${timestamp}@example.com`;
}

export function generateTestUser() {
  const email = generateUniqueEmail();
  return {
    email,
    password: TEST_PASSWORD,
    name: 'Test User',
  };
}

export function getFutureDate(months: number = 1, years: number = 0): string {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  date.setFullYear(date.getFullYear() + years);
  return date.toISOString();
}
