/**
 * 🔐 Cognito Authentication Middleware
 * 
 * PATRÓN REPLICADO DE: user-service y product-service
 * 
 * Middleware para verificar JWT de Cognito en requests
 * REGLA #6: Defense in depth - Validación en múltiples capas
 * 
 * Flujo:
 * 1. Extraer token de Authorization header
 * 2. Verificar con CognitoVerifierService
 * 3. Adjuntar contexto de usuario al request
 * 4. Pasar al siguiente handler
 */

import { Request, Response, NextFunction } from 'express';
import { cognitoVerifier } from './cognito-verifier';
import { unauthorizedErrorResponse } from '../utility/response';
import logger from '../utility/logger';

/**
 * Extender Express Request para incluir auth context
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      isAuthenticated?: boolean;
    }
  }
}

/**
 * Middleware de autenticación Cognito
 * 
 * REQUIRED: En endpoints protegidos
 * OPTIONAL: En endpoints públicos (solo loguea si presente)
 */
export const cognitoAuthMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Extraer token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Missing or invalid Authorization header', {
        path: req.path,
        method: req.method
      });
      // NO retornar error aún - dejar que el handler decida si es requerido
      return next();
    }

    const token = authHeader.slice(7); // Remover 'Bearer '

    // 2. Verificar JWT con Cognito
    try {
      const payload = await cognitoVerifier.verifyToken(token);

      // 3. Adjuntar contexto al request
      req.userId = payload.sub;  // 'sub' es el subject (user ID) en JWT de Cognito
      req.userEmail = payload.email;
      req.isAuthenticated = true;

      logger.debug('User authenticated with Cognito', {
        userId: req.userId,
        email: req.userEmail
      });

      next();
    } catch (error: any) {
      logger.security('Cognito JWT verification failed', {
        error: error.message,
        code: error.code,
        tokenPreview: token.slice(0, 20)
      });
      // NO retornar error - dejar que el handler decida
      return next();
    }
  } catch (error: any) {
    logger.error('Error in Cognito auth middleware', {
      error: error.message
    });
    next(error);
  }
};

/**
 * Middleware OBLIGATORIO - Requiere autenticación Cognito
 * 
 * USO: En endpoints que requieren usuario autenticado
 * Ejemplo: app.get('/user/profile', requireAuthMiddleware, handler)
 */
export const requireAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.isAuthenticated || !req.userId) {
    logger.warn('Unauthorized access attempt', {
      path: req.path,
      method: req.method,
      isAuthenticated: req.isAuthenticated
    });
    unauthorizedErrorResponse(res, 'Authentication required');
    return;
  }

  next();
};

