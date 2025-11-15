/**
 * Logger Estructurado - Winston
 * 
 * REGLA DE ORO #3: SIEMPRE usar logger estructurado, NUNCA console.log
 * 
 * Niveles disponibles: debug, info, warn, error
 * Incluye contexto estructurado: timestamp, requestId, userId, stack trace
 * CloudWatch Logs filtrable por nivel y contexto
 */

import winston from 'winston';

// Determinar nivel de log desde variable de entorno
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Formato JSON para CloudWatch
const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Formato simple para desarrollo
const simpleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

/**
 * Logger compartido - Singleton
 * Evita múltiples instancias de logger
 */
const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: jsonFormat,
  defaultMeta: { service: process.env.SERVICE_NAME || 'express-service' },
  transports: [
    // Errors a archivo separado
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Todos los logs a archivo combinado
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 10
    })
  ]
});

// En desarrollo, mostrar también en consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: simpleFormat
    })
  );
}

/**
 * Logger con contexto estructurado
 * 
 * Uso:
 *   logger.info('User created', { userId: '123', email: 'user@example.com' })
 *   logger.error('Database error', { error: error.message, stack: error.stack })
 */
export const loggerWithContext = {
  debug: (message: string, meta?: Record<string, any>) => {
    logger.debug(message, meta);
  },
  
  info: (message: string, meta?: Record<string, any>) => {
    logger.info(message, meta);
  },
  
  warn: (message: string, meta?: Record<string, any>) => {
    logger.warn(message, meta);
  },
  
  error: (message: string, meta?: Record<string, any>) => {
    logger.error(message, {
      ...meta,
      stack: meta?.error instanceof Error ? meta.error.stack : undefined
    });
  },
  
  /**
   * Log de seguridad - Siempre incluye requestId y userId
   */
  security: (message: string, meta?: Record<string, any>) => {
    logger.info(`[SECURITY] ${message}`, {
      ...meta,
      securityEvent: true
    });
  }
};

export default loggerWithContext;

