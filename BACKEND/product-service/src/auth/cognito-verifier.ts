import { CognitoJwtVerifier } from "aws-jwt-verify";
import type { CognitoJwtVerifierSingleUserPool } from "aws-jwt-verify/cognito-verifier";
import { createLogger } from "../utility/logger.js";
import { config } from "../config/app-config.js";

/**
 * 🔐 Servicio de verificación de tokens JWT de AWS Cognito
 *
 * Maneja la configuración y verificación de tokens JWT de Cognito.
 * Implementa patrón Singleton para reutilización eficiente entre
 * invocaciones de Lambda (warm starts).
 *
 * IMPORTANTE: Este servicio valida que las variables de entorno
 * COGNITO_POOL_ID y COGNITO_APP_CLIENT_ID estén configuradas.
 * Si no lo están, falla inmediatamente (fail-fast) en lugar de
 * fallar silenciosamente en runtime.
 *
 * REGLA #6: SIEMPRE implementar defense in depth en seguridad
 */
export class CognitoVerifierService {
  private static instance: CognitoVerifierService;
  private verifier: CognitoJwtVerifierSingleUserPool<{
    userPoolId: string;
    tokenUse: "id";
    clientId: string;
  }>;
  private logger = createLogger('CognitoVerifier');

  /**
   * Constructor privado - Singleton pattern
   *
   * Usa configuración centralizada validada en app-config.ts.
   * La validación fail-fast ya ocurrió al importar config.
   */
  private constructor() {
    // ========================================
    // INICIALIZACIÓN: Crear verificador JWT con configuración validada
    // ========================================
    this.verifier = CognitoJwtVerifier.create({
      userPoolId: config.cognito.poolId,
      tokenUse: "id",
      clientId: config.cognito.appClientId,
    });

    this.logger.info('CognitoJwtVerifier inicializado correctamente', {
      userPoolId: `${config.cognito.poolId.substring(0, 15)}...`,
      clientId: `${config.cognito.appClientId.substring(0, 10)}...`,
    });
  }

  /**
   * Obtiene la instancia singleton del servicio
   */
  static getInstance(): CognitoVerifierService {
    if (!CognitoVerifierService.instance) {
      CognitoVerifierService.instance = new CognitoVerifierService();
    }
    return CognitoVerifierService.instance;
  }

  /**
   * Verifica un token JWT de Cognito y extrae los claims
   *
   * IMPORTANTE: Este método valida que el token:
   * - Pertenezca al User Pool correcto (userPoolId)
   * - Sea un token de identidad válido (tokenUse: "id")
   * - No esté expirado
   * - Tenga una firma criptográfica válida
   *
   * @param token Token JWT (sin prefijo "Bearer")
   * @returns Claims del usuario (userId, userEmail)
   * @throws Error si el token es inválido, expirado o malformado
   */
  async verifyToken(token: string) {
    try {
      const payload = await this.verifier.verify(token);

      // Extraer claims importantes del token verificado
      return {
        userId: payload.sub as string,        // UUID del usuario en Cognito
        userEmail: payload.email as string    // Email verificado (si existe)
      };
    } catch (error) {
      // Log del error sin exponer el token completo (seguridad)
      this.logger.warn('Token JWT inválido', {
        error: error instanceof Error ? error.message : String(error),
        tokenPrefix: token.substring(0, 10) + '...' // Solo primeros 10 chars para debugging
      });
      throw error;
    }
  }

  /**
   * Extrae el token JWT del header Authorization
   *
   * Soporta ambos formatos:
   * - "Bearer eyJhbGciOi..." (estándar HTTP)
   * - "eyJhbGciOi..." (directo)
   *
   * @param authHeader Valor del header Authorization
   * @returns Token JWT sin prefijo, o null si no existe
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    // Remover prefijo "Bearer " (case-insensitive) si existe
    return authHeader.replace(/^Bearer\s+/i, '');
  }
}
