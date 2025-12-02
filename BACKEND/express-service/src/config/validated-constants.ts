/**
 * ✅ Constantes Validadas con Zod + Tipado Fuerte
 *
 * FILOSOFÍA (REGLA DIAMANTE EXTENDIDA):
 * Este archivo implementa CAPA 2 de DEFENSE IN DEPTH:
 * - Capa 1: TypeScript type-checking (config-types.ts)
 * - Capa 2: Zod runtime validation (ESTE ARCHIVO) ← FAIL-FAST
 * - Capa 3: Readonly<> immutability (config-types.ts)
 *
 * REGLA #2: NUNCA exponer datos sensibles
 * REGLA #5: Validar datos de entrada con schemas (Zod)
 * REGLA #6: Defense in depth - múltiples capas de validación
 * REGLA PLATINO: Código escalable y mantenible
 *
 * ✅ FUNCIONALIDAD:
 *   1. Lee variables de entorno (process.env)
 *   2. Mapea a estructura de config
 *   3. Valida con Zod (FAIL-FAST si hay error)
 *   4. Logs con logger estructurado
 *   5. Exporta valores tipados y seguros (Readonly<>)
 */

import logger from '../utility/logger';
import { CompleteConfigSchema } from './config-schema';
import type {
  CompleteConfig,
  ReadonlyServiceIdentity,
  ReadonlyServerConfig,
  ReadonlyLoggingConfig,
  ReadonlyTimeoutConfig,
  ReadonlyAuthConfig,
  ReadonlyDatabaseConfig,
  ReadonlyCorsConfig,
  ReadonlyBusinessLimits,
} from './config-types';

import {
  SERVICE_CONFIG,
  BUSINESS_LIMITS,
  TIMEOUT_CONFIG,
  AUTH_CONFIG,
  DATABASE_CONFIG,
} from './constants';

// ============================================================================
// 🔐 VALIDACIÓN Y PARSING - FAIL-FAST EN STARTUP
// ============================================================================

/**
 * 🔍 Parsear y validar TODA la configuración en tiempo de startup
 *
 * Si algo está mal, FALLA INMEDIATAMENTE con mensaje claro.
 * Implementa fail-fast pattern según REGLA #2 y #6 (seguridad defensiva).
 *
 * REGLA #2: Si credenciales faltan → ERROR (no defaults para credentials)
 * REGLA #6: Validación en compilación + runtime + tipos
 */
function parseAndValidateConfig(): CompleteConfig {
  const configData = {
    // ✅ Service Identity (de constants.ts)
    service: {
      name: SERVICE_CONFIG.identity.name,
      displayName: SERVICE_CONFIG.identity.displayName,
      description: SERVICE_CONFIG.identity.description,
      version: SERVICE_CONFIG.identity.version,
    },

    // ✅ Server Configuration (Express.js specific)
    server: {
      port: SERVICE_CONFIG.server.port,
      env: SERVICE_CONFIG.server.env,
      timeout: SERVICE_CONFIG.server.timeout,
    },

    // ✅ Logging Configuration (CloudWatch compatible)
    logging: {
      level: SERVICE_CONFIG.logging.level,
      format: SERVICE_CONFIG.logging.format,
    },

    // ✅ Timeout Configuration (centralizados)
    timeout: TIMEOUT_CONFIG,

    // ✅ Authentication Configuration (AWS Cognito)
    // REGLA #2: FAIL-FAST si credenciales faltan
    auth: {
      COGNITO_POOL_ID: AUTH_CONFIG.COGNITO_POOL_ID,
      COGNITO_APP_CLIENT_ID: AUTH_CONFIG.COGNITO_APP_CLIENT_ID,
      COGNITO_REGION: AUTH_CONFIG.COGNITO_REGION,
    },

    // ✅ Database Configuration (PostgreSQL)
    database: {
      HOST: DATABASE_CONFIG.HOST,
      PORT: DATABASE_CONFIG.PORT,
      USER: DATABASE_CONFIG.USER,
      PASSWORD: DATABASE_CONFIG.PASSWORD,
      NAME: DATABASE_CONFIG.NAME,
      MAX_CONNECTIONS: DATABASE_CONFIG.POOL_MAX,
      IDLE_TIMEOUT_MS: 30000,
      CONNECTION_TIMEOUT_MS: 2000,
    },

    // ✅ CORS Configuration
    cors: {
      ALLOW_CREDENTIALS: true,
      ALLOW_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      ALLOW_HEADERS: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-Request-ID',
      ],
      MAX_AGE_SECONDS: 3600,
    },

    // ✅ Business Limits (scalable, replicable)
    businessLimits: BUSINESS_LIMITS,
  };

  try {
    // 🔐 VALIDACIÓN CON ZOD (FAIL-FAST)
    logger.info('🔍 Validando configuración con Zod schemas...', {
      service: configData.service.name,
      environment: configData.server.env,
    });

    const validated = CompleteConfigSchema.parse(configData);

    // ✅ LOG SUCCESS (REGLA #3: Logger estructurado)
    logger.info('✅ Configuración validada exitosamente', {
      service: validated.service.name,
      environment: validated.server.env,
      port: validated.server.port,
      databaseHost: validated.database.HOST,
      cognitoPoolId: validated.auth.COGNITO_POOL_ID.substring(0, 20) + '***',
      logLevel: validated.logging.level,
    });

    return validated;
  } catch (error: any) {
    // ❌ PARSE ERROR HANDLING (REGLA #3: Logger estructurado)
    const formattedErrors = error.errors
      ? error.errors.map((e: any) => ({
          path: e.path.join('.'),
          message: e.message,
          received: JSON.stringify(e.received || '<missing>'),
        }))
      : [];

    const errorMessage = formattedErrors
      .map((e: any) => `  • ${e.path}: ${e.message} (received: ${e.received})`)
      .join('\n');

    logger.error(
      '❌ Error de validación de configuración - STARTUP FAILED',
      {
        errorCount: formattedErrors.length,
        errors: errorMessage,
        context: 'config-validation-failed',
      }
    );

    // 🚨 FAIL-FAST: Detener aplicación si config es inválida (REGLA #2 + #6)
    process.exit(1);
  }
}

// ============================================================================
// 🚀 LAZY INITIALIZATION - Se ejecuta al IMPORT (fail-fast)
// ============================================================================

/**
 * Validar configuración al cargar el módulo
 * Esto garantiza que la app FALLA AL STARTUP si hay problemas
 * No se espera hasta runtime (REGLA #6: defense in depth)
 */
const validatedConfig = parseAndValidateConfig();

// ============================================================================
// 📤 EXPORTS - Valores tipados y seguros (Readonly<>)
// ============================================================================

/**
 * Configuración completa validada
 * REGLA PLATINO: Escalable - agregar config = agregar export
 */
export const config: Readonly<CompleteConfig> = validatedConfig;

/**
 * Sub-configs exportados individualmente para convenience
 * Todos con Readonly<> para inmutabilidad (REGLA #6: defense in depth)
 */

export const service: ReadonlyServiceIdentity = validatedConfig.service;

export const server: ReadonlyServerConfig = validatedConfig.server;

export const logging: ReadonlyLoggingConfig = validatedConfig.logging;

export const timeout: ReadonlyTimeoutConfig = validatedConfig.timeout;

export const auth: ReadonlyAuthConfig = validatedConfig.auth;

export const database: ReadonlyDatabaseConfig = validatedConfig.database;

export const cors: ReadonlyCorsConfig = validatedConfig.cors;

export const businessLimits: ReadonlyBusinessLimits =
  validatedConfig.businessLimits;

// ============================================================================
// 🔒 TYPE EXPORTS - Para garantizar tipado fuerte (REGLA PLATINO)
// ============================================================================

export type { CompleteConfig } from './config-types';
export type {
  ReadonlyServiceIdentity,
  ReadonlyServerConfig,
  ReadonlyLoggingConfig,
  ReadonlyTimeoutConfig,
  ReadonlyAuthConfig,
  ReadonlyDatabaseConfig,
  ReadonlyCorsConfig,
  ReadonlyBusinessLimits,
} from './config-types';

