import { create } from 'zustand';
import { api } from '@/lib/api';

interface User {
  id: string;
  name: string;
  lastName?: string;
  email: string;
  phone?: string;
  phoneVerified?: boolean;
  role: string;
  street?: string;
  city?: string;
  state?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  postalCode?: string;
  avatar?: string;
  isActive?: boolean;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isCheckingAuth: boolean;
  authRetryCount: number;
  login: (phone: string, password: string) => Promise<{ user: User; token: string }>;
  register: (userData: any) => Promise<{ user: User; token: string }>;
  sendSmsCode: (userData: any) => Promise<void>;
  verifySmsCode: (phone: string, code: string) => Promise<{ user: User; token: string }>;
  resendSmsCode: (phone: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isCheckingAuth: false,
  authRetryCount: 0,

  login: async (phone: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await api.login(phone, password);
      // Handle both 'token' (mock) and 'accessToken' (real backend) formats
      const token = response.token || response.accessToken;
      const user = response.user;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        // Also store refresh token if provided
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
      }
      set({ user, token, isLoading: false, authRetryCount: 0 });
      
      return { user, token };
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (userData: any) => {
    set({ isLoading: true });
    try {
      const response = await api.register(userData);
      // Handle both 'token' (mock) and 'accessToken' (real backend) formats
      const token = response.token || response.accessToken;
      const user = response.user;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        // Also store refresh token if provided
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
      }
      set({ user, token, isLoading: false, authRetryCount: 0 });
      
      return { user, token };
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  sendSmsCode: async (userData: any) => {
    set({ isLoading: true });
    try {
      await api.sendSmsCode(userData);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  verifySmsCode: async (phone: string, code: string) => {
    set({ isLoading: true });
    try {
      const response = await api.verifySmsCode(phone, code);
      // Handle both 'token' (mock) and 'accessToken' (real backend) formats
      const token = response.token || response.accessToken;
      const user = response.user;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        // Also store refresh token if provided
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
      }
      set({ user, token, isLoading: false, authRetryCount: 0 });
      
      return { user, token };
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  resendSmsCode: async (phone: string) => {
    set({ isLoading: true });
    try {
      await api.resendSmsCode(phone);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
    set({ user: null, token: null, authRetryCount: 0 });
  },

  checkAuth: async () => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isCheckingAuth: false, authRetryCount: 0 });
      return;
    }

    set({ isCheckingAuth: true });

    try {
      const response = await api.getProfile();
      set({ user: response.user, token, isCheckingAuth: false, authRetryCount: 0 });
    } catch (error) {
      const currentRetry = get().authRetryCount;
      const nextRetry = Math.min(currentRetry + 1, 3);

      // Silently handle auth check failures
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('ایمیل یا رمز عبور اشتباه است')) {
          // Clear invalid token silently
          localStorage.removeItem('token');
          set({ user: null, token: null });
        }
        // Don't log network errors during auth check
        else if (!error.message.includes('خطا در اتصال به اینترنت')) {
          console.log('Auth check failed:', error.message);
        }
      }
      set({ isCheckingAuth: false, authRetryCount: nextRetry });
      return;
    }

    set({ isCheckingAuth: false });
  },
}));