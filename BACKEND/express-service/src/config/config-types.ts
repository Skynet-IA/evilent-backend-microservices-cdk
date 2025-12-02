/**
 * 📘 Tipos Tipados de Configuración - Expres Service
 *
 * Estos tipos se infieren automáticamente de los schemas Zod,
 * garantizando que los tipos SIEMPRE estén sincronizados con la validación.
 *
 * FILOSOFÍA:
 * - Tipos infiridos de Zod = ZERO desincronización
 * - Versiones readonly = Mayor seguridad (no mutación accidental)
 * - Zero lógica, zero valores = Solo tipos TypeScript puros
 *
 * REGLA PLATINO: Código escalable y mantenible con tipado fuerte
 * REGLA #5: Complementa validación Zod con tipado fuerte
 * REGLA #9: Consistencia arquitectónica con user-service
 * REGLA DIAMANTE EXTENDIDA: Filosofía antes que estructura
 *
 * ✅ BENEFICIOS:
 *   - Si cambias config-schema.ts, tipos se actualizan automáticamente
 *   - TypeScript te avisa de errores en tiempo de compilación
 *   - Defense in depth: compilación + runtime + tipos infiridos
 *   - Zero posibilidad de desincronización entre validación y tipos
 */

import { z } from 'zod';
import {
  ServiceIdentitySchema,
  ServerConfigSchema,
  LoggingConfigSchema,
  TimeoutConfigSchema,
  AuthConfigSchema,
  DatabaseConfigSchema,
  CorsConfigSchema,
  BusinessLimitsSchema,
  CompleteConfigSchema,
} from './config-schema';

// ========================================
// 📘 TIPOS INFIRIDOS DE ZOD
// ========================================

/**
 * Identidad del servicio - Infirida de ServiceIdentitySchema
 * Punto único de cambio para replicar servicio
 */
export type ServiceIdentity = z.infer<typeof ServiceIdentitySchema>;

/**
 * Configuración del servidor Express
 */
export type ServerConfig = z.infer<typeof ServerConfigSchema>;

/**
 * Configuración de logging estructurado (CloudWatch compatible)
 */
export type LoggingConfig = z.infer<typeof LoggingConfigSchema>;

/**
 * Timeouts para operaciones críticas
 * REGLA #4: Centralizar timeouts
 */
export type TimeoutConfig = z.infer<typeof TimeoutConfigSchema>;

/**
 * Configuración de autenticación AWS Cognito
 * REGLA #2: Nunca exponer credenciales
 */
export type AuthConfig = z.infer<typeof AuthConfigSchema>;

/**
 * Configuración de conexión PostgreSQL
 * REGLA #5: Validar rangos y formatos
 */
export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;

/**
 * Configuración CORS (Cross-Origin Resource Sharing)
 * REGLA #9: Consistencia con user-service
 */
export type CorsConfig = z.infer<typeof CorsConfigSchema>;

/**
 * Límites de negocio - Validaciones de datos de usuario
 * REGLA PLATINO: Escalable - agregar límite = agregar propiedad
 */
export type BusinessLimits = z.infer<typeof BusinessLimitsSchema>;

/**
 * Configuración completa validada
 * REGLA #6: Defense in depth - tipos + validación runtime
 */
export type CompleteConfig = z.infer<typeof CompleteConfigSchema>;

// ========================================
// 🔒 TIPOS READONLY (INMUTABLES)
// ========================================

/**
 * Versiones readonly para mayor seguridad en tiempo de compilación
 * Impide que código accidentalmente mutee la configuración
 *
 * REGLA DIAMANTE: Senior architect mindset - seguridad defensiva
 */

export type ReadonlyServiceIdentity = Readonly<ServiceIdentity>;
export type ReadonlyServerConfig = Readonly<ServerConfig>;
export type ReadonlyLoggingConfig = Readonly<LoggingConfig>;
export type ReadonlyTimeoutConfig = Readonly<TimeoutConfig>;
export type ReadonlyAuthConfig = Readonly<AuthConfig>;
export type ReadonlyDatabaseConfig = Readonly<DatabaseConfig>;
export type ReadonlyCorsConfig = Readonly<CorsConfig>;
export type ReadonlyBusinessLimits = Readonly<BusinessLimits>;
export type ReadonlyCompleteConfig = Readonly<CompleteConfig>;

