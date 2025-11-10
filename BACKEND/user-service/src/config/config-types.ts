/**
 * 📘 Tipos Tipados de Configuración
 * 
 * Estos tipos se infieren automáticamente de los schemas Zod,
 * garantizando que los tipos SIEMPRE estén sincronizados con la validación.
 * 
 * REGLA PLATINO: Código escalable y mantenible con tipado fuerte
 * REGLA #9: Consistencia arquitectónica con product-service
 * 
 * ✅ Ventaja: Si cambias el schema Zod, TypeScript
 *    automáticamente te avisa si el código es inválido.
 *    ZERO posibilidad de desincronización.
 */

import { z } from 'zod';
import {
  CognitoConfigSchema,
  LoggingConfigSchema,
  CorsConfigSchema,
  EnvironmentConfigSchema,
  PostgreSQLConfigSchema,
  ServiceIdentitySchema,
  UserLimitsSchema,
  CompleteConfigSchema,
} from './config-schema.js';

// ========================================
// 📘 TIPOS INFIRIDOS DE ZOD
// ========================================

export type CognitoConfig = z.infer<typeof CognitoConfigSchema>;
export type LoggingConfig = z.infer<typeof LoggingConfigSchema>;
export type CorsConfig = z.infer<typeof CorsConfigSchema>;
export type EnvironmentConfig = z.infer<typeof EnvironmentConfigSchema>;
export type PostgreSQLConfig = z.infer<typeof PostgreSQLConfigSchema>;
export type ServiceIdentity = z.infer<typeof ServiceIdentitySchema>;
export type UserLimits = z.infer<typeof UserLimitsSchema>;
export type ValidatedConfig = z.infer<typeof CompleteConfigSchema>;

// ========================================
// 🔒 TIPOS READONLY (INMUTABLES)
// ========================================

/**
 * Versiones readonly para mayor seguridad
 * Impide que código accidentalmente mutee la configuración
 */

export type ReadonlyCognitoConfig = Readonly<CognitoConfig>;
export type ReadonlyLoggingConfig = Readonly<LoggingConfig>;
export type ReadonlyCorsConfig = Readonly<CorsConfig>;
export type ReadonlyEnvironmentConfig = Readonly<EnvironmentConfig>;
export type ReadonlyPostgreSQLConfig = Readonly<PostgreSQLConfig>;
export type ReadonlyServiceIdentity = Readonly<ServiceIdentity>;
export type ReadonlyUserLimits = Readonly<UserLimits>;
export type ReadonlyValidatedConfig = Readonly<ValidatedConfig>;

