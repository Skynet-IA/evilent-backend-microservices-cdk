/**
 * 🔐 Utilidad de Validación con Zod
 * 
 * Este archivo proporciona funciones helper para validar datos con Zod
 * y convertir errores de Zod en respuestas HTTP consistentes.
 * 
 * REGLA #5 BACKEND: SIEMPRE validar datos de entrada con schemas (Zod)
 * REGLA #3 BACKEND: Logger estructurado con contexto
 * 
 * Uso en Express handlers:
 *   const result = validateWithZod(CreateUserDTO, req.body);
 *   if (!result.success) {
 *     return res.status(400).json(result.response);
 *   }
 *   const userData = result.data; // ✅ Tipado fuerte
 */

import { z, ZodError, ZodSchema } from 'zod';
import logger from './logger';
import { ERROR_MESSAGES, HTTP_STATUS } from '../config/constants';

/**
 * Interfaz para errores de validación formateados
 * Compatible con la estructura de error consistente del proyecto
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Resultado de validación con Zod
 */
export interface ZodValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
  response?: any; // Express Response object structure
}

/**
 * Convierte errores de Zod en un formato compatible con express-service
 * 
 * @param error - Error de Zod
 * @returns Array de errores formateados
 * 
 * @example
 * ```typescript
 * try {
 *   schema.parse(data);
 * } catch (error) {
 *   const errors = formatZodErrors(error as ZodError);
 *   // errors: [{ field: 'firstName', message: '...', code: 'VALIDATION_ERROR' }]
 * }
 * ```
 */
export function formatZodErrors(error: ZodError): ValidationError[] {
  return error.errors.map((err) => ({
    field: err.path.join('.') || 'body',
    message: err.message,
    code: 'VALIDATION_ERROR'
  }));
}

/**
 * Genera objeto de respuesta de validación fallida
 * Usado internamente por validateWithZod
 */
function createValidationErrorResponse(errors: ValidationError[]) {
  return {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    body: JSON.stringify({
      success: false,
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      data: { errors },
      timestamp: new Date().toISOString()
    })
  };
}

/**
 * Valida datos usando un schema de Zod y retorna resultado estructurado
 * 
 * Esta función es compatible con el patrón usado en express-service.
 * Retorna un objeto con success, data, errors y response.
 * 
 * REGLA #5: Validación centralizada, reutilizable en múltiples handlers
 * 
 * @param schema - Schema de Zod para validar
 * @param data - Datos a validar
 * @returns Resultado de validación con datos tipados o errores
 * 
 * @example
 * ```typescript
 * const result = validateWithZod(CreateUserDTO, req.body);
 * if (!result.success) {
 *   return res.status(400).json(result.response);
 * }
 * const validatedData = result.data; // ✅ Tipado fuerte
 * ```
 */
export function validateWithZod<T>(
  schema: ZodSchema<T>,
  data: unknown
): ZodValidationResult<T> {
  try {
    const validatedData = schema.parse(data);
    
    logger.debug('Validación Zod exitosa', {
      schema: schema.constructor.name
    });
    
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = formatZodErrors(error);
      
      logger.warn('Error de validación Zod', {
        errorsCount: formattedErrors.length,
        errors: formattedErrors,
      });

      return {
        success: false,
        errors: formattedErrors,
        response: createValidationErrorResponse(formattedErrors),
      };
    }

    // Error inesperado
    logger.error('Error inesperado durante validación Zod', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    return {
      success: false,
      errors: [{ field: 'body', message: 'Error de validación inesperado', code: 'VALIDATION_ERROR' }],
      response: createValidationErrorResponse([
        { field: 'body', message: 'Error de validación inesperado', code: 'VALIDATION_ERROR' }
      ]),
    };
  }
}

/**
 * Valida datos usando un schema de Zod y retorna los datos validados
 * 
 * Si la validación falla, lanza un ZodError.
 * Si la validación es exitosa, retorna los datos validados y tipados.
 * 
 * REGLA #5: Patrón alternativo para handlers que prefieren manejo manual de excepciones
 * 
 * @param schema - Schema de Zod para validar
 * @param data - Datos a validar
 * @returns Datos validados y tipados
 * @throws ZodError si la validación falla
 * 
 * @example
 * ```typescript
 * try {
 *   const validatedData = parseWithZod(CreateUserDTO, req.body);
 *   // Continuar con lógica de negocio
 * } catch (error) {
 *   if (error instanceof ZodError) {
 *     const errors = formatZodErrors(error);
 *     return res.status(400).json(validationErrorResponse(errors));
 *   }
 * }
 * ```
 */
export function parseWithZod<T>(schema: ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Valida datos usando un schema de Zod de forma segura (sin lanzar excepciones)
 * 
 * Retorna un objeto con success: boolean que indica si la validación fue exitosa.
 * 
 * REGLA #5: Patrón para manejo muy granular de validación
 * 
 * @param schema - Schema de Zod para validar
 * @param data - Datos a validar
 * @returns Resultado de validación con success y data/error
 * 
 * @example
 * ```typescript
 * const result = safeParseWithZod(CreateUserDTO, req.body);
 * if (result.success) {
 *   const validatedData = result.data;
 * } else {
 *   const errors = result.error.errors;
 * }
 * ```
 */
export function safeParseWithZod<T>(
  schema: ZodSchema<T>,
  data: unknown
): z.SafeParseReturnType<unknown, T> {
  return schema.safeParse(data);
}

