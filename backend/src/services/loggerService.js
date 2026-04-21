/**
 * Simple structured logger for production readiness.
 * Can be easily extended to use Winston or Pino later.
 */

const formatMessage = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  return JSON.stringify({
    timestamp,
    level,
    message,
    ...meta,
  });
};

export const logger = {
  info: (message, meta = {}) => {
    console.log(formatMessage('INFO', message, meta));
  },
  error: (message, error = null, meta = {}) => {
    const errorMeta = error ? { 
      errorMessage: error.message, 
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    } : {};
    console.error(formatMessage('ERROR', message, { ...meta, ...errorMeta }));
  },
  warn: (message, meta = {}) => {
    console.warn(formatMessage('WARN', message, meta));
  },
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatMessage('DEBUG', message, meta));
    }
  },
};
