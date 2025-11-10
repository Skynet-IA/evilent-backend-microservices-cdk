/**
 * 🔍 Request Parser - Validación centralizada de inputs
 * 
 * ✅ REGLA #5: SIEMPRE validar datos de entrada con schemas (Zod)
 * ✅ REGLA PLATINO: Validar TODOS los inputs antes de procesarlos
 * ✅ REGLA #9: Mantener consistencia arquitectónica
 * 
 * Este archivo centraliza la validación de inputs para TODOS los endpoints.
 * Patrón adoptado de product-service para garantizar consistencia.
 * 
 * Uso obligatorio:
 * ```typescript
 * const { data, error } = parseAndValidateBody(event, CreateProfileSchema);
 * if (error) return validationErrorResponse(error);
 * // 'data' está garantizado como válido y type-safe
 * ```
 */

import { z } from 'zod';
import type { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createLogger } from './logger.js';

const logger = createLogger('RequestParser');

/**
 * Interfaz para errores de validación
 */
export interface ValidationError {
  statusCode: number;
  message: string;
  details: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

/**
 * Interfaz para resultado de parseo y validación
 */
export interface ParseResult<T> {
  data: T | null;
  error: ValidationError | null;
}

/**
 * Parsea y valida el body de un evento API Gateway
 * 
 * ✅ REGLA #5: Validar TODOS los inputs con Zod
 * ✅ REGLA PLATINO: Defense in Depth
 * 
 * @param event - Evento de API Gateway
 * @param schema - Schema de Zod para validación
 * @returns { data, error } - Datos validados o error
 * 
 * @example
 * ```typescript
 * const { data, error } = parseAndValidateBody(event, CreateProfileSchema);
 * if (error) return validationErrorResponse(error);
 * 
 * const { first_name, last_name, phone } = data; // Type-safe
 * ```
 */
export function parseAndValidateBody<T>(
  event: APIGatewayEvent,
  schema: z.ZodSchema<T>
): ParseResult<T> {
  try {
    // 1. Parsear body JSON
    let body: any;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (jsonErr) {
      // ✅ Manejar JSON inválido
      logger.error('❌ JSON inválido', {
        error: jsonErr instanceof Error ? jsonErr.message : String(jsonErr),
        requestId: event.requestContext?.requestId,
      });

      return {
        data: null,
        error: {
          statusCode: 400,
          message: 'JSON inválido o error de parsing',
          details: [
            {
              field: 'body',
              message: jsonErr instanceof Error ? jsonErr.message : 'Error desconocido',
              code: 'invalid_json',
            },
          ],
        },
      };
    }

    // 2. Validar contra schema Zod
    const result = schema.parse(body);

    // 3. Log de éxito
    logger.info('✅ Validación exitosa', {
      schema: schema.constructor.name,
      requestId: event.requestContext?.requestId,
    });

    return { data: result, error: null };
  } catch (err) {
    // 4. Manejo de errores Zod
    if (err instanceof z.ZodError) {
      const formattedErrors = err.errors.map((e) => ({
        field: e.path.join('.') || 'root',
        message: e.message,
        code: e.code,
      }));

      logger.warn('❌ Validación fallida', {
        schema: schema.constructor.name,
        errors: formattedErrors,
        requestId: event.requestContext?.requestId,
      });

      return {
        data: null,
        error: {
          statusCode: 400,
          message: 'Datos de entrada inválidos',
          details: formattedErrors,
        },
      };
    }

    // 5. Otros errores
    logger.error('❌ Error en validación (no Zod)', {
      error: err instanceof Error ? err.message : String(err),
      requestId: event.requestContext?.requestId,
    });

    throw err;
  }
}

/**
 * Parsea y valida los path parameters de un evento API Gateway
 * 
 * @param event - Evento de API Gateway
 * @param schema - Schema de Zod para validación
 * @returns { data, error } - Datos validados o error
 */
export function parseAndValidatePathParams<T>(
  event: APIGatewayEvent,
  schema: z.ZodSchema<T>
): ParseResult<T> {
  try {
    // 1. Validar contra schema Zod
    const result = schema.parse(event.pathParameters || {});

    // 2. Log de éxito
    logger.info('✅ Path params validados', {
      schema: schema.constructor.name,
      requestId: event.requestContext?.requestId,
    });

    return { data: result, error: null };
  } catch (err) {
    // 3. Manejo de errores Zod
    if (err instanceof z.ZodError) {
      const formattedErrors = err.errors.map((e) => ({
        field: e.path.join('.') || 'root',
        message: e.message,
        code: e.code,
      }));

      logger.warn('❌ Path params validación fallida', {
        schema: schema.constructor.name,
        errors: formattedErrors,
        requestId: event.requestContext?.requestId,
      });

      return {
        data: null,
        error: {
          statusCode: 400,
          message: 'Parámetros de ruta inválidos',
          details: formattedErrors,
        },
      };
    }

    logger.error('❌ Error en validación de path params', {
      error: err instanceof Error ? err.message : String(err),
      requestId: event.requestContext?.requestId,
    });

    throw err;
  }
}

/**
 * Parsea y valida los query parameters de un evento API Gateway
 * 
 * @param event - Evento de API Gateway
 * @param schema - Schema de Zod para validación
 * @returns { data, error } - Datos validados o error
 */
export function parseAndValidateQueryParams<T>(
  event: APIGatewayEvent,
  schema: z.ZodSchema<T>
): ParseResult<T> {
  try {
    // 1. Validar contra schema Zod
    const result = schema.parse(event.queryStringParameters || {});

    // 2. Log de éxito
    logger.info('✅ Query params validados', {
      schema: schema.constructor.name,
      requestId: event.requestContext?.requestId,
    });

    return { data: result, error: null };
  } catch (err) {
    // 3. Manejo de errores Zod
    if (err instanceof z.ZodError) {
      const formattedErrors = err.errors.map((e) => ({
        field: e.path.join('.') || 'root',
        message: e.message,
        code: e.code,
      }));

      logger.warn('❌ Query params validación fallida', {
        schema: schema.constructor.name,
        errors: formattedErrors,
        requestId: event.requestContext?.requestId,
      });

      return {
        data: null,
        error: {
          statusCode: 400,
          message: 'Parámetros de consulta inválidos',
          details: formattedErrors,
        },
      };
    }

    logger.error('❌ Error en validación de query params', {
      error: err instanceof Error ? err.message : String(err),
      requestId: event.requestContext?.requestId,
    });

    throw err;
  }
}

/**
 * Helper para respuesta de validación exitosa
 * Centraliza formato de respuesta
 * 
 * @param data - Datos a retornar
 * @param statusCode - Status HTTP (default 200)
 * @returns APIGatewayProxyResult formateada
 */
export function validationSuccessResponse<T>(
  data: T,
  statusCode = 200
): APIGatewayProxyResult {
  return {
    statusCode,
    body: JSON.stringify({
      success: true,
      data,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  };
}

/**
 * Helper para respuesta de error de validación
 * Centraliza formato de respuesta de error
 * 
 * @param error - ValidationError con detalles
 * @returns APIGatewayProxyResult con error
 * 
 * @example
 * ```typescript
 * const { error } = parseAndValidateBody(event, schema);
 * if (error) return validationErrorResponse(error);
 * ```
 */
export function validationErrorResponse(
  error: ValidationError
): APIGatewayProxyResult {
  return {
    statusCode: error.statusCode,
    body: JSON.stringify({
      success: false,
      message: error.message,
      data: {
        errors: error.details,
      },
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  };
}

