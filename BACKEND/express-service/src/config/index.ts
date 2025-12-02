/**
 * 📦 Config Barrel Export - Punto Único de Importación
 *
 * TAREA 1.4: Barrel Export para Configuración
 * REGLA PLATINO: Código escalable y mantenible
 *
 * FILOSOFÍA:
 * Consolidar TODOS los exports de configuración en un único punto.
 * Esto facilita importaciones limpias desde otros módulos:
 *
 *   ✅ ANTES (incorrecto - imports dispersos):
 *      import { config } from '../config/validated-constants';
 *      import { SERVICE_CONFIG } from '../config/constants';
 *      import type { CompleteConfig } from '../config/config-types';
 *
 *   ✅ DESPUÉS (correcto - barrel export):
 *      import { config, SERVICE_CONFIG, CompleteConfig } from '../config';
 *
 * REGLA #4: Centralizar constantes
 * REGLA PLATINO: Escalable - agregar config = agregar export
 * REGLA #9: Consistencia arquitectónica (mismo patrón que user-service)
 */

// ============================================================================
// ✅ RE-EXPORTS: CONSTANTES CENTRALIZADAS
// ============================================================================

export {
  SERVICE_CONFIG,
  BUSINESS_LIMITS,
  TIMEOUT_CONFIG,
  AUTH_CONFIG,
  DATABASE_CONFIG,
} from './constants';

// ============================================================================
// ✅ RE-EXPORTS: CONFIGURACIÓN VALIDADA (RUNTIME)
// ============================================================================

export {
  // Config completa validada
  config,
  // Sub-configs individuales (Readonly<>)
  service,
  server,
  logging,
  timeout,
  auth,
  database,
  cors,
  businessLimits,
} from './validated-constants';

// ============================================================================
// ✅ RE-EXPORTS: TIPOS TIPADOS (COMPILE-TIME)
// ============================================================================

export type {
  // Tipos base infiridos de Zod
  ServiceIdentity,
  ServerConfig,
  LoggingConfig,
  TimeoutConfig,
  AuthConfig,
  DatabaseConfig,
  CorsConfig,
  BusinessLimits,
  CompleteConfig,
  // Tipos readonly (inmutables)
  ReadonlyServiceIdentity,
  ReadonlyServerConfig,
  ReadonlyLoggingConfig,
  ReadonlyTimeoutConfig,
  ReadonlyAuthConfig,
  ReadonlyDatabaseConfig,
  ReadonlyCorsConfig,
  ReadonlyBusinessLimits,
} from './config-types';

// ============================================================================
// ✅ RE-EXPORTS: SCHEMAS ZOD (VALIDACIÓN)
// ============================================================================

export {
  // Schemas individuales (reutilizables si necesario)
  ServiceIdentitySchema,
  ServerConfigSchema,
  LoggingConfigSchema,
  TimeoutConfigSchema,
  AuthConfigSchema,
  DatabaseConfigSchema,
  CorsConfigSchema,
  BusinessLimitsSchema,
  // Schema completo (validación master)
  CompleteConfigSchema,
} from './config-schema';

// ============================================================================
// 📝 DOCUMENTACIÓN DE USO
// ============================================================================

/**
 * IMPORTACIONES VÁLIDAS desde '../config':
 *
 * 1. Valores compilados:
 *    import { SERVICE_CONFIG, BUSINESS_LIMITS } from '../config';
 *
 * 2. Configuración validada en runtime:
 *    import { config, server, auth } from '../config';
 *
 * 3. Tipos TypeScript:
 *    import type { CompleteConfig, ServerConfig } from '../config';
 *
 * 4. Schemas Zod (para validación adicional):
 *    import { CompleteConfigSchema } from '../config';
 *
 * EJEMPLO REAL:
 * ─────────────────────────────────────────────────────────────
 *
 * import { config, SERVICE_CONFIG, CompleteConfig } from '../config';
 *
 * const port = config.server.port;  // Runtime validated
 * const name = SERVICE_CONFIG.identity.name;  // Compile-time constant
 *
 * async function validateUserConfig(data: unknown): Promise<CompleteConfig> {
 *   return CompleteConfigSchema.parse(data);
 * }
 */

