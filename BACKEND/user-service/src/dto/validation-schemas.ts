/**
 * 🔐 Schemas de Validación con Zod - User Service
 * 
 * Este archivo centraliza TODOS los schemas de validación usando Zod.
 * Zod proporciona validación type-safe en runtime con TypeScript.
 * 
 * REGLA #5: SIEMPRE validar datos de entrada con schemas (Zod)
 * 
 * Beneficios:
 * - Type-safety completo (TypeScript + Zod)
 * - Validación robusta y descriptiva
 * - Mensajes de error claros y personalizables
 * - Protección contra inyección
 * - Inferencia automática de tipos
 */

import { z } from 'zod';

// ========================================
// 📦 USER PROFILE SCHEMAS
// ========================================

/**
 * Schema de validación para crear un perfil de usuario
 * 
 * Campos validados:
 * - first_name: Requerido, 1-50 caracteres
 * - last_name: Requerido, 1-50 caracteres
 * - phone: Opcional, formato internacional
 */
export const CreateProfileSchema = z.object({
  first_name: z
    .string({
      required_error: 'El nombre es requerido',
      invalid_type_error: 'El nombre debe ser un texto',
    })
    .min(1, {
      message: 'El nombre es requerido y debe ser una cadena no vacía',
    })
    .max(50, {
      message: 'El nombre no debe exceder los 50 caracteres',
    })
    .trim(),

  last_name: z
    .string({
      required_error: 'El apellido es requerido',
      invalid_type_error: 'El apellido debe ser un texto',
    })
    .min(1, {
      message: 'El apellido es requerido y debe ser una cadena no vacía',
    })
    .max(50, {
      message: 'El apellido no debe exceder los 50 caracteres',
    })
    .trim(),

  phone: z
    .string({
      invalid_type_error: 'El teléfono debe ser una cadena de texto',
    })
    .regex(/^\+?[0-9\s-()]{7,20}$/, {
      message: 'El formato del teléfono es inválido',
    })
    .optional()
    .or(z.literal('')), // Permitir string vacío
});

/**
 * Schema de validación para actualizar un perfil de usuario
 * 
 * Todos los campos son opcionales (partial update)
 */
export const UpdateProfileSchema = CreateProfileSchema.partial();

/**
 * Schema de validación para email (usado internamente)
 * 
 * Nota: El email viene de Cognito (ya verificado), pero validamos
 * el formato por defense in depth
 */
export const EmailSchema = z
  .string({
    required_error: 'El email es requerido',
    invalid_type_error: 'El email debe ser un texto',
  })
  .trim()
  .email({
    message: 'El email debe tener un formato válido (ej: usuario@dominio.com)',
  })
  .max(255, {
    message: 'El email no debe exceder los 255 caracteres',
  });

// ========================================
// 📊 TIPOS INFERIDOS AUTOMÁTICAMENTE
// ========================================

/**
 * Tipo inferido del schema de creación de perfil
 * ✅ Type-safe: TypeScript infiere automáticamente desde Zod
 */
export type CreateProfileInput = z.infer<typeof CreateProfileSchema>;

/**
 * Tipo inferido del schema de actualización de perfil
 * ✅ Type-safe: TypeScript infiere automáticamente desde Zod
 */
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

/**
 * Tipo inferido del schema de email
 * ✅ Type-safe: TypeScript infiere automáticamente desde Zod
 */
export type EmailInput = z.infer<typeof EmailSchema>;

