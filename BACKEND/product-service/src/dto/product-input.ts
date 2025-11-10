/**
 * DTOs (Data Transfer Objects) para Product
 * 
 * Define la estructura de datos esperada para operaciones de productos.
 * Estos DTOs se usan junto con Schemas Zod para validación type-safe.
 * 
 * REGLA #5: SIEMPRE validar datos de entrada con schemas (Zod)
 * REGLA #9: SIEMPRE mantener consistencia arquitectónica
 */

/**
 * DTO para crear un producto
 * 
 * Todos los campos son requeridos excepto los marcados como opcionales.
 */
export interface CreateProductInput {
  /**
   * Nombre del producto
   * Min: 3 caracteres, Max: 200 caracteres
   */
  name: string;

  /**
   * Descripción del producto (opcional)
   * Max: 2000 caracteres
   */
  description?: string;

  /**
   * Precio del producto
   * Min: 0.01, Max: 999999.99
   */
  price: number;

  /**
   * ID de la categoría (opcional)
   * Debe ser un UUID válido
   */
  categoryId?: string;

  /**
   * URL de la imagen del producto (opcional)
   * Debe ser una URL válida
   */
  imageUrl?: string;

  /**
   * Stock disponible (opcional)
   * Default: 0
   * Debe ser un entero no negativo
   */
  stock?: number;

  /**
   * Indica si el producto está activo (opcional)
   * Default: true
   */
  isActive?: boolean;
}

/**
 * DTO para actualizar un producto
 * 
 * Todos los campos son opcionales (actualización parcial)
 */
export interface UpdateProductInput {
  /**
   * Nombre del producto (opcional)
   * Min: 3 caracteres, Max: 200 caracteres
   */
  name?: string;

  /**
   * Descripción del producto (opcional)
   * Max: 2000 caracteres
   */
  description?: string;

  /**
   * Precio del producto (opcional)
   * Min: 0.01, Max: 999999.99
   */
  price?: number;

  /**
   * ID de la categoría (opcional)
   * Debe ser un UUID válido
   */
  categoryId?: string;

  /**
   * URL de la imagen del producto (opcional)
   * Debe ser una URL válida
   */
  imageUrl?: string;

  /**
   * Stock disponible (opcional)
   * Debe ser un entero no negativo
   */
  stock?: number;

  /**
   * Indica si el producto está activo (opcional)
   */
  isActive?: boolean;
}

/**
 * DTO para obtener un producto por ID
 */
export interface GetProductByIdInput {
  /**
   * ID del producto
   * Debe ser un UUID válido
   */
  id: string;
}

/**
 * DTO para subir imagen de producto
 */
export interface ImageUploadInput {
  /**
   * Nombre del archivo
   * Debe tener extensión válida: jpg, jpeg, png, webp
   */
  fileName: string;

  /**
   * Tipo de contenido
   * Debe ser image/*
   */
  contentType: string;
}

/**
 * DTO para paginación
 */
export interface PaginationInput {
  /**
   * Número de página
   * Min: 1
   * Default: 1
   */
  page?: number;

  /**
   * Tamaño de página
   * Min: 1, Max: 100
   * Default: 20
   */
  pageSize?: number;
}




