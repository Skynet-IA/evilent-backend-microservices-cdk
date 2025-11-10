/**
 * 📋 Tipos compartidos para la API Layer
 *
 * Este archivo contiene las definiciones de tipos TypeScript utilizadas
 * en toda la capa de API para garantizar type-safety y consistencia.
 * 
 * ✅ REGLA #9: SIEMPRE mantener consistencia arquitectónica
 * Este archivo es idéntico al de user-service para 100% consistencia.
 */

/**
 * Claims extraídos y validados del token JWT de Cognito
 *
 * Estos claims son obtenidos después de verificar exitosamente
 * un token JWT de AWS Cognito User Pool.
 */
export interface UserClaims {
  /** ID único del usuario en Cognito (UUID) - Claim 'sub' del JWT */
  userId: string;
  /** Email verificado del usuario - Claim 'email' del JWT (opcional) */
  userEmail?: string;
}

/**
 * Jerarquía de errores personalizados para la API
 *
 * Todos los errores heredan de ApiError para permitir manejo
 * centralizado con códigos de estado HTTP apropiados.
 */
/**
 * Error base de API con código de estado HTTP
 *
 * ✅ REGLA #6: Defense in Depth - Errores centralizados y tipados
 * 
 * @example
 * throw new ApiError('Operación falló', 500, 'INTERNAL_ERROR');
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Error 401: Autenticación requerida o inválida
 *
 * Se lanza cuando el token JWT está ausente, expirado o es inválido.
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Token de autenticación requerido') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * Error 400: Request malformado o validación fallida
 *
 * Se lanza cuando el body JSON es inválido o los datos no cumplen validaciones.
 */
export class BadRequestError extends ApiError {
  constructor(message: string = 'Solicitud malformada') {
    super(message, 400, 'BAD_REQUEST');
  }
}

