/**
 * Logger Utility
 * Centralized logging for development and production
 */

import { APP_CONFIG } from '@/config/env';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

class Logger {
  private isDevelopment = APP_CONFIG.DEBUG;

  private formatMessage(level: LogLevel, tag: string, message: string) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${tag}] ${message}`;
  }

  private getColorForLevel(level: LogLevel): string {
    switch (level) {
      case 'error':
        return colors.red;
      case 'warn':
        return colors.yellow;
      case 'debug':
        return colors.blue;
      case 'info':
      default:
        return colors.cyan;
    }
  }

  log(tag: string, message: string, data?: any) {
    if (!this.isDevelopment) return;
    const formatted = this.formatMessage('info', tag, message);
    console.log(`${this.getColorForLevel('info')}${formatted}${colors.reset}`, data || '');
  }

  debug(tag: string, message: string, data?: any) {
    if (!this.isDevelopment) return;
    const formatted = this.formatMessage('debug', tag, message);
    console.debug(`${this.getColorForLevel('debug')}${formatted}${colors.reset}`, data || '');
  }

  warn(tag: string, message: string, data?: any) {
    const formatted = this.formatMessage('warn', tag, message);
    console.warn(`${this.getColorForLevel('warn')}${formatted}${colors.reset}`, data || '');
  }

  error(tag: string, message: string, error?: any) {
    const formatted = this.formatMessage('error', tag, message);
    console.error(`${this.getColorForLevel('error')}${formatted}${colors.reset}`);
    if (error) {
      console.error(error);
    }
  }

  // Advanced logging for API calls
  apiCall(method: string, endpoint: string, status?: number) {
    if (!this.isDevelopment) return;
    const message = status 
      ? `${method} ${endpoint} → ${status}` 
      : `${method} ${endpoint}`;
    this.log('API', message);
  }

  apiError(endpoint: string, error: any) {
    this.error('API_ERROR', `${endpoint}`, error);
  }
}

export const logger = new Logger();
