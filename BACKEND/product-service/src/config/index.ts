/**
 * 🎯 Punto central de exportación de configuración
 * 
 * REGLA #4: Centralizar todo en UN lugar
 * 
 * Exporta:
 * ✅ Constantes validadas + tipadas (NEW)
 * ✅ Tipos TypeScript
 * ✅ Referencias legacy para compatibilidad
 */

// ========================================
// ✅ EXPORTAR CONSTANTES VALIDADAS + TIPADAS (NUEVO)
// ========================================

export {
  VALIDATED_CONFIG,
  GLOBAL_CONFIG,
  INFRASTRUCTURE_CONFIG,
  S3_CONFIG,
  BUSINESS_LIMITS,
  LOG_CONFIG,
  CORS_CONFIG,
  TIMEOUT_CONFIG,
  AUTH_CONFIG,
  MONGODB_CONFIG,
  SERVICE_CONFIG,
  // Legacy exports
  PROJECT_NAME,
  AWS_REGION,
  LAMBDA_TIMEOUT_SECONDS,
  LAMBDA_MEMORY_MB,
  LAMBDA_EPHEMERAL_STORAGE_MB,
  API_GATEWAY_THROTTLING_RATE_LIMIT,
  API_GATEWAY_THROTTLING_BURST_LIMIT,
  S3_IMAGE_MAX_SIZE_MB,
  S3_IMAGE_ALLOWED_TYPES,
  PRODUCT_NAME_MAX_LENGTH,
  PRODUCT_NAME_MIN_LENGTH,
  PRODUCT_DESCRIPTION_MAX_LENGTH,
  PRODUCT_PRICE_MIN,
  PRODUCT_PRICE_MAX,
  CATEGORY_NAME_MAX_LENGTH,
  CATEGORY_NAME_MIN_LENGTH,
  CATEGORY_DESCRIPTION_MAX_LENGTH,
  DEAL_DISCOUNT_MIN,
  DEAL_DISCOUNT_MAX,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  LOG_LEVEL,
  LOG_REQUEST_DETAILS,
  CORS_ENABLED,
  CORS_ALLOWED_ORIGINS,
  API_REQUEST_TIMEOUT_MS,
  COGNITO_POOL_ID,
  COGNITO_APP_CLIENT_ID,
  MONGODB_MAX_POOL_SIZE,
  MONGODB_MIN_POOL_SIZE,
  MONGODB_SERVER_SELECTION_TIMEOUT_MS,
  MONGODB_SOCKET_TIMEOUT_MS,
  MONGODB_CONNECT_TIMEOUT_MS,
  MONGODB_MAX_IDLE_TIME_MS,
  MONGODB_RETRY_WRITES,
  MONGODB_RETRY_READS,
  MONGODB_AUTO_INDEX,
  SERVICE_NAME,
} from './validated-constants.js';

// ========================================
// ✅ EXPORTAR TIPOS
// ========================================

export type {
  GlobalConfig,
  InfrastructureConfig,
  S3Config,
  BusinessLimits,
  LogConfig,
  CorsConfig,
  TimeoutConfig,
  AuthConfig,
  MongoDBConfig,
  ServiceConfig,
  ValidatedConfig,
} from './validated-constants.js';

export type {
  ReadonlyGlobalConfig,
  ReadonlyInfrastructureConfig,
  ReadonlyS3Config,
  ReadonlyBusinessLimits,
  ReadonlyLogConfig,
  ReadonlyCorsConfig,
  ReadonlyTimeoutConfig,
  ReadonlyAuthConfig,
  ReadonlyMongoDBConfig,
  ReadonlyServiceConfig,
  ReadonlyValidatedConfig,
} from './config-types.js';

// ========================================
// ⚠️ DEPRECATED: constants.ts (Legacy)
// ========================================

/**
 * ⚠️ DEPRECATED: Este archivo se mantiene SOLO por compatibilidad backward.
 * 
 * MIGRACIÓN REQUERIDA:
 * 
 * ❌ ANTIGUO (deprecated):
 *   import { PRODUCT_NAME_MAX_LENGTH } from '@/config/constants';
 *   import { COGNITO_POOL_ID } from '@/config/constants';
 * 
 * ✅ NUEVO (recomendado):
 *   import { BUSINESS_LIMITS } from '@/config';  // Validado + Tipado
 *   import { AUTH_CONFIG } from '@/config';      // Validado + Tipado
 * 
 * LÍNEA DE CORTE: El archivo constants.js será ELIMINADO en v2.0 (Q2 2025)
 * Tiempo de migración: ~6 meses desde hoy
 * 
 * ¿Por qué?
 * - Los antiguos imports NO validan datos en startup
 * - Los nuevos imports SI validan datos y garantizan tipos correctos
 * - Los nuevos imports son más escalables (estructura jerárquica)
 */

export * from './constants.js';
export { HTTP_STATUS } from './constants.js';

