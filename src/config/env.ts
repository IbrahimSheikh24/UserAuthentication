/**
 * Environment Configuration
 * Centralized configuration for different environments
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * API Configuration
 * Development: Uses local backend or emulator IP
 * Production: Uses deployed backend URL
 */
export const API_CONFIG = {
  // Production API endpoint
  PRODUCTION_URL: 'https://bookmovieticket-eelf.onrender.com/api',
  
  // Development API endpoints
  DEVELOPMENT_URL: 'http://localhost:5001/api',
  
  // For emulator/device testing - replace with your actual IP
  EMULATOR_URL: 'http://192.168.1.100:5001/api',
  
  // Select based on environment
  BASE_URL: isDevelopment 
    ? process.env.EXPO_PUBLIC_API_URL || 'https://bookmovieticket-eelf.onrender.com/api'
    : 'https://bookmovieticket-eelf.onrender.com/api',
};

/**
 * App Configuration
 */
export const APP_CONFIG = {
  DEBUG: isDevelopment,
  // Token storage key
  AUTH_TOKEN_KEY: 'auth_token',
};

export default {
  API_CONFIG,
  APP_CONFIG,
};
