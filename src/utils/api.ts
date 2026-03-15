/**
 * API Configuration and Fetch Utility
 * Centralized API calls with error handling and logging
 */

import { API_CONFIG, APP_CONFIG } from '@/config/env';
import * as SecureStore from 'expo-secure-store';
import { logger } from './logger';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
  error?: string;
}

/**
 * Generic fetch wrapper with error handling and logging
 */
export const apiCall = async <T,>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const method = options.method || 'GET';

  try {
    logger.apiCall(method, endpoint);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    logger.apiCall(method, endpoint, response.status);

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.message || `API Error: ${response.status}`;
      logger.apiError(endpoint, errorMessage);
      throw new Error(errorMessage);
    }

    const data: ApiResponse<T> = await response.json();
    return data.data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.apiError(endpoint, errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Store token in secure storage
 */
export const setAuthToken = async (token: string | null) => {
  try {
    if (token) {
      await SecureStore.setItemAsync(APP_CONFIG.AUTH_TOKEN_KEY, token);
      logger.debug('Auth', 'Token stored successfully');
    } else {
      await SecureStore.deleteItemAsync(APP_CONFIG.AUTH_TOKEN_KEY);
      logger.debug('Auth', 'Token cleared');
    }
  } catch (error) {
    logger.error('Auth', 'Error storing token', error);
  }
};

/**
 * Retrieve token from secure storage
 */
export const getStoredAuthToken = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync(APP_CONFIG.AUTH_TOKEN_KEY);
    if (token) {
      logger.debug('Auth', 'Token retrieved from storage');
    }
    return token;
  } catch (error) {
    logger.error('Auth', 'Error retrieving token', error);
    return null;
  }
};
