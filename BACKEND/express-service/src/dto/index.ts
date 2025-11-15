/**
 * DTOs - Data Transfer Objects con Zod
 * 
 * REGLA DE ORO #5: SIEMPRE validar datos de entrada con schemas (Zod)
 * 
 * Uso:
 *   const result = CreateUserDTO.safeParse(req.body);
 *   if (!result.success) {
 *     return validationErrorResponse(res, result.error.errors);
 *   }
 *   const userData = result.data;
 */

import { z } from 'zod';
import { BUSINESS_LIMITS } from '../config/constants';

// ============================================================================
// USER DTOs
// ============================================================================

export const CreateUserDTO = z.object({
  firstName: z
    .string()
    .min(BUSINESS_LIMITS.USER.FIRST_NAME_MIN_LENGTH, 'First name is required')
    .max(BUSINESS_LIMITS.USER.FIRST_NAME_MAX_LENGTH, 'First name too long'),
  lastName: z
    .string()
    .min(BUSINESS_LIMITS.USER.LAST_NAME_MIN_LENGTH, 'Last name is required')
    .max(BUSINESS_LIMITS.USER.LAST_NAME_MAX_LENGTH, 'Last name too long'),
  email: z
    .string()
    .email('Invalid email')
    .max(BUSINESS_LIMITS.USER.EMAIL_MAX_LENGTH, 'Email too long')
});

export type CreateUserInput = z.infer<typeof CreateUserDTO>;

export const UpdateUserDTO = CreateUserDTO.partial();
export type UpdateUserInput = z.infer<typeof UpdateUserDTO>;

// ============================================================================
// PRODUCT DTOs
// ============================================================================

export const CreateProductDTO = z.object({
  name: z
    .string()
    .min(BUSINESS_LIMITS.PRODUCT.NAME_MIN_LENGTH, 'Product name must be at least 3 characters')
    .max(BUSINESS_LIMITS.PRODUCT.NAME_MAX_LENGTH, 'Product name too long'),
  description: z
    .string()
    .max(BUSINESS_LIMITS.PRODUCT.DESCRIPTION_MAX_LENGTH, 'Description too long')
    .optional(),
  price: z
    .number()
    .min(BUSINESS_LIMITS.PRODUCT.PRICE_MIN, 'Price must be greater than 0')
    .max(BUSINESS_LIMITS.PRODUCT.PRICE_MAX, 'Price exceeds maximum')
});

export type CreateProductInput = z.infer<typeof CreateProductDTO>;

export const UpdateProductDTO = CreateProductDTO.partial();
export type UpdateProductInput = z.infer<typeof UpdateProductDTO>;

// ============================================================================
// PAGINATION DTOs
// ============================================================================

export const PaginationDTO = z.object({
  page: z.coerce
    .number()
    .int()
    .min(BUSINESS_LIMITS.PAGINATION.DEFAULT_PAGE, 'Page must be >= 1')
    .default(BUSINESS_LIMITS.PAGINATION.DEFAULT_PAGE),
  pageSize: z.coerce
    .number()
    .int()
    .min(1, 'Page size must be >= 1')
    .max(BUSINESS_LIMITS.PAGINATION.MAX_PAGE_SIZE, `Page size must be <= ${BUSINESS_LIMITS.PAGINATION.MAX_PAGE_SIZE}`)
    .default(BUSINESS_LIMITS.PAGINATION.DEFAULT_PAGE_SIZE)
});

export type PaginationInput = z.infer<typeof PaginationDTO>;

// ============================================================================
// AUTH DTOs
// ============================================================================

export const LoginDTO = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export type LoginInput = z.infer<typeof LoginDTO>;

export const SignUpDTO = z.object({
  firstName: z
    .string()
    .min(BUSINESS_LIMITS.USER.FIRST_NAME_MIN_LENGTH, 'First name is required'),
  lastName: z
    .string()
    .min(BUSINESS_LIMITS.USER.LAST_NAME_MIN_LENGTH, 'Last name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export type SignUpInput = z.infer<typeof SignUpDTO>;

// ============================================================================
// Utility function para extraer errores de Zod
// ============================================================================

export const extractZodErrors = (error: z.ZodError) => {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: 'VALIDATION_ERROR'
  }));
};

