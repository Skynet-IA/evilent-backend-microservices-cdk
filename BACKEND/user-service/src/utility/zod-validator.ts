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
 * Compatible con la estructura existente de user-service
 */
export interface SimpleValidationError {
  property: string;
  message: string;
}

/**
 * Resultado de validación con Zod
 */
export interface ZodValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: SimpleValidationError[];
  response?: APIGatewayProxyResult;
}

/**
 * Convierte errores de Zod en un formato compatible con user-service
 * 
 * @param error - Error de Zod
 * @returns Array de errores formateados
 */
export function formatZodErrors(error: ZodError): SimpleValidationError[] {
  return error.errors.map((err) => ({
    property: err.path.join('.') || 'body',
    message: err.message,
  }));
}

/**
 * Valida datos usando un schema de Zod y retorna resultado estructurado
 * 
 * Esta función es compatible con el patrón usado en user-service.
 * Retorna un objeto con success, data, errors y response.
 * 
 * @param schema - Schema de Zod para validar
 * @param data - Datos a validar
 * @returns Resultado de validación con datos tipados o errores
 * 
 * @example
 * ```typescript
 * const result = await validateWithZod(CreateProfileSchema, input);
 * if (!result.success) {
 *   return result.response; // Retornar error 400
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
    
    logger.debug('Validación Zod exitosa');
    
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
        response: ValidationErrorResponse(formattedErrors),
      };
    }

    // Error inesperado
    logger.error('Error inesperado durante validación Zod', error);
    
    return {
      success: false,
      errors: [{ property: 'body', message: 'Error de validación inesperado' }],
      response: ValidationErrorResponse([
        { property: 'body', message: 'Error de validación inesperado' }
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
 * @param schema - Schema de Zod para validar
 * @param data - Datos a validar
 * @returns Datos validados y tipados
 * @throws ZodError si la validación falla
 * 
 * @example
 * ```typescript
 * try {
 *   const validatedData = parseWithZod(CreateProfileSchema, input);
 *   // Continuar con lógica de negocio
 * } catch (error) {
 *   // Manejar error de validación
 * }
 * ```
 */
export function parseWithZod<T>(schema: ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Valida datos usando un schema de Zod de forma segura (sin lanzar excepciones)
 * 
 * @param schema - Schema de Zod para validar
 * @param data - Datos a validar
 * @returns Resultado de validación con success y data/error
 * 
 * @example
 * ```typescript
 * const result = safeParseWithZod(CreateProfileSchema, input);
 * if (result.success) {
 *   const validatedData = result.data;
 * } else {
 *   const errors = result.error;
 * }
 * ```
 */
export function safeParseWithZod<T>(
  schema: ZodSchema<T>,
  data: unknown
): z.SafeParseReturnType<unknown, T> {
  return schema.safeParse(data);
}

