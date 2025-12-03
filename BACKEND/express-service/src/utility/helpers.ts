/**
 * 📚 Helpers Utilities - Funciones reutilizables
 * 
 * ✅ REGLA #4 BACKEND: Centralizar funciones helper
 * ✅ REGLA CERO DUPLICACIÓN: Un solo lugar para helpers
 * ✅ REGLA #3 BACKEND: Logger estructurado
 * 
 * Este archivo contiene funciones utilitarias reutilizables en handlers y services.
 * Patrones adoptados de user-service para garantizar consistencia.
 * 
 * Funciones:
 * - formatUser(): Estandarizar formato de usuario
 * - buildSuccessResponse(): Construir respuesta exitosa
 * - extractZodErrors(): Extraer errores de Zod
 * - generateRandomProfile(): Generar perfil aleatorio a partir de email
 */

import { z } from 'zod';
import logger from './logger';

/**
 * Interfaz para usuario formateado
 * Estandariza estructura de usuario en todas las respuestas
 */
export interface FormattedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Formatea un usuario para respuesta API
 * 
 * ✅ REGLA #4: Estandarizar formato de respuesta
 * ✅ REGLA CERO DUPLICACIÓN: Un solo lugar donde formatear usuarios
 * 
 * @param user - Objeto usuario de la base de datos
 * @returns Usuario formateado con estructura consistente
 * 
 * @example
 * ```typescript
 * const user = await userRepository.findById(id);
 * const formatted = formatUser(user);
 * return res.json({ success: true, data: formatted });
 * ```
 */
export function formatUser(user: any): FormattedUser {
  try {
    const formatted: FormattedUser = {
      id: user.id,
      email: user.email,
      firstName: user.first_name || user.firstName || '',
      lastName: user.last_name || user.lastName || '',
      fullName: `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim(),
      createdAt: user.created_at ? new Date(user.created_at).toISOString() : new Date().toISOString(),
      updatedAt: user.updated_at ? new Date(user.updated_at).toISOString() : new Date().toISOString(),
    };

    logger.debug('User formateado', {
      userId: user.id,
      email: user.email,
    });

    return formatted;
  } catch (error) {
    logger.error('Error formateando usuario', {
      error: error instanceof Error ? error.message : String(error),
      user: user?.id || 'unknown',
    });
    throw error;
  }
}

/**
 * Construye una respuesta exitosa estandarizada
 * 
 * ✅ REGLA #4: Respuesta centralizada consistente
 * ✅ REGLA #9: Consistencia con user-service
 * 
 * @param data - Datos a retornar
 * @param message - Mensaje de éxito (default: 'Success')
 * @param statusCode - Status HTTP (default: 200)
 * @returns Objeto de respuesta JSON formateado
 * 
 * @example
 * ```typescript
 * const user = formatUser(dbUser);
 * const response = buildSuccessResponse(user, 'User retrieved', 200);
 * return res.status(response.statusCode).json(response.body);
 * ```
 */
export function buildSuccessResponse<T>(
  data: T,
  message: string = 'Success',
  statusCode: number = 200
) {
  return {
    statusCode,
    body: {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Extrae y formatea errores de validación Zod
 * 
 * ✅ REGLA #5 BACKEND: Centralizar extracción de errores Zod
 * ✅ REGLA CERO DUPLICACIÓN: Ya no duplicado en dto/index.ts
 * 
 * @param error - Error de Zod
 * @returns Array de errores formateados
 * 
 * @example
 * ```typescript
 * try {
 *   schema.parse(data);
 * } catch (error) {
 *   if (error instanceof z.ZodError) {
 *     const errors = extractZodErrors(error);
 *     return res.status(400).json(validationErrorResponse(errors));
 *   }
 * }
 * ```
 */
export function extractZodErrors(error: z.ZodError) {
  return error.errors.map((err) => ({
    field: err.path.join('.') || 'body',
    message: err.message,
    code: err.code || 'VALIDATION_ERROR',
  }));
}

/**
 * Genera un perfil aleatorio a partir del email del usuario
 * 
 * Útil para auto-provisioning o generación de nombres por defecto.
 * Patrón adoptado de user-service/src/utility/name-generator.ts
 * 
 * @param email - Email del usuario
 * @returns Objeto con firstName y lastName generados
 * 
 * @example
 * ```typescript
 * const email = 'john.doe@example.com';
 * const profile = generateRandomProfile(email);
 * // { firstName: 'Johndoe', lastName: '847392' }
 * ```
 */
export function generateRandomProfile(email: string): { firstName: string; lastName: string } {
  try {
    // Extraer la parte antes del @
    const username = email.split('@')[0];

    // Sanitizar: remover caracteres especiales y números, mantener solo letras
    const sanitized = username.replace(/[^a-zA-Z]/g, '');

    // Si después de sanitizar queda vacío o muy corto, usar un nombre genérico
    const firstName = sanitized.length < 3 
      ? 'User' + Math.floor(Math.random() * 1000)
      : sanitized.charAt(0).toUpperCase() + sanitized.slice(1).toLowerCase();

    // Generar apellido con números aleatorios (6 dígitos)
    const lastName = Math.floor(100000 + Math.random() * 900000).toString();

    logger.debug('Perfil aleatorio generado', {
      email,
      firstName,
      lastName,
    });

    return { firstName, lastName };
  } catch (error) {
    logger.error('Error generando perfil aleatorio', {
      error: error instanceof Error ? error.message : String(error),
      email,
    });
    throw error;
  }
}

/**
 * Formatea múltiples usuarios (array)
 * 
 * ✅ REGLA CERO DUPLICACIÓN: Reutilizar formatUser en array
 * 
 * @param users - Array de usuarios
 * @returns Array de usuarios formateados
 */
export function formatUsers(users: any[]): FormattedUser[] {
  return users.map((user) => formatUser(user));
}

/**
 * Sanitiza una cadena removiendo caracteres especiales
 * 
 * Útil para validar y limpiar inputs de usuario.
 * 
 * @param input - Cadena a sanitizar
 * @param allowedChars - Expresión regular de caracteres permitidos (default: alfanuméricos y espacios)
 * @returns Cadena sanitizada
 * 
 * @example
 * ```typescript
 * const dirty = 'hello<script>alert("xss")</script>';
 * const clean = sanitizeString(dirty);
 * // 'helloscriptalertxssscript'
 * ```
 */
export function sanitizeString(
  input: string,
  allowedChars: string = '^a-zA-Z0-9\\s'
): string {
  try {
    const regex = new RegExp(`[${allowedChars}]`, 'g');
    const sanitized = input.match(regex)?.join('') || '';

    logger.debug('Cadena sanitizada', {
      original: input.substring(0, 50),
      sanitized: sanitized.substring(0, 50),
    });

    return sanitized;
  } catch (error) {
    logger.error('Error sanitizando cadena', {
      error: error instanceof Error ? error.message : String(error),
      input: input.substring(0, 50),
    });
    throw error;
  }
}

/**
 * Convierte objeto con snake_case a camelCase
 * 
 * Útil para convertir respuestas de BD (snake_case) a API (camelCase)
 * 
 * @param obj - Objeto con snake_case keys
 * @returns Objeto con camelCase keys
 * 
 * @example
 * ```typescript
 * const dbResult = { first_name: 'John', last_name: 'Doe', created_at: '2024-01-01' };
 * const api = toCamelCase(dbResult);
 * // { firstName: 'John', lastName: 'Doe', createdAt: '2024-01-01' }
 * ```
 */
export function toCamelCase(obj: Record<string, any>): Record<string, any> {
  try {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      // Convertir snake_case a camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
      result[camelKey] = value;
    }

    return result;
  } catch (error) {
    logger.error('Error convirtiendo a camelCase', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Extrae campos específicos de un objeto (subset)
 * 
 * ✅ REGLA PLATINO: No enviar datos no necesarios en respuesta
 * 
 * @param obj - Objeto original
 * @param fields - Array de campos a extraer
 * @returns Nuevo objeto con solo los campos especificados
 * 
 * @example
 * ```typescript
 * const user = { id: '123', email: 'test@example.com', password: 'secret' };
 * const safe = pickFields(user, ['id', 'email']);
 * // { id: '123', email: 'test@example.com' }
 * ```
 */
export function pickFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): Partial<T> {
  try {
    const result: Partial<T> = {};

    for (const field of fields) {
      if (field in obj) {
        result[field] = obj[field];
      }
    }

    return result;
  } catch (error) {
    logger.error('Error extrayendo campos', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

