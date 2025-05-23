const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Debug API URL on load
console.log('🌐 Auth API Base URL:', API_BASE_URL);

// Types for API responses
export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface ApiError {
  error: string;
  message: string;
  details?: string[];
}

// Get token from localStorage
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

// Set token in localStorage
const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
};

// Remove token from localStorage
const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }
};

// Create headers with authentication
const createHeaders = (includeAuth: boolean = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

// Generic API request function
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
  includeAuth: boolean = true
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...createHeaders(includeAuth),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Check if response is ok
    if (!response.ok) {
      let errorData: ApiError;
      try {
        errorData = await response.json();
      } catch {
        // If JSON parsing fails, create a generic error
        errorData = {
          error: 'Network Error',
          message: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
      throw new Error(errorData.message || 'Request failed');
    }

    // Try to parse JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check your internet connection.');
    }
    
    // Re-throw other errors
    throw error;
  }
};

// Authentication API calls
export const authApi = {
  // Login user
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      false // Don't include auth header for login
    );

    // Store tokens
    setToken(response.accessToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', response.refreshToken);
    }

    return response;
  },

  // Register user
  register: async (email: string, password: string, name?: string): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      },
      false // Don't include auth header for register
    );

    // Store tokens
    setToken(response.accessToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', response.refreshToken);
    }

    return response;
  },

  // Get current user
  getCurrentUser: async (): Promise<{ message: string; user: User }> => {
    return apiRequest<{ message: string; user: User }>('/auth/me');
  },

  // Logout user
  logout: async (): Promise<{ message: string }> => {
    try {
      const response = await apiRequest<{ message: string }>('/auth/logout', {
        method: 'POST',
      });
      
      // Remove tokens regardless of response
      removeToken();
      
      return response;
    } catch (error) {
      // Remove tokens even if logout fails
      removeToken();
      throw error;
    }
  },

  // Refresh token
  refreshToken: async (): Promise<AuthResponse> => {
    const refreshToken = typeof window !== 'undefined' 
      ? localStorage.getItem('refreshToken') 
      : null;

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiRequest<AuthResponse>(
      '/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      },
      false // Don't include auth header for refresh
    );

    // Update stored tokens
    setToken(response.accessToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', response.refreshToken);
    }

    return response;
  },
};

// Health check
export const healthCheck = async (): Promise<{ status: string; timestamp: string; port: number; env: string; uptime: number }> => {
  return apiRequest('/health', { method: 'GET' }, false);
};

// Export utility functions
export { getToken, setToken, removeToken };