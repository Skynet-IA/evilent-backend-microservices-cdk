/**
 * 🔐 Utilidad de Validación con Zod
 * 
 * Este archivo proporciona funciones helper para validar datos con Zod
 * y convertir errores de Zod en respuestas HTTP consistentes.
 * 
 * REGLA #5: SIEMPRE validar datos de entrada con schemas (Zod)
 */

import { z, ZodError, ZodSchema } from 'zod';
import { APIGatewayProxyResult } from 'aws-lambda';
import { ValidationErrorResponse } from './response.js';
import { createLogger } from './logger.js';

const logger = createLogger('ZodValidator');

/**
 * Interfaz para errores de validación formateados
 */
interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Convierte errores de Zod en un formato legible y consistente
 * 
 * @param error - Error de Zod
 * @returns Array de errores formateados
 */
export function formatZodErrors(error: ZodError): ValidationError[] {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));
}

/**
 * Valida datos usando un schema de Zod
 * 
 * Si la validación falla, retorna una respuesta HTTP 400 con los errores.
 * Si la validación es exitosa, retorna null.
 * 
 * @param schema - Schema de Zod para validar
 * @param data - Datos a validar
 * @returns Respuesta HTTP de error o null si es válido
 * 
 * @example
 * ```typescript
 * const validationError = validateWithZod(CreateProductSchema, data);
 * if (validationError) {
 *   return validationError; // Retornar error 400
 * }
 * // Continuar con lógica de negocio
 * ```
 */
export function validateWithZod<T>(
  schema: ZodSchema<T>,
  data: unknown
): APIGatewayProxyResult | null {
  try {
    schema.parse(data);
    return null; // Validación exitosa
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = formatZodErrors(error);
      
      logger.warn('Error de validación Zod', {
        errorsCount: formattedErrors.length,
        errors: formattedErrors,
      });

      return ValidationErrorResponse(
        'Error de validación de datos',
        formattedErrors
      );
    }

    // Error inesperado
    logger.error('Error inesperado durante validación Zod', error);
    return ValidationErrorResponse('Error de validación de datos');
  }
}

/**
 * Valida datos usando un schema de Zod y retorna los datos validados
 * 
 * Si la validación falla, lanza un ZodError.
 * Si la validación es exitosa, retorna los datos validados y tipados.
 * 
 * @param schema - Schema de Zod para validar
 * @param data - Datos a validar
 * @returns Datos validados y tipados
 * @throws ZodError si la validación falla
 * 
 * @example
 * ```typescript
 * try {
 *   const validatedData = parseWithZod(CreateProductSchema, data);
 *   // validatedData está tipado como CreateProductInput
 *   return service.createProduct(validatedData);
 * } catch (error) {
 *   return ErrorResponse(error);
 * }
 * ```
 */
export function parseWithZod<T>(schema: ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Valida datos usando un schema de Zod de forma segura
 * 
 * Retorna un objeto con success: true y data si es válido,
 * o success: false y error si falla.
 * 
 * @param schema - Schema de Zod para validar
 * @param data - Datos a validar
 * @returns Resultado de la validación
 * 
 * @example
 * ```typescript
 * const result = safeParseWithZod(CreateProductSchema, data);
 * if (result.success) {
 *   return service.createProduct(result.data);
 * } else {
 *   return ValidationErrorResponse('Error', formatZodErrors(result.error));
 * }
 * ```
 */
export function safeParseWithZod<T>(
  schema: ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: ZodError } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    logger.warn('Error de validación Zod (safeParse)', {
      errorsCount: result.error.errors.length,
      errors: formatZodErrors(result.error),
    });
    return { success: false, error: result.error };
  }
}

/**
 * Valida query parameters de API Gateway
 * 
 * Convierte strings a números/booleanos según el schema.
 * 
 * @param schema - Schema de Zod para validar
 * @param queryParams - Query parameters de API Gateway
 * @returns Respuesta HTTP de error o null si es válido
 */
export function validateQueryParams<T>(
  schema: ZodSchema<T>,
  queryParams: Record<string, string | undefined> | null
): APIGatewayProxyResult | null {
  if (!queryParams) {
    return ValidationErrorResponse('Query parameters son requeridos');
  }

  // Mantener valores como strings (API Gateway siempre envía strings)
  const parsedParams: Record<string, string> = {};

  for (const [key, value] of Object.entries(queryParams)) {
    if (value !== undefined) {
      parsedParams[key] = value;
    }
  }

  return validateWithZod(schema, parsedParams);
}

/**
 * Valida path parameters de API Gateway
 * 
 * @param schema - Schema de Zod para validar
 * @param pathParams - Path parameters de API Gateway
 * @returns Respuesta HTTP de error o null si es válido
 */
export function validatePathParams<T>(
  schema: ZodSchema<T>,
  pathParams: Record<string, string | undefined> | null
): APIGatewayProxyResult | null {
  if (!pathParams) {
    return ValidationErrorResponse('Path parameters son requeridos');
  }

  return validateWithZod(schema, pathParams);
}

