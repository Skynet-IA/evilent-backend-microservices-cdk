import { APIGatewayEvent } from "aws-lambda";
import { CognitoVerifierService } from "../../auth/cognito-verifier.js";
import { UserClaims, UnauthorizedError } from "../../types/api-types.js";
import { createLogger } from "../../utility/logger.js";

const logger = createLogger('AuthMiddleware');

/**
 * 🔐 Middleware de autenticación JWT con AWS Cognito
 *
 * Valida tokens JWT de Cognito y extrae claims del usuario.
 * Todos los endpoints protegidos deben pasar por este middleware.
 *
 * Flujo de autenticación:
 * 1. Extrae header Authorization del request
 * 2. Valida formato del token JWT
 * 3. Verifica firma criptográfica contra Cognito
 * 4. Valida expiración del token
 * 5. Extrae y retorna claims del usuario
 */
export class AuthMiddleware {
  // Instancia singleton del verificador JWT (reutilizado entre requests)
  private static verifier = CognitoVerifierService.getInstance();

  /**
   * Autentica un usuario validando su token JWT de Cognito
   *
   * IMPORTANTE: Este método lanza UnauthorizedError si:
   * - El header Authorization no existe
   * - El token está malformado
   * - El token está expirado
   * - La firma del token es inválida
   * - El token no pertenece al User Pool correcto
   *
   * @param event Evento de API Gateway con headers HTTP
   * @returns Claims del usuario autenticado (userId, userEmail)
   * @throws UnauthorizedError si la autenticación falla
   */
  static async authenticate(event: APIGatewayEvent): Promise<UserClaims> {
    // ========================================
    // PASO 1: Extraer header Authorization
    // ========================================
    // Soporta tanto "Authorization" como "authorization" (case-insensitive)
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    const token = CognitoVerifierService.extractTokenFromHeader(authHeader);

    if (!token) {
      logger.warn('Token de autenticación faltante', {
        hasAuthHeader: !!authHeader,
        method: event.httpMethod,
        path: event.path
      });
      throw new UnauthorizedError('Token de autenticación requerido');
    }

    // ========================================
    // PASO 2: Verificar token JWT con Cognito
    // ========================================
    try {
      const claims = await this.verifier.verifyToken(token);

      logger.info('Usuario autenticado exitosamente', {
        // Nota: No loggeamos userId completo por privacidad/PII
        userIdHash: claims.userId.substring(0, 8), // Solo primeros 8 chars para debugging
        hasEmail: !!claims.userEmail
      });

      return claims;

    } catch (error) {
      // Token inválido, expirado o error de red con Cognito
      logger.warn('Fallo en autenticación', {
        error: error instanceof Error ? error.message : String(error),
        method: event.httpMethod,
        path: event.path
      });
      throw new UnauthorizedError('Token de autenticación inválido');
    }
  }

}
