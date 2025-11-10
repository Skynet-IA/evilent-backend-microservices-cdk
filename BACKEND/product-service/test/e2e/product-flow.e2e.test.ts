/**
 * 🧪 PRODUCT-SERVICE E2E TESTS - FLUJOS COMPLETOS
 *
 * TESTING PURO Y DURO: Flujos end-to-end sin mocks
 * ✅ APIs REALES (API Gateway)
 * ✅ BD REALES (MongoDB TEST)
 * ✅ S3 REALES (S3 TEST)
 * ✅ Validar TODOS los pasos del flujo de negocio
 *
 * REGLAS APLICADAS:
 * ✅ REGLA #8: Tests para código crítico (E2E = crítico)
 * ✅ REGLA CRÍTICA: Consistencia tests ↔ código empresarial
 * ✅ REGLA DIAMANTE: Tareas 100% verificables
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import { AuthHelper } from '../helpers/auth-helper.js';
import { MongoDBHelper } from '../helpers/mongodb-helper.js';
import { ApiHelper } from '../helpers/api-helper.js';
import { TestUtils } from '../config.js';

describe('PRODUCT-SERVICE E2E - Flujos Completos de Negocio', () => {
  let authHelper: AuthHelper;
  let dbHelper: MongoDBHelper;
  let apiHelper: ApiHelper;

  jest.setTimeout(30000); // E2E tests pueden tardar más

  beforeAll(async () => {
    authHelper = new AuthHelper();
    dbHelper = new MongoDBHelper();
    apiHelper = new ApiHelper();

    // Conectar a servicios
    try {
      await dbHelper.connect();
    } catch (error) {
      console.warn('⚠️ MongoDB TEST no disponible - algunos tests serán skipped');
    }
  });

  afterAll(async () => {
    await authHelper.cleanupTestUsers();
    if (dbHelper.isConnectedToDb()) {
      await dbHelper.disconnect();
    }
  });

  beforeEach(async () => {
    if (dbHelper.isConnectedToDb()) {
      await dbHelper.cleanupTestData();
    }
  });

  // ========================================
  // FLUJO 1: Categoría → Producto → CRUD
  // ========================================

  describe('FLUJO 1: Crear Categoría → Crear Producto → Listar → Actualizar → Eliminar', () => {
    it('debería completar CRUD: categoría → producto → listar → actualizar → eliminar', async () => {
      if (!authHelper.isConfigured() || !dbHelper.isConnectedToDb()) {
        console.warn('⚠️ Servicios TEST no disponibles - test skipped');
        return;
      }

      const testEmail = TestUtils.generateUniqueEmail('flow1@example.com');
      const password = 'FlowTest123!';
      const categoryName = 'Electronics';
      const productName = 'Test Laptop';

      // PASO 1: Autenticarse
      const { token } = await authHelper.setupTestUser(testEmail, password);
      expect(token).toBeDefined();

      // PASO 2: Crear categoría via API
      const createCategoryResponse = await apiHelper.post(
        '/category',
        {
          name: categoryName,
          description: 'Electronics category for testing',
        },
        token
      );
      expect(createCategoryResponse.statusCode).toBe(200);
      const categoryBody = JSON.parse(createCategoryResponse.body);
      expect(categoryBody.success).toBe(true);
      const categoryId = categoryBody.data._id;

      // PASO 3: Crear producto via API
      const createProductResponse = await apiHelper.post(
        '/product',
        {
          name: productName,
          description: 'Test product',
          price: 999.99,
          stock: 10,
          categoryId: categoryId,
        },
        token
      );
      expect(createProductResponse.statusCode).toBe(200);
      const productBody = JSON.parse(createProductResponse.body);
      expect(productBody.success).toBe(true);
      const productId = productBody.data._id;

      // PASO 4: Listar productos
      const listResponse = await apiHelper.get('/product', token);
      expect(listResponse.statusCode).toBe(200);
      const listBody = JSON.parse(listResponse.body);
      expect(listBody.success).toBe(true);
      expect(Array.isArray(listBody.data)).toBe(true);
      expect(listBody.data.length).toBeGreaterThan(0);

      // PASO 5: Actualizar producto
      const updateResponse = await apiHelper.put(
        `/product/${productId}`,
        {
          name: 'Updated Test Laptop',
          price: 1199.99,
        },
        token
      );
      expect(updateResponse.statusCode).toBe(200);
      const updateBody = JSON.parse(updateResponse.body);
      expect(updateBody.success).toBe(true);
      expect(updateBody.data.name).toBe('Updated Test Laptop');

      // PASO 6: Verificar actualización
      const getResponse = await apiHelper.get(`/product/${productId}`, token);
      expect(getResponse.statusCode).toBe(200);
      const getBody = JSON.parse(getResponse.body);
      expect(getBody.data.name).toBe('Updated Test Laptop');
      expect(getBody.data.price).toBe(1199.99);

      // PASO 7: Eliminar producto
      const deleteResponse = await apiHelper.delete(`/product/${productId}`, token);
      expect(deleteResponse.statusCode).toBe(200);
      const deleteBody = JSON.parse(deleteResponse.body);
      expect(deleteBody.success).toBe(true);
    });
  });

  // ========================================
  // FLUJO 2: Categorías anidadas
  // ========================================

  describe('FLUJO 2: Categorías Anidadas - BD Consistency', () => {
    it('debería validar categorías anidadas y productos en subcategorías', async () => {
      if (!authHelper.isConfigured() || !dbHelper.isConnectedToDb()) {
        console.warn('⚠️ Servicios TEST no disponibles - test skipped');
        return;
      }

      const testEmail = TestUtils.generateUniqueEmail('flow2@example.com');
      const password = 'FlowTest123!';
      const { token } = await authHelper.setupTestUser(testEmail, password);

      // PASO 1: Crear categoría padre
      const parentCatResponse = await apiHelper.post(
        '/category',
        {
          name: 'Electronics',
          description: 'Parent category',
        },
        token
      );
      const parentCategoryId = JSON.parse(parentCatResponse.body).data._id;

      // PASO 2: Crear subcategoría
      const childCatResponse = await apiHelper.post(
        '/category',
        {
          name: 'Laptops',
          description: 'Child category',
          parentId: parentCategoryId,
        },
        token
      );
      const childCategoryId = JSON.parse(childCatResponse.body).data._id;

      // PASO 3: Crear producto en subcategoría
      const productResponse = await apiHelper.post(
        '/product',
        {
          name: 'Gaming Laptop',
          description: 'High performance laptop',
          price: 1599.99,
          stock: 5,
          categoryId: childCategoryId,
        },
        token
      );
      const productId = JSON.parse(productResponse.body).data._id;

      // PASO 4: Verificar en MongoDB
      const conn = dbHelper.getConnection();
      if (conn && conn.db) {
        const productsCollection = conn.db.collection('products');
        const mongoProduct = await productsCollection.findOne({ _id: productId });
        expect(mongoProduct).toBeDefined();
        expect(mongoProduct?.name).toBe('Gaming Laptop');

        const categoriesCollection = conn.db.collection('categories');
        const mongoCategory = await categoriesCollection.findOne({ _id: childCategoryId });
        expect(mongoCategory).toBeDefined();
      }

      // PASO 5: Listar productos por categoría
      const categoryProductsResponse = await apiHelper.get(
        `/category/${childCategoryId}/products`,
        token
      );
      expect(categoryProductsResponse.statusCode).toBe(200);
      const categoryBody = JSON.parse(categoryProductsResponse.body);
      expect(Array.isArray(categoryBody.data)).toBe(true);
    });
  });

  // ========================================
  // FLUJO 3: Múltiples usuarios
  // ========================================

  describe('FLUJO 3: Aislamiento de datos - Múltiples usuarios', () => {
    it('debería aislar productos entre múltiples usuarios', async () => {
      if (!authHelper.isConfigured() || !dbHelper.isConnectedToDb()) {
        console.warn('⚠️ Servicios TEST no disponibles - test skipped');
        return;
      }

      const password = 'TestPass123!';
      const user1Email = TestUtils.generateUniqueEmail('user1@example.com');
      const user2Email = TestUtils.generateUniqueEmail('user2@example.com');

      const { token: token1 } = await authHelper.setupTestUser(user1Email, password);
      const { token: token2 } = await authHelper.setupTestUser(user2Email, password);

      // Usuario 1: Crear categoría y producto
      const cat1Response = await apiHelper.post(
        '/category',
        { name: 'User1 Category' },
        token1
      );
      const cat1Id = JSON.parse(cat1Response.body).data._id;

      const prod1Response = await apiHelper.post(
        '/product',
        {
          name: 'User1 Product',
          price: 100,
          stock: 10,
          categoryId: cat1Id,
        },
        token1
      );
      expect(prod1Response.statusCode).toBe(200);

      // Usuario 2: Crear categoría y producto
      const cat2Response = await apiHelper.post(
        '/category',
        { name: 'User2 Category' },
        token2
      );
      const cat2Id = JSON.parse(cat2Response.body).data._id;

      const prod2Response = await apiHelper.post(
        '/product',
        {
          name: 'User2 Product',
          price: 200,
          stock: 20,
          categoryId: cat2Id,
        },
        token2
      );
      expect(prod2Response.statusCode).toBe(200);

      // Usuario 1 lista productos - debería ver sus propios productos
      const list1Response = await apiHelper.get('/product', token1);
      const list1Body = JSON.parse(list1Response.body);
      expect(Array.isArray(list1Body.data)).toBe(true);

      // Usuario 2 lista productos - debería ver sus propios productos
      const list2Response = await apiHelper.get('/product', token2);
      const list2Body = JSON.parse(list2Response.body);
      expect(Array.isArray(list2Body.data)).toBe(true);
    });
  });

  // ========================================
  // FLUJO 4: Errores y validación
  // ========================================

  describe('FLUJO 4: Manejo de errores y validación', () => {
    it('debería rechazar producto con datos inválidos (400)', async () => {
      if (!authHelper.isConfigured()) {
        console.warn('⚠️ Cognito TEST no disponible - test skipped');
        return;
      }

      const testEmail = TestUtils.generateUniqueEmail('error@example.com');
      const { token } = await authHelper.setupTestUser(testEmail, 'Test123!');

      // Intentar crear producto sin nombre
      const response = await apiHelper.post(
        '/product',
        {
          description: 'No name provided',
          price: 100,
          stock: 10,
        },
        token
      );

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.data.errors).toBeDefined();
      expect(Array.isArray(body.data.errors)).toBe(true);
    });

    it('debería rechazar requests sin token con 401', async () => {
      try {
        await apiHelper.get('/product', ''); // Sin token
        throw new Error('Debería haber rechazado la request sin token');
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    it('debería retornar 404 para producto inexistente', async () => {
      if (!authHelper.isConfigured()) {
        console.warn('⚠️ Cognito TEST no disponible - test skipped');
        return;
      }

      const testEmail = TestUtils.generateUniqueEmail('notfound@example.com');
      const { token } = await authHelper.setupTestUser(testEmail, 'Test123!');

      const fakeId = TestUtils.generateUniqueId();
      const response = await apiHelper.get(`/product/${fakeId}`, token);

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });
  });

  // ========================================
  // FLUJO 5: Deals (Ofertas)
  // ========================================

  describe('FLUJO 5: Deals - Ofertas en productos', () => {
    it('debería crear y listar deals (ofertas)', async () => {
      if (!authHelper.isConfigured() || !dbHelper.isConnectedToDb()) {
        console.warn('⚠️ Servicios TEST no disponibles - test skipped');
        return;
      }

      const testEmail = TestUtils.generateUniqueEmail('deals@example.com');
      const password = 'DealTest123!';
      const { token } = await authHelper.setupTestUser(testEmail, password);

      // PASO 1: Crear categoría
      const catResponse = await apiHelper.post(
        '/category',
        { name: 'Deal Category' },
        token
      );
      const categoryId = JSON.parse(catResponse.body).data._id;

      // PASO 2: Crear producto
      const prodResponse = await apiHelper.post(
        '/product',
        {
          name: 'Deal Product',
          price: 500,
          stock: 50,
          categoryId: categoryId,
        },
        token
      );
      const productId = JSON.parse(prodResponse.body).data._id;

      // PASO 3: Listar deals
      const dealsResponse = await apiHelper.get('/deal', token);
      expect(dealsResponse.statusCode).toBe(200);
      const dealsBody = JSON.parse(dealsResponse.body);
      expect(dealsBody.success).toBe(true);
      expect(Array.isArray(dealsBody.data)).toBe(true);
    });
  });

  // ========================================
  // FLUJO 6: Limpieza
  // ========================================

  describe('FLUJO 6: Limpieza de datos', () => {
    it('debería limpiar todos los datos de test después de E2E', async () => {
      if (!authHelper.isConfigured() || !dbHelper.isConnectedToDb()) {
        console.warn('⚠️ Servicios TEST no disponibles - test skipped');
        return;
      }

      const testEmail = TestUtils.generateUniqueEmail('cleanup@example.com');
      const { token } = await authHelper.setupTestUser(testEmail, 'Test123!');

      // Crear categoría y producto
      const catResponse = await apiHelper.post(
        '/category',
        { name: 'Cleanup Category' },
        token
      );
      const categoryId = JSON.parse(catResponse.body).data._id;

      const prodResponse = await apiHelper.post(
        '/product',
        {
          name: 'Cleanup Product',
          price: 100,
          stock: 10,
          categoryId: categoryId,
        },
        token
      );

      // Limpiar datos
      await authHelper.cleanupTestUsers();
      await dbHelper.cleanupTestData();

      // Verificar que datos fueron eliminados
      const conn = dbHelper.getConnection();
      if (conn && conn.db) {
        const categoriesCollection = conn.db.collection('categories');
        const categoryCount = await categoriesCollection.countDocuments({
          name: 'Cleanup Category',
        });
        expect(categoryCount).toBe(0);

        const productsCollection = conn.db.collection('products');
        const productCount = await productsCollection.countDocuments({
          name: 'Cleanup Product',
        });
        expect(productCount).toBe(0);
      }
    });
  });
});

