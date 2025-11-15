/**
 * CONSTANTES CENTRALIZADAS - TEMPLATE REPLICABLE
 * 
 * REGLA DE ORO #4: SIEMPRE centralizar constantes, NUNCA hardcodear valores
 * 
 * REGLA DIAMANTE EXTENDIDA: Para replicar este servicio en otro proyecto:
 * 1. Cambiar SERVICE_CONFIG.identity.name (ej: 'order-service')
 * 2. TODO lo demás se actualiza automáticamente
 * 
 * Esto asegura REPLICABILIDAD: Crear order-service = cambiar 3 valores
 * Vs. Buscar y cambiar 50+ constantes dispersas (propenso a errores)
 */

// ============================================================================
// SERVICE CONFIGURATION - PUNTO ÚNICO DE CAMBIO PARA REPLICAR
// ============================================================================

export const SERVICE_CONFIG = {
  identity: {
    name: 'express-service',        // ← CAMBIAR AQUÍ para replicar (ej: 'order-service')
    displayName: 'Express Service',
    description: 'Express.js Monolith Template - Base replicable',
    version: '1.0.0'
  },
  
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
    timeout: 30000
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json' // CloudWatch compatible
  }
} as const;

// ============================================================================
// BUSINESS LIMITS - Límites de negocio centralizados
// ============================================================================

export const BUSINESS_LIMITS = {
  USER: {
    FIRST_NAME_MIN_LENGTH: 1,
    FIRST_NAME_MAX_LENGTH: 50,
    LAST_NAME_MIN_LENGTH: 1,
    LAST_NAME_MAX_LENGTH: 50,
    EMAIL_MAX_LENGTH: 255
  },
  PRODUCT: {
    NAME_MIN_LENGTH: 3,
    NAME_MAX_LENGTH: 255,
    DESCRIPTION_MAX_LENGTH: 2000,
    PRICE_MIN: 0.01,
    PRICE_MAX: 999999.99
  },
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100
  }
} as const;

// ============================================================================
// TIMEOUT CONFIGURATION - Timeouts centralizados
// ============================================================================

export const TIMEOUT_CONFIG = {
  API_REQUEST_TIMEOUT_MS: 5000,
  API_RESPONSE_TIMEOUT_MS: 10000,
  DATABASE_TIMEOUT_MS: 30000,
  COGNITO_TIMEOUT_MS: 5000
} as const;

// ============================================================================
// AUTHENTICATION CONFIGURATION - Cognito
// ============================================================================

export const AUTH_CONFIG = {
  COGNITO_POOL_ID: process.env.COGNITO_POOL_ID || 'local-pool-id',
  COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID || 'local-client-id',
  COGNITO_REGION: process.env.COGNITO_REGION || 'us-east-1',
  JWT_SECRET: process.env.JWT_SECRET || 'local-jwt-secret-for-testing',
  JWT_EXPIRY: '24h',
  JWT_ALGORITHM: 'HS256'
} as const;

// ============================================================================
// DATABASE CONFIGURATION - (Opcional)
// ============================================================================

export const DATABASE_CONFIG = {
  HOST: process.env.DB_HOST || 'localhost',
  PORT: parseInt(process.env.DB_PORT || '5432', 10),
  USER: process.env.DB_USER || 'postgres',
  PASSWORD: process.env.DB_PASSWORD || 'password',
  NAME: process.env.DB_NAME || 'express_service_db',
  POOL_MIN: 2,
  POOL_MAX: 10,
  SSL: process.env.DB_SSL === 'true'
} as const;

// ============================================================================
// API CONFIGURATION - Rate limiting, timeouts, etc
// ============================================================================

export const API_CONFIG = {
  RATE_LIMIT_WINDOW_MS: 60000,       // 1 minuto
  RATE_LIMIT_MAX_REQUESTS: 100,      // 100 requests por ventana
  REQUEST_TIMEOUT_MS: 5000,
  RESPONSE_TIMEOUT_MS: 10000
} as const;

// ============================================================================
// ERROR MESSAGES - Mensajes de error centralizados
// ============================================================================

export const ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Validation failed',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not found',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  BAD_REQUEST: 'Bad request',
  CONFLICT: 'Resource already exists',
  SERVICE_UNAVAILABLE: 'Service unavailable'
} as const;

// ============================================================================
// ERROR CODES - Códigos de error estructurados
// ============================================================================

export const ERROR_CODES = {
  VALIDATION_ERROR: 'ERR_VALIDATION_FAILED',
  UNAUTHORIZED: 'ERR_UNAUTHORIZED',
  FORBIDDEN: 'ERR_FORBIDDEN',
  NOT_FOUND: 'ERR_NOT_FOUND',
  INTERNAL_SERVER_ERROR: 'ERR_INTERNAL_SERVER',
  BAD_REQUEST: 'ERR_BAD_REQUEST',
  CONFLICT: 'ERR_CONFLICT',
  SERVICE_UNAVAILABLE: 'ERR_SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'ERR_DATABASE',
  COGNITO_ERROR: 'ERR_COGNITO'
} as const;

// ============================================================================
// RESPONSE FORMATS - Formatos de respuesta estandarizados
// ============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

// ============================================================================
// REFERENCES LEGACY - Sin duplicación, referencias a valores principales
// ============================================================================

// Service identity references
export const SERVICE_NAME = SERVICE_CONFIG.identity.name;
export const SERVICE_DISPLAY_NAME = SERVICE_CONFIG.identity.displayName;
export const SERVICE_VERSION = SERVICE_CONFIG.identity.version;
export const NODE_ENV = SERVICE_CONFIG.server.env;
export const PORT = SERVICE_CONFIG.server.port;

// Business limits references
export const USER_FIRST_NAME_MIN = BUSINESS_LIMITS.USER.FIRST_NAME_MIN_LENGTH;
export const USER_FIRST_NAME_MAX = BUSINESS_LIMITS.USER.FIRST_NAME_MAX_LENGTH;
export const PRODUCT_NAME_MIN = BUSINESS_LIMITS.PRODUCT.NAME_MIN_LENGTH;
export const PRODUCT_NAME_MAX = BUSINESS_LIMITS.PRODUCT.NAME_MAX_LENGTH;

// Timeout references
export const API_REQUEST_TIMEOUT = TIMEOUT_CONFIG.API_REQUEST_TIMEOUT_MS;
export const DATABASE_TIMEOUT = TIMEOUT_CONFIG.DATABASE_TIMEOUT_MS;

