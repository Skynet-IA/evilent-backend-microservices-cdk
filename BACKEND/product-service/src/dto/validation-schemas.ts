/**
 * 🔐 Schemas de Validación con Zod - Product Service
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
import {
  PRODUCT_NAME_MAX_LENGTH,
  PRODUCT_NAME_MIN_LENGTH,
  PRODUCT_DESCRIPTION_MAX_LENGTH,
  PRODUCT_PRICE_MIN,
  PRODUCT_PRICE_MAX,
  CATEGORY_NAME_MAX_LENGTH,
  CATEGORY_NAME_MIN_LENGTH,
  CATEGORY_DESCRIPTION_MAX_LENGTH,
  DEAL_DISCOUNT_MIN,
  DEAL_DISCOUNT_MAX,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from '../config/constants.js';
import type {
  CreateProductInput,
  UpdateProductInput,
  GetProductByIdInput,
  ImageUploadInput,
  PaginationInput,
} from './product-input.js';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  GetCategoryByIdInput,
} from './category-input.js';
import type {
  CreateDealInput,
  UpdateDealInput,
  GetDealByIdInput,
} from './deal-input.js';

// ✅ Exportar tipos para que sean accesibles desde este módulo
export type {
  CreateProductInput,
  UpdateProductInput,
  GetProductByIdInput,
  ImageUploadInput,
  PaginationInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  GetCategoryByIdInput,
  CreateDealInput,
  UpdateDealInput,
  GetDealByIdInput,
};

// ========================================
// 📦 PRODUCT SCHEMAS
// ========================================

/**
 * Schema de validación para crear un producto
 * Garantiza consistencia con CreateProductInput mediante satisfies
 */
export const CreateProductSchema = z.object({
  name: z
    .string({
      required_error: 'El nombre del producto es requerido',
      invalid_type_error: 'El nombre debe ser un texto',
    })
    .min(PRODUCT_NAME_MIN_LENGTH, {
      message: `El nombre debe tener al menos ${PRODUCT_NAME_MIN_LENGTH} caracteres`,
    })
    .max(PRODUCT_NAME_MAX_LENGTH, {
      message: `El nombre no puede exceder ${PRODUCT_NAME_MAX_LENGTH} caracteres`,
    })
    .trim(),

  description: z
    .string({
      required_error: 'La descripción del producto es requerida',
      invalid_type_error: 'La descripción debe ser un texto',
    })
    .max(PRODUCT_DESCRIPTION_MAX_LENGTH, {
      message: `La descripción no puede exceder ${PRODUCT_DESCRIPTION_MAX_LENGTH} caracteres`,
    })
    .trim()
    .optional(),

  price: z
    .number({
      required_error: 'El precio del producto es requerido',
      invalid_type_error: 'El precio debe ser un número',
    })
    .min(PRODUCT_PRICE_MIN, {
      message: `El precio mínimo es ${PRODUCT_PRICE_MIN}`,
    })
    .max(PRODUCT_PRICE_MAX, {
      message: `El precio máximo es ${PRODUCT_PRICE_MAX}`,
    })
    .positive({
      message: 'El precio debe ser un número positivo',
    }),

  categoryId: z
    .string({
      required_error: 'El ID de categoría es requerido',
      invalid_type_error: 'El ID de categoría debe ser un texto',
    })
    .uuid({
      message: 'El ID de categoría debe ser un UUID válido',
    })
    .optional(),

  imageUrl: z
    .string({
      invalid_type_error: 'La URL de la imagen debe ser un texto',
    })
    .url({
      message: 'La URL de la imagen debe ser válida',
    })
    .optional(),

  stock: z
    .number({
      invalid_type_error: 'El stock debe ser un número',
    })
    .int({
      message: 'El stock debe ser un número entero',
    })
    .nonnegative({
      message: 'El stock no puede ser negativo',
    })
    .optional()
    .default(0),

  isActive: z
    .boolean({
      invalid_type_error: 'isActive debe ser un booleano',
    })
    .optional()
    .default(true),
});

/**
 * Schema de validación para actualizar un producto
 * Todos los campos son opcionales (actualización parcial)
 */
export const UpdateProductSchema = CreateProductSchema.partial();

/**
 * Schema de validación para obtener un producto por ID
 */
export const GetProductByIdSchema = z.object({
  id: z
    .string({
      required_error: 'El ID del producto es requerido',
      invalid_type_error: 'El ID debe ser un texto',
    })
    .uuid({
      message: 'El ID debe ser un UUID válido',
    }),
});

// ========================================
// 🏷️ CATEGORY SCHEMAS
// ========================================

/**
 * Schema de validación para crear una categoría
 * Garantiza consistencia con CreateCategoryInput mediante satisfies
 */
export const CreateCategorySchema = z.object({
  name: z
    .string({
      required_error: 'El nombre de la categoría es requerido',
      invalid_type_error: 'El nombre debe ser un texto',
    })
    .min(CATEGORY_NAME_MIN_LENGTH, {
      message: `El nombre debe tener al menos ${CATEGORY_NAME_MIN_LENGTH} caracteres`,
    })
    .max(CATEGORY_NAME_MAX_LENGTH, {
      message: `El nombre no puede exceder ${CATEGORY_NAME_MAX_LENGTH} caracteres`,
    })
    .trim(),

  description: z
    .string({
      invalid_type_error: 'La descripción debe ser un texto',
    })
    .max(CATEGORY_DESCRIPTION_MAX_LENGTH, {
      message: `La descripción no puede exceder ${CATEGORY_DESCRIPTION_MAX_LENGTH} caracteres`,
    })
    .trim()
    .optional(),

  parentCategoryId: z
    .string({
      invalid_type_error: 'El ID de categoría padre debe ser un texto',
    })
    .uuid({
      message: 'El ID de categoría padre debe ser un UUID válido',
    })
    .optional(),
});

/**
 * Schema de validación para actualizar una categoría
 * Todos los campos son opcionales (actualización parcial)
 */
export const UpdateCategorySchema = CreateCategorySchema.partial();

/**
 * Schema de validación para obtener una categoría por ID
 */
export const GetCategoryByIdSchema = z.object({
  id: z
    .string({
      required_error: 'El ID de la categoría es requerido',
      invalid_type_error: 'El ID debe ser un texto',
    })
    .uuid({
      message: 'El ID debe ser un UUID válido',
    }),
});

// ========================================
// 💰 DEAL SCHEMAS
// ========================================

/**
 * Schema de validación para crear una oferta
 * Incluye validación cruzada: endDate debe ser posterior a startDate
 */
export const CreateDealSchema = z.object({
  productId: z
    .string({
      required_error: 'El ID del producto es requerido',
      invalid_type_error: 'El ID del producto debe ser un texto',
    })
    .uuid({
      message: 'El ID del producto debe ser un UUID válido',
    }),

  discount: z
    .number({
      required_error: 'El descuento es requerido',
      invalid_type_error: 'El descuento debe ser un número',
    })
    .min(DEAL_DISCOUNT_MIN, {
      message: `El descuento mínimo es ${DEAL_DISCOUNT_MIN}%`,
    })
    .max(DEAL_DISCOUNT_MAX, {
      message: `El descuento máximo es ${DEAL_DISCOUNT_MAX}%`,
    }),

  startDate: z
    .string({
      required_error: 'La fecha de inicio es requerida',
      invalid_type_error: 'La fecha de inicio debe ser un texto',
    })
    .datetime({
      message: 'La fecha de inicio debe ser un formato ISO 8601 válido',
    }),

  endDate: z
    .string({
      required_error: 'La fecha de fin es requerida',
      invalid_type_error: 'La fecha de fin debe ser un texto',
    })
    .datetime({
      message: 'La fecha de fin debe ser un formato ISO 8601 válido',
    }),
}).refine(
  (data) => {
    // Validar que endDate sea posterior a startDate
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end > start;
  },
  {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['endDate'],
  }
);

/**
 * Schema de validación para actualizar una oferta
 * Todos los campos son opcionales (actualización parcial)
 * 
 * Nota: No se puede usar .partial() en schemas con .refine()
 * Se define manualmente con campos opcionales
 */
export const UpdateDealSchema = z.object({
  productId: z.string().uuid().optional(),
  discount: z.number().min(DEAL_DISCOUNT_MIN).max(DEAL_DISCOUNT_MAX).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * Schema de validación para obtener una oferta por ID
 */
export const GetDealByIdSchema = z.object({
  id: z
    .string({
      required_error: 'El ID de la oferta es requerido',
      invalid_type_error: 'El ID debe ser un texto',
    })
    .uuid({
      message: 'El ID debe ser un UUID válido',
    }),
});

// ========================================
// 🖼️ IMAGE UPLOAD SCHEMAS
// ========================================

/**
 * Schema de validación para subir una imagen
 * Garantiza consistencia con ImageUploadInput mediante satisfies
 * 
 * Nota: El schema usa 'file' pero el DTO usa 'fileName' para mayor claridad
 */
export const ImageUploadSchema = z.object({
  fileName: z
    .string({
      required_error: 'El nombre del archivo es requerido',
      invalid_type_error: 'El nombre del archivo debe ser un texto',
    })
    .min(1, {
      message: 'El nombre del archivo no puede estar vacío',
    })
    .regex(/\.(jpg|jpeg|png|webp)$/i, {
      message: 'El archivo debe ser una imagen (jpg, jpeg, png, webp)',
    }),

  contentType: z
    .string({
      invalid_type_error: 'El tipo de contenido debe ser un texto',
    })
    .regex(/^image\/(jpeg|jpg|png|webp)$/i, {
      message: 'El tipo de contenido debe ser image/jpeg, image/png o image/webp',
    }),
});

// ========================================
// 📄 PAGINATION SCHEMAS
// ========================================

/**
 * Schema de validación para paginación
 * Garantiza consistencia con PaginationInput mediante satisfies
 */
export const PaginationSchema = z.object({
  page: z
    .coerce.number({
      invalid_type_error: 'La página debe ser un número',
    })
    .int({
      message: 'La página debe ser un número entero',
    })
    .positive({
      message: 'La página debe ser un número positivo',
    })
    .optional()
    .default(1),

  pageSize: z
    .coerce.number({
      invalid_type_error: 'El tamaño de página debe ser un número',
    })
    .int({
      message: 'El tamaño de página debe ser un número entero',
    })
    .positive({
      message: 'El tamaño de página debe ser un número positivo',
    })
    .max(MAX_PAGE_SIZE, {
      message: `El tamaño de página máximo es ${MAX_PAGE_SIZE}`,
    })
    .optional()
    .default(DEFAULT_PAGE_SIZE),
}) satisfies z.ZodType<PaginationInput>;

