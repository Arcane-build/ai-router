import { useState, useEffect, useCallback } from 'react';
import { 
  login as loginService, 
  register as registerService, 
  logout as logoutService, 
  getCurrentUser,
  getUserProfile,
  isAuthenticated as checkIsAuthenticated,
  type User 
} from '@/services/auth';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string) => Promise<void>;
  register: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

/**
 * Custom hook for authentication
 * Manages user state and provides auth functions
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  /**
   * Refresh user data from server
   */
  const refreshUser = useCallback(async () => {
    try {
      const userData = await getUserProfile();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, clear user state
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  /**
   * Check authentication status on mount
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (checkIsAuthenticated()) {
          // Token exists, try to get user
          const userData = await getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error: any) {
        console.error('Auth check failed:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Login function
   */
  const login = useCallback(async (email: string) => {
    try {
      setLoading(true);
      const result = await loginService(email);
      setUser(result.user);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Login failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Register function
   */
  const register = useCallback(async (email: string) => {
    try {
      setLoading(true);
      const result = await registerService(email);
      setUser(result.user);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Registration failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await logoutService();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error: any) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear local state
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };
}
