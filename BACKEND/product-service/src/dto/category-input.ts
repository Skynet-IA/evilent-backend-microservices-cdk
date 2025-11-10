/**
 * DTOs (Data Transfer Objects) para Category
 * 
 * Define la estructura de datos esperada para operaciones de categorías.
 * Estos DTOs se usan junto con Schemas Zod para validación type-safe.
 * 
 * REGLA #5: SIEMPRE validar datos de entrada con schemas (Zod)
 * REGLA #9: SIEMPRE mantener consistencia arquitectónica
 */

/**
 * DTO para crear una categoría
 */
export interface CreateCategoryInput {
  /**
   * Nombre de la categoría
   * Min: 2 caracteres, Max: 100 caracteres
   */
  name: string;

  /**
   * Descripción de la categoría (opcional)
   * Max: 500 caracteres
   */
  description?: string;

  /**
   * ID de la categoría padre (opcional)
   * Debe ser un UUID válido
   */
  parentCategoryId?: string;
}

/**
 * DTO para actualizar una categoría
 * 
 * Todos los campos son opcionales (actualización parcial)
 */
export interface UpdateCategoryInput {
  /**
   * Nombre de la categoría (opcional)
   * Min: 2 caracteres, Max: 100 caracteres
   */
  name?: string;

  /**
   * Descripción de la categoría (opcional)
   * Max: 500 caracteres
   */
  description?: string;

  /**
   * ID de la categoría padre (opcional)
   * Debe ser un UUID válido
   */
  parentCategoryId?: string;
}

/**
 * DTO para obtener una categoría por ID
 */
export interface GetCategoryByIdInput {
  /**
   * ID de la categoría
   * Debe ser un UUID válido
   */
  id: string;
}




