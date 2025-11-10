/**
 * 🎯 Configuración centralizada del proyecto User Service
 *
 * Permite configuración por variables de entorno para despliegues flexibles.
 * Valores por defecto apropiados para desarrollo.
 *
 * REGLA #4: SIEMPRE centralizar constantes, NUNCA hardcodear valores
 * REGLA #9: Consistencia arquitectónica con product-service
 * REGLA DIAMANTE: Resolver problema de nombres hardcodeados para replicabilidad
 */

// ========================================
// 🌍 CONFIGURACIÓN GLOBAL DEL PROYECTO
// ========================================

export const PROJECT_NAME = process.env.PROJECT_NAME || 'evilent';
export const AWS_REGION = process.env.AWS_REGION || process.env.CDK_DEFAULT_REGION || 'eu-central-1';

// Prefix Lists específicos por región (para S3 Gateway Endpoints)
export const S3_PREFIX_LISTS: Record<string, string> = {
  'eu-central-1': 'pl-6ea54007',
  'us-east-1': 'pl-63a5400a',
  'us-west-2': 'pl-02cd2c6b',
};

export const S3_PREFIX_LIST = S3_PREFIX_LISTS[AWS_REGION] || S3_PREFIX_LISTS['eu-central-1'];

// ========================================
// 🏗️ CONFIGURACIÓN DE INFRAESTRUCTURA (CDK)
// ========================================

// VPC Configuration
export const VPC_CIDR = process.env.VPC_CIDR || '10.0.0.0/16';

// Database Configuration (RDS)
export const DEFAULT_STORAGE_GB = parseInt(process.env.DEFAULT_STORAGE_GB || '20');
export const DEFAULT_MAX_STORAGE_GB = parseInt(process.env.DEFAULT_MAX_STORAGE_GB || '100');
export const DEFAULT_BACKUP_RETENTION_DEV = parseInt(process.env.DEFAULT_BACKUP_RETENTION_DEV || '0');
export const DEFAULT_BACKUP_RETENTION_PROD = parseInt(process.env.DEFAULT_BACKUP_RETENTION_PROD || '7');

// Bastion Configuration
export const DEFAULT_BASTION_STORAGE_GB = parseInt(process.env.DEFAULT_BASTION_STORAGE_GB || '20');

// Lambda Configuration
export const LAMBDA_TIMEOUT_SECONDS = parseInt(process.env.LAMBDA_TIMEOUT_SECONDS || '30');
export const LAMBDA_MEMORY_MB = parseInt(process.env.LAMBDA_MEMORY_MB || '512');
export const LAMBDA_EPHEMERAL_STORAGE_MB = parseInt(process.env.LAMBDA_EPHEMERAL_STORAGE_MB || '512');
export const LAMBDA_RUNTIME = process.env.LAMBDA_RUNTIME || 'nodejs18.x';
export const LAMBDA_NODE_ENV = process.env.NODE_ENV || 'production';
export const LAMBDA_DEBUG_LOGS = process.env.EVILENT_DEBUG_LOGS || 'false';

// API Gateway Configuration
export const API_GATEWAY_THROTTLING_RATE_LIMIT = parseInt(process.env.API_GATEWAY_THROTTLING_RATE_LIMIT || '50');
export const API_GATEWAY_THROTTLING_BURST_LIMIT = parseInt(process.env.API_GATEWAY_THROTTLING_BURST_LIMIT || '100');

// Database Credentials (CDK)
export const DB_SECRET_PREFIX = process.env.DB_SECRET_PREFIX || 'evilent/user-service';
export const DB_ADMIN_USER = process.env.DB_ADMIN_USER || 'evilent_admin';
export const DB_PASSWORD_LENGTH = parseInt(process.env.DB_PASSWORD_LENGTH || '16');
export const DB_PORT = parseInt(process.env.DB_PORT || '5432');
export const DB_DEFAULT_NAME = process.env.DB_DEFAULT_NAME || 'postgres';
export const DB_INSTANCE_CLASS = process.env.DB_INSTANCE_CLASS || 'T4G';
export const DB_MIN_STORAGE_GB = parseInt(process.env.DB_MIN_STORAGE_GB || '20');

// Nomenclatura
export const DEFAULT_BUCKET_NAME = process.env.DEFAULT_BUCKET_NAME || 'evilent-user-service-bucket';
export const DEFAULT_INSTANCE_SIZE = process.env.DEFAULT_INSTANCE_SIZE || 'MICRO';

// ========================================
// 📊 LÍMITES DE NEGOCIO
// ========================================

/**
 * ✅ REGLA #4: Límites de negocio agrupados jerárquicamente
 * 
 * Estos valores se usan en:
 * - Schemas Zod (src/dto/validation-schemas.ts)
 * - Validación de datos de entrada
 * - Mensajes de error
 */

export const BUSINESS_LIMITS = {
  // User Profile Limits
  USER: {
    FIRST_NAME_MIN_LENGTH: 1,
    FIRST_NAME_MAX_LENGTH: 50,
    LAST_NAME_MIN_LENGTH: 1,
    LAST_NAME_MAX_LENGTH: 50,
    PHONE_MIN_LENGTH: 7,
    PHONE_MAX_LENGTH: 20,
    PHONE_REGEX: /^\+?[0-9\s-()]{7,20}$/,
    EMAIL_MAX_LENGTH: 255,
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    MIN_PAGE_SIZE: 1,
  },
} as const;

// ========================================
// 🔒 CONFIGURACIÓN DE AUTENTICACIÓN
// ========================================

export const AUTH_CONFIG = {
  COGNITO_POOL_ID: process.env.COGNITO_POOL_ID || '',
  COGNITO_APP_CLIENT_ID: process.env.COGNITO_APP_CLIENT_ID || '',
  COGNITO_REGION: process.env.COGNITO_REGION || AWS_REGION,
} as const;

// ========================================
// 📝 CONFIGURACIÓN DE LOGGING
// ========================================

export const LOG_CONFIG = {
  LEVEL: process.env.LOG_LEVEL || 'info',
  REQUEST_DETAILS: process.env.LOG_REQUEST_DETAILS === 'true',
  RESPONSE_DETAILS: process.env.LOG_RESPONSE_DETAILS === 'true',
  DB_QUERIES: process.env.LOG_DB_QUERIES === 'true',
} as const;

// ========================================
// 🎨 CONFIGURACIÓN DE CORS
// ========================================

export const CORS_CONFIG = {
  ENABLED: process.env.CORS_ENABLED === 'true',
  ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['*'],
  ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] as const,
  ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key', 'X-Amz-Security-Token'] as const,
  MAX_AGE: parseInt(process.env.CORS_MAX_AGE || '86400'), // 24 horas
} as const;

// ========================================
// ⏱️ TIMEOUTS Y RETRIES
// ========================================

export const TIMEOUT_CONFIG = {
  // API Timeouts
  API_REQUEST_TIMEOUT_MS: parseInt(process.env.API_REQUEST_TIMEOUT_MS || '5000'),
  API_RESPONSE_TIMEOUT_MS: parseInt(process.env.API_RESPONSE_TIMEOUT_MS || '10000'),

  // Database Timeouts
  DB_QUERY_TIMEOUT_MS: parseInt(process.env.DB_QUERY_TIMEOUT_MS || '5000'),
  DB_TRANSACTION_TIMEOUT_MS: parseInt(process.env.DB_TRANSACTION_TIMEOUT_MS || '10000'),

  // AWS Service Timeouts
  SECRETS_MANAGER_TIMEOUT_MS: parseInt(process.env.SECRETS_MANAGER_TIMEOUT_MS || '5000'),
  COGNITO_TIMEOUT_MS: parseInt(process.env.COGNITO_TIMEOUT_MS || '3000'),
} as const;

// ========================================
// 🗄️ CONFIGURACIÓN DE POSTGRESQL
// ========================================

/**
 * ✅ REGLA #4: Constantes centralizadas para PostgreSQL
 * 
 * Estas constantes se usan en src/utility/database-client.ts para optimizar
 * el connection pooling y timeouts de PostgreSQL para entornos serverless (Lambda)
 */

export const POSTGRESQL_CONFIG = {
  // Connection Pooling (optimizado para Lambda)
  POOL_MAX: parseInt(process.env.DB_POOL_MAX || '2'),
  POOL_MIN: parseInt(process.env.DB_POOL_MIN || '0'),
  POOL_IDLE_TIMEOUT_MS: parseInt(process.env.DB_POOL_IDLE_TIMEOUT_MS || '120000'),
  CONNECTION_TIMEOUT_MS: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS || '3000'),
} as const;

// ========================================
// 🏷️ CONFIGURACIÓN DEL SERVICIO (NOMBRES)
// ========================================

/**
 * ✅ REGLA DIAMANTE: Resolver problema de nombres hardcodeados
 * 
 * Esta configuración centraliza TODOS los nombres hardcodeados del proyecto
 * para permitir fácil cambio de "user-service" a cualquier otro servicio.
 * 
 * REPLICABILIDAD: Para crear "order-service", solo cambiar valores aquí.
 */

export const SERVICE_CONFIG = {
  // ========================================
  // 📦 IDENTIDAD DEL SERVICIO
  // ========================================
  identity: {
    name: process.env.SERVICE_NAME || 'user-service',
    displayName: process.env.SERVICE_DISPLAY_NAME || 'User Service',
    description: process.env.SERVICE_DESCRIPTION || 'Serverless API para gestión de perfiles de usuario con Cognito + PostgreSQL',
    version: process.env.SERVICE_VERSION || '1.0.0',
  },

  // ========================================
  // 🏗️ COMPONENTES DE INFRAESTRUCTURA
  // ========================================
  infrastructure: {
    stack: {
      name: process.env.STACK_NAME || 'UserServiceStack',
      serviceStackName: process.env.SERVICE_STACK_NAME || 'UserService',
      apiGatewayName: process.env.API_GATEWAY_NAME || 'UserApiGateway',
      databaseStackName: process.env.DATABASE_STACK_NAME || 'UserDatabase',
      bastionStackName: process.env.BASTION_STACK_NAME || 'UserBastion',
    },
  },

  // ========================================
  // 🔧 FUNCIONES LAMBDA
  // ========================================
  lambdas: {
    main: process.env.MAIN_LAMBDA_NAME || 'user-api',
  },

  // ========================================
  // 🗄️ BASE DE DATOS
  // ========================================
  database: {
    secretName: process.env.DB_SECRET_NAME || 'evilent/user-service/postgres',
    secretDescription: process.env.DB_SECRET_DESCRIPTION || 'PostgreSQL credentials for User Service',
  },

  // ========================================
  // 📁 ARCHIVOS Y CLASES
  // ========================================
  code: {
    files: {
      mainApi: process.env.MAIN_API_FILE || 'user-api',
      mainService: process.env.MAIN_SERVICE_FILE || 'user-service',
    },
    classes: {
      mainService: process.env.MAIN_SERVICE_CLASS || 'UserService',
      mainRepository: process.env.MAIN_REPOSITORY_CLASS || 'UserRepository',
    },
  },

  // ========================================
  // 🛤️ RUTAS DE API
  // ========================================
  api: {
    routes: {
      base: process.env.API_BASE_PATH || '/user',
    },
  },

  // ========================================
  // 🏷️ PREFIJOS Y NAMESPACES
  // ========================================
  naming: {
    prefixes: {
      project: process.env.PROJECT_PREFIX || 'evilent',
      logGroup: process.env.LOG_GROUP_PREFIX || '/aws/lambda/UserService',
      secret: process.env.SECRET_PREFIX || 'evilent/user-service',
    },
    entities: {
      main: process.env.MAIN_ENTITY || 'User',
    },
  },
} as const;

// ========================================
// 🔢 CONSTANTES DE CÓDIGOS HTTP
// ========================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ========================================
// 📨 MENSAJES DE RESPUESTA ESTÁNDAR
// ========================================

export const RESPONSE_MESSAGES = {
  SUCCESS: 'Operación exitosa',
  CREATED: 'Recurso creado exitosamente',
  UPDATED: 'Recurso actualizado exitosamente',
  DELETED: 'Recurso eliminado exitosamente',
  NOT_FOUND: 'Recurso no encontrado',
  VALIDATION_ERROR: 'Error de validación de datos',
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Acceso prohibido',
  INTERNAL_ERROR: 'Error interno del servidor',
  DATABASE_ERROR: 'Error de base de datos',
  COGNITO_ERROR: 'Error de autenticación',
} as const;

// ========================================
// 🔗 REFERENCIAS LEGACY (POR COMPATIBILIDAD)
// ========================================

/**
 * ✅ REGLA #4: Mantener compatibilidad hacia atrás
 * 
 * Estas constantes apuntan a las nuevas agrupadas para evitar romper código existente.
 * Permiten migración gradual del código legacy.
 */

// Legacy Business Limits (apuntan a BUSINESS_LIMITS)
export const USER_FIRST_NAME_MIN_LENGTH = BUSINESS_LIMITS.USER.FIRST_NAME_MIN_LENGTH;
export const USER_FIRST_NAME_MAX_LENGTH = BUSINESS_LIMITS.USER.FIRST_NAME_MAX_LENGTH;
export const USER_LAST_NAME_MIN_LENGTH = BUSINESS_LIMITS.USER.LAST_NAME_MIN_LENGTH;
export const USER_LAST_NAME_MAX_LENGTH = BUSINESS_LIMITS.USER.LAST_NAME_MAX_LENGTH;
export const USER_PHONE_MIN_LENGTH = BUSINESS_LIMITS.USER.PHONE_MIN_LENGTH;
export const USER_PHONE_MAX_LENGTH = BUSINESS_LIMITS.USER.PHONE_MAX_LENGTH;
export const USER_PHONE_REGEX = BUSINESS_LIMITS.USER.PHONE_REGEX;
export const USER_EMAIL_MAX_LENGTH = BUSINESS_LIMITS.USER.EMAIL_MAX_LENGTH;

export const DEFAULT_PAGE_SIZE = BUSINESS_LIMITS.PAGINATION.DEFAULT_PAGE_SIZE;
export const MAX_PAGE_SIZE = BUSINESS_LIMITS.PAGINATION.MAX_PAGE_SIZE;
export const MIN_PAGE_SIZE = BUSINESS_LIMITS.PAGINATION.MIN_PAGE_SIZE;

// Legacy Auth Config (apuntan a AUTH_CONFIG)
export const COGNITO_POOL_ID = AUTH_CONFIG.COGNITO_POOL_ID;
export const COGNITO_APP_CLIENT_ID = AUTH_CONFIG.COGNITO_APP_CLIENT_ID;
export const COGNITO_REGION = AUTH_CONFIG.COGNITO_REGION;

// Legacy Log Config (apuntan a LOG_CONFIG)
export const LOG_LEVEL = LOG_CONFIG.LEVEL;
export const LOG_REQUEST_DETAILS = LOG_CONFIG.REQUEST_DETAILS;
export const LOG_RESPONSE_DETAILS = LOG_CONFIG.RESPONSE_DETAILS;
export const LOG_DB_QUERIES = LOG_CONFIG.DB_QUERIES;

// Legacy CORS Config (apuntan a CORS_CONFIG)
export const CORS_ENABLED = CORS_CONFIG.ENABLED;
export const CORS_ALLOWED_ORIGINS = CORS_CONFIG.ALLOWED_ORIGINS;
export const CORS_ALLOWED_METHODS = CORS_CONFIG.ALLOWED_METHODS;
export const CORS_ALLOWED_HEADERS = CORS_CONFIG.ALLOWED_HEADERS;
export const CORS_MAX_AGE = CORS_CONFIG.MAX_AGE;

// Legacy Timeout Config (apuntan a TIMEOUT_CONFIG)
export const API_REQUEST_TIMEOUT_MS = TIMEOUT_CONFIG.API_REQUEST_TIMEOUT_MS;
export const API_RESPONSE_TIMEOUT_MS = TIMEOUT_CONFIG.API_RESPONSE_TIMEOUT_MS;
export const DB_QUERY_TIMEOUT_MS = TIMEOUT_CONFIG.DB_QUERY_TIMEOUT_MS;
export const DB_TRANSACTION_TIMEOUT_MS = TIMEOUT_CONFIG.DB_TRANSACTION_TIMEOUT_MS;
export const SECRETS_MANAGER_TIMEOUT_MS = TIMEOUT_CONFIG.SECRETS_MANAGER_TIMEOUT_MS;
export const COGNITO_TIMEOUT_MS = TIMEOUT_CONFIG.COGNITO_TIMEOUT_MS;

// Legacy PostgreSQL Config (apuntan a POSTGRESQL_CONFIG)
export const DB_POOL_MAX = POSTGRESQL_CONFIG.POOL_MAX;
export const DB_POOL_MIN = POSTGRESQL_CONFIG.POOL_MIN;
export const DB_POOL_IDLE_TIMEOUT_MS = POSTGRESQL_CONFIG.POOL_IDLE_TIMEOUT_MS;
export const DB_CONNECTION_TIMEOUT_MS = POSTGRESQL_CONFIG.CONNECTION_TIMEOUT_MS;

// Legacy Service Name (apunta a SERVICE_CONFIG)
export const SERVICE_NAME = SERVICE_CONFIG.identity.name;
export const SERVICE_VERSION = SERVICE_CONFIG.identity.version;
export const SERVICE_ENVIRONMENT = LAMBDA_NODE_ENV;
export const SERVICE_DISPLAY_NAME = SERVICE_CONFIG.identity.displayName;
export const SERVICE_DESCRIPTION = SERVICE_CONFIG.identity.description;
