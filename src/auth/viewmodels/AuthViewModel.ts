/**
 * Unified Auth ViewModel
 * 
 * This is the single source of truth for all auth-related logic:
 * - Form validation
 * - API coordination
 * - State management
 * - Derived state (computed values)
 * 
 * The View layer (screens) should ONLY interact with this ViewModel,
 * never directly with the Context or API hooks.
 */

import { useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface AuthViewModelState {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthViewModelValidation {
  validateEmail: (email: string) => { isValid: boolean; message?: string };
  validatePassword: (password: string) => { isValid: boolean; message?: string };
  validateName: (name: string) => { isValid: boolean; message?: string };
  validateLoginForm: (email: string, password: string) => ValidationResult;
  validateSignupForm: (
    name: string,
    email: string,
    password: string
  ) => ValidationResult;
}

export interface AuthViewModelActions {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export interface AuthViewModelDerivedState {
  isLoggedIn: boolean;
  canLogin: boolean;
  canSignup: boolean;
}

export interface AuthViewModel
  extends AuthViewModelState,
    AuthViewModelActions,
    AuthViewModelValidation,
    AuthViewModelDerivedState {}

export const useAuthViewModel = (): AuthViewModel => {
  // Global state - single source of truth
  const { state, login: contextLogin, signup: contextSignup, logout: contextLogout } = useAuth();

  // ============ VALIDATION LOGIC ============

  const validateEmail = useCallback((email: string) => {
    if (!email.trim()) {
      return { isValid: false, message: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Invalid email format' };
    }

    return { isValid: true };
  }, []);

  const validatePassword = useCallback((password: string) => {
    if (!password) {
      return { isValid: false, message: 'Password is required' };
    }

    if (password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters' };
    }

    return { isValid: true };
  }, []);

  const validateName = useCallback((name: string) => {
    if (!name.trim()) {
      return { isValid: false, message: 'Name is required' };
    }

    if (name.trim().length < 2) {
      return { isValid: false, message: 'Name must be at least 2 characters' };
    }

    return { isValid: true };
  }, []);

  const validateLoginForm = useCallback(
    (email: string, password: string): ValidationResult => {
      const errors: ValidationError[] = [];

      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        errors.push({ field: 'email', message: emailValidation.message! });
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        errors.push({ field: 'password', message: passwordValidation.message! });
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
    [validateEmail, validatePassword]
  );

  const validateSignupForm = useCallback(
    (name: string, email: string, password: string): ValidationResult => {
      const errors: ValidationError[] = [];

      const nameValidation = validateName(name);
      if (!nameValidation.isValid) {
        errors.push({ field: 'name', message: nameValidation.message! });
      }

      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        errors.push({ field: 'email', message: emailValidation.message! });
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        errors.push({ field: 'password', message: passwordValidation.message! });
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
    [validateName, validateEmail, validatePassword]
  );

  // ============ ACTION LOGIC ============

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        // Delegate to context (Model layer) for API calls and state management
        await contextLogin(email, password);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Login failed';
        throw new Error(errorMessage);
      }
    },
    [validateLoginForm, contextLogin]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        // Delegate to context for API calls and state management
        await contextSignup(name, email, password);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Signup failed';
        throw new Error(errorMessage);
      }
    },
    [contextSignup]
  );

  const logout = useCallback(async () => {
    try {
      // Delegate to context for API calls and state management
      await contextLogout();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      throw new Error(errorMessage);
    }
  }, [contextLogout]);

  // ============ DERIVED STATE (Memoized Selectors) ============

  const isLoggedIn = useMemo(
    () => state.isSignedIn && !!state.user,
    [state.isSignedIn, state.user]
  );

  const canLogin = useMemo(
    () => !state.isLoading,
    [state.isLoading]
  );

  const canSignup = useMemo(
    () => !state.isLoading,
    [state.isLoading]
  );

  const isLoading = useMemo(
    () => state.isLoading,
    [state.isLoading]
  );

  const error = useMemo(
    () => state.error,
    [state.error]
  );

  // ============ RETURN UNIFIED INTERFACE ============

  return {
    // State
    user: state.user,
    isAuthenticated: state.isSignedIn,
    isLoading,
    error,

    // Validation
    validateEmail,
    validatePassword,
    validateName,
    validateLoginForm,
    validateSignupForm,

    // Actions
    login,
    signup,
    logout,

    // Derived State
    isLoggedIn,
    canLogin,
    canSignup,
  };
};
