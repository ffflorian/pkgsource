import {describe, expect, it} from 'vitest';

import {formatDate, getLogger, validateUrl} from '../src/utils.js';

describe('utils', () => {
  it('formats date in expected yyyy-MM-dd HH:mm:ss shape', () => {
    expect(formatDate()).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  it('creates logger methods without throwing', () => {
    const logger = getLogger('test');

    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.log).toBe('function');

    logger.debug('debug message');
    logger.info('info message');
    logger.warn('warn message');
    logger.error('error message');
    logger.log('log message');
  });

  it('validates URLs', () => {
    expect(validateUrl('https://example.com/path')?.hostname).toBe('example.com');
    expect(validateUrl('not a valid url')).toBeNull();
  });
});
