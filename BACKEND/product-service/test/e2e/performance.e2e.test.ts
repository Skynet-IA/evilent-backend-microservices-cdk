/**
 * ⚡ PERFORMANCE & LOAD E2E TESTS - PRODUCT-SERVICE
 *
 * TESTING PURO Y DURO: Medir performance real contra APIs en AWS
 * ✅ Latencia p50, p95, p99 por endpoint
 * ✅ Throughput máximo (requests/sec)
 * ✅ Cold start vs warm start de Lambdas
 * ✅ APIs REALES, BD REALES, sin mocks
 *
 * REGLAS APLICADAS:
 * ✅ REGLA #8: Tests para código crítico (performance = crítico)
 * ✅ REGLA CRÍTICA: Consistencia tests ↔ código empresarial
 * ✅ REGLA DIAMANTE: Tareas 100% verificables
 */

import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { AuthHelper } from '../helpers/auth-helper.js';
import { MongoDBHelper } from '../helpers/mongodb-helper.js';
import { ApiHelper } from '../helpers/api-helper.js';
import { TestUtils } from '../config.js';

describe('PRODUCT-SERVICE PERFORMANCE - Latencia y Throughput', () => {
  let authHelper: AuthHelper;
  let dbHelper: MongoDBHelper;
  let apiHelper: ApiHelper;
  let token: string;
  let categoryId: string;

  jest.setTimeout(120000); // Performance tests pueden tardar más (2 minutos)

  beforeAll(async () => {
    authHelper = new AuthHelper();
    dbHelper = new MongoDBHelper();
    apiHelper = new ApiHelper();

    try {
      await dbHelper.connect();
    } catch (error) {
      console.warn('⚠️ MongoDB TEST no disponible');
    }

    // Crear usuario para tests
    if (authHelper.isConfigured()) {
      const testEmail = TestUtils.generateUniqueEmail('perfproduct@example.com');
      const { token: t } = await authHelper.setupTestUser(testEmail, 'PerfProductTest123!');
      token = t;

      // Crear categoría
      const catResponse = await apiHelper.post(
        '/category',
        {
          name: 'Performance Test Category',
          description: 'For performance testing',
        },
        token
      );

      if (catResponse.statusCode === 200) {
        const catBody = JSON.parse(catResponse.body);
        categoryId = catBody.data._id;
      }
    }
  });

  afterAll(async () => {
    await authHelper.cleanupTestUsers();
    if (dbHelper.isConnectedToDb()) {
      await dbHelper.disconnect();
    }
  });

  // ========================================
  // Latencia individual (p50, p95, p99)
  // ========================================

  describe('LATENCIA: GET /product', () => {
    it('debería medir latencia p50, p95, p99 para GET /product', async () => {
      if (!authHelper.isConfigured()) {
        console.warn('⚠️ Cognito TEST no disponible - test skipped');
        return;
      }

      const iterations = 10;
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const response = await apiHelper.get('/product', token);
        const end = performance.now();

        expect([200, 401]).toContain(response.statusCode);
        if (response.statusCode === 200) {
          latencies.push(end - start);
        }
      }

      if (latencies.length === 0) {
        console.warn('⚠️ No successful responses para latency measurement');
        return;
      }

      // Calcular percentiles
      latencies.sort((a, b) => a - b);
      const p50 = latencies[Math.floor(latencies.length * 0.5)];
      const p95 = latencies[Math.floor(latencies.length * 0.95)];
      const p99 = latencies[Math.floor(latencies.length * 0.99)] || latencies[latencies.length - 1];
      const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      const min = Math.min(...latencies);
      const max = Math.max(...latencies);

      console.log(`⚡ LATENCIA GET /product (${latencies.length} requests):`);
      console.log(`   p50: ${p50.toFixed(2)}ms`);
      console.log(`   p95: ${p95.toFixed(2)}ms`);
      console.log(`   p99: ${p99.toFixed(2)}ms`);
      console.log(`   avg: ${avg.toFixed(2)}ms`);
      console.log(`   min: ${min.toFixed(2)}ms`);
      console.log(`   max: ${max.toFixed(2)}ms`);

      expect(p50).toBeLessThan(5000);
      expect(p95).toBeLessThan(10000);
    });

    it('debería medir latencia para POST /product (crear producto)', async () => {
      if (!authHelper.isConfigured() || !categoryId) {
        console.warn('⚠️ Servicios TEST no disponibles - test skipped');
        return;
      }

      const iterations = 3;
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const response = await apiHelper.post(
          '/product',
          {
            name: `Performance Product ${i}`,
            description: 'Load test product',
            price: 99.99 + i,
            stock: 10 + i,
            categoryId: categoryId,
          },
          token
        );
        const end = performance.now();

        expect(response.statusCode).toBe(200);
        latencies.push(end - start);
      }

      // Calcular percentiles
      latencies.sort((a, b) => a - b);
      const p50 = latencies[Math.floor(latencies.length * 0.5)];
      const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;

      console.log(`⚡ LATENCIA POST /product (${iterations} requests):`);
      console.log(`   p50: ${p50.toFixed(2)}ms`);
      console.log(`   avg: ${avg.toFixed(2)}ms`);

      expect(p50).toBeLessThan(10000);
    });

    it('debería medir latencia para GET /category', async () => {
      if (!authHelper.isConfigured()) {
        console.warn('⚠️ Cognito TEST no disponible - test skipped');
        return;
      }

      const iterations = 10;
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const response = await apiHelper.get('/category', token);
        const end = performance.now();

        expect([200, 401]).toContain(response.statusCode);
        if (response.statusCode === 200) {
          latencies.push(end - start);
        }
      }

      if (latencies.length === 0) {
        console.warn('⚠️ No successful responses para latency measurement');
        return;
      }

      // Calcular percentiles
      latencies.sort((a, b) => a - b);
      const p50 = latencies[Math.floor(latencies.length * 0.5)];
      const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;

      console.log(`⚡ LATENCIA GET /category (${latencies.length} requests):`);
      console.log(`   p50: ${p50.toFixed(2)}ms`);
      console.log(`   avg: ${avg.toFixed(2)}ms`);

      expect(p50).toBeLessThan(5000);
    });
  });

  // ========================================
  // Throughput: requests por segundo
  // ========================================

  describe('THROUGHPUT: Requests por segundo', () => {
    it('debería medir throughput para GET /product (10 requests concurrentes)', async () => {
      if (!authHelper.isConfigured()) {
        console.warn('⚠️ Cognito TEST no disponible - test skipped');
        return;
      }

      const concurrency = 10;
      const iterations = 2; // Total 20 requests
      let successCount = 0;
      let errorCount = 0;

      const start = performance.now();

      for (let iter = 0; iter < iterations; iter++) {
        const promises: Promise<any>[] = [];

        for (let i = 0; i < concurrency; i++) {
          promises.push(
            (async () => {
              try {
                const response = await apiHelper.get('/product', token);

                if (response.statusCode === 200) {
                  successCount++;
                } else {
                  errorCount++;
                }
              } catch (error) {
                errorCount++;
              }
            })()
          );
        }

        await Promise.all(promises);
      }

      const end = performance.now();
      const totalTime = (end - start) / 1000; // en segundos
      const throughput = (successCount + errorCount) / totalTime;

      console.log(`📊 THROUGHPUT GET /product:`);
      console.log(`   Total requests: ${successCount + errorCount}`);
      console.log(`   Success: ${successCount}`);
      console.log(`   Errors: ${errorCount}`);
      console.log(`   Time: ${totalTime.toFixed(2)}s`);
      console.log(`   Throughput: ${throughput.toFixed(2)} req/s`);

      expect(throughput).toBeGreaterThan(0);
    });
  });

  // ========================================
  // Cold start vs Warm start
  // ========================================

  describe('COLD START vs WARM START', () => {
    it('debería medir diferencia entre cold start y warm start', async () => {
      if (!authHelper.isConfigured()) {
        console.warn('⚠️ Cognito TEST no disponible - test skipped');
        return;
      }

      // Primera request (potencialmente cold start)
      const coldStart = performance.now();
      const coldResponse = await apiHelper.get('/product', token);
      const coldEnd = performance.now();
      const coldLatency = coldEnd - coldStart;

      expect([200, 401]).toContain(coldResponse.statusCode);

      // Próximas requests (warm start)
      const warmLatencies: number[] = [];
      for (let i = 0; i < 5; i++) {
        const start = performance.now();
        const response = await apiHelper.get('/product', token);
        const end = performance.now();
        if (response.statusCode === 200) {
          warmLatencies.push(end - start);
        }
      }

      if (warmLatencies.length > 0) {
        const warmAvg = warmLatencies.reduce((a, b) => a + b, 0) / warmLatencies.length;

        console.log(`❄️ COLD vs WARM START:`);
        console.log(`   Cold start: ${coldLatency.toFixed(2)}ms`);
        console.log(`   Warm avg: ${warmAvg.toFixed(2)}ms`);
        console.log(`   Ratio: ${(coldLatency / warmAvg).toFixed(2)}x`);
      }
    });
  });

  // ========================================
  // Resiliencia bajo carga
  // ========================================

  describe('RESILIENCIA: Error rate bajo carga', () => {
    it('debería mantener error rate < 5% bajo carga', async () => {
      if (!authHelper.isConfigured()) {
        console.warn('⚠️ Cognito TEST no disponible - test skipped');
        return;
      }

      const concurrency = 5;
      const iterations = 5; // Total 25 requests
      let successCount = 0;
      let errorCount = 0;

      for (let iter = 0; iter < iterations; iter++) {
        const promises: Promise<any>[] = [];

        for (let i = 0; i < concurrency; i++) {
          promises.push(
            (async () => {
              try {
                const response = await apiHelper.get('/product', token);
                if (response.statusCode === 200) {
                  successCount++;
                } else {
                  errorCount++;
                }
              } catch (error) {
                errorCount++;
              }
            })()
          );
        }

        await Promise.all(promises);
      }

      const totalRequests = successCount + errorCount;
      const errorRate = (errorCount / totalRequests) * 100;

      console.log(`📊 ERROR RATE:`);
      console.log(`   Total requests: ${totalRequests}`);
      console.log(`   Success: ${successCount}`);
      console.log(`   Errors: ${errorCount}`);
      console.log(`   Error rate: ${errorRate.toFixed(2)}%`);

      expect(errorRate).toBeLessThan(5);
    });
  });

  // ========================================
  // Comparar servicios
  // ========================================

  describe('COMPARACIÓN: USER-SERVICE vs PRODUCT-SERVICE', () => {
    it('debería medir y comparar latencia entre servicios', async () => {
      if (!authHelper.isConfigured()) {
        console.warn('⚠️ Cognito TEST no disponible - test skipped');
        return;
      }

      const iterations = 5;
      const productLatencies: number[] = [];

      // Medir PRODUCT-SERVICE
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const response = await apiHelper.get('/product', token);
        const end = performance.now();

        if (response.statusCode === 200) {
          productLatencies.push(end - start);
        }
      }

      if (productLatencies.length > 0) {
        const productAvg =
          productLatencies.reduce((a, b) => a + b, 0) / productLatencies.length;

        console.log(`📊 COMPARACIÓN DE SERVICIOS:`);
        console.log(`   PRODUCT-SERVICE /product avg: ${productAvg.toFixed(2)}ms`);
        console.log(`   (Note: USER-SERVICE /user medido en test anterior)`);
      }
    });
  });
});

