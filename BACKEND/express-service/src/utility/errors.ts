/**
 * Custom Error Classes - ACTIVIDAD #3
 * 
 * REGLA DE ORO: Manejar errores de forma específica y consistente
 * Cada error tiene: statusCode, message, code, retryable
 * 
 * Permite que servicios distintos tengan errores predecibles y manejables.
 */

/**
 * Error base de la aplicación
 * Todos los errores deben extender de AppError
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly code: string,
    public readonly retryable: boolean = false,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      code: this.code,
      retryable: this.retryable,
      details: this.details
    };
  }
}

/**
 * Error de Validación (400)
 * Cuando los datos de entrada no cumplen el schema
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(400, message, 'VALIDATION_ERROR', false, details);
  }
}

/**
 * Error de Autenticación (401)
 * Cuando el usuario no está autenticado o token es inválido
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, 'AUTHENTICATION_ERROR', false);
  }
}

/**
 * Error de Autorización (403)
 * Cuando el usuario no tiene permiso para acceder a un recurso
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(403, message, 'FORBIDDEN_ERROR', false);
  }
}

/**
 * Error de Recurso No Encontrado (404)
 * Cuando un recurso no existe
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', resource?: string) {
    const msg = resource ? `${resource} not found` : message;
    super(404, msg, 'NOT_FOUND_ERROR', false, { resource });
  }
}

/**
 * Error de Conflicto (409)
 * Cuando hay un conflicto (ej: email ya existe)
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Conflict') {
    super(409, message, 'CONFLICT_ERROR', false);
  }
}

/**
 * Error de Base de Datos (500)
 * RETRYABLE: Errores temporales pueden reintentar
 * NO RETRYABLE: Errores de schema/migración
 */
export class DatabaseError extends AppError {
  constructor(message: string, retryable: boolean = true) {
    super(500, message, 'DATABASE_ERROR', retryable);
  }
}

/**
 * Error de Servicio Externo (503)
 * RETRYABLE: Timeout, conexión rechazada
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service unavailable') {
    super(503, message, 'SERVICE_UNAVAILABLE_ERROR', true);
  }
}

/**
 * Error Interno del Servidor (500)
 * RETRYABLE: No siempre, depende del contexto
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', retryable: boolean = false) {
    super(500, message, 'INTERNAL_SERVER_ERROR', retryable);
  }
}

/**
 * Función helper para convertir errores genéricos a AppError
 * Útil para capturar errores desconocidos
 */
export const toAppError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new InternalServerError(error.message);
  }

  return new InternalServerError('Unknown error');
};

