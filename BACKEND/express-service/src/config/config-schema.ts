/**
 * 🔒 SCHEMAS ZOD - Validación de Configuración
 *
 * FILOSOFÍA:
 * Estos schemas definen el "contrato" de configuración para toda la aplicación.
 * Todos los valores de constants.ts se validan contra estos schemas.
 *
 * REGLA #5: Validar datos de entrada con schemas (Zod)
 * REGLA #6: Defense in depth - Validación en compilación + runtime
 * REGLA PLATINO: Código escalable y declarativo
 *
 * BENEFICIOS:
 * ✅ Si cambias el schema, TypeScript te avisa de incompatibilidades
 * ✅ Runtime validation con mensajes de error claros
 * ✅ Escalable: agregar nueva config = agregar nuevo schema
 * ✅ Centralizado: una sola fuente de verdad para validación
 *
 * USO:
 * En validated-constants.ts:
 *   const config = CompleteConfigSchema.parse({...})
 *
 * En config-types.ts:
 *   export type ValidatedConfig = z.infer<typeof CompleteConfigSchema>
 */

import { z } from 'zod';

// ============================================================================
// 🏠 SERVICE IDENTITY SCHEMA
// ============================================================================

/**
 * Identidad del servicio - Información básica del servicio
 * REGLA DIAMANTE EXTENDIDA: Punto único de cambio para replicar servicio
 * Cambiar solo el campo 'name' replica el servicio a otro proyecto
 */
export const ServiceIdentitySchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Service name debe tener al menos 3 caracteres' })
    .max(50, { message: 'Service name no puede exceder 50 caracteres' })
    .regex(/^[a-z0-9-]+$/, {
      message: 'Service name solo puede contener minúsculas, números y guiones',
    }),
  displayName: z
    .string()
    .min(3, { message: 'Display name debe tener al menos 3 caracteres' })
    .max(100, { message: 'Display name no puede exceder 100 caracteres' }),
  description: z
    .string()
    .min(10, { message: 'Description debe tener al menos 10 caracteres' })
    .max(500, { message: 'Description no puede exceder 500 caracteres' }),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, {
      message: 'Version debe ser formato semver (ej: 1.0.0)',
    }),
});

// ============================================================================
// 🖥️ SERVER CONFIG SCHEMA
// ============================================================================

/**
 * Configuración del servidor Express
 */
export const ServerConfigSchema = z.object({
  port: z
    .number()
    .min(1024, { message: 'Puerto debe ser >= 1024 (no privilegiado)' })
    .max(65535, { message: 'Puerto debe ser <= 65535' }),
  env: z
    .enum(['development', 'staging', 'production'], {
      errorMap: () => ({
        message: 'NODE_ENV debe ser: development, staging o production',
      }),
    }),
  timeout: z
    .number()
    .positive({ message: 'Timeout debe ser positivo' })
    .max(60000, { message: 'Timeout no puede exceder 60 segundos' }),
});

// ============================================================================
// 📊 LOGGING CONFIG SCHEMA
// ============================================================================

/**
 * Configuración de logging estructurado
 * CloudWatch compatible con niveles JSON
 */
export const LoggingConfigSchema = z.object({
  level: z.enum(['debug', 'info', 'warn', 'error'], {
    errorMap: () => ({
      message: 'LOG_LEVEL debe ser: debug, info, warn o error',
    }),
  }),
  format: z
    .enum(['json', 'text'], {
      errorMap: () => ({ message: 'Format debe ser: json o text' }),
    })
    .default('json'),
});

// ============================================================================
// ⏱️ TIMEOUT CONFIG SCHEMA
// ============================================================================

/**
 * Timeouts para diferentes operaciones
 * REGLA #4: Centralizar todos los timeouts
 */
export const TimeoutConfigSchema = z.object({
  API_REQUEST_TIMEOUT_MS: z
    .number()
    .positive()
    .max(30000, { message: 'API timeout no puede exceder 30 segundos' }),
  API_RESPONSE_TIMEOUT_MS: z
    .number()
    .positive()
    .max(60000, { message: 'Response timeout no puede exceder 60 segundos' }),
  DATABASE_TIMEOUT_MS: z
    .number()
    .positive()
    .max(60000, { message: 'Database timeout no puede exceder 60 segundos' }),
  COGNITO_TIMEOUT_MS: z
    .number()
    .positive()
    .max(15000, { message: 'Cognito timeout no puede exceder 15 segundos' }),
});

// ============================================================================
// 🔐 AUTHENTICATION CONFIG SCHEMA (Cognito)
// ============================================================================

/**
 * Configuración de AWS Cognito
 * REGLA #2: Nunca exponer credenciales - vienen de variables de entorno
 * REGLA #6: Defense in depth - validar credenciales en tiempo de compilación
 */
export const AuthConfigSchema = z.object({
  COGNITO_POOL_ID: z
    .string()
    .min(1, { message: 'COGNITO_POOL_ID es requerido (variable de entorno)' })
    .regex(/^[a-z0-9-]+_[a-zA-Z0-9]+$/, {
      message:
        'COGNITO_POOL_ID inválido (formato: region_poolid, ej: eu-central-1_abc123)',
    }),
  COGNITO_APP_CLIENT_ID: z
    .string()
    .min(1, {
      message:
        'COGNITO_APP_CLIENT_ID es requerido (variable de entorno)',
    })
    .min(20, {
      message: 'COGNITO_APP_CLIENT_ID inválido (muy corto)',
    }),
  COGNITO_REGION: z
    .string()
    .min(1, { message: 'COGNITO_REGION es requerido' })
    .regex(/^[a-z0-9-]+$/, {
      message:
        'COGNITO_REGION inválido (ej: eu-central-1, us-east-1)',
    }),
});

// ============================================================================
// 🗄️ DATABASE CONFIG SCHEMA (PostgreSQL)
// ============================================================================

/**
 * Configuración de conexión PostgreSQL
 * REGLA #2: Credenciales vienen de .env, validadas aquí
 * REGLA #5: Validar rangos y formatos de valores de BD
 */
export const DatabaseConfigSchema = z.object({
  HOST: z
    .string()
    .min(1, { message: 'DB_HOST es requerido' })
    .refine((host) => {
      // Validar que sea hostname o IP válida
      const hostnameRegex = /^[a-zA-Z0-9.-]+$/;
      return hostnameRegex.test(host);
    }, 'DB_HOST inválido (hostname o IP inválida)'),
  PORT: z
    .number()
    .min(1, { message: 'DB_PORT debe ser > 0' })
    .max(65535, { message: 'DB_PORT debe ser <= 65535' })
    .int({ message: 'DB_PORT debe ser entero' }),
  USER: z
    .string()
    .min(1, { message: 'DB_USER es requerido' })
    .max(63, { message: 'DB_USER no puede exceder 63 caracteres (límite PostgreSQL)' }),
  PASSWORD: z
    .string()
    .min(1, { message: 'DB_PASSWORD es requerido' })
    .max(100, { message: 'DB_PASSWORD no puede exceder 100 caracteres' }),
  NAME: z
    .string()
    .min(1, { message: 'DB_NAME es requerido' })
    .max(63, { message: 'DB_NAME no puede exceder 63 caracteres' })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'DB_NAME solo puede contener letras, números y guiones bajos',
    }),
  MAX_CONNECTIONS: z
    .number()
    .min(1, { message: 'Max connections debe ser >= 1' })
    .max(100, { message: 'Max connections no puede exceder 100' }),
  IDLE_TIMEOUT_MS: z
    .number()
    .positive({ message: 'Idle timeout debe ser positivo' })
    .max(600000, { message: 'Idle timeout no puede exceder 10 minutos' }),
  CONNECTION_TIMEOUT_MS: z
    .number()
    .positive({ message: 'Connection timeout debe ser positivo' })
    .max(30000, { message: 'Connection timeout no puede exceder 30 segundos' }),
});

// ============================================================================
// 🌐 CORS CONFIG SCHEMA
// ============================================================================

/**
 * Configuración de CORS (Cross-Origin Resource Sharing)
 * REGLA #9: Consistencia - Mismo patrón que user-service
 */
export const CorsConfigSchema = z.object({
  ALLOW_CREDENTIALS: z
    .boolean()
    .default(true),
  ALLOW_METHODS: z
    .array(z.string())
    .min(1, { message: 'Debe permitir al menos un método HTTP' })
    .default(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']),
  ALLOW_HEADERS: z
    .array(z.string())
    .default([
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-Request-ID',
    ]),
  MAX_AGE_SECONDS: z
    .number()
    .positive()
    .default(3600),
});

// ============================================================================
// 📊 BUSINESS LIMITS SCHEMA
// ============================================================================

/**
 * Límites de negocio - Validaciones de datos de usuario
 * REGLA #5: Validar inputs del usuario antes de procesarlos
 * REGLA PLATINO: Escalable - Agregar nuevo límite = agregar propiedad
 */
export const BusinessLimitsSchema = z.object({
  USER: z.object({
    FIRST_NAME_MIN_LENGTH: z
      .number()
      .positive()
      .default(1),
    FIRST_NAME_MAX_LENGTH: z
      .number()
      .positive()
      .max(500, { message: 'Max length no puede ser excesivo' })
      .default(50),
    LAST_NAME_MIN_LENGTH: z
      .number()
      .positive()
      .default(1),
    LAST_NAME_MAX_LENGTH: z
      .number()
      .positive()
      .max(500, { message: 'Max length no puede ser excesivo' })
      .default(50),
    EMAIL_MAX_LENGTH: z
      .number()
      .positive()
      .max(500, { message: 'Max length no puede ser excesivo' })
      .default(255),
  }),
  PRODUCT: z.object({
    NAME_MIN_LENGTH: z
      .number()
      .positive()
      .default(3),
    NAME_MAX_LENGTH: z
      .number()
      .positive()
      .max(1000, { message: 'Max length no puede ser excesivo' })
      .default(255),
    DESCRIPTION_MAX_LENGTH: z
      .number()
      .positive()
      .max(10000, { message: 'Max length no puede ser excesivo' })
      .default(2000),
    PRICE_MIN: z
      .number()
      .positive()
      .default(0.01),
    PRICE_MAX: z
      .number()
      .positive()
      .max(9999999.99, { message: 'Precio máximo no puede ser excesivo' })
      .default(999999.99),
  }),
  PAGINATION: z.object({
    DEFAULT_PAGE: z
      .number()
      .positive()
      .default(1),
    DEFAULT_PAGE_SIZE: z
      .number()
      .positive()
      .max(1000, { message: 'Page size no puede exceder 1000' })
      .default(20),
    MAX_PAGE_SIZE: z
      .number()
      .positive()
      .max(10000, { message: 'Max page size no puede exceder 10000' })
      .default(100),
  }),
});

// ============================================================================
// ✅ COMPLETE CONFIG SCHEMA - Agrupa toda la configuración
// ============================================================================

/**
 * SCHEMA COMPLETO - Valida toda la configuración de la aplicación
 * REGLA #6: Defense in depth - Múltiples capas de validación
 *
 * Uso en validated-constants.ts:
 *   const validated = CompleteConfigSchema.parse(allConfig)
 *
 * BENEFICIO: Error single si falta algo, con mensaje específico
 */
export const CompleteConfigSchema = z.object({
  service: ServiceIdentitySchema,
  server: ServerConfigSchema,
  logging: LoggingConfigSchema,
  timeout: TimeoutConfigSchema,
  auth: AuthConfigSchema,
  database: DatabaseConfigSchema,
  cors: CorsConfigSchema,
  businessLimits: BusinessLimitsSchema,
});

// ============================================================================
// 📘 TYPE EXPORTS - Para uso en config-types.ts
// ============================================================================

export type ServiceIdentity = z.infer<typeof ServiceIdentitySchema>;
export type ServerConfig = z.infer<typeof ServerConfigSchema>;
export type LoggingConfig = z.infer<typeof LoggingConfigSchema>;
export type TimeoutConfig = z.infer<typeof TimeoutConfigSchema>;
export type AuthConfig = z.infer<typeof AuthConfigSchema>;
export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;
export type CorsConfig = z.infer<typeof CorsConfigSchema>;
export type BusinessLimits = z.infer<typeof BusinessLimitsSchema>;
export type CompleteConfig = z.infer<typeof CompleteConfigSchema>;





