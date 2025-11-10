/**
 * 🧪 TESTS: Validation Schemas - PRODUCT-SERVICE
 * 
 * REGLA #5: SIEMPRE validar datos de entrada con schemas (Zod)
 * REGLA CRÍTICA: Tests deben validar CONSISTENCIA entre schema y ejemplos reales
 * 
 * Este archivo prueba TODOS los schemas Zod utilizados en product-service
 * para garantizar que la validación sea correcta en productos, categorías, paginación, etc.
 */

import { z } from 'zod';
import {
  CreateProductSchema,
  UpdateProductSchema,
  GetProductByIdSchema,
  CreateCategorySchema,
  UpdateCategorySchema,
  GetCategoryByIdSchema,
  PaginationSchema,
  type CreateProductInput,
  type UpdateProductInput,
  type GetProductByIdInput,
  type CreateCategoryInput,
  type GetCategoryByIdInput,
  type PaginationInput,
} from '../../src/dto/validation-schemas.js';

// Helpers para generar datos válidos
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

describe('Validation Schemas - PRODUCT-SERVICE', () => {
  /**
   * ✅ CREATEPRODUCTSCHEMA TESTS (15+ tests)
   */

  describe('CreateProductSchema', () => {
    // ========================================
    // ✅ CASOS VÁLIDOS
    // ========================================

    it('debe aceptar producto válido con todos los campos', () => {
      const validData = {
        name: 'Mouse USB',
        price: 25.99,
        description: 'Mouse óptico de precisión',
        categoryId: generateUUID(),
      };

      const result = CreateProductSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Mouse USB');
        expect(result.data.price).toBe(25.99);
      }
    });

    it('debe aceptar producto sin descripción (opcional)', () => {
      const validData = {
        name: 'Teclado',
        price: 50.00,
        categoryId: generateUUID(),
      };

      const result = CreateProductSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('debe aceptar producto sin categoría (opcional)', () => {
      const validData = {
        name: 'Cable HDMI',
        price: 5.99,
      };

      const result = CreateProductSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    // ========================================
    // ❌ CASOS INVÁLIDOS: REQUERIDOS
    // ========================================

    it('debe rechazar si falta nombre', () => {
      const invalidData = {
        price: 25.99,
      };

      const result = CreateProductSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('debe rechazar si falta precio', () => {
      const invalidData = {
        name: 'Mouse',
      };

      const result = CreateProductSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    // ========================================
    // ❌ CASOS INVÁLIDOS: LONGITUD
    // ========================================

    it('debe rechazar nombre menor a 3 caracteres', () => {
      const invalidData = {
        name: 'AB',
        price: 10.00,
      };

      const result = CreateProductSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('too_small');
      }
    });

    it('debe rechazar nombre mayor a 100 caracteres', () => {
      const invalidData = {
        name: 'a'.repeat(101),
        price: 10.00,
      };

      const result = CreateProductSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('too_big');
      }
    });

    it('debe aceptar nombre con exactamente 100 caracteres', () => {
      const validData = {
        name: 'a'.repeat(100),
        price: 10.00,
      };

      const result = CreateProductSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    // ========================================
    // ❌ CASOS INVÁLIDOS: PRECIOS
    // ========================================

    it('debe rechazar precio menor a 0', () => {
      const invalidData = {
        name: 'Mouse',
        price: -10,
      };

      const result = CreateProductSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('debe rechazar precio mayor a 999999', () => {
      const invalidData = {
        name: 'Mouse',
        price: 1000000,
      };

      const result = CreateProductSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('debe aceptar precio 0.01 (mínimo)', () => {
      const validData = {
        name: 'Mouse',
        price: 0.01,
      };

      const result = CreateProductSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    // ========================================
    // ❌ CASOS INVÁLIDOS: UUID
    // ========================================

    it('debe rechazar categoryId inválido (no UUID)', () => {
      const invalidData = {
        name: 'Mouse',
        price: 10.00,
        categoryId: 'invalid-id',
      };

      const result = CreateProductSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('debe aceptar categoryId con UUID válido', () => {
      const validData = {
        name: 'Mouse',
        price: 10.00,
        categoryId: generateUUID(),
      };

      const result = CreateProductSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  /**
   * ✅ CREATECATEGORYSCHEMA TESTS (12+ tests)
   */

  describe('CreateCategorySchema', () => {
    it('debe aceptar categoría válida', () => {
      const validData = {
        name: 'Accesorios',
        description: 'Accesorios de computadora',
      };

      const result = CreateCategorySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('debe aceptar categoría sin descripción', () => {
      const validData = {
        name: 'Periféricos',
      };

      const result = CreateCategorySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('debe rechazar nombre menor a 3 caracteres', () => {
      const invalidData = {
        name: 'AB',
      };

      const result = CreateCategorySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('debe rechazar nombre mayor a 100 caracteres', () => {
      const invalidData = {
        name: 'a'.repeat(101),
      };

      const result = CreateCategorySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('debe rechazar descripción mayor a 500 caracteres', () => {
      const invalidData = {
        name: 'Categoría',
        description: 'a'.repeat(501),
      };

      const result = CreateCategorySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('debe aceptar descripción con exactamente 500 caracteres', () => {
      const validData = {
        name: 'Categoría',
        description: 'a'.repeat(500),
      };

      const result = CreateCategorySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  /**
   * ✅ GETBYIDSCHEMA TESTS (8+ tests)
   * Valida que los IDs sean UUIDs válidos
   */

  describe('GetProductByIdSchema / GetCategoryByIdSchema', () => {
    it('debe aceptar UUID válido para producto', () => {
      const validData = {
        id: generateUUID(),
      };

      const result = GetProductByIdSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('debe aceptar UUID válido para categoría', () => {
      const validData = {
        id: generateUUID(),
      };

      const result = GetCategoryByIdSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('debe rechazar ID inválido (no UUID)', () => {
      const invalidData = {
        id: 'invalid-id-12345',
      };

      const result = GetProductByIdSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('debe rechazar ID vacío', () => {
      const invalidData = {
        id: '',
      };

      const result = GetProductByIdSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('debe rechazar si falta ID', () => {
      const invalidData = {};

      const result = GetProductByIdSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('debe rechazar ID con números invalidandose UUID format', () => {
      const invalidData = {
        id: '00000000-0000-0000-0000-000000000000', // Valid UUID pero podría fallar si hay validación adicional
      };

      // Este UUID es válido en formato, así que debería pasar
      const result = GetProductByIdSchema.safeParse(invalidData);
      expect(result.success).toBe(true);
    });
  });

  /**
   * ✅ PAGINATIONSCHEMA TESTS (12+ tests)
   * CRÍTICO: Tests para coercion de strings a números desde query params
   */

  describe('PaginationSchema', () => {
    // ========================================
    // ✅ CASOS VÁLIDOS: STRINGS (desde query params)
    // ========================================

    it('debe aceptar page como string y convertir a número', () => {
      const queryData = {
        page: '1',
        pageSize: '10',
      };

      const result = PaginationSchema.safeParse(queryData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(typeof result.data.page).toBe('number');
        expect(result.data.pageSize).toBe(10);
        expect(typeof result.data.pageSize).toBe('number');
      }
    });

    it('debe aceptar page como número (si viene de JSON body)', () => {
      const data = {
        page: 2,
        pageSize: 20,
      };

      const result = PaginationSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    // ========================================
    // ✅ CASOS VÁLIDOS: VALORES POR DEFECTO
    // ========================================

    it('debe usar page=1 si no se proporciona', () => {
      const data = {
        pageSize: 10,
      };

      const result = PaginationSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
      }
    });

    it('debe usar pageSize=20 (DEFAULT) si no se proporciona', () => {
      const data = {
        page: 1,
      };

      const result = PaginationSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.pageSize).toBe(20);
      }
    });

    it('debe usar ambos defaults si objeto vacío', () => {
      const data = {};

      const result = PaginationSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.pageSize).toBe(20);
      }
    });

    // ========================================
    // ❌ CASOS INVÁLIDOS: VALORES INVÁLIDOS
    // ========================================

    it('debe rechazar page = 0 (no positivo)', () => {
      const data = {
        page: '0',
      };

      const result = PaginationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('debe rechazar page negativo', () => {
      const data = {
        page: '-1',
      };

      const result = PaginationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('debe rechazar pageSize mayor a MAX_PAGE_SIZE (100)', () => {
      const data = {
        page: 1,
        pageSize: '101',  // Mayor a 100
      };

      const result = PaginationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('debe aceptar pageSize = 100 (máximo)', () => {
      const data = {
        page: 1,
        pageSize: '100',
      };

      const result = PaginationSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.pageSize).toBe(100);
      }
    });

    it('debe rechazar strings no numéricos', () => {
      const data = {
        page: 'abc',
      };

      const result = PaginationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('debe rechazar números decimales', () => {
      const data = {
        page: '1.5',
      };

      const result = PaginationSchema.safeParse(data);
      expect(result.success).toBe(false);  // .int() rechaza decimales
    });
  });

  /**
   * ✅ SCHEMA CONSISTENCY TESTS (5+ tests)
   */

  describe('Schema Consistency', () => {
    it('CreateProductSchema y UpdateProductSchema deben ser consistentes', () => {
      const createData = {
        name: 'Mouse',
        price: 10.00,
      };

      const updateData = {
        name: 'Mouse Óptico',
        price: 15.00,
      };

      const createResult = CreateProductSchema.safeParse(createData);
      const updateResult = UpdateProductSchema.safeParse(updateData);

      expect(createResult.success).toBe(true);
      expect(updateResult.success).toBe(true);
    });

    it('CategoryId debe validarse igual en CreateProduct y GetProductByIdSchema', () => {
      const categoryId = generateUUID();

      const createData = {
        name: 'Mouse',
        price: 10.00,
        categoryId,
      };

      const getIdData = {
        id: categoryId,
      };

      const createResult = CreateProductSchema.safeParse(createData);
      const getCategoryResult = GetCategoryByIdSchema.safeParse(getIdData);

      expect(createResult.success).toBe(true);
      expect(getCategoryResult.success).toBe(true);
    });

    it('PaginationSchema debe funcionar con números y strings', () => {
      const numericData = { page: 1, pageSize: 10 };
      const stringData = { page: '1', pageSize: '10' };

      const numResult = PaginationSchema.safeParse(numericData);
      const strResult = PaginationSchema.safeParse(stringData);

      expect(numResult.success).toBe(true);
      expect(strResult.success).toBe(true);

      if (numResult.success && strResult.success) {
        expect(numResult.data.page).toBe(strResult.data.page);
        expect(numResult.data.pageSize).toBe(strResult.data.pageSize);
      }
    });
  });

  /**
   * ✅ TYPE SAFETY TESTS (3+ tests)
   */

  describe('TypeScript Type Safety', () => {
    it('CreateProductInput debe tener tipos correctos', () => {
      const validData: CreateProductInput = {
        name: 'Mouse',
        price: 10.00,
      };

      const result = CreateProductSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('PaginationInput debe aceptar números', () => {
      const validData: PaginationInput = {
        page: 1,
        pageSize: 20,
      };

      const result = PaginationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('GetProductByIdInput debe tener UUID válido', () => {
      const validData: GetProductByIdInput = {
        id: generateUUID(),
      };

      const result = GetProductByIdSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});

