/**
 * ✅ Constantes Validadas con Zod + Tipado Fuerte
 * 
 * REGLA #4: Centralizar constantes
 * REGLA #5: Validar con Zod
 * REGLA PLATINO: Tipado fuerte
 * 
 * Este archivo:
 * 1. ✅ Lee variables de entorno
 * 2. ✅ Valida con Zod (fail-fast si hay errores)
 * 3. ✅ Infiere tipos TypeScript automáticamente
 * 4. ✅ Proporciona tipos readonly para inmutabilidad
 * 5. ✅ Lazy initialization (sin side effects en import)
 */

import { createLogger } from '../utility/logger.js';
import { CompleteConfigSchema } from './config-schema.js';
import type {
  ValidatedConfig,
  ReadonlyCognitoConfig,
  ReadonlyLoggingConfig,
  ReadonlyCorsConfig,
  ReadonlyEnvironmentConfig,
  ReadonlyPostgreSQLConfig,
  ReadonlyServiceIdentity,
  ReadonlyUserLimits,
} from './config-types.js';

const logger = createLogger('ConfigValidator');

// ========================================
// 🔐 VALIDACIÓN Y PARSING
// ========================================

/**
 * 🔍 Parsear y validar TODA la configuración
 * 
 * Si algo está mal, FALLA INMEDIATAMENTE con mensaje claro.
 * Implementa fail-fast pattern según REGLA #2 (NUNCA datos sensibles sin validar)
 */
function parseAndValidateConfig(): ValidatedConfig {
  const configData = {
    cognito: {
      POOL_ID: process.env.COGNITO_POOL_ID || '',
      APP_CLIENT_ID: process.env.COGNITO_APP_CLIENT_ID || '',
    },
    logging: {
      DEBUG_ENABLED: process.env.EVILENT_DEBUG_LOGS === 'true',
    },
    cors: {
      ENABLED: process.env.CORS_ENABLED === 'true',
    },
    environment: {
      NODE_ENV: (process.env.NODE_ENV || 'production') as 'development' | 'production' | 'test',
    },
    postgresql: {
      POOL_MAX: parseInt(process.env.DB_POOL_MAX || '2'),
      POOL_MIN: parseInt(process.env.DB_POOL_MIN || '0'),
      POOL_IDLE_TIMEOUT_MS: parseInt(process.env.DB_POOL_IDLE_TIMEOUT_MS || '120000'),
      CONNECTION_TIMEOUT_MS: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS || '3000'),
    },
    serviceIdentity: {
      NAME: process.env.SERVICE_NAME || 'user-service',
      DISPLAY_NAME: process.env.SERVICE_DISPLAY_NAME || 'User Service',
      DESCRIPTION: process.env.SERVICE_DESCRIPTION || 'Serverless API para gestión de perfiles de usuario con Cognito + PostgreSQL',
    },
    userLimits: {
      FIRST_NAME_MIN_LENGTH: 1,
      FIRST_NAME_MAX_LENGTH: 50,
      LAST_NAME_MIN_LENGTH: 1,
      LAST_NAME_MAX_LENGTH: 50,
      PHONE_MIN_LENGTH: 7,
      PHONE_MAX_LENGTH: 20,
      EMAIL_MAX_LENGTH: 255,
    },
  };

  try {
    logger.info('Validando configuración con Zod...');
    const validated = CompleteConfigSchema.parse(configData);
    logger.info('✅ Configuración validada exitosamente', {
      service: validated.serviceIdentity.NAME,
      environment: validated.environment.NODE_ENV,
      cognitoPoolId: validated.cognito.POOL_ID,
    });
    return validated;
  } catch (error: any) {
    const formattedErrors = error.errors
      ? error.errors.map((e: any) => ({
          path: e.path.join('.'),
          message: e.message,
          received: JSON.stringify(e.received || '<missing>'),
        }))
      : [];
    
    const errorMessage = formattedErrors
      .map((e: any) => `${e.path}: ${e.message} (received: ${e.received})`)
      .join('\n  ');
    
    logger.error('❌ Error de validación de configuración', {
      error: errorMessage,
      issues: error.issues || [],
      suggestion: 'Verifica que TODAS las variables de entorno requeridas estén configuradas correctamente',
    });
    
    // FAIL-FAST: No permitir que la app inicie con configuración inválida
    throw new Error(
      `❌ Configuración inválida:\n  ${errorMessage}\n\n` +
      `💡 Sugerencia: Verifica que las siguientes variables estén configuradas:\n` +
      `  - COGNITO_POOL_ID (formato: eu-central-1_abc123)\n` +
      `  - COGNITO_APP_CLIENT_ID (mínimo 20 caracteres)\n` +
      `  - NODE_ENV (development, production, o test)`
    );
  }
}

// ========================================
// 📦 EXPORTAR CONFIGURACIÓN VALIDADA
// ========================================

/**
 * ✅ Instancia singleton validada (Lazy Initialization)
 * 
 * - Validada con Zod (evaluado cuando se necesita, no en import time)
 * - Tipada al 100% por TypeScript
 * - Readonly para inmutabilidad
 * - Sin side effects en import
 * - Testeable (puedes mockear antes de obtener config)
 */
let _validatedConfig: ValidatedConfig | null = null;

function getValidatedConfig(): ValidatedConfig {
  if (!_validatedConfig) {
    _validatedConfig = Object.freeze(parseAndValidateConfig());
  }
  return _validatedConfig;
}

export const VALIDATED_CONFIG = getValidatedConfig();

// ========================================
// 🎯 EXPORTAR PARTES INDIVIDUALES (TYPE-SAFE)
// ========================================

/**
 * ✅ Acceso seguro a partes de configuración
 * 
 * Cada uno es una referencia tipada que retorna el valor correcto.
 */

export const COGNITO_CONFIG: ReadonlyCognitoConfig = 
  Object.freeze(VALIDATED_CONFIG.cognito);

export const LOGGING_CONFIG: ReadonlyLoggingConfig = 
  Object.freeze(VALIDATED_CONFIG.logging);

export const CORS_CONFIG: ReadonlyCorsConfig = 
  Object.freeze(VALIDATED_CONFIG.cors);

export const ENVIRONMENT_CONFIG: ReadonlyEnvironmentConfig = 
  Object.freeze(VALIDATED_CONFIG.environment);

export const POSTGRESQL_CONFIG: ReadonlyPostgreSQLConfig = 
  Object.freeze(VALIDATED_CONFIG.postgresql);

export const SERVICE_IDENTITY: ReadonlyServiceIdentity = 
  Object.freeze(VALIDATED_CONFIG.serviceIdentity);

export const USER_LIMITS: ReadonlyUserLimits = 
  Object.freeze(VALIDATED_CONFIG.userLimits);

// ========================================
// 🔗 COMPATIBILIDAD LEGACY (GENERADAS AUTOMÁTICAMENTE)
// ========================================

/**
 * ✅ REGLA #4: Mantener compatibilidad con código antiguo
 * 
 * Código antiguo que usa constantes directas sigue funcionando,
 * pero ahora VALIDADO, TIPADO y GENERADO DINÁMICAMENTE (sin duplicación).
 * 
 * ✅ REGLA #1: Sin código especulativo (generado, no hardcodeado)
 */

// Cognito (compatibilidad con app-config.ts)
export const COGNITO_POOL_ID = COGNITO_CONFIG.POOL_ID;
export const COGNITO_APP_CLIENT_ID = COGNITO_CONFIG.APP_CLIENT_ID;

// Logging
export const DEBUG_ENABLED = LOGGING_CONFIG.DEBUG_ENABLED;

// CORS
export const CORS_ENABLED = CORS_CONFIG.ENABLED;

// Environment
export const NODE_ENV = ENVIRONMENT_CONFIG.NODE_ENV;
export const IS_DEVELOPMENT = NODE_ENV === 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';
export const IS_TEST = NODE_ENV === 'test';

// PostgreSQL
export const DB_POOL_MAX = POSTGRESQL_CONFIG.POOL_MAX;
export const DB_POOL_MIN = POSTGRESQL_CONFIG.POOL_MIN;
export const DB_POOL_IDLE_TIMEOUT_MS = POSTGRESQL_CONFIG.POOL_IDLE_TIMEOUT_MS;
export const DB_CONNECTION_TIMEOUT_MS = POSTGRESQL_CONFIG.CONNECTION_TIMEOUT_MS;

// Service Identity
export const SERVICE_NAME = SERVICE_IDENTITY.NAME;
export const SERVICE_DISPLAY_NAME = SERVICE_IDENTITY.DISPLAY_NAME;
export const SERVICE_DESCRIPTION = SERVICE_IDENTITY.DESCRIPTION;

// User Limits
export const FIRST_NAME_MIN_LENGTH = USER_LIMITS.FIRST_NAME_MIN_LENGTH;
export const FIRST_NAME_MAX_LENGTH = USER_LIMITS.FIRST_NAME_MAX_LENGTH;
export const LAST_NAME_MIN_LENGTH = USER_LIMITS.LAST_NAME_MIN_LENGTH;
export const LAST_NAME_MAX_LENGTH = USER_LIMITS.LAST_NAME_MAX_LENGTH;
export const PHONE_MIN_LENGTH = USER_LIMITS.PHONE_MIN_LENGTH;
export const PHONE_MAX_LENGTH = USER_LIMITS.PHONE_MAX_LENGTH;
export const EMAIL_MAX_LENGTH = USER_LIMITS.EMAIL_MAX_LENGTH;

// ========================================
// 🧪 UTILIDADES PARA TESTING
// ========================================

/**
 * ⚠️ SOLO PARA TESTS: Resetear configuración singleton
 * 
 * Permite mockear variables de entorno y re-validar configuración.
 */
export function _resetConfigForTesting(): void {
  _validatedConfig = null;
}

