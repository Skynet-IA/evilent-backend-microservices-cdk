/**
 * 🎯 Punto central de exportación de configuración
 * 
 * REGLA #4: Centralizar todo en UN lugar
 * REGLA #9: Consistencia arquitectónica con product-service
 * 
 * Exporta:
 * ✅ Constantes validadas + tipadas (NUEVO)
 * ✅ Tipos TypeScript
 * ✅ Referencias legacy para compatibilidad
 */

// ========================================
// ✅ EXPORTAR CONSTANTES VALIDADAS + TIPADAS (NUEVO)
// ========================================

export {
  VALIDATED_CONFIG,
  COGNITO_CONFIG,
  LOGGING_CONFIG,
  CORS_CONFIG,
  ENVIRONMENT_CONFIG,
  POSTGRESQL_CONFIG,
  SERVICE_IDENTITY,
  USER_LIMITS,
  
  // Legacy exports validados (SOLO los más usados)
  COGNITO_POOL_ID,
  COGNITO_APP_CLIENT_ID,
  CORS_ENABLED,
  DB_POOL_MAX,
  DB_POOL_MIN,
  SERVICE_NAME,
  SERVICE_DISPLAY_NAME,
  FIRST_NAME_MAX_LENGTH,
  LAST_NAME_MAX_LENGTH,
  PHONE_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
} from './validated-constants.js';

// Legacy exports desde constants.ts (infraestructura CDK y runtime)
export {
  PROJECT_NAME,
  AWS_REGION,
  LAMBDA_TIMEOUT_SECONDS,
  LAMBDA_MEMORY_MB,
  LAMBDA_EPHEMERAL_STORAGE_MB,
  API_GATEWAY_THROTTLING_RATE_LIMIT,
  API_GATEWAY_THROTTLING_BURST_LIMIT,
  API_REQUEST_TIMEOUT_MS,
  DB_QUERY_TIMEOUT_MS,
  LOG_LEVEL,
  LOG_REQUEST_DETAILS,
  CORS_ALLOWED_ORIGINS,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  HTTP_STATUS,
  RESPONSE_MESSAGES,
} from './constants.js';

// App config
export { config } from './app-config.js';
export type { AppConfig } from './app-config.js';

// ========================================
// ✅ EXPORTAR TIPOS
// ========================================

export type {
  CognitoConfig,
  LoggingConfig,
  CorsConfig,
  EnvironmentConfig,
  PostgreSQLConfig,
  ServiceIdentity,
  UserLimits,
  ValidatedConfig,
  ReadonlyCognitoConfig,
  ReadonlyLoggingConfig,
  ReadonlyCorsConfig,
  ReadonlyEnvironmentConfig,
  ReadonlyPostgreSQLConfig,
  ReadonlyServiceIdentity,
  ReadonlyUserLimits,
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
 *   import { USER_FIRST_NAME_MAX_LENGTH } from '@/config/constants';
 *   import { COGNITO_POOL_ID } from '@/config/constants';
 * 
 * ✅ NUEVO (recomendado):
 *   import { USER_LIMITS } from '@/config';  // Validado + Tipado
 *   import { COGNITO_CONFIG } from '@/config';      // Validado + Tipado
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

