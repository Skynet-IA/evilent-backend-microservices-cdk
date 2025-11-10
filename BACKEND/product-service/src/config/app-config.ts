/**
 * ⚙️ Configuración centralizada de la aplicación Product Service
 *
 * ⚠️ DEPRECATED: Este archivo es LEGACY.
 * 
 * MIGRACIÓN: Usa validated-constants.ts en su lugar
 * - Antes: import { config } from '@/config/app-config';
 * - Ahora: import { AUTH_CONFIG, CORS_CONFIG } from '@/config';
 * 
 * Este archivo se mantiene SOLO para compatibilidad con cognito-verifier.ts
 * Será eliminado en la próxima refactorización.
 * 
 * REGLA #4: SIEMPRE centralizar constantes, NUNCA hardcodear valores
 * REGLA #2: NUNCA exponer datos sensibles en el código
 */

import {
  AUTH_CONFIG,
  CORS_CONFIG,
  LOG_CONFIG,
  S3_CONFIG,
  TIMEOUT_CONFIG,
} from './validated-constants.js';

interface AppConfig {
  // Ambiente
  readonly nodeEnv: string;
  readonly isDevelopment: boolean;
  readonly isProduction: boolean;

  // CORS
  readonly isCorsEnabled: boolean;

  // Cognito
  readonly cognito: {
    readonly poolId: string;
    readonly appClientId: string;
  };

  // S3
  readonly s3: {
    readonly bucketName: string;
    readonly imageMaxSizeMB: number;
    readonly allowedTypes: readonly string[];
  };

  // Logging
  readonly logging: {
    readonly debugEnabled: boolean;
    readonly level: string;
    readonly requestDetailsEnabled: boolean;
  };

  // API
  readonly api: {
    readonly requestTimeoutMs: number;
  };
}

/**
 * ✅ Configuración de la aplicación (delegada a validated-constants.ts)
 * 
 * IMPORTANTE:
 * - Ya está validada en validated-constants.ts
 * - Ya está tipada y es inmutable
 * - Ya implementa fail-fast pattern
 */
function createAppConfig(): AppConfig {
  const nodeEnv = process.env.NODE_ENV || 'production';
  const bucketName = (process.env.BUCKET_NAME?.trim()) || 'product-service-s3-bucket'; // Default para testing

  // Validar bucket S3 (la única validación que no cubre validated-constants)
  if (!bucketName || bucketName.length === 0) {
    throw new Error('BUCKET_NAME no está configurada o está vacía');
  }

  return {
    nodeEnv,
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
    isCorsEnabled: CORS_CONFIG.ENABLED,
    cognito: {
      poolId: AUTH_CONFIG.COGNITO_POOL_ID || '',
      appClientId: AUTH_CONFIG.COGNITO_APP_CLIENT_ID || '',
    },
    s3: {
      bucketName,
      imageMaxSizeMB: S3_CONFIG.IMAGE_MAX_SIZE_MB,
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    },
    logging: {
      debugEnabled: process.env.EVILENT_DEBUG_LOGS === 'true',
      level: LOG_CONFIG.LEVEL,
      requestDetailsEnabled: LOG_CONFIG.REQUEST_DETAILS,
    },
    api: {
      requestTimeoutMs: TIMEOUT_CONFIG.API_REQUEST_TIMEOUT_MS,
    },
  };
}

// Exportar configuración singleton
export const config = createAppConfig();

// Exportar tipo para uso en tests
export type { AppConfig };

