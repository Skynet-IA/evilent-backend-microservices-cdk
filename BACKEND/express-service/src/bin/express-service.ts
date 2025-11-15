/**
 * Express Service - Entry Point
 * 
 * Punto de entrada de la aplicación
 * Setup de Express, middleware, rutas
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { SERVICE_CONFIG, PORT, SERVICE_NAME } from '../config/constants';
import logger from '../utility/logger';
import { requestIdMiddleware } from '../utility/request-id';
import { optionalAuthMiddleware } from '../auth/jwt-auth';
import { registerUserRoutes, logAvailableRoutes } from '../api/user.handler';
import { internalServerErrorResponse } from '../utility/response';

// Crear aplicación Express
const app = express();

// ============================================================================
// MIDDLEWARE GLOBAL
// ============================================================================

// CORS Configuration (ACTIVIDAD #1)
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request ID Tracking (ACTIVIDAD #2)
app.use(requestIdMiddleware);

// Legacy request logging middleware (kept for compatibility)
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info('Incoming request', {
    requestId: req.id,
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString()
  });
  next();
});

// Optional auth middleware
app.use(optionalAuthMiddleware);

// Rate Limiting (ACTIVIDAD #4)
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Retorna info en `RateLimit-*` headers
  legacyHeaders: false, // Deshabilita `X-RateLimit-*` headers
  skip: (req: Request) => {
    // Saltar rate limiting para health checks
    return req.path === '/health' || req.path === '/info';
  },
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded', {
      requestId: req.id,
      ip: req.ip,
      path: req.path,
      timestamp: new Date().toISOString()
    });
    res.status(429).json({
      success: false,
      message: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: res.getHeader('Retry-After')
    });
  }
});

app.use(rateLimiter);

// ============================================================================
// ROUTES
// ============================================================================

/**
 * Health check endpoint
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: SERVICE_NAME,
    version: SERVICE_CONFIG.identity.version,
    timestamp: new Date().toISOString()
  });
});

/**
 * Info endpoint
 */
app.get('/info', (_req: Request, res: Response) => {
  res.json({
    service: SERVICE_CONFIG.identity.displayName,
    description: SERVICE_CONFIG.identity.description,
    version: SERVICE_CONFIG.identity.version,
    environment: SERVICE_CONFIG.server.env
  });
});

/**
 * Registrar rutas de usuarios
 */
registerUserRoutes(app);

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * 404 - Not Found
 */
app.use((req: Request, res: Response) => {
  logger.warn('Route not found', {
    method: req.method,
    path: req.path
  });
  
  res.status(404).json({
    success: false,
    message: 'Route not found',
    data: null,
    timestamp: new Date().toISOString()
  });
});

/**
 * Global error handler
 */
app.use((error: any, req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method
  });

  internalServerErrorResponse(res, error, 'An unexpected error occurred');
});

// ============================================================================
// START SERVER
// ============================================================================

const start = async () => {
  try {
    // Mostrar rutas disponibles
    logAvailableRoutes();

    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info('🚀 Server started successfully', {
        service: SERVICE_NAME,
        port: PORT,
        environment: SERVICE_CONFIG.server.env,
        timestamp: new Date().toISOString()
      });

      logger.info('📝 Health check available at', {
        url: `http://localhost:${PORT}/health`
      });

      logger.info('📖 API info available at', {
        url: `http://localhost:${PORT}/info`
      });
    });
  } catch (error: any) {
    logger.error('Failed to start server', {
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

// Manejar señales para graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Iniciar servidor
start();

export default app;

