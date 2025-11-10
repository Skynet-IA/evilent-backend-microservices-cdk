/**
 * 🎯 Configuración centralizada del proyecto Product Service
 *
 * Permite configuración por variables de entorno para despliegues flexibles.
 * Valores por defecto apropiados para desarrollo.
 *
 * REGLA #4: SIEMPRE centralizar constantes, NUNCA hardcodear valores
 * REGLA DIAMANTE: Resolver problema de nombres hardcodeados para replicabilidad
 */

// ========================================
// 🌍 CONFIGURACIÓN GLOBAL DEL PROYECTO
// ========================================

export const PROJECT_NAME = process.env.PROJECT_NAME || 'evilent';
export const AWS_REGION = process.env.AWS_REGION || process.env.CDK_DEFAULT_REGION || 'eu-central-1';

// ========================================
// 🏗️ CONFIGURACIÓN DE INFRAESTRUCTURA
// ========================================

// Lambda Configuration
export const LAMBDA_TIMEOUT_SECONDS = parseInt(process.env.LAMBDA_TIMEOUT_SECONDS || '10');
export const LAMBDA_MEMORY_MB = parseInt(process.env.LAMBDA_MEMORY_MB || '512');
export const LAMBDA_EPHEMERAL_STORAGE_MB = parseInt(process.env.LAMBDA_EPHEMERAL_STORAGE_MB || '512');
export const LAMBDA_RUNTIME = process.env.LAMBDA_RUNTIME || 'nodejs20.x';
export const LAMBDA_NODE_ENV = process.env.NODE_ENV || 'production';
export const LAMBDA_DEBUG_LOGS = process.env.EVILENT_DEBUG_LOGS || 'false';

// API Gateway Configuration
export const API_GATEWAY_THROTTLING_RATE_LIMIT = parseInt(process.env.API_GATEWAY_THROTTLING_RATE_LIMIT || '50');
export const API_GATEWAY_THROTTLING_BURST_LIMIT = parseInt(process.env.API_GATEWAY_THROTTLING_BURST_LIMIT || '100');

// ========================================
// 🗄️ CONFIGURACIÓN DE S3
// ========================================

export const S3_IMAGE_MAX_SIZE_MB = parseInt(process.env.S3_IMAGE_MAX_SIZE_MB || '5');
export const S3_IMAGE_ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const;

// ========================================
// 📊 LÍMITES DE NEGOCIO
// ========================================

// ✅ TAREA #7 COMPLETADA: Validación con Zod
// Estas constantes se usan en los schemas de validación Zod.
// Ver: src/dto/validation-schemas.ts

export const BUSINESS_LIMITS = {
  // Product Limits
  PRODUCT: {
    NAME_MAX_LENGTH: 100,
    NAME_MIN_LENGTH: 3,
    DESCRIPTION_MAX_LENGTH: 2000,
    PRICE_MIN: 0.01,
    PRICE_MAX: 999999.99,
  },

  // Category Limits
  CATEGORY: {
    NAME_MAX_LENGTH: 100,
    NAME_MIN_LENGTH: 3,
    DESCRIPTION_MAX_LENGTH: 500,
  },

  // Deal Limits
  DEAL: {
    DISCOUNT_MIN: 0,
    DISCOUNT_MAX: 100,
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
} as const;

// ========================================
// 🔒 CONFIGURACIÓN DE AUTENTICACIÓN
// ========================================

export const AUTH_CONFIG = {
  COGNITO_POOL_ID: process.env.COGNITO_POOL_ID,
  COGNITO_APP_CLIENT_ID: process.env.COGNITO_APP_CLIENT_ID,
} as const;

// ========================================
// 📝 CONFIGURACIÓN DE LOGGING
// ========================================

export const LOG_CONFIG = {
  LEVEL: process.env.LOG_LEVEL || 'info',
  REQUEST_DETAILS: process.env.LOG_REQUEST_DETAILS === 'true',
} as const;

// ========================================
// 🎨 CONFIGURACIÓN DE CORS
// ========================================

export const CORS_CONFIG = {
  ENABLED: process.env.CORS_ENABLED === 'true',
  ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['*'],
} as const;

// ========================================
// ⏱️ TIMEOUTS Y RETRIES
// ========================================

export const TIMEOUT_CONFIG = {
  // 🔮 PARA USO FUTURO: S3 Upload Timeout
  // Esta constante está comentada porque NO se usa actualmente en image-api.ts
  // Se descomentará cuando se implemente timeout en la subida de imágenes.
  // S3_UPLOAD_TIMEOUT_MS: parseInt(process.env.S3_UPLOAD_TIMEOUT_MS || '30000'),

  API_REQUEST_TIMEOUT_MS: parseInt(process.env.API_REQUEST_TIMEOUT_MS || '5000'),
} as const;

// ========================================
// 🗄️ CONFIGURACIÓN DE MONGODB
// ========================================

// ✅ REGLA #4: Constantes centralizadas para MongoDB
// Estas constantes se usan en src/db/db-connection.ts para optimizar
// el connection pooling y timeouts de MongoDB para entornos serverless

export const MONGODB_CONFIG = {
  // Connection Pooling
  MAX_POOL_SIZE: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10'),
  MIN_POOL_SIZE: parseInt(process.env.MONGODB_MIN_POOL_SIZE || '2'),

  // Timeouts
  SERVER_SELECTION_TIMEOUT_MS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || '5000'),
  SOCKET_TIMEOUT_MS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT_MS || '45000'),
  CONNECT_TIMEOUT_MS: parseInt(process.env.MONGODB_CONNECT_TIMEOUT_MS || '10000'),
  MAX_IDLE_TIME_MS: parseInt(process.env.MONGODB_MAX_IDLE_TIME_MS || '60000'),

  // Retry Logic
  RETRY_WRITES: process.env.MONGODB_RETRY_WRITES !== 'false', // Default true
  RETRY_READS: process.env.MONGODB_RETRY_READS !== 'false', // Default true

  // Performance
  AUTO_INDEX: process.env.MONGODB_AUTO_INDEX === 'true', // Default false
} as const;

// ========================================
// 🏷️ CONFIGURACIÓN DEL SERVICIO (NOMBRES)
// ========================================

// ✅ REGLA DIAMANTE: Resolver problema de nombres hardcodeados
// Esta configuración centraliza TODOS los nombres hardcodeados del proyecto
// para permitir fácil cambio de "product-service" a cualquier otro servicio

export const SERVICE_CONFIG = {
  // ========================================
  // 📦 IDENTIDAD DEL SERVICIO
  // ========================================
  identity: {
    name: process.env.SERVICE_NAME || 'product-service',           // Nombre del servicio
    displayName: process.env.SERVICE_DISPLAY_NAME || 'Product Service', // Nombre para display
    description: process.env.SERVICE_DESCRIPTION || 'Serverless API para gestión de productos, categorías y ofertas',
  },

  // ========================================
  // 🏗️ COMPONENTES DE INFRAESTRUCTURA
  // ========================================
  infrastructure: {
    stack: {
      name: process.env.STACK_NAME || 'ProductServiceStack',       // Nombre del stack CDK
      serviceStackName: process.env.SERVICE_STACK_NAME || 'ProductService', // Nombre del construct ServiceStack
      apiGatewayName: process.env.API_GATEWAY_NAME || 'ProductApiGateway', // Nombre del API Gateway
      s3BucketName: process.env.S3_BUCKET_NAME || 'ProductServiceS3Bucket', // Nombre del bucket S3
    },
  },

  // ========================================
  // 🔧 FUNCIONES LAMBDA
  // ========================================
  lambdas: {
    main: process.env.MAIN_LAMBDA_NAME || 'product-api',         // Lambda principal (CRUD products)
    category: process.env.CATEGORY_LAMBDA_NAME || 'category-api', // Lambda de categorías
    deal: process.env.DEAL_LAMBDA_NAME || 'deal-api',            // Lambda de ofertas
    image: process.env.IMAGE_LAMBDA_NAME || 'image-api',         // Lambda de imágenes
    queue: process.env.QUEUE_LAMBDA_NAME || 'message-queue',     // Lambda de cola
  },

  // ========================================
  // 🗄️ BASE DE DATOS
  // ========================================
  database: {
    secretName: process.env.DB_SECRET_NAME || 'prod/product-service/mongodb', // Nombre del secret
    secretDescription: process.env.DB_SECRET_DESCRIPTION || 'MongoDB connection string for Product Service',
  },

  // ========================================
  // 📁 ARCHIVOS Y CLASES
  // ========================================
  code: {
    files: {
      mainApi: process.env.MAIN_API_FILE || 'product-api',         // Archivo principal product-api.ts
      categoryApi: process.env.CATEGORY_API_FILE || 'category-api', // Archivo category-api.ts
      dealApi: process.env.DEAL_API_FILE || 'deal-api',            // Archivo deal-api.ts
      imageApi: process.env.IMAGE_API_FILE || 'image-api',         // Archivo image-api.ts
      mainService: process.env.MAIN_SERVICE_FILE || 'product-service', // Archivo product-service.ts
      categoryService: process.env.CATEGORY_SERVICE_FILE || 'category-service', // Archivo category-service.ts
    },
    classes: {
      mainService: process.env.MAIN_SERVICE_CLASS || 'ProductService',     // Clase ProductService
      categoryService: process.env.CATEGORY_SERVICE_CLASS || 'CategoryService', // Clase CategoryService
      dealService: process.env.DEAL_SERVICE_CLASS || 'DealService',       // Clase DealService
      imageService: process.env.IMAGE_SERVICE_CLASS || 'ImageService',    // Clase ImageService
      mainRepository: process.env.MAIN_REPOSITORY_CLASS || 'ProductRepository', // Clase ProductRepository
      categoryRepository: process.env.CATEGORY_REPOSITORY_CLASS || 'CategoryRepository', // Clase CategoryRepository
    },
  },

  // ========================================
  // 🛤️ RUTAS DE API
  // ========================================
  api: {
    routes: {
      base: process.env.API_BASE_PATH || '/product',               // Ruta base principal
      category: process.env.API_CATEGORY_PATH || '/category',      // Ruta de categorías
      deal: process.env.API_DEAL_PATH || '/deal',                  // Ruta de ofertas
      image: process.env.API_IMAGE_PATH || '/image',               // Ruta de imágenes
    },
  },

  // ========================================
  // 🏷️ PREFIJOS Y NAMESPACES
  // ========================================
  naming: {
    prefixes: {
      project: process.env.PROJECT_PREFIX || 'evilent',            // Prefijo del proyecto
      s3Bucket: process.env.S3_BUCKET_PREFIX || 'product-images',  // Prefijo del bucket S3
      logGroup: process.env.LOG_GROUP_PREFIX || '/aws/lambda/ProductService', // Prefijo de log groups
      secret: process.env.SECRET_PREFIX || 'prod/product-service', // Prefijo de secrets
    },
    entities: {
      main: process.env.MAIN_ENTITY || 'Product',                  // Entidad principal
      category: process.env.CATEGORY_ENTITY || 'Category',         // Entidad categoría
      deal: process.env.DEAL_ENTITY || 'Deal',                     // Entidad oferta
      image: process.env.IMAGE_ENTITY || 'Image',                  // Entidad imagen
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
  INTERNAL_SERVER_ERROR: 500,
} as const;

// ========================================
// 🔗 REFERENCIAS LEGACY (POR COMPATIBILIDAD)
// ========================================

// ✅ REGLA #4: Mantener compatibilidad hacia atrás
// Estas constantes apuntan a las nuevas agrupadas para evitar romper código existente

// Legacy Business Limits (apuntan a BUSINESS_LIMITS)
export const PRODUCT_NAME_MAX_LENGTH = BUSINESS_LIMITS.PRODUCT.NAME_MAX_LENGTH;
export const PRODUCT_NAME_MIN_LENGTH = BUSINESS_LIMITS.PRODUCT.NAME_MIN_LENGTH;
export const PRODUCT_DESCRIPTION_MAX_LENGTH = BUSINESS_LIMITS.PRODUCT.DESCRIPTION_MAX_LENGTH;
export const PRODUCT_PRICE_MIN = BUSINESS_LIMITS.PRODUCT.PRICE_MIN;
export const PRODUCT_PRICE_MAX = BUSINESS_LIMITS.PRODUCT.PRICE_MAX;

export const CATEGORY_NAME_MAX_LENGTH = BUSINESS_LIMITS.CATEGORY.NAME_MAX_LENGTH;
export const CATEGORY_NAME_MIN_LENGTH = BUSINESS_LIMITS.CATEGORY.NAME_MIN_LENGTH;
export const CATEGORY_DESCRIPTION_MAX_LENGTH = BUSINESS_LIMITS.CATEGORY.DESCRIPTION_MAX_LENGTH;

export const DEAL_DISCOUNT_MIN = BUSINESS_LIMITS.DEAL.DISCOUNT_MIN;
export const DEAL_DISCOUNT_MAX = BUSINESS_LIMITS.DEAL.DISCOUNT_MAX;

export const DEFAULT_PAGE_SIZE = BUSINESS_LIMITS.PAGINATION.DEFAULT_PAGE_SIZE;
export const MAX_PAGE_SIZE = BUSINESS_LIMITS.PAGINATION.MAX_PAGE_SIZE;

// Legacy Auth Config (apuntan a AUTH_CONFIG)
export const COGNITO_POOL_ID = AUTH_CONFIG.COGNITO_POOL_ID;
export const COGNITO_APP_CLIENT_ID = AUTH_CONFIG.COGNITO_APP_CLIENT_ID;

// Legacy Log Config (apuntan a LOG_CONFIG)
export const LOG_LEVEL = LOG_CONFIG.LEVEL;
export const LOG_REQUEST_DETAILS = LOG_CONFIG.REQUEST_DETAILS;

// Legacy CORS Config (apuntan a CORS_CONFIG)
export const CORS_ENABLED = CORS_CONFIG.ENABLED;
export const CORS_ALLOWED_ORIGINS = CORS_CONFIG.ALLOWED_ORIGINS;

// Legacy Timeout Config (apuntan a TIMEOUT_CONFIG)
export const API_REQUEST_TIMEOUT_MS = TIMEOUT_CONFIG.API_REQUEST_TIMEOUT_MS;

// Legacy MongoDB Config (apuntan a MONGODB_CONFIG)
export const MONGODB_MAX_POOL_SIZE = MONGODB_CONFIG.MAX_POOL_SIZE;
export const MONGODB_MIN_POOL_SIZE = MONGODB_CONFIG.MIN_POOL_SIZE;
export const MONGODB_SERVER_SELECTION_TIMEOUT_MS = MONGODB_CONFIG.SERVER_SELECTION_TIMEOUT_MS;
export const MONGODB_SOCKET_TIMEOUT_MS = MONGODB_CONFIG.SOCKET_TIMEOUT_MS;
export const MONGODB_CONNECT_TIMEOUT_MS = MONGODB_CONFIG.CONNECT_TIMEOUT_MS;
export const MONGODB_MAX_IDLE_TIME_MS = MONGODB_CONFIG.MAX_IDLE_TIME_MS;
export const MONGODB_RETRY_WRITES = MONGODB_CONFIG.RETRY_WRITES;
export const MONGODB_RETRY_READS = MONGODB_CONFIG.RETRY_READS;
export const MONGODB_AUTO_INDEX = MONGODB_CONFIG.AUTO_INDEX;

// Legacy Service Name (apunta a SERVICE_CONFIG)
export const SERVICE_NAME = SERVICE_CONFIG.identity.name;
