import { create } from 'zustand';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isCheckingAuth: boolean;
  authRetryCount: number;
  login: (email: string, password: string) => Promise<{ user: User; accessToken: string }>;
  register: (userData: any) => Promise<{ user: User; accessToken: string }>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  isCheckingAuth: false,
  authRetryCount: 0,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await api.login(email, password);
      const { accessToken, refreshToken, user } = response;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      }
      set({ user, token: accessToken, refreshToken, isLoading: false });
      
      return { user, accessToken };
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (userData: any) => {
    set({ isLoading: true });
    try {
      const response = await api.register(userData);
      const { accessToken, refreshToken, user } = response;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      }
      set({ user, token: accessToken, refreshToken, isLoading: false });
      
      return { user, accessToken };
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    const state = get();
    
    // Call logout API if refresh token exists
    if (state.refreshToken) {
      api.logout(state.refreshToken).catch(console.error);
    }
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
    set({ user: null, token: null, refreshToken: null });
  },

  checkAuth: async () => {
    if (typeof window === 'undefined') return;
    
    const state = get();
    
    // Prevent multiple simultaneous auth checks
    if (state.isCheckingAuth) return;
    
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!token && !refreshToken) return;

    set({ isCheckingAuth: true, token, refreshToken });

    try {
      const response = await api.getProfile();
      set({ user: response.user, isCheckingAuth: false, authRetryCount: 0 }); // Reset retry count on success
    } catch (error) {
      set({ isCheckingAuth: false });
      
      if (error instanceof Error) {
        // Network/connection errors
        if (error.message.includes('خطا در اتصال')) {
          const retryCount = state.authRetryCount + 1;
          set({ authRetryCount: retryCount });
          
          // Retry up to 3 times with exponential backoff
          if (retryCount <= 3) {
            console.warn(`Network error during auth check, retry ${retryCount}/3`);
            if (retryCount === 1) {
              toast.warning('مشکل در اتصال به سرور. در حال تلاش مجدد...');
            }
            setTimeout(() => {
              get().checkAuth();
            }, Math.pow(2, retryCount) * 1000); // 2s, 4s, 8s
            return;
          } else {
            console.error('Max auth retries reached, giving up');
            toast.error('عدم امکان اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید');
            set({ authRetryCount: 0 });
          }
        }
        
        // Token expired - try refresh
        if (error.message.includes('401') && refreshToken) {
          try {
            const refreshed = await get().refreshAccessToken();
            if (refreshed) {
              // Retry with new token
              const response = await api.getProfile();
              set({ user: response.user });
              return;
            }
          } catch (refreshError) {
            console.warn('Token refresh failed:', refreshError);
          }
        }
        
        // Invalid/expired tokens - logout and redirect
        if (error.message.includes('401') || error.message.includes('403') || error.message.includes('ایمیل یا رمز عبور اشتباه است')) {
          console.info('Authentication expired, logging out');
          get().logout();
          
          // Redirect to login page
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            if (currentPath.startsWith('/admin')) {
              toast.error('جلسه شما منقضی شده است. لطفاً مجدداً وارد شوید');
              window.location.href = '/auth/login?redirect=' + encodeURIComponent(currentPath);
            } else if (currentPath.startsWith('/profile')) {
              toast.error('جلسه شما منقضی شده است. لطفاً مجدداً وارد شوید');
              window.location.href = '/auth/login?redirect=' + encodeURIComponent(currentPath);
            }
          }
          return;
        }
        
        // Other server errors
        console.error('Auth check failed:', error.message);
      }
      
      // Clear invalid tokens for unknown errors
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
      set({ user: null, token: null, refreshToken: null });
    }
  },

  refreshAccessToken: async () => {
    const state = get();
    const storedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    const refreshToken = state.refreshToken || storedRefreshToken;
    
    if (!refreshToken) return false;
    
    try {
      const response = await api.refreshToken(refreshToken);
      const { accessToken, user } = response;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', accessToken);
      }
      set({ user, token: accessToken });
      
      return true;
    } catch (error) {
      console.info('Refresh token expired or invalid');
      
      // Refresh token expired, logout user and redirect if needed
      get().logout();
      
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/admin') || currentPath.startsWith('/profile')) {
          toast.info('جلسه شما منقضی شده است. لطفاً مجدداً وارد شوید');
          setTimeout(() => {
            window.location.href = '/auth/login?redirect=' + encodeURIComponent(currentPath);
          }, 1500);
        }
      }
      
      return false;
    }
  },
}));