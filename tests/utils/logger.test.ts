import { describe, it, expect } from 'vitest';
import { logger } from '../../utils/logger';

describe('Logger Utility', () => {
  it('should expose log methods', () => {
    expect(logger).toBeDefined();
    expect(typeof logger.log).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  it('should not throw errors when calling log methods', () => {
    expect(() => logger.log('test')).not.toThrow();
    expect(() => logger.error('test')).not.toThrow();
    expect(() => logger.warn('test')).not.toThrow();
    expect(() => logger.info('test')).not.toThrow();
    expect(() => logger.debug('test')).not.toThrow();
  });

  it('should handle multiple arguments', () => {
    expect(() => logger.log('message', { data: 'test' }, 123)).not.toThrow();
  });

  it('should provide grouping methods', () => {
    expect(typeof logger.group).toBe('function');
    expect(typeof logger.groupEnd).toBe('function');
    expect(() => {
      logger.group('Test Group');
      logger.log('Inside group');
      logger.groupEnd();
    }).not.toThrow();
  });

  it('should provide time measurement methods', () => {
    expect(typeof logger.time).toBe('function');
    expect(typeof logger.timeEnd).toBe('function');
    expect(() => {
      logger.time('test-timer');
      logger.timeEnd('test-timer');
    }).not.toThrow();
  });
});
