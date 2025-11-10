/**
 * 🧪 CATEGORY-SERVICE UNIT TESTS
 * 
 * REGLA CRÍTICA: Tests deben validar CONSISTENCIA con código real
 * ✅ Validado contra:
 *    - src/service/category-service.ts
 *    - src/dto/validation-schemas.ts
 *    - src/utility/response.ts
 */

// Jest globals are available globally, no need to import
import { CategoryService } from '../../src/service/category-service';
import { MockCategoryRepository, createTestCategory } from '../mocks/repository-mocks';
import { createMockPostEvent, createMockPathParamsEvent, parseResponseBody } from '../mocks/aws-mocks';
import { TEST_CONFIG, TestUtils } from '../config';

describe('CategoryService', () => {
  let service: CategoryService;
  let mockRepository: MockCategoryRepository;

  beforeEach(() => {
    mockRepository = new MockCategoryRepository();
    service = new CategoryService(mockRepository as any);
  });

  afterEach(() => {
    mockRepository.clear();
  });

  // ========================================
  // ✅ TESTS: CreateCategory
  // ========================================

  describe('CreateCategory', () => {
    it('debe crear una categoría válida con todos los campos', async () => {
      const event = createMockPostEvent({
        name: 'Electrónica',
        description: 'Productos electrónicos variados'
      });

      const result = await service.CreateCategory(event);

      expect(result.statusCode).toBe(201);
      const body = parseResponseBody(result);
      expect(body.success).toBe(true);
      expect(body.message).toContain('Categoría creada');
      expect(body.data).toBeDefined();
      expect(body.data.name).toBe('Electrónica');
    });

    it('debe crear una categoría válida sin descripción', async () => {
      const event = createMockPostEvent({
        name: 'Ropa'
      });

      const result = await service.CreateCategory(event);

      expect(result.statusCode).toBe(201);
      const body = parseResponseBody(result);
      expect(body.data.name).toBe('Ropa');
    });

    it('debe rechazar si falta el nombre', async () => {
      const event = createMockPostEvent({
        description: 'Descripción sin nombre'
      });

      const result = await service.CreateCategory(event);

      expect(result.statusCode).toBe(400);
      const body = parseResponseBody(result);
      expect(body.success).toBe(false);
      expect(body.data.errors).toBeDefined();
      expect(body.data.errors.length).toBeGreaterThan(0);
    });

    it('debe rechazar nombre menor a 3 caracteres', async () => {
      const event = createMockPostEvent({
        name: 'AB'
      });

      const result = await service.CreateCategory(event);

      expect(result.statusCode).toBe(400);
    });

    it('debe rechazar nombre mayor a 100 caracteres', async () => {
      const event = createMockPostEvent({
        name: 'a'.repeat(101)
      });

      const result = await service.CreateCategory(event);

      expect(result.statusCode).toBe(400);
    });

    it('debe rechazar descripción mayor a 500 caracteres', async () => {
      const event = createMockPostEvent({
        name: 'Válido',
        description: 'a'.repeat(501)
      });

      const result = await service.CreateCategory(event);

      expect(result.statusCode).toBe(400);
    });

    it('debe rechazar JSON inválido', async () => {
      const event = createMockPostEvent({});
      event.body = '{invalid json}';

      const result = await service.CreateCategory(event);

      expect(result.statusCode).toBe(400);
    });
  });

  // ========================================
  // ✅ TESTS: GetCategories
  // ========================================

  describe('GetCategories', () => {
    beforeEach(async () => {
      await mockRepository.CreateCategory(createTestCategory());
      await mockRepository.CreateCategory(createTestCategory());
    });

    it('debe obtener todas las categorías', async () => {
      const event = createMockPathParamsEvent({});

      const result = await service.GetCategories(event);

      expect(result.statusCode).toBe(200);
      const body = parseResponseBody(result);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBe(2);
    });

    it('debe retornar array vacío si no hay categorías', async () => {
      mockRepository.clear();
      const event = createMockPathParamsEvent({});

      const result = await service.GetCategories(event);

      expect(result.statusCode).toBe(200);
      const body = parseResponseBody(result);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBe(0);
    });

    it('debe obtener categorías top cuando type=top', async () => {
      const event = createMockPathParamsEvent({});
      event.queryStringParameters = { type: 'top' };

      const result = await service.GetCategories(event);

      expect(result.statusCode).toBe(200);
      const body = parseResponseBody(result);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  // ========================================
  // ✅ TESTS: GetCategory
  // ========================================

  describe('GetCategory', () => {
    let categoryId: string;

    beforeEach(async () => {
      const category = await mockRepository.CreateCategory(createTestCategory());
      categoryId = category._id;
    });

    it('debe obtener una categoría existente por ID', async () => {
      const event = createMockPathParamsEvent({ id: categoryId });

      const result = await service.GetCategory(event);

      expect(result.statusCode).toBe(200);
      const body = parseResponseBody(result);
      expect(body.success).toBe(true);
      expect(body.data._id).toBe(categoryId);
    });

    it('debe retornar 404 si la categoría no existe', async () => {
      const fakeId = TestUtils.generateUUID();
      const event = createMockPathParamsEvent({ id: fakeId });

      const result = await service.GetCategory(event);

      expect(result.statusCode).toBe(404);
      const body = parseResponseBody(result);
      expect(body.message).toContain('no encontrada');
    });

    it('debe rechazar si falta el ID', async () => {
      const event = createMockPathParamsEvent({});

      const result = await service.GetCategory(event);

      expect(result.statusCode).toBe(400);
    });

    it('debe obtener categoría con paginación válida', async () => {
      const event = createMockPathParamsEvent({ id: categoryId });
      event.queryStringParameters = { page: '1', pageSize: '10' };

      const result = await service.GetCategory(event);

      expect(result.statusCode).toBe(200);
    });
  });

  // ========================================
  // ✅ TESTS: UpdateCategory
  // ========================================

  describe('UpdateCategory', () => {
    let categoryId: string;

    beforeEach(async () => {
      const category = await mockRepository.CreateCategory(
        createTestCategory({ name: 'Original' })
      );
      categoryId = category._id;
    });

    it('debe actualizar el nombre de la categoría', async () => {
      const event = createMockPathParamsEvent({ id: categoryId });
      event.body = JSON.stringify({ name: 'Actualizado' });

      const result = await service.UpdateCategory(event);

      expect(result.statusCode).toBe(200);
      const body = parseResponseBody(result);
      expect(body.data.name).toBe('Actualizado');
    });

    it('debe actualizar la descripción de la categoría', async () => {
      const event = createMockPathParamsEvent({ id: categoryId });
      event.body = JSON.stringify({ description: 'Nueva descripción' });

      const result = await service.UpdateCategory(event);

      expect(result.statusCode).toBe(200);
      const body = parseResponseBody(result);
      expect(body.data.description).toBe('Nueva descripción');
    });

    it('debe actualizar múltiples campos', async () => {
      const event = createMockPathParamsEvent({ id: categoryId });
      event.body = JSON.stringify({
        name: 'Nuevo Nombre',
        description: 'Nueva descripción'
      });

      const result = await service.UpdateCategory(event);

      expect(result.statusCode).toBe(200);
      const body = parseResponseBody(result);
      expect(body.data.name).toBe('Nuevo Nombre');
      expect(body.data.description).toBe('Nueva descripción');
    });

    it('debe rechazar si falta el ID', async () => {
      const event = createMockPathParamsEvent({});
      event.body = JSON.stringify({ name: 'Actualizado' });

      const result = await service.UpdateCategory(event);

      expect(result.statusCode).toBe(400);
    });

    it('debe rechazar validación de nombre en update', async () => {
      const event = createMockPathParamsEvent({ id: categoryId });
      event.body = JSON.stringify({ name: 'AB' });

      const result = await service.UpdateCategory(event);

      expect(result.statusCode).toBe(400);
    });
  });

  // ========================================
  // ✅ TESTS: DeletCategory
  // ========================================

  describe('DeletCategory', () => {
    let categoryId: string;

    beforeEach(async () => {
      const category = await mockRepository.CreateCategory(createTestCategory());
      categoryId = category._id;
    });

    it('debe eliminar una categoría existente', async () => {
      const event = createMockPathParamsEvent({ id: categoryId });

      const result = await service.DeletCategory(event);

      expect(result.statusCode).toBe(200);
      const body = parseResponseBody(result);
      expect(body.success).toBe(true);
      expect(body.data.deleted).toBe(true);
    });

    it('debe retornar 404 al intentar eliminar categoría no existente', async () => {
      const fakeId = TestUtils.generateUUID();
      const event = createMockPathParamsEvent({ id: fakeId });

      const result = await service.DeletCategory(event);

      expect(result.statusCode).toBe(404);
    });

    it('debe rechazar si falta el ID', async () => {
      const event = createMockPathParamsEvent({});

      const result = await service.DeletCategory(event);

      expect(result.statusCode).toBe(400);
    });
  });
});

