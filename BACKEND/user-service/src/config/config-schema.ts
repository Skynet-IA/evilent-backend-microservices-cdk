/**
 * 🔐 Schemas de Validación para Configuración
 * 
 * REGLA #5: SIEMPRE validar datos de entrada con schemas (Zod)
 * REGLA #4: Centralizar validación de constantes
 * 
 * Estos schemas validan:
 * - Variables de entorno runtime (Cognito, CORS, Logging)
 * - Configuración de PostgreSQL
 * - Identidad del servicio
 * - Límites de negocio
 */

import { z } from 'zod';

// ========================================
// 🔐 ESQUEMAS DE AUTENTICACIÓN (COGNITO)
// ========================================

export const CognitoConfigSchema = z.object({
  POOL_ID: z
    .string({
      required_error: 'COGNITO_POOL_ID es requerido',
      invalid_type_error: 'COGNITO_POOL_ID debe ser un string',
    })
    .min(1, 'COGNITO_POOL_ID no puede estar vacío')
    .regex(
      /^[a-z]{2}-[a-z]+-\d+_[a-zA-Z0-9]+$/,
      'COGNITO_POOL_ID debe tener formato: eu-central-1_abc123'
    ),
  
  APP_CLIENT_ID: z
    .string({
      required_error: 'COGNITO_APP_CLIENT_ID es requerido',
      invalid_type_error: 'COGNITO_APP_CLIENT_ID debe ser un string',
    })
    .min(20, 'COGNITO_APP_CLIENT_ID debe tener al menos 20 caracteres')
    .max(128, 'COGNITO_APP_CLIENT_ID no puede exceder 128 caracteres'),
});

// ========================================
// 📝 ESQUEMAS DE LOGGING
// ========================================

export const LoggingConfigSchema = z.object({
  DEBUG_ENABLED: z.boolean().default(false),
});

// ========================================
// 🎨 ESQUEMAS DE CORS
// ========================================

export const CorsConfigSchema = z.object({
  ENABLED: z.boolean().default(false),
});

// ========================================
// 🌍 ESQUEMAS DE AMBIENTE
// ========================================

export const EnvironmentConfigSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('production'),
});

// ========================================
// 🗄️ ESQUEMAS DE POSTGRESQL
// ========================================

export const PostgreSQLConfigSchema = z.object({
  POOL_MAX: z
    .number()
    .int('Pool max debe ser entero')
    .min(1, 'Pool max mínimo: 1')
    .max(20, 'Pool max máximo: 20 (optimizado para Lambda)')
    .default(2),
  
  POOL_MIN: z
    .number()
    .int('Pool min debe ser entero')
    .min(0, 'Pool min mínimo: 0')
    .max(10, 'Pool min máximo: 10')
    .default(0),
  
  POOL_IDLE_TIMEOUT_MS: z
    .number()
    .int('Idle timeout debe ser entero')
    .min(1000, 'Idle timeout mínimo: 1s')
    .max(600000, 'Idle timeout máximo: 10min')
    .default(120000),
  
  CONNECTION_TIMEOUT_MS: z
    .number()
    .int('Connection timeout debe ser entero')
    .min(1000, 'Connection timeout mínimo: 1s')
    .max(30000, 'Connection timeout máximo: 30s')
    .default(3000),
});

// ========================================
// 🏷️ ESQUEMAS DE IDENTIDAD DEL SERVICIO
// ========================================

export const ServiceIdentitySchema = z.object({
  NAME: z
    .string()
    .min(3, 'Service name debe tener al menos 3 caracteres')
    .max(50, 'Service name no puede exceder 50 caracteres')
    .default('user-service'),
  
  DISPLAY_NAME: z
    .string()
    .min(3, 'Display name debe tener al menos 3 caracteres')
    .max(100, 'Display name no puede exceder 100 caracteres')
    .default('User Service'),
  
  DESCRIPTION: z
    .string()
    .max(500, 'Description no puede exceder 500 caracteres')
    .default('Serverless API para gestión de perfiles de usuario con Cognito + PostgreSQL'),
});

// ========================================
// 📊 ESQUEMAS DE LÍMITES DE NEGOCIO
// ========================================

export const UserLimitsSchema = z.object({
  FIRST_NAME_MIN_LENGTH: z.number().int().min(1).max(50).default(1),
  FIRST_NAME_MAX_LENGTH: z.number().int().min(10).max(100).default(50),
  LAST_NAME_MIN_LENGTH: z.number().int().min(1).max(50).default(1),
  LAST_NAME_MAX_LENGTH: z.number().int().min(10).max(100).default(50),
  PHONE_MIN_LENGTH: z.number().int().min(7).max(30).default(7),
  PHONE_MAX_LENGTH: z.number().int().min(10).max(30).default(20),
  EMAIL_MAX_LENGTH: z.number().int().min(50).max(500).default(255),
});

// ========================================
// 🎯 ESQUEMA COMPLETO DE CONFIGURACIÓN
// ========================================

export const CompleteConfigSchema = z.object({
  cognito: CognitoConfigSchema,
  logging: LoggingConfigSchema,
  cors: CorsConfigSchema,
  environment: EnvironmentConfigSchema,
  postgresql: PostgreSQLConfigSchema,
  serviceIdentity: ServiceIdentitySchema,
  userLimits: UserLimitsSchema,
});

// ========================================
// 📦 NOTA: TIPOS MOVIDOS A config-types.ts
// ========================================

/**
 * ✅ REGLA #9: Consistencia arquitectónica
 * 
 * Los tipos ahora están en config-types.ts para:
 * - Separación de responsabilidades (schemas vs tipos)
 * - Imports más eficientes (solo tipos sin schemas)
 * - Consistencia con product-service
 * 
 * Para usar los tipos:
 * import type { CognitoConfig, ValidatedConfig } from './config-types.js';
 */

