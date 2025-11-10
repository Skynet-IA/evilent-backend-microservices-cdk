/**
 * 📘 Tipos Tipados de Configuración
 * 
 * Estos tipos se infieren automáticamente de los schemas Zod,
 * garantizando que los tipos SIEMPRE estén sincronizados con la validación.
 * 
 * REGLA PLATINO: Código escalable y mantenible con tipado fuerte
 * 
 * ✅ Ventaja: Si cambias el schema Zod, TypeScript
 *    automáticamente te avisa si el código es inválido.
 *    ZERO posibilidad de desincronización.
 */

import { z } from 'zod';
import {
  GlobalConfigSchema,
  InfrastructureConfigSchema,
  S3ConfigSchema,
  BusinessLimitsSchema,
  LogConfigSchema,
  CorsConfigSchema,
  TimeoutConfigSchema,
  AuthConfigSchema,
  MongoDBConfigSchema,
  ServiceConfigSchema,
  CompleteConfigSchema,
} from './config-schema.js';

// ========================================
// 📘 TIPOS INFIRIDOS DE ZOD
// ========================================

export type GlobalConfig = z.infer<typeof GlobalConfigSchema>;
export type InfrastructureConfig = z.infer<typeof InfrastructureConfigSchema>;
export type S3Config = z.infer<typeof S3ConfigSchema>;
export type BusinessLimits = z.infer<typeof BusinessLimitsSchema>;
export type LogConfig = z.infer<typeof LogConfigSchema>;
export type CorsConfig = z.infer<typeof CorsConfigSchema>;
export type TimeoutConfig = z.infer<typeof TimeoutConfigSchema>;
export type AuthConfig = z.infer<typeof AuthConfigSchema>;
export type MongoDBConfig = z.infer<typeof MongoDBConfigSchema>;
export type ServiceConfig = z.infer<typeof ServiceConfigSchema>;
export type ValidatedConfig = z.infer<typeof CompleteConfigSchema>;

// ========================================
// 🔒 TIPOS READONLY (INMUTABLES)
// ========================================

/**
 * Versiones readonly para mayor seguridad
 * Impide que código accidentalmente mutee la configuración
 */

export type ReadonlyGlobalConfig = Readonly<GlobalConfig>;
export type ReadonlyInfrastructureConfig = Readonly<InfrastructureConfig>;
export type ReadonlyS3Config = Readonly<S3Config>;
export type ReadonlyBusinessLimits = Readonly<BusinessLimits>;
export type ReadonlyLogConfig = Readonly<LogConfig>;
export type ReadonlyCorsConfig = Readonly<CorsConfig>;
export type ReadonlyTimeoutConfig = Readonly<TimeoutConfig>;
export type ReadonlyAuthConfig = Readonly<AuthConfig>;
export type ReadonlyMongoDBConfig = Readonly<MongoDBConfig>;
export type ReadonlyServiceConfig = Readonly<ServiceConfig>;
export type ReadonlyValidatedConfig = Readonly<ValidatedConfig>;

