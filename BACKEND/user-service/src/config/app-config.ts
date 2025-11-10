/**
 * ⚙️ Configuración centralizada de la aplicación
 *
 * ✅ REFACTORIZADO: Ahora delega validación a Zod (validated-constants.ts)
 * 
 * REGLA #4: Centralizar constantes
 * REGLA #5: Validar con Zod
 * REGLA #9: Consistencia arquitectónica con product-service
 * REGLA PLATINO: Tipado fuerte
 * 
 * Este archivo mantiene compatibilidad con código existente,
 * pero ahora usa validación Zod bajo el capó.
 */

import {
  VALIDATED_CONFIG,
  COGNITO_CONFIG,
  LOGGING_CONFIG,
  CORS_CONFIG,
  ENVIRONMENT_CONFIG,
  SERVICE_IDENTITY,
  POSTGRESQL_CONFIG,
} from './validated-constants.js';

interface AppConfig {
  // Ambiente
  readonly nodeEnv: string;
  readonly isDevelopment: boolean;
  readonly isProduction: boolean;
  readonly isTest: boolean;

  // CORS
  readonly isCorsEnabled: boolean;

  // Cognito
  readonly cognito: {
    readonly poolId: string;
    readonly appClientId: string;
  };

  // Logging
  readonly logging: {
    readonly debugEnabled: boolean;
  };

  // PostgreSQL
  readonly postgresql: {
    readonly poolMax: number;
    readonly poolMin: number;
    readonly poolIdleTimeoutMs: number;
    readonly connectionTimeoutMs: number;
  };

  // Service Identity
  readonly service: {
    readonly name: string;
    readonly displayName: string;
    readonly description: string;
  };

  // Helper methods
  getServiceName(): string;
  getDisplayName(): string;
  getDescription(): string;
  isDebugEnabled(): boolean;
}

/**
 * ✅ Configuración de la aplicación delegando a Zod
 * 
 * Ahora la validación es manejada por validated-constants.ts,
 * este archivo solo transforma el formato para compatibilidad.
 */
function createAppConfig(): AppConfig {
  // ✅ Validación delegada a Zod (VALIDATED_CONFIG ya validó todo)
  const baseConfig = {
    nodeEnv: ENVIRONMENT_CONFIG.NODE_ENV,
    isDevelopment: ENVIRONMENT_CONFIG.NODE_ENV === 'development',
    isProduction: ENVIRONMENT_CONFIG.NODE_ENV === 'production',
    isTest: ENVIRONMENT_CONFIG.NODE_ENV === 'test',
    isCorsEnabled: CORS_CONFIG.ENABLED,
    cognito: {
      poolId: COGNITO_CONFIG.POOL_ID,
      appClientId: COGNITO_CONFIG.APP_CLIENT_ID,
    },
    logging: {
      debugEnabled: LOGGING_CONFIG.DEBUG_ENABLED,
    },
    postgresql: {
      poolMax: POSTGRESQL_CONFIG.POOL_MAX,
      poolMin: POSTGRESQL_CONFIG.POOL_MIN,
      poolIdleTimeoutMs: POSTGRESQL_CONFIG.POOL_IDLE_TIMEOUT_MS,
      connectionTimeoutMs: POSTGRESQL_CONFIG.CONNECTION_TIMEOUT_MS,
    },
    service: {
      name: SERVICE_IDENTITY.NAME,
      displayName: SERVICE_IDENTITY.DISPLAY_NAME,
      description: SERVICE_IDENTITY.DESCRIPTION,
    },
  };

  // ✅ Helper methods
  return {
    ...baseConfig,
    getServiceName(): string {
      return this.service.name;
    },
    getDisplayName(): string {
      return this.service.displayName;
    },
    getDescription(): string {
      return this.service.description;
    },
    isDebugEnabled(): boolean {
      return this.logging.debugEnabled;
    },
  };
}

// Exportar configuración singleton (ahora validada con Zod)
export const config = createAppConfig();

// Exportar tipo para uso en tests
export type { AppConfig };
