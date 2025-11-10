/**
 * 📝 Logger estructurado para AWS Lambda (Product Service)
 *
 * Características:
 * - Niveles: debug, info, warn, error
 * - Formato estructurado para CloudWatch
 * - Sin información sensible en logs
 * - Configuración optimizada para producción
 * - Control de debug logs via EVILENT_DEBUG_LOGS=true
 *
 * REGLA #3: SIEMPRE usar logger estructurado, NUNCA console.log
 */

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private context: string;
  private minLevel: LogLevel;

  constructor(context: string, minLevel: LogLevel = LogLevel.INFO) {
    this.context = context;
    this.minLevel = minLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const baseMessage = `[${timestamp}] [${level}] [${this.context}] ${message}`;

    if (data && Object.keys(data).length > 0) {
      // Sanitizar datos sensibles
      const sanitizedData = this.sanitizeData(data);
      return `${baseMessage} ${JSON.stringify(sanitizedData)}`;
    }

    return baseMessage;
  }

  private sanitizeData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized = { ...data };

    // Lista de campos sensibles a sanitizar
    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'email', 'phone',
      'ssn', 'credit_card', 'api_key', 'auth_token', 'jwt',
      'authorization', 'cookie'
    ];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    // Sanitizar campos que contengan información sensible
    if (sanitized.body && typeof sanitized.body === 'string' && sanitized.body.length > 100) {
      sanitized.body = '[LARGE_BODY_REDACTED]';
    }

    // Sanitizar headers de autorización
    if (sanitized.headers && sanitized.headers.Authorization) {
      sanitized.headers.Authorization = '[REDACTED]';
    }

    return sanitized;
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage('DEBUG', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage('INFO', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message, data));
    }
  }

  error(message: string, error?: Error | any, data?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorData = error instanceof Error
        ? { error: error.message, stack: error.stack }
        : error;

      console.error(this.formatMessage('ERROR', message, { ...data, ...errorData }));
    }
  }
}

// Factory function para crear loggers con contexto
export function createLogger(context: string): Logger {
  // Comportamiento optimizado para producción:
  // - Por defecto: INFO, WARN, ERROR (apropiado para prod)
  // - Con EVILENT_DEBUG_LOGS=true: incluye DEBUG
  const showDebug = process.env.EVILENT_DEBUG_LOGS === 'true';
  const minLevel = showDebug ? LogLevel.DEBUG : LogLevel.INFO;

  return new Logger(context, minLevel);
}



