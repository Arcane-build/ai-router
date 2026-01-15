/**
 * Authentication Service
 * Handles user authentication, registration, and token management
 */

const API_BASE_URL = '/api';
const TOKEN_KEY = 'auth_token';

export interface User {
  id: string;
  email: string;
  credits: number;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Store authentication token in localStorage
 */
export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Get authentication token from localStorage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Remove authentication token from localStorage
 */
export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Register a new user with email
 */
export async function register(email: string): Promise<{ user: User; token: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result: AuthResponse = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Registration failed');
    }

    // Store token
    setAuthToken(result.data.token);

    return {
      user: result.data.user,
      token: result.data.token,
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(error.message || 'Failed to register');
  }
}

/**
 * Login with email (same as register for MVP)
 */
export async function login(email: string): Promise<{ user: User; token: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result: AuthResponse = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Login failed');
    }

    // Store token
    setAuthToken(result.data.token);

    return {
      user: result.data.user,
      token: result.data.token,
    };
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Failed to login');
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token is invalid, remove it
        removeAuthToken();
        throw new Error('Authentication expired. Please login again.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<{ user: User }> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to get user');
    }

    return result.data.user;
  } catch (error: any) {
    console.error('Get current user error:', error);
    throw new Error(error.message || 'Failed to get current user');
  }
}

/**
 * Get user profile (includes credits)
 */
export async function getUserProfile(): Promise<User> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token is invalid, remove it
        removeAuthToken();
        throw new Error('Authentication expired. Please login again.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<{ user: User }> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to get user profile');
    }

    return result.data.user;
  } catch (error: any) {
    console.error('Get user profile error:', error);
    throw new Error(error.message || 'Failed to get user profile');
  }
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    const token = getAuthToken();
    if (!token) {
      // No token, just clear local storage
      removeAuthToken();
      return;
    }

    // Try to call logout endpoint (optional, since we're clearing token anyway)
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      // Ignore logout endpoint errors, we'll clear token anyway
      console.warn('Logout endpoint error (ignored):', error);
    }

    // Remove token from localStorage
    removeAuthToken();
  } catch (error: any) {
    console.error('Logout error:', error);
    // Even if there's an error, remove the token
    removeAuthToken();
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}
