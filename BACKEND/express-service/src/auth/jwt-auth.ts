/**
 * Autenticación JWT con Cognito
 * 
 * REGLA DE ORO #6: SIEMPRE implementar defense in depth
 * 
 * Capas de seguridad:
 * 1. Validación de JWT token
 * 2. Verificación de expiración
 * 3. Extracción de claims
 * 4. Contexto de usuario en request
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AUTH_CONFIG } from '../config/constants';
import { unauthorizedErrorResponse } from '../utility/response';
import logger from '../utility/logger';
import { JwtPayload, AuthContext } from '../types';

/**
 * Extender Express Request para incluir auth context
 */
declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

/**
 * Middleware - Validación JWT
 * 
 * Extrae el token del header Authorization: Bearer <token>
 * Valida la firma y expiración
 * Adjunta contexto de autenticación al request
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // 1. Extraer token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Missing or invalid Authorization header', {
        path: req.path,
        method: req.method
      });
      unauthorizedErrorResponse(res, 'Missing or invalid Authorization header');
      return;
    }

    const token = authHeader.slice(7); // Remover 'Bearer '

    // 2. Verificar y decodificar JWT
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, AUTH_CONFIG.JWT_SECRET) as JwtPayload;
    } catch (error: any) {
      logger.security('JWT verification failed', {
        error: error.message,
        tokenPreview: token.slice(0, 20)
      });
      unauthorizedErrorResponse(res, 'Invalid or expired token');
      return;
    }

    // 3. Adjuntar contexto de autenticación al request
    req.auth = {
      userId: decoded.userId,
      email: decoded.email,
      isAuthenticated: true
    };

    logger.debug('User authenticated', {
      userId: decoded.userId,
      email: decoded.email
    });

    next();
  } catch (error: any) {
    logger.error('Auth middleware error', {
      message: error.message,
      stack: error.stack
    });
    unauthorizedErrorResponse(res);
  }
};

/**
 * Generar JWT token
 * 
 * Uso:
 *   const token = generateJWT({ userId: '123', email: 'user@example.com' });
 */
export const generateJWT = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, AUTH_CONFIG.JWT_SECRET, {
    algorithm: AUTH_CONFIG.JWT_ALGORITHM as any,
    expiresIn: AUTH_CONFIG.JWT_EXPIRY
  });
};

/**
 * Verificar JWT token
 * 
 * Retorna decoded payload o null si es inválido
 */
export const verifyJWT = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, AUTH_CONFIG.JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error: any) {
    logger.debug('JWT verification failed', {
      error: error.message
    });
    return null;
  }
};

/**
 * Middleware - Autenticación opcional para algunas rutas
 * 
 * Uso en routes:
 *   router.get('/protected', optionalAuthMiddleware, handler);
 */
export const optionalAuthMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const decoded = jwt.verify(token, AUTH_CONFIG.JWT_SECRET) as JwtPayload;
      
      req.auth = {
        userId: decoded.userId,
        email: decoded.email,
        isAuthenticated: true
      };
    } else {
      req.auth = {
        isAuthenticated: false
      };
    }
    
    next();
  } catch (_error: any) {
    req.auth = {
      isAuthenticated: false
    };
    next();
  }
};

