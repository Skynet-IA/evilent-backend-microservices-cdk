/**
 * 📤 Utilidades para respuestas HTTP estandarizadas
 *
 * Proporciona funciones helper para crear respuestas HTTP consistentes
 * con el formato correcto de headers y body.
 *
 * REGLA #9: SIEMPRE mantener consistencia arquitectónica
 */

import { APIGatewayProxyResult } from 'aws-lambda';
import { AppError, ValidationError, getErrorInfo } from './errors.js';
import { HTTP_STATUS } from '../config/constants.js';
import { createLogger } from './logger.js';

const logger = createLogger('Response');

/**
 * Formatea una respuesta HTTP con headers estándar
 */
const formatResponse = (
  statusCode: number,
  message: string,
  data?: unknown,
  success?: boolean
): APIGatewayProxyResult => {
  const body: any = {
    success: success !== undefined ? success : statusCode >= 200 && statusCode < 300,
    message,
  };

  if (data !== undefined) {
    body.data = data;
  }

        return {
            statusCode,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            },
    body: JSON.stringify(body),
  };
};

/**
 * Respuesta de éxito (200 OK)
 */
export const SuccessResponse = (
  data: unknown,
  message: string = 'Operación exitosa'
): APIGatewayProxyResult => {
  return formatResponse(HTTP_STATUS.OK, message, data);
};

/**
 * Respuesta de creación exitosa (201 Created)
 * 
 * 🔮 PREPARADA PARA TAREA #7: Validación con Zod
 * Esta función será usada cuando se implementen operaciones CREATE con Zod.
 */
export const CreatedResponse = (
  data: unknown,
  message: string = 'Recurso creado exitosamente'
): APIGatewayProxyResult => {
  return formatResponse(HTTP_STATUS.CREATED, message, data);
};

/**
 * Respuesta sin contenido (204 No Content)
 * 
 * 🔮 PREPARADA PARA TAREA #7: Validación con Zod
 * Esta función será usada para operaciones DELETE exitosas.
 */
export const NoContentResponse = (): APIGatewayProxyResult => {
        return {
    statusCode: HTTP_STATUS.NO_CONTENT,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
    body: '',
  };
};

/**
 * Respuesta de error estandarizada
 *
 * Maneja diferentes tipos de errores y los convierte en respuestas HTTP apropiadas
 */
export const ErrorResponse = (
  codeOrError: number | Error | AppError | unknown,
  errorOrMessage?: Error | AppError | unknown | string
): APIGatewayProxyResult => {
  // Mantener compatibilidad con firma antigua: ErrorResponse(404, error)
  if (typeof codeOrError === 'number') {
    const statusCode = codeOrError;
    const error = errorOrMessage;
    
    // Si es un array (class-validator errors)
    if (Array.isArray(error)) {
      logger.warn('Error de validación (class-validator)', { errors: error });
      const errorObject = error[0]?.constraints;
      const errorMessage = errorObject ? errorObject[Object.keys(errorObject)[0]] : 'Error de validación';
      return formatResponse(statusCode, errorMessage, { errors: error });
    }
    
    // Si es un string
    if (typeof error === 'string') {
      return formatResponse(statusCode, error);
    }
    
    // Si es un Error
    if (error instanceof Error) {
      logger.error('Error en la aplicación', error);
      return formatResponse(statusCode, error.message);
    }
    
    return formatResponse(statusCode, 'Error en la operación');
  }
  
  // Nueva firma: ErrorResponse(error, defaultMessage)
  const error = codeOrError;
  const defaultMessage = typeof errorOrMessage === 'string' ? errorOrMessage : 'Error en la operación';
  // Si es un AppError, usar su información
  if (error instanceof AppError) {
    const errorInfo = getErrorInfo(error);

    // Log del error
    logger.error('Error en la aplicación', error, {
      statusCode: error.statusCode,
      isOperational: error.isOperational,
    });

    // Si es ValidationError, incluir detalles de validación
    if (error instanceof ValidationError && error.errors) {
      return formatResponse(error.statusCode, error.message, {
        errors: error.errors,
      });
    }

    return formatResponse(error.statusCode, error.message);
  }

  // Si es un Error estándar
  if (error instanceof Error) {
    logger.error('Error no manejado', error);
    return formatResponse(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      defaultMessage,
      process.env.NODE_ENV === 'development' ? { error: error.message } : undefined
    );
    }

  // Error desconocido
  logger.error('Error desconocido', undefined, { error });
  return formatResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, defaultMessage);
};

/**
 * Respuesta de error de validación (400 Bad Request)
 *
 * 🔮 PREPARADA PARA TAREA #7: Validación con Zod
 * Esta función será usada para errores de validación de Zod schemas.
 * Los errores van en body.data.errors para consistencia con tests existentes.
 */
export const ValidationErrorResponse = (
  message: string,
  errors?: any[]
): APIGatewayProxyResult => {
  logger.warn('Error de validación', { message, errors });

  const body: any = {
    success: false,
    message,
    data: {}
  };

  if (errors && errors.length > 0) {
    body.data.errors = errors; // ← Los errors van en data.errors para consistencia con tests
  }

  return {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    },
    body: JSON.stringify(body),
  };
};

/**
 * Respuesta de no autorizado (401 Unauthorized)
 */
export const UnauthorizedResponse = (
  message: string = 'No autenticado'
): APIGatewayProxyResult => {
  logger.warn('Intento de acceso no autorizado', { message });
  return formatResponse(HTTP_STATUS.UNAUTHORIZED, message);
};

/**
 * Respuesta de prohibido (403 Forbidden)
 * 
 * 🔮 PREPARADA PARA TAREA #7: Validación con Zod
 * Esta función será usada para errores de permisos insuficientes.
 */
export const ForbiddenResponse = (
  message: string = 'No tienes permisos para realizar esta acción'
): APIGatewayProxyResult => {
  logger.warn('Acceso prohibido', { message });
  return formatResponse(HTTP_STATUS.FORBIDDEN, message);
};

/**
 * Respuesta de no encontrado (404 Not Found)
 * 
 * 🔮 PREPARADA PARA TAREA #7: Validación con Zod
 * Esta función será usada cuando un recurso no exista.
 */
export const NotFoundResponse = (
  message: string = 'Recurso no encontrado'
): APIGatewayProxyResult => {
  logger.info('Recurso no encontrado', { message });
  return formatResponse(HTTP_STATUS.NOT_FOUND, message);
};

/**
 * Respuesta de conflicto (409 Conflict)
 * 
 * 🔮 PREPARADA PARA TAREA #7: Validación con Zod
 * Esta función será usada para conflictos (ej: recurso duplicado).
 */
export const ConflictResponse = (
  message: string = 'Conflicto con el estado actual del recurso'
): APIGatewayProxyResult => {
  logger.warn('Conflicto detectado', { message });
  return formatResponse(HTTP_STATUS.CONFLICT, message);
};
