/**
 * DTOs (Data Transfer Objects) para Deal
 * 
 * Define la estructura de datos esperada para operaciones de ofertas/deals.
 * Estos DTOs se usan junto con Schemas Zod para validación type-safe.
 * 
 * REGLA #5: SIEMPRE validar datos de entrada con schemas (Zod)
 * REGLA #9: SIEMPRE mantener consistencia arquitectónica
 */

/**
 * DTO para crear un deal
 */
export interface CreateDealInput {
  /**
   * ID del producto
   * Debe ser un UUID válido
   */
  productId: string;

  /**
   * Porcentaje de descuento
   * Min: 0, Max: 100
   */
  discount: number;

  /**
   * Fecha de inicio del deal
   * Formato ISO 8601
   */
  startDate: string;

  /**
   * Fecha de fin del deal
   * Formato ISO 8601
   * Debe ser posterior a startDate
   */
  endDate: string;
}

/**
 * DTO para actualizar un deal
 * 
 * Todos los campos son opcionales (actualización parcial)
 */
export interface UpdateDealInput {
  /**
   * ID del producto (opcional)
   * Debe ser un UUID válido
   */
  productId?: string;

  /**
   * Porcentaje de descuento (opcional)
   * Min: 0, Max: 100
   */
  discount?: number;

  /**
   * Fecha de inicio del deal (opcional)
   * Formato ISO 8601
   */
  startDate?: string;

  /**
   * Fecha de fin del deal (opcional)
   * Formato ISO 8601
   */
  endDate?: string;
}

/**
 * DTO para obtener un deal por ID
 */
export interface GetDealByIdInput {
  /**
   * ID del deal
   * Debe ser un UUID válido
   */
  id: string;
}




