import { config } from './config';

// API utilities for the client
interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
}

export async function apiRequest(endpoint: string, options: ApiRequestOptions = {}): Promise<any> {
  const { method = 'GET', body, headers = {} } = options;
  
  // Construct full URL using base URL from config
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${config.apiBaseUrl}${endpoint}`;
  
  const requestConfig: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    // Important: Include credentials for cross-origin requests
    credentials: 'include',
  };

  if (body && method !== 'GET') {
    requestConfig.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, requestConfig);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API Request failed:', { url, method, error });
    throw error;
  }
}

// Payment API helpers
export const paymentApi = {
  getPlans: () => apiRequest('/api/payments/plans'),
  
  createCustomer: (email: string, name: string) =>
    apiRequest('/api/payments/customers', {
      method: 'POST',
      body: { email, name },
    }),
  
  createCheckoutSession: (customerId: string, planIds: string | string[]) =>
    apiRequest('/api/payments/checkout', {
      method: 'POST',
      body: { customerId, planIds: Array.isArray(planIds) ? planIds : [planIds] },
    }),
  
  createBillingPortal: (customerId: string) =>
    apiRequest('/api/payments/billing-portal', {
      method: 'POST',
      body: { customerId },
    }),
};

// Content API helpers
export const contentApi = {
  getLessons: (filters?: { subject?: string; keyStage?: string; difficulty?: string }) =>
    apiRequest('/api/content/lessons' + (filters ? '?' + new URLSearchParams(filters as any).toString() : '')),
  
  getBlogPosts: (limit = 10) =>
    apiRequest(`/api/content/blog?limit=${limit}`),
  
  getFAQs: (category?: string) =>
    apiRequest('/api/content/faq' + (category ? `?category=${category}` : '')),
  
  subscribeToNewsletter: (email: string, firstName: string, lastName?: string, role = 'Student') =>
    apiRequest('/api/content/newsletter/subscribe', {
      method: 'POST',
      body: { email, firstName, lastName, role },
    }),
  
  updateNewsletterPreferences: (email: string, preferences: Record<string, boolean>) =>
    apiRequest('/api/content/newsletter/preferences', {
      method: 'PUT',
      body: { email, preferences },
    }),
};

// Auth API helpers (since you have auth routes)
export const authApi = {
  register: (userData: any) =>
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: userData,
    }),
  
  childLogin: (username: string, password: string) =>
    apiRequest('/api/auth/child-login', {
      method: 'POST',
      body: { username, password },
    }),
  
  logout: () =>
    apiRequest('/api/auth/logout', {
      method: 'POST',
    }),
};
