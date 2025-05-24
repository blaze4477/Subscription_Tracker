import { create } from 'zustand';
import { authApi, type User } from '@/lib/api';
import * as gtag from '@/lib/gtag';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ message: string }>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Login function
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authApi.login(email, password);
      
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Track successful login
      gtag.event({
        action: 'login',
        category: 'engagement',
        label: 'email',
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      });
      throw error;
    }
  },

  // Register function
  register: async (email: string, password: string, name?: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authApi.register(email, password, name);
      
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Track successful registration
      gtag.event({
        action: 'sign_up',
        category: 'engagement',
        label: 'email',
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      });
      throw error;
    }
  },

  // Logout function
  logout: async () => {
    set({ isLoading: true, error: null });

    try {
      await authApi.logout();
    } catch (error) {
      // Log error but still clear state
      console.error('Logout error:', error);
    }

    // Always clear state after logout attempt
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  // Get current user
  getCurrentUser: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await authApi.getCurrentUser();
      
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to get user',
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authApi.changePassword(currentPassword, newPassword);
      
      set({
        isLoading: false,
        error: null,
      });

      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to change password',
      });
      throw error;
    }
  },

  // Initialize auth state (check for existing token)
  initialize: async () => {
    console.log('🔄 Auth: Initializing...');
    
    // Only run on client side
    if (typeof window === 'undefined') {
      console.log('🔄 Auth: Server side, skipping');
      return;
    }

    const token = localStorage.getItem('authToken');
    console.log('🔑 Auth: Token check:', {
      hasToken: !!token,
      tokenLength: token?.length || 0
    });
    
    if (!token) {
      console.log('❌ Auth: No token found');
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      return;
    }

    // Try to get current user with existing token
    try {
      console.log('🔍 Auth: Getting current user...');
      await get().getCurrentUser();
      console.log('✅ Auth: User authenticated successfully');
    } catch (error) {
      console.log('❌ Auth: Failed to get user, trying refresh...', error);
      // Token might be expired, try to refresh
      try {
        await authApi.refreshToken();
        await get().getCurrentUser();
        console.log('✅ Auth: Token refreshed successfully');
      } catch {
        console.log('❌ Auth: Refresh failed, clearing state');
        // Refresh failed, clear auth state
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        
        // Clear stored tokens
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
      }
    }
  },
}));