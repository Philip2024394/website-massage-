/**
 * Production-Safe Logger Utility
 * 
 * ⚠️ DEPRECATED: Use '@/lib/logger.production' instead
 * This file maintained for backward compatibility only
 * 
 * New code should use:
 * import { logger } from '@/lib/logger.production';
 */

export { logger, logger as default } from '../lib/logger.production';
