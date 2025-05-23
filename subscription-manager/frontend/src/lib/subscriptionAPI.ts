import { getToken } from './api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Debug API URL on load
console.log('🌐 Subscription API Base URL:', API_BASE_URL);

// Types for subscription data
export interface Subscription {
  id: string;
  userId: string;
  serviceName: string;
  planType: string;
  cost: number;
  billingCycle: string;
  nextBillingDate: string;
  status: string;
  category: string;
  paymentMethod: string;
  autoRenewal: boolean;
  createdAt: string;
  updatedAt: string;
  transactions: Transaction[];
  _count: {
    transactions: number;
  };
}

export interface Transaction {
  id: string;
  subscriptionId: string;
  amount: number;
  date: string;
  paymentMethod: string;
  status: string;
  receiptUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionsResponse {
  message: string;
  data: Subscription[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AnalyticsData {
  overview: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    inactiveSubscriptions: number;
    monthlyTotal: number;
    yearlyTotal: number;
    totalSpent: number;
  };
  upcomingRenewals: {
    count: number;
    totalCost: number;
    renewals: {
      id: string;
      serviceName: string;
      cost: number;
      nextBillingDate: string;
    }[];
  };
  categoryBreakdown: {
    category: string;
    count: number;
    monthlyTotal: number;
  }[];
}

export interface AnalyticsResponse {
  message: string;
  data: AnalyticsData;
}

export interface CreateSubscriptionData {
  serviceName: string;
  planType: string;
  cost: number;
  billingCycle: string;
  nextBillingDate: string;
  status?: string;
  category: string;
  paymentMethod: string;
  autoRenewal?: boolean;
}

export interface UpdateSubscriptionData extends Partial<CreateSubscriptionData> {}

// Create headers with authentication
const createHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

// Generic API request function for subscriptions
const subscriptionApiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...createHeaders(),
      ...options.headers,
    },
  };

  try {
    console.log('🔍 Making API request to:', url);
    console.log('🔑 Request config:', {
      method: config.method || 'GET',
      hasAuthHeader: !!config.headers?.Authorization,
      origin: window.location.origin
    });
    
    const response = await fetch(url, config);
    
    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error('❌ API Error Response:', errorData);
      } catch (parseError) {
        console.error('❌ Failed to parse error response:', parseError);
        errorData = {
          error: 'Network Error',
          message: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
      throw new Error(errorData.message || 'Request failed');
    }

    const data = await response.json();
    console.log('✅ API Success, data received');
    return data;
  } catch (error) {
    console.error('🚨 API Request Failed:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check your internet connection.');
    }
    throw error;
  }
};

// Subscription API functions
export const subscriptionApi = {
  // Get all subscriptions with optional filtering and pagination
  getSubscriptions: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    billingCycle?: string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
  }): Promise<SubscriptionsResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/subscriptions${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return subscriptionApiRequest<SubscriptionsResponse>(endpoint);
  },

  // Get subscription analytics
  getAnalytics: async (): Promise<AnalyticsResponse> => {
    return subscriptionApiRequest<AnalyticsResponse>('/subscriptions/analytics');
  },

  // Get specific subscription by ID
  getSubscription: async (id: string): Promise<{ message: string; data: Subscription }> => {
    return subscriptionApiRequest<{ message: string; data: Subscription }>(`/subscriptions/${id}`);
  },

  // Create new subscription
  createSubscription: async (data: CreateSubscriptionData): Promise<{ message: string; data: Subscription }> => {
    return subscriptionApiRequest<{ message: string; data: Subscription }>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update subscription
  updateSubscription: async (id: string, data: UpdateSubscriptionData): Promise<{ message: string; data: Subscription }> => {
    return subscriptionApiRequest<{ message: string; data: Subscription }>(`/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete subscription
  deleteSubscription: async (id: string): Promise<{ message: string }> => {
    return subscriptionApiRequest<{ message: string }>(`/subscriptions/${id}`, {
      method: 'DELETE',
    });
  },
};

// Utility functions
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'text-success-600 bg-success-50';
    case 'inactive':
      return 'text-secondary-600 bg-secondary-50';
    case 'cancelled':
      return 'text-danger-600 bg-danger-50';
    case 'expired':
      return 'text-warning-600 bg-warning-50';
    default:
      return 'text-secondary-600 bg-secondary-50';
  }
};

export const getBillingCycleDisplay = (cycle: string): string => {
  switch (cycle.toLowerCase()) {
    case 'daily':
      return 'Daily';
    case 'weekly':
      return 'Weekly';
    case 'monthly':
      return 'Monthly';
    case 'quarterly':
      return 'Quarterly';
    case 'yearly':
      return 'Yearly';
    default:
      return cycle;
  }
};

export const getDaysUntilRenewal = (nextBillingDate: string): number => {
  const now = new Date();
  const renewal = new Date(nextBillingDate);
  const diffTime = renewal.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getRenewalUrgencyColor = (daysUntil: number): string => {
  if (daysUntil < 0) return 'text-danger-600 bg-danger-50'; // Overdue
  if (daysUntil <= 3) return 'text-danger-600 bg-danger-50'; // Due soon
  if (daysUntil <= 7) return 'text-warning-600 bg-warning-50'; // Due this week
  if (daysUntil <= 30) return 'text-primary-600 bg-primary-50'; // Due this month
  return 'text-secondary-600 bg-secondary-50'; // Future
};