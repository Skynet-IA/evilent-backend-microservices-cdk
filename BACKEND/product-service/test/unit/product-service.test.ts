/**
 * 🧪 PRODUCT-SERVICE UNIT TESTS
 * 
 * REGLA CRÍTICA: Tests deben validar CONSISTENCIA con código real
 * ✅ Validado contra:
 *    - src/service/product-service.ts
 *    - src/dto/validation-schemas.ts
 *    - src/utility/response.ts
 *    - MongoDB estructura (con mocks)
 */

// Jest globals are available globally, no need to import
import { ProductService } from '../../src/service/product-service';
import { MockProductRepository, MockCategoryRepository, createTestProduct } from '../mocks/repository-mocks';
import { createMockPostEvent, createMockPathParamsEvent, parseResponseBody } from '../mocks/aws-mocks';
import { TEST_CONFIG, TestUtils } from '../config';

describe('ProductService', () => {
  let service: ProductService;
  let mockProductRepository: MockProductRepository;
  let mockCategoryRepository: MockCategoryRepository;

  beforeEach(() => {
    // Arrancar con repositorios limpios
    mockProductRepository = new MockProductRepository();
    mockCategoryRepository = new MockCategoryRepository();
    service = new ProductService(mockProductRepository as any, mockCategoryRepository as any);
  });

  afterEach(() => {
    // Limpiar después de cada test
    mockProductRepository.clear();
    mockCategoryRepository.clear();
  });

  // ========================================
  // ✅ TESTS: CreateProduct
  // ========================================

  describe('CreateProduct', () => {
    it('debe crear un producto válido con todos los campos', async () => {
      const categoryId = TestUtils.generateUUID();
      const event = createMockPostEvent({
        name: 'Laptop Dell XPS 15',
        description: 'Laptop de alta gama para profesionales',
        price: 1299.99,
        categoryId: categoryId
      });

      const result = await service.CreateProduct(event);

      expect(result.statusCode).toBe(201);
      const body = parseResponseBody(result);
      expect(body.success).toBe(true);
      expect(body.message).toContain('Producto creado');
      expect(body.data).toBeDefined();
      expect(body.data.name).toBe('Laptop Dell XPS 15');
      expect(body.data.price).toBe(1299.99);
    });

    it('debe crear un producto válido sin descripción', async () => {
      const categoryId = TestUtils.generateUUID();
      const event = createMockPostEvent({
        name: 'Mouse USB',
        price: 25.50,
        categoryId: categoryId
      });

      const result = await service.CreateProduct(event);

      expect(result.statusCode).toBe(201);
      const body = parseResponseBody(result);
      expect(body.data).toBeDefined();
      expect(body.data.name).toBe('Mouse USB');
    });

    it('debe rechazar si falta el nombre', async () => {
      const event = createMockPostEvent({
        price: 100,
        categoryId: TestUtils.generateUUID()
      });

      const result = await service.CreateProduct(event);

      expect(result.statusCode).toBe(400);
      const body = parseResponseBody(result);
      expect(body.success).toBe(false);
      expect(body.data.errors).toBeDefined();
      expect(body.data.errors.length).toBeGreaterThan(0);
      expect(body.data.errors[0]).toHaveProperty('field');
    });

    it('debe rechazar si falta el precio', async () => {
      const event = createMockPostEvent({
        name: 'Producto',
        categoryId: TestUtils.generateUUID()
      });

      const result = await service.CreateProduct(event);

      expect(result.statusCode).toBe(400);
      const body = parseResponseBody(result);
      expect(body.success).toBe(false);
      expect(body.data.errors).toBeDefined();
      expect(body.data.errors.length).toBeGreaterThan(0);
    });

    it('debe rechazar nombre menor a 3 caracteres', async () => {
      const event = createMockPostEvent({
        name: 'AB',
        price: 100,
        categoryId: TestUtils.generateUUID()
      });

      const result = await service.CreateProduct(event);

      expect(result.statusCode).toBe(400);
    });

    it('debe rechazar nombre mayor a 100 caracteres', async () => {
      const event = createMockPostEvent({
        name: 'a'.repeat(101),
        price: 100,
        categoryId: TestUtils.generateUUID()
      });

      const result = await service.CreateProduct(event);

      expect(result.statusCode).toBe(400);
    });

    it('debe rechazar precio menor a 0', async () => {
      const event = createMockPostEvent({
        name: 'Producto',
        price: -10,
        categoryId: TestUtils.generateUUID()
      });

      const result = await service.CreateProduct(event);

      expect(result.statusCode).toBe(400);
    });

    it('debe rechazar precio mayor a 999999', async () => {
      const event = createMockPostEvent({
        name: 'Producto',
        price: 1000000,
        categoryId: TestUtils.generateUUID()
      });

      const result = await service.CreateProduct(event);

      expect(result.statusCode).toBe(400);
    });

    it('debe rechazar JSON inválido', async () => {
      const event = createMockPostEvent({});
      event.body = '{invalid json}';

      const result = await service.CreateProduct(event);

      expect(result.statusCode).toBe(400);
    });

    it('debe rechazar body vacío', async () => {
      const event = createMockPostEvent({});
      event.body = '';

      const result = await service.CreateProduct(event);

      expect(result.statusCode).toBe(400);
    });
  });

  // ========================================
  // ✅ TESTS: GetProducts
  // ========================================

  describe('GetProducts', () => {
    beforeEach(async () => {
      // Crear algunos productos de prueba
      await mockProductRepository.CreateProduct(createTestProduct());
      await mockProductRepository.CreateProduct(createTestProduct());
      await mockProductRepository.CreateProduct(createTestProduct());
    });

    it('debe obtener todos los productos', async () => {
      const event = createMockPathParamsEvent({});

      const result = await service.GetProducts(event);

      expect(result.statusCode).toBe(200);
      const body = parseResponseBody(result);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBe(3);
    });

    it('debe retornar array vacío si no hay productos', async () => {
      mockProductRepository.clear();
      const event = createMockPathParamsEvent({});

      const result = await service.GetProducts(event);

      expect(result.statusCode).toBe(200);
      const body = parseResponseBody(result);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBe(0);
    });
  });

  // ========================================
  // ✅ TESTS: GetProduct
  // ========================================

  describe('GetProduct', () => {
    let productId: string;

    beforeEach(async () => {
      const product = await mockProductRepository.CreateProduct(createTestProduct());
      productId = product._id;
    });

    it('debe obtener un producto existente por ID', async () => {
      const event = createMockPathParamsEvent({ id: productId });

      const result = await service.GetProduct(event);

      expect(result.statusCode).toBe(200);
      const body = parseResponseBody(result);
      expect(body.success).toBe(true);
      expect(body.data._id).toBe(productId);
    });

    it('debe retornar 404 si el producto no existe', async () => {
      const fakeId = TestUtils.generateUUID();
      const event = createMockPathParamsEvent({ id: fakeId });

      const result = await service.GetProduct(event);

      expect(result.statusCode).toBe(404);
      const body = parseResponseBody(result);
      expect(body.message).toContain('no encontrado');
    });

    it('debe rechazar si falta el ID', async () => {
      const event = createMockPathParamsEvent({});

      const result = await service.GetProduct(event);

      expect(result.statusCode).toBe(400);
    });
  });

  // ========================================
  // ✅ TESTS: UpdateProduct
  // ========================================

  describe('UpdateProduct', () => {
    let productId: string;

    beforeEach(async () => {
      const product = await mockProductRepository.CreateProduct(
        createTestProduct({ name: 'Producto Original', price: 100 })
      );
      productId = product._id;
    });

    it('debe actualizar el nombre del producto', async () => {
      const event = createMockPathParamsEvent({ id: productId });
      event.body = JSON.stringify({ name: 'Producto Actualizado' });

      const result = await service.UpdateProduct(event);

      expect(result.statusCode).toBe(200);
      const body = parseResponseBody(result);
      expect(body.data.name).toBe('Producto Actualizado');
    });

    it('debe actualizar el precio del producto', async () => {
      const event = createMockPathParamsEvent({ id: productId });
      event.body = JSON.stringify({ price: 250 });

      const result = await service.UpdateProduct(event);

      expect(result.statusCode).toBe(200);
      const body = parseResponseBody(result);
      expect(body.data.price).toBe(250);
    });

    it('debe actualizar múltiples campos', async () => {
      const event = createMockPathParamsEvent({ id: productId });
      event.body = JSON.stringify({
        name: 'Nuevo Nombre',
        price: 300,
        description: 'Nueva descripción'
      });

      const result = await service.UpdateProduct(event);

      expect(result.statusCode).toBe(200);
      const body = parseResponseBody(result);
      expect(body.data.name).toBe('Nuevo Nombre');
      expect(body.data.price).toBe(300);
    });

    it('debe rechazar si falta el ID', async () => {
      const event = createMockPathParamsEvent({});
      event.body = JSON.stringify({ name: 'Actualizado' });

      const result = await service.UpdateProduct(event);

      expect(result.statusCode).toBe(400);
    });

    it('debe rechazar validación de nombre en update', async () => {
      const event = createMockPathParamsEvent({ id: productId });
      event.body = JSON.stringify({ name: 'AB' });  // Demasiado corto

      const result = await service.UpdateProduct(event);

      expect(result.statusCode).toBe(400);
    });
  });

  // ========================================
  // ✅ TESTS: DeletProduct
  // ========================================

  describe('DeletProduct', () => {
    let productId: string;

    beforeEach(async () => {
      const product = await mockProductRepository.CreateProduct(createTestProduct());
      productId = product._id;
    });

    it('debe eliminar un producto existente', async () => {
      const event = createMockPathParamsEvent({ id: productId });

      const result = await service.DeletProduct(event);

      expect(result.statusCode).toBe(200);
      const body = parseResponseBody(result);
      expect(body.success).toBe(true);
      expect(body.data.deleted).toBe(true);
    });

    it('debe retornar 404 al intentar eliminar producto no existente', async () => {
      const fakeId = TestUtils.generateUUID();
      const event = createMockPathParamsEvent({ id: fakeId });

      const result = await service.DeletProduct(event);

      expect(result.statusCode).toBe(404);
    });

    it('debe rechazar si falta el ID', async () => {
      const event = createMockPathParamsEvent({});

      const result = await service.DeletProduct(event);

      expect(result.statusCode).toBe(400);
    });
  });
});

