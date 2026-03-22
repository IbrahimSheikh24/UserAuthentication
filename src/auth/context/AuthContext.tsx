import React, { createContext, useCallback, useEffect, useState } from 'react';
import { getStoredAuthToken, setAuthToken } from '@/utils/api';
import * as SecureStore from 'expo-secure-store';

import { useGetUserByTokenAPI, useLoginAPI, useLogoutAPI, useSignupAPI } from '../hooks/useAuthAPI';
import { AuthContextType, AuthState } from '../models/AuthState';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  isBootstrapping: true,  // Initially true - will be set to false after bootstrap
  isLoading: true,
  isSignedIn: false,
  user: null,
  error: null,
  successMessage: ''
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const signupApi = useSignupAPI();
  const loginApi = useLoginAPI();
  const logoutApi = useLogoutAPI();
  const tokenAPi = useGetUserByTokenAPI();

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Check if token exists in secure storage
        const token = await getStoredAuthToken();
        if (!token) {
          // No token, user not logged in
          setState({
            isBootstrapping: false,  // Bootstrap complete
            isLoading: false,
            isSignedIn: false,
            user: null,
            error: null,
            successMessage: ''
          });
          return;
        }
        // Token exists - fetch user info to verify and hydrate state
        try {
          const response = await tokenAPi.getUserByToken(token);
          setState({
            isBootstrapping: false,  // Bootstrap complete
            isLoading: false,
            isSignedIn: true,
            user: response,
            error: null,
            successMessage: '',
          });
        } catch (apiError) {
          // Token invalid or expired
          await SecureStore.deleteItemAsync('auth_token');
          setState({
            isBootstrapping: false,  // Bootstrap complete
            isLoading: false,
            isSignedIn: false,
            user: null,
            error: 'Session expired. Please login again.',
            successMessage: '',
          });
        }
      } catch (error) {
        console.error('Error bootstrapping auth:', error);
        try {
          await SecureStore.deleteItemAsync('auth_token');
        } catch (e) {
          // Ignore deletion errors
        }
        setState({
          isBootstrapping: false,  // Bootstrap complete
          isLoading: false,
          isSignedIn: false,
          user: null,
          error: 'Session expired. Please login again.',
          successMessage: '',
        });
      }
    };
    bootstrapAsync();
  }, [tokenAPi]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await loginApi.login(email, password);
      // loginApi.login already calls setAuthToken internally
      setState({
        isBootstrapping: false,
        isLoading: false,
        isSignedIn: true,
        user: response.user,
        error: null,
        successMessage: ''
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setState({
        isBootstrapping: false,
        isLoading: false,
        isSignedIn: false,
        user: null,
        error: errorMessage,
        successMessage: ''
      });
      throw error;
    }
  }, [loginApi]);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      await signupApi.signup(name, email, password);
      setState({
        isBootstrapping: false,
        isLoading: false,
        isSignedIn: false,
        user: null,
        error: null,
        successMessage: "Account created! Please login with your credentials",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      setState({
        isBootstrapping: false,
        isLoading: false,
        isSignedIn: false,
        user: null,
        error: errorMessage,
        successMessage: ''
      });
      throw error;
    }
  }, [signupApi]);

  const logout = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      await setAuthToken(null);
      setState({
        isBootstrapping: false,
        isLoading: false,
        isSignedIn: false,
        user: null,
        error: null,
        successMessage: 'User logged out successfully',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      setState((prev) => ({
        ...prev,
        isBootstrapping: false,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [logoutApi]);

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  const value: AuthContextType = {
    state,
    login,
    signup,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
