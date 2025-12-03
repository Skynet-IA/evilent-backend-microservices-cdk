/**
 * 🔍 Request Parser - Validación centralizada de inputs
 * 
 * ✅ REGLA #5: SIEMPRE validar datos de entrada con schemas (Zod)
 * ✅ REGLA PLATINO: Validar TODOS los inputs antes de procesarlos
 * ✅ REGLA #9: Mantener consistencia arquitectónica
 * 
 * Este archivo centraliza la validación de inputs para TODOS los endpoints.
 * Adaptado de user-service pero para Express (no AWS Lambda).
 * 
 * Uso obligatorio en handlers Express:
 * ```typescript
 * const { data, error } = parseAndValidateBody(req, CreateUserDTO);
 * if (error) return res.status(error.statusCode).json(error);
 * // 'data' está garantizado como válido y type-safe
 * ```
 */

import { Request } from 'express';
import { z } from 'zod';
import logger from './logger';

/**
 * Interfaz para errores de validación
 * Formato consistente con responses.ts
 */
export interface ValidationErrorResponse {
  statusCode: number;
  body: {
    success: false;
    message: string;
    data: {
      errors: Array<{
        field: string;
        message: string;
        code: string;
      }>;
    };
    timestamp: string;
  };
}

/**
 * Interfaz para resultado de parseo y validación
 * Union type que garantiza que SIEMPRE hay data O error, nunca ambos
 */
export type ParseResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: ValidationErrorResponse };

/**
 * Parsea y valida el body de un request Express
 * 
 * ✅ REGLA #5: Validar TODOS los inputs con Zod
 * ✅ REGLA PLATINO: Defense in Depth - Validación centralizada
 * ✅ REGLA #3: Logger estructurado para cada validación
 * 
 * @param req - Request de Express
 * @param schema - Schema de Zod para validación
 * @returns ParseResult<T> con data validado o error detallado
 * 
 * @example
 * ```typescript
 * const result = parseAndValidateBody(req, CreateUserDTO);
 * if (!result.success) {
 *   return res.status(result.error.statusCode).json(result.error.body);
 * }
 * const { firstName, lastName, email } = result.data; // Type-safe
 * ```
 */
export function parseAndValidateBody<T>(
  req: Request,
  schema: z.ZodSchema<T>
): ParseResult<T> {
  try {
    // 1. Validar contra schema Zod
    const result = schema.parse(req.body);

    // 2. Log de éxito
    logger.debug('✅ Body validado exitosamente', {
      requestId: req.id,
      path: req.path,
      method: req.method,
      schema: schema.constructor.name
    });

    return { success: true, data: result, error: null };
  } catch (err) {
    // 3. Manejo de errores Zod
    if (err instanceof z.ZodError) {
      const formattedErrors = err.errors.map((e) => ({
        field: e.path.join('.') || 'root',
        message: e.message,
        code: e.code,
      }));

      logger.warn('❌ Validación de body fallida', {
        requestId: req.id,
        path: req.path,
        method: req.method,
        schema: schema.constructor.name,
        errorsCount: formattedErrors.length,
        errors: formattedErrors,
      });

      return {
        success: false,
        data: null,
        error: {
          statusCode: 400,
          body: {
            success: false,
            message: 'Datos de entrada inválidos',
            data: { errors: formattedErrors },
            timestamp: new Date().toISOString(),
          },
        },
      };
    }

    // 4. Otros errores (no Zod)
    logger.error('❌ Error inesperado en validación de body', {
      requestId: req.id,
      path: req.path,
      method: req.method,
      error: err instanceof Error ? err.message : String(err),
    });

    throw err;
  }
}

/**
 * Parsea y valida los path parameters de un request Express
 * 
 * ✅ REGLA #5: Validar path params antes de usar en lógica
 * 
 * @param req - Request de Express
 * @param schema - Schema de Zod para validación
 * @returns ParseResult<T> con params validados o error
 * 
 * @example
 * ```typescript
 * const result = parseAndValidatePathParams(req, z.object({ id: z.string().uuid() }));
 * if (!result.success) {
 *   return res.status(result.error.statusCode).json(result.error.body);
 * }
 * const { id } = result.data; // Type-safe
 * ```
 */
export function parseAndValidatePathParams<T>(
  req: Request,
  schema: z.ZodSchema<T>
): ParseResult<T> {
  try {
    // 1. Validar contra schema Zod
    const result = schema.parse(req.params);

    // 2. Log de éxito
    logger.debug('✅ Path params validados', {
      requestId: req.id,
      path: req.path,
      method: req.method,
      schema: schema.constructor.name
    });

    return { success: true, data: result, error: null };
  } catch (err) {
    // 3. Manejo de errores Zod
    if (err instanceof z.ZodError) {
      const formattedErrors = err.errors.map((e) => ({
        field: e.path.join('.') || 'root',
        message: e.message,
        code: e.code,
      }));

      logger.warn('❌ Validación de path params fallida', {
        requestId: req.id,
        path: req.path,
        method: req.method,
        schema: schema.constructor.name,
        errors: formattedErrors,
      });

      return {
        success: false,
        data: null,
        error: {
          statusCode: 400,
          body: {
            success: false,
            message: 'Parámetros de ruta inválidos',
            data: { errors: formattedErrors },
            timestamp: new Date().toISOString(),
          },
        },
      };
    }

    logger.error('❌ Error inesperado en validación de path params', {
      requestId: req.id,
      path: req.path,
      method: req.method,
      error: err instanceof Error ? err.message : String(err),
    });

    throw err;
  }
}

/**
 * Parsea y valida los query parameters de un request Express
 * 
 * ✅ REGLA #5: Validar query params antes de usar en lógica
 * 
 * @param req - Request de Express
 * @param schema - Schema de Zod para validación
 * @returns ParseResult<T> con query params validados o error
 * 
 * @example
 * ```typescript
 * const result = parseAndValidateQueryParams(req, PaginationDTO);
 * if (!result.success) {
 *   return res.status(result.error.statusCode).json(result.error.body);
 * }
 * const { page, pageSize } = result.data; // Type-safe
 * ```
 */
export function parseAndValidateQueryParams<T>(
  req: Request,
  schema: z.ZodSchema<T>
): ParseResult<T> {
  try {
    // 1. Validar contra schema Zod
    const result = schema.parse(req.query);

    // 2. Log de éxito
    logger.debug('✅ Query params validados', {
      requestId: req.id,
      path: req.path,
      method: req.method,
      schema: schema.constructor.name
    });

    return { success: true, data: result, error: null };
  } catch (err) {
    // 3. Manejo de errores Zod
    if (err instanceof z.ZodError) {
      const formattedErrors = err.errors.map((e) => ({
        field: e.path.join('.') || 'root',
        message: e.message,
        code: e.code,
      }));

      logger.warn('❌ Validación de query params fallida', {
        requestId: req.id,
        path: req.path,
        method: req.method,
        schema: schema.constructor.name,
        errors: formattedErrors,
      });

      return {
        success: false,
        data: null,
        error: {
          statusCode: 400,
          body: {
            success: false,
            message: 'Parámetros de consulta inválidos',
            data: { errors: formattedErrors },
            timestamp: new Date().toISOString(),
          },
        },
      };
    }

    logger.error('❌ Error inesperado en validación de query params', {
      requestId: req.id,
      path: req.path,
      method: req.method,
      error: err instanceof Error ? err.message : String(err),
    });

    throw err;
  }
}

/**
 * Helper para respuesta de validación exitosa
 * Centraliza formato de respuesta
 * 
 * @param data - Datos a retornar
 * @param message - Mensaje de éxito (default: 'Success')
 * @param statusCode - Status HTTP (default: 200)
 * @returns Objeto de respuesta JSON formateado
 */
export function validationSuccessResponse<T>(
  data: T,
  message: string = 'Success',
  statusCode: number = 200
) {
  return {
    statusCode,
    body: JSON.stringify({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
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
 * ✅ REGLA #3: Logger automático de errores
 * ✅ REGLA #4: Respuesta centralizada consistente
 * 
 * @param error - ValidationErrorResponse con detalles
 * @returns Objeto de respuesta JSON con error
 * 
 * @example
 * ```typescript
 * const result = parseAndValidateBody(req, schema);
 * if (!result.success) {
 *   return res.status(result.error.statusCode).json(result.error.body);
 * }
 * ```
 */
export function validationErrorResponse(
  error: ValidationErrorResponse
) {
  return {
    statusCode: error.statusCode,
    body: JSON.stringify(error.body),
    headers: {
      'Content-Type': 'application/json',
    },
  };
}

