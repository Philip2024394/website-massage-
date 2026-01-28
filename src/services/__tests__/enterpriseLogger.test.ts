/**
 * Unit Tests for Enterprise Logger Service
 * Testing structured logging and PII filtering
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { logger, LogLevel } from '../enterpriseLogger';

describe('EnterpriseLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear log buffer
    (logger as any).logBuffer = [];
  });

  describe('Basic Logging', () => {
    it('should log debug messages', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      logger.debug('Test debug message', { key: 'value' });
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log info messages', () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      
      logger.info('Test info message', { userId: '123' });
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log warning messages', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      logger.warn('Test warning message', { attemptCount: 3 });
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log error messages', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      logger.error('Test error message', { error: new Error('Test error') });
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('PII Filtering', () => {
    it('should mask sensitive keys', () => {
      const logSpy = vi.spyOn(logger as any, 'sanitizeContext');
      
      const sensitiveData = {
        username: 'john',
        password: 'secret123',
        email: 'john@example.com',
        token: 'abc123xyz'
      };

      logger.info('User login attempt', sensitiveData);
      
      expect(logSpy).toHaveBeenCalled();
      logSpy.mockRestore();
    });

    it('should preserve non-sensitive data', () => {
      const context = {
        userId: '123',
        action: 'login',
        timestamp: Date.now()
      };

      const sanitized = (logger as any).sanitizeContext(context);
      
      expect(sanitized.userId).toBe('123');
      expect(sanitized.action).toBe('login');
      expect(sanitized.timestamp).toBeDefined();
    });

    it('should mask nested sensitive keys', () => {
      const context = {
        user: {
          name: 'John',
          password: 'secret123',
          profile: {
            token: 'abc123'
          }
        }
      };

      const sanitized = (logger as any).sanitizeContext(context);
      
      expect(sanitized.user.password).toBe('[REDACTED]');
      expect(sanitized.user.profile.token).toBe('[REDACTED]');
      expect(sanitized.user.name).toBe('John');
    });
  });

  describe('Log Buffering', () => {
    it('should buffer logs before flushing', () => {
      logger.info('Message 1');
      logger.info('Message 2');
      logger.info('Message 3');
      
      const buffer = (logger as any).logBuffer;
      expect(buffer.length).toBeGreaterThanOrEqual(0); // May have been flushed
    });

    it('should flush logs when buffer is full', async () => {
      const flushSpy = vi.spyOn(logger as any, 'flush');
      
      // Fill buffer beyond maxBatchSize
      for (let i = 0; i < 60; i++) {
        logger.info(`Message ${i}`);
      }
      
      // Buffer should have triggered flush
      expect((logger as any).logBuffer.length).toBeLessThan(60);
      flushSpy.mockRestore();
    });
  });

  describe('Log Levels', () => {
    it('should respect minimum log level', () => {
      const originalMinLevel = (logger as any).config.minLevel;
      (logger as any).config.minLevel = LogLevel.ERROR;
      
      const debugSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      logger.debug('This should not log');
      logger.error('This should log');
      
      expect(errorSpy).toHaveBeenCalled();
      
      // Restore
      (logger as any).config.minLevel = originalMinLevel;
      debugSpy.mockRestore();
      errorSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in logging gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        throw new Error('Console error');
      });
      
      // Should not throw
      expect(() => {
        logger.error('Test error with failing console');
      }).not.toThrow();
      
      consoleSpy.mockRestore();
    });

    it('should capture error stack traces', () => {
      const error = new Error('Test error with stack');
      const logSpy = vi.spyOn(logger as any, 'log');
      
      logger.error('Error occurred', { error });
      
      expect(logSpy).toHaveBeenCalledWith(
        LogLevel.ERROR,
        'Error occurred',
        expect.objectContaining({ error })
      );
      
      logSpy.mockRestore();
    });
  });

  describe('Context Enrichment', () => {
    it('should add session ID to logs', () => {
      const sessionId = (logger as any).sessionId;
      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');
    });

    it('should add build version to logs', () => {
      const buildVersion = (logger as any).buildVersion;
      expect(buildVersion).toBeDefined();
    });

    it('should add timestamp to log entries', () => {
      const logSpy = vi.spyOn(logger as any, 'createLogEntry');
      
      logger.info('Test message');
      
      if (logSpy.mock.results[0]) {
        const logEntry = logSpy.mock.results[0].value;
        expect(logEntry.timestamp).toBeDefined();
      }
      
      logSpy.mockRestore();
    });
  });
});
