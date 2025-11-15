/**
 * Request ID Middleware - ACTIVIDAD #2
 * 
 * Genera UUID para cada request y propaga a través de toda la aplicación.
 * Permite correlacionar logs entre cliente y servidor para debugging.
 * 
 * REGLA DE ORO #3: SIEMPRE usar logger estructurado con contexto
 * REGLA DE ORO #7: Logging de seguridad con request tracking
 */

import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import logger from './logger';

// Extender Express Request para incluir request ID
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

/**
 * Middleware que genera y propaga Request ID
 * 
 * - Genera UUID si no existe (cliente no envía X-Request-ID)
 * - Usa X-Request-ID del cliente si existe (para flujos distribuidos)
 * - Agrega a response headers para que cliente pueda correlacionar
 * - Incluye en todos los logs automáticamente
 */
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 1. Generar o reutilizar Request ID
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  req.id = requestId;

  // 2. Agregar a response headers (cliente puede usar para debugging)
  res.setHeader('X-Request-ID', requestId);

  // 3. Log de inicio de request con contexto
  logger.info('Request started', {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
  });

  // 4. Interceptar end de response para log de cierre
  const originalSend = res.send;
  res.send = function (data: any) {
    logger.info('Request completed', {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      timestamp: new Date().toISOString()
    });
    return originalSend.call(this, data);
  };

  next();
};

/**
 * Helper para obtener Request ID del request actual
 * Útil para incluir en logs dentro de handlers/services
 */
export const getRequestId = (req: Request): string => {
  return req.id || 'UNKNOWN';
};

