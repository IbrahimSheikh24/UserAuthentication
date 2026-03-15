/**
 * Auth API Hooks - Stateless API Wrapper Layer
 * 
 * These are pure functions that only make API calls.
 * NO state management here - all state lives in AuthContext.
 * This layer communicates between Context and backend API.
 */

import { apiCall, getStoredAuthToken, setAuthToken } from '@/utils/api';
import { useCallback } from 'react';
import { User } from '../models/User';

export interface LoginResponse {
  user: User;
  token: string;
}

export interface SignupResponse {
  message: string;
}

/**
 * Hook for login API call - Stateless wrapper
 */
export const useLoginAPI = () => {
  const login = useCallback(
    async (email: string, password: string): Promise<LoginResponse> => {
      const response = await apiCall<LoginResponse>('/user/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // Store token in secure storage
      await setAuthToken(response.token);
      return response;
    },
    []
  );

  return { login };
};

/**
 * Hook for signup API call - Stateless wrapper
 */
export const useSignupAPI = () => {
  const signup = useCallback(
    async (
      name: string,
      email: string,
      password: string
    ): Promise<SignupResponse> => {
      const response = await apiCall<SignupResponse>('/user/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      // Don't set token - user must login after signup
      return response;
    },
    []
  );

  return { signup };
};

/**
 * Hook for logout API call - Stateless wrapper
 */
export const useLogoutAPI = () => {
  const logout = useCallback(async (): Promise<void> => {
    try {
      const token = await getStoredAuthToken();
      await apiCall<void>('/user/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      // Log error but don't throw - we'll clear token anyway
      console.error('Logout API error:', err);
    } finally {
      // Always clear token from storage, even if API call fails
      await setAuthToken(null);
    }
  }, []);

  return { logout };
};

/**
 * Hook for verifying authentication token - Stateless wrapper
 */
export const useGetUserByTokenAPI = () => {
  const getUserByToken = useCallback(async (token: string): Promise<User | null> => {
    try {
      const user = await apiCall<User>('/user/getUserByToken', {
        method: 'GET',
        headers: {
          jwttoken: token,
        },
      });
      return user;
    } catch (err) {
      throw err;
    }
  }, []);

  return { getUserByToken };
};
