/**
 * 🗄️ REPOSITORY MOCKS - Mocks para Repositorios de Base de Datos
 * 
 * REGLA CRÍTICA: Los mocks DEBEN reflejar la estructura EXACTA de los métodos reales
 * - Métodos deben ser async (como en código real)
 * - Retornos deben coincidir exactamente con MongoDB behavior
 * - Usar _id en lugar de id (como MongoDB)
 * 
 * ✅ Validado contra: src/repository/product-repository.ts, etc.
 */

// ========================================
// MOCK PRODUCT REPOSITORY
// ========================================

/**
 * Mock de ProductRepository para MongoDB
 * REGLA CRÍTICA: Simular comportamiento real de MongoDB
 */
export class MockProductRepository {
  private products: Map<string, any> = new Map();

  /**
   * Crear nuevo producto
   * REGLA CRÍTICA: MongoDB genera _id automáticamente
   */
  async CreateProduct(input: {
    name: string;
    price: number;
    categoryId?: string;
    stock?: number;
    isActive?: boolean;
    imageUrl?: string;
  }): Promise<any> {
    // ✅ REGLA CRÍTICA: Generar UUIDs válidos (Zod.uuid() compatible)
    // Las IDs DEBEN ser UUIDs válidos porque el schema lo requiere
    const productId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    const product = {
      _id: productId,
      name: input.name,
      price: input.price,
      categoryId: input.categoryId || null,
      stock: input.stock ?? 0,
      isActive: input.isActive ?? true,
      imageUrl: input.imageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(productId, product);
    return product;
  }

  /**
   * Obtener todos los productos
   */
  async GetAllProducts(): Promise<any[]> {
    return Array.from(this.products.values());
  }

  /**
   * Obtener producto por ID
   */
  async GetProductById(productId: string): Promise<any | null> {
    return this.products.get(productId) || null;
  }

  /**
   * Actualizar producto
   * REGLA CRÍTICA: Retornar documento completo después de actualizar
   */
  async UpdateProduct(input: { _id: string; [key: string]: any }): Promise<any | null> {
    const existing = this.products.get(input._id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...input,
      updatedAt: new Date(),
    };
    this.products.set(input._id, updated);
    return updated;
  }

  /**
   * Eliminar producto
   * REGLA CRÍTICA: Retornar objeto con resultado de eliminación
   */
  async DeletProduct(productId: string): Promise<any | null> {
    const product = this.products.get(productId);
    if (!product) return null;

    this.products.delete(productId);
    return {
      category_id: product.categoryId,
      resultDelet: true,
    };
  }

  /**
   * Obtener productos por categoría
   */
  async GetProductsByCategory(categoryId: string): Promise<any[]> {
    return Array.from(this.products.values()).filter(
      (p) => p.categoryId === categoryId
    );
  }

  /**
   * Obtener productos con cursor (paginación)
   * REGLA CRÍTICA: Simular paginación real
   */
  async GetProductsCursor(skip: number = 0, limit: number = 10): Promise<any[]> {
    return Array.from(this.products.values()).slice(skip, skip + limit);
  }

  /**
   * Helper: Limpiar datos de test
   */
  clear(): void {
    this.products.clear();
  }

  /**
   * Helper: Obtener cantidad de productos
   */
  count(): number {
    return this.products.size;
  }
}

// ========================================
// MOCK CATEGORY REPOSITORY
// ========================================

/**
 * Mock de CategoryRepository para MongoDB
 */
export class MockCategoryRepository {
  private categories: Map<string, any> = new Map();

  /**
   * Crear nueva categoría
   */
  async CreateCategory(input: {
    name: string;
    description?: string;
    parentCategoryId?: string;
  }): Promise<any> {
    // ✅ REGLA CRÍTICA: Generar UUIDs válidos (Zod.uuid() compatible)
    // Las IDs DEBEN ser UUIDs válidos porque el schema lo requiere
    const categoryId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    const category = {
      _id: categoryId,
      name: input.name,
      description: input.description || null,
      parentCategoryId: input.parentCategoryId || null,
      products: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.categories.set(categoryId, category);
    return category;
  }

  /**
   * Obtener todas las categorías
   */
  async GetAllCategories(): Promise<any[]> {
    return Array.from(this.categories.values());
  }

  /**
   * Obtener categorías top (más populares)
   * REGLA CRÍTICA: Simular categorías destacadas
   */
  async GetTopCategories(): Promise<any[]> {
    return Array.from(this.categories.values())
      .sort((a, b) => (b.products?.length || 0) - (a.products?.length || 0))
      .slice(0, 5);
  }

  /**
   * Obtener categoría por ID con paginación
   * GetCategoryById(categoryId, skip, limit) - Para obtener productos paginados
   */
  async GetCategoryById(categoryId: string, skip?: number, limit?: number): Promise<any | null> {
    return this.categories.get(categoryId) || null;
  }

  /**
   * Actualizar categoría
   */
  async UpdateCategory(input: { _id: string; [key: string]: any }): Promise<any | null> {
    const existing = this.categories.get(input._id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...input,
      updatedAt: new Date(),
    };
    this.categories.set(input._id, updated);
    return updated;
  }

  /**
   * Eliminar categoría
   * Nota: El método en CategoryRepository es "DeletCategory" (typo en el código real)
   */
  async DeletCategory(categoryId: string): Promise<boolean> {
    return this.categories.delete(categoryId);
  }

  /**
   * Alias para DeleteCategory (método estándar)
   */
  async DeleteCategory(categoryId: string): Promise<boolean> {
    return this.categories.delete(categoryId);
  }

  /**
   * Agregar producto a categoría
   */
  async addItem(categoryId: string, productId: string): Promise<void> {
    const category = this.categories.get(categoryId);
    if (category && !category.products.includes(productId)) {
      category.products.push(productId);
    }
  }

  /**
   * Remover producto de categoría
   */
  async removeItem(categoryId: string, productId: string): Promise<void> {
    const category = this.categories.get(categoryId);
    if (category) {
      category.products = category.products.filter(
        (id: string) => id !== productId
      );
    }
  }

  /**
   * Helper: Limpiar datos de test
   */
  clear(): void {
    this.categories.clear();
  }

  /**
   * Helper: Obtener cantidad de categorías
   */
  count(): number {
    return this.categories.size;
  }
}

// ========================================
// MOCK DEAL REPOSITORY
// ========================================

/**
 * Mock de DealRepository para MongoDB
 */
export class MockDealRepository {
  private deals: Map<string, any> = new Map();

  /**
   * Crear nuevo deal
   */
  async CreateDeal(input: {
    productId: string;
    discount: number;
    startDate: Date;
    endDate: Date;
    description?: string;
  }): Promise<any> {
    const dealId = `deal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const deal = {
      _id: dealId,
      productId: input.productId,
      discount: input.discount,
      startDate: input.startDate,
      endDate: input.endDate,
      description: input.description || null,
      isActive: new Date() < input.endDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.deals.set(dealId, deal);
    return deal;
  }

  /**
   * Obtener todos los deals
   */
  async GetAllDeals(): Promise<any[]> {
    return Array.from(this.deals.values());
  }

  /**
   * Obtener deal por ID
   */
  async GetDealById(dealId: string): Promise<any | null> {
    return this.deals.get(dealId) || null;
  }

  /**
   * Obtener deals activos
   */
  async GetActiveDeals(): Promise<any[]> {
    const now = new Date();
    return Array.from(this.deals.values()).filter(
      (d) => d.startDate < now && now < d.endDate
    );
  }

  /**
   * Obtener deals por producto
   */
  async GetDealsByProduct(productId: string): Promise<any[]> {
    return Array.from(this.deals.values()).filter(
      (d) => d.productId === productId
    );
  }

  /**
   * Eliminar deal
   */
  async DeletDeal(dealId: string): Promise<boolean> {
    return this.deals.delete(dealId);
  }

  /**
   * Helper: Limpiar datos de test
   */
  clear(): void {
    this.deals.clear();
  }

  /**
   * Helper: Obtener cantidad de deals
   */
  count(): number {
    return this.deals.size;
  }
}

// ========================================
// FACTORY FUNCTIONS
// ========================================

/**
 * Crear repositorios mock de forma consistente
 * REGLA CRÍTICA: Mantener mismo patrón en TODOS los tests
 */
export function createMockRepositories() {
  return {
    productRepository: new MockProductRepository(),
    categoryRepository: new MockCategoryRepository(),
    dealRepository: new MockDealRepository(),
  };
}

/**
 * Crear producto de test con datos válidos
 */
export function createTestProduct(overrides?: any) {
  return {
    name: 'Test Product',
    price: 99.99,
    stock: 10,
    isActive: true,
    ...overrides,
  };
}

/**
 * Crear categoría de test con datos válidos
 */
export function createTestCategory(overrides?: any) {
  return {
    name: 'Test Category',
    description: 'A test category',
    ...overrides,
  };
}

/**
 * Crear deal de test con datos válidos
 */
export function createTestDeal(productId: string, overrides?: any) {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return {
    productId,
    discount: 20,
    startDate: now,
    endDate: tomorrow,
    description: 'Test deal',
    ...overrides,
  };
}

