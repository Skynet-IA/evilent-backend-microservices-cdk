/**
 * 🔐 AUTH MIDDLEWARE - Validación JWT con Cognito
 *
 * TAREA 2.1: Express-adapted Authentication Middleware
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ✅ REGLA #2 BACKEND: Datos sensibles protegidos (tokens en headers)
 * ✅ REGLA #3 BACKEND: Logger estructurado (no console.log)
 * ✅ REGLA #6 BACKEND: Defense in depth (validación en middleware)
 * ✅ REGLA DIAMANTE: Código escalable (middleware reutilizable)
 *
 * 📋 FILOSOFÍA:
 * ─────────────
 * Este middleware es el PUNTO DE ENTRADA para todas las rutas protegidas.
 * Extrae el JWT del header Authorization, valida con Cognito, y si es válido
 * agrega el usuario al objeto req para que los handlers accedan fácilmente.
 *
 * ⚠️ DIFERENCIA EXPRESS vs LAMBDA:
 * ─────────────────────────────────
 * Lambda usa CLASES estáticas (como AuthMiddleware en user-service)
 * Express usa FUNCIONES middleware (este patrón)
 *
 * NO COPIAR el patrón Lambda aquí - Express requiere:
 * • (req: Request, res: Response, next: NextFunction) signature
 * • return cuando hay error
 * • next() cuando OK
 *
 * 🔄 FLOW:
 * ─────────
 * 1. Extraer Authorization header
 * 2. Validar formato "Bearer <token>"
 * 3. Verificar JWT con CognitoVerifierService
 * 4. Si OK → req.user = { userId, userEmail } + next()
 * 5. Si ERROR → res.status(401).json(...) + return
 *
 * 📊 COBERTURA:
 * ─────────────
 * Este middleware es CRÍTICO para seguridad (REGLA #8: >85% coverage)
 * Tests deben verificar:
 * • Token válido → next() llamado
 * • Token inválido → 401 retornado
 * • No token → 401 retornado
 * • Formato Bearer correcto
 * • Error en verificación → 401 retornado
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utility/logger';
import { CognitoVerifierService } from '../../auth/cognito-verifier';

/**
 * 🔑 Extend Express Request con usuario autenticado y request ID
 *
 * Permite que los handlers accedan a:
 * • req.id - ID único del request (propagado por request-id.middleware)
 * • req.user.userId - ID del usuario autenticado
 * • req.user.userEmail - Email del usuario autenticado
 */
declare global {
  namespace Express {
    interface Request {
      id?: string; // Request ID único (generado por request-id.middleware)
      user?: {
        userId: string;
        userEmail: string;
      };
    }
  }
}

/**
 * ✅ MIDDLEWARE REQUIREAUTH - Validación JWT con Cognito
 *
 * PUNTO DE ENTRADA para rutas protegidas.
 *
 * 📌 USO:
 * ────────
 * ```typescript
 * app.get('/user/profile', requireAuth, getUserProfile);
 * app.post('/user/profile', requireAuth, updateUserProfile);
 * ```
 *
 * ⚠️ ERRORES POSIBLES:
 * ────────────────────
 * • 401: Sin token
 * • 401: Formato Bearer incorrecto
 * • 401: Token expirado o inválido
 * • 500: Error al verificar con Cognito (raro, pero posible)
 *
 * 🔒 DEFENSE IN DEPTH:
 * ────────────────────
 * Este middleware es la PRIMERA línea.
 * Los handlers pueden agregar validaciones adicionales si es necesario.
 *
 * @param req - Objeto Request de Express
 * @param res - Objeto Response de Express
 * @param next - Función NextFunction para continuar al siguiente middleware/handler
 *
 * @returns void - Llama a next() si OK, o envía error si falla
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  // ═══════════════════════════════════════════════════════════════════════════
  // PASO 1: Extraer Authorization header
  // ═══════════════════════════════════════════════════════════════════════════

  const authHeader = req.header('Authorization');

  if (!authHeader) {
    logger.warn('Unauthorized access attempt: No Authorization header', {
      requestId: req.id,
      path: req.path,
      method: req.method,
    });

    res.status(401).json({
      success: false,
      message: 'No Authorization header provided',
    });
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PASO 2: Validar formato Bearer <token>
  // ═══════════════════════════════════════════════════════════════════════════

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    logger.warn('Unauthorized access attempt: Invalid Bearer format', {
      requestId: req.id,
      path: req.path,
      method: req.method,
      authFormat: parts[0],
    });

    res.status(401).json({
      success: false,
      message: 'Invalid Authorization header format. Expected "Bearer <token>"',
    });
    return;
  }

  const token = parts[1];

  // ═══════════════════════════════════════════════════════════════════════════
  // PASO 3: Verificar JWT con CognitoVerifierService
  // ═══════════════════════════════════════════════════════════════════════════

  CognitoVerifierService.getInstance()
    .verifyToken(token)
    .then((claims) => {
      // ✅ TOKEN VÁLIDO - Agregar usuario a req y continuar

      req.user = {
        userId: claims.sub, // Cognito "sub" es el userId
        userEmail: claims.email,
      };

      logger.info('User authenticated successfully', {
        requestId: req.id,
        userId: req.user.userId,
        path: req.path,
        method: req.method,
      });

      // Continuar al siguiente middleware/handler
      next();
    })
    .catch((error) => {
      // ❌ TOKEN INVÁLIDO - Retornar 401

      logger.warn('Token verification failed', {
        requestId: req.id,
        path: req.path,
        method: req.method,
        error: error instanceof Error ? error.message : String(error),
      });

      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    });
}

/**
 * ✅ MIDDLEWARE OPTIONALAUTH - Validación JWT opcional
 *
 * Similar a requireAuth pero NO falla si no hay token.
 * El usuario es opcional - si está, se valida; si no, continúa.
 *
 * 📌 USO:
 * ────────
 * Para endpoints que pueden ser públicos pero también aceptan usuarios autenticados:
 * ```typescript
 * app.get('/products', optionalAuth, getProducts);
 * ```
 *
 * Si usuario está autenticado → req.user está poblado
 * Si no hay token → req.user es undefined, pero req continúa
 *
 * @param req - Objeto Request de Express
 * @param res - Objeto Response de Express
 * @param next - Función NextFunction para continuar
 *
 * @returns void - Siempre continúa (next()), con o sin usuario
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.header('Authorization');

  // Si no hay Authorization header, simplemente continuar sin usuario
  if (!authHeader) {
    next();
    return;
  }

  const parts = authHeader.split(' ');

  // Si formato es incorrecto, simplemente continuar sin usuario
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    logger.debug('Invalid Authorization format in optional auth, skipping', {
      requestId: req.id,
      path: req.path,
    });
    next();
    return;
  }

  const token = parts[1];

  // Intentar verificar, pero no fallar si hay error
  CognitoVerifierService.getInstance()
    .verifyToken(token)
    .then((claims) => {
      req.user = {
        userId: claims.sub,
        userEmail: claims.email,
      };

      logger.debug('Optional auth: User authenticated', {
        requestId: req.id,
        userId: req.user.userId,
      });

      next();
    })
    .catch((error) => {
      // No fallar, simplemente no agregar usuario
      logger.debug('Optional auth: Token verification failed, continuing without user', {
        requestId: req.id,
        error: error instanceof Error ? error.message : String(error),
      });

      next();
    });
}

