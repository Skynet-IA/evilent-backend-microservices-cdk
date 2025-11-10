/**
 * ⚡ PERFORMANCE & LOAD E2E TESTS - USER-SERVICE
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

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { AuthHelper } from '../helpers/auth-helper.js';
import { PostgreSQLHelper } from '../helpers/postgresql-helper.js';
import { ApiHelper } from '../helpers/api-helper.js';
import { TestUtils } from '../config.js';

describe('USER-SERVICE PERFORMANCE - Latencia y Throughput', () => {
  let authHelper: AuthHelper;
  let dbHelper: PostgreSQLHelper;
  let apiHelper: ApiHelper;
  let token: string;

  jest.setTimeout(120000); // Performance tests pueden tardar más (2 minutos)

  beforeAll(async () => {
    authHelper = new AuthHelper();
    dbHelper = new PostgreSQLHelper();
    apiHelper = new ApiHelper();

    try {
      await dbHelper.connect();
    } catch (error) {
      console.warn('⚠️ PostgreSQL TEST no disponible');
    }

    // Crear usuario para tests
    if (authHelper.isConfigured()) {
      const testEmail = TestUtils.generateUniqueEmail('perf@example.com');
      const { token: t } = await authHelper.setupTestUser(testEmail, 'PerfTest123!');
      token = t;

      // Crear perfil
      await apiHelper.post(
        '/user',
        {
          first_name: 'Performance',
          last_name: 'Test',
          email: testEmail,
          phone: '+1234567890',
        },
        token
      );
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

  describe('LATENCIA: GET /user/profile', () => {
    it('debería medir latencia p50, p95, p99 para GET /user/profile', async () => {
      if (!authHelper.isConfigured()) {
        console.warn('⚠️ Cognito TEST no disponible - test skipped');
        return;
      }

      const iterations = 10;
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const response = await apiHelper.get('/user/profile', token);
        const end = performance.now();

        expect(response.statusCode).toBe(200);
        latencies.push(end - start);
      }

      // Calcular percentiles
      latencies.sort((a, b) => a - b);
      const p50 = latencies[Math.floor(latencies.length * 0.5)];
      const p95 = latencies[Math.floor(latencies.length * 0.95)];
      const p99 = latencies[Math.floor(latencies.length * 0.99)] || latencies[latencies.length - 1];
      const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      const min = Math.min(...latencies);
      const max = Math.max(...latencies);

      console.log(`⚡ LATENCIA GET /user/profile (${iterations} requests):`);
      console.log(`   p50: ${p50.toFixed(2)}ms`);
      console.log(`   p95: ${p95.toFixed(2)}ms`);
      console.log(`   p99: ${p99.toFixed(2)}ms`);
      console.log(`   avg: ${avg.toFixed(2)}ms`);
      console.log(`   min: ${min.toFixed(2)}ms`);
      console.log(`   max: ${max.toFixed(2)}ms`);

      // Validaciones básicas
      expect(p50).toBeLessThan(5000); // p50 < 5s
      expect(p95).toBeLessThan(10000); // p95 < 10s
      expect(p99).toBeLessThan(15000); // p99 < 15s
    });

    it('debería medir latencia para POST /user (crear perfil)', async () => {
      if (!authHelper.isConfigured()) {
        console.warn('⚠️ Cognito TEST no disponible - test skipped');
        return;
      }

      const iterations = 5;
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const testEmail = TestUtils.generateUniqueEmail(`post-test-${i}@example.com`);
        const { token: t } = await authHelper.setupTestUser(testEmail, 'PostTest123!');

        const start = performance.now();
        const response = await apiHelper.post(
          '/user',
          {
            first_name: `Test${i}`,
            last_name: 'PostLatency',
            email: testEmail,
            phone: '+9999999999',
          },
          t
        );
        const end = performance.now();

        expect([200, 201]).toContain(response.statusCode);
        latencies.push(end - start);
      }

      // Calcular percentiles
      latencies.sort((a, b) => a - b);
      const p50 = latencies[Math.floor(latencies.length * 0.5)];
      const p95 = latencies[Math.floor(latencies.length * 0.95)];
      const p99 = latencies[Math.floor(latencies.length * 0.99)] || latencies[latencies.length - 1];
      const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;

      console.log(`⚡ LATENCIA POST /user (${iterations} requests):`);
      console.log(`   p50: ${p50.toFixed(2)}ms`);
      console.log(`   p95: ${p95.toFixed(2)}ms`);
      console.log(`   p99: ${p99.toFixed(2)}ms`);
      console.log(`   avg: ${avg.toFixed(2)}ms`);

      // Validaciones
      expect(p50).toBeLessThan(10000); // p50 < 10s (crear es más lento)
    });

    it('debería medir latencia para PUT /user/profile (actualizar)', async () => {
      if (!authHelper.isConfigured()) {
        console.warn('⚠️ Cognito TEST no disponible - test skipped');
        return;
      }

      const iterations = 5;
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const response = await apiHelper.put(
          '/user/profile',
          {
            first_name: `Updated${i}`,
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

      console.log(`⚡ LATENCIA PUT /user/profile (${iterations} requests):`);
      console.log(`   p50: ${p50.toFixed(2)}ms`);
      console.log(`   avg: ${avg.toFixed(2)}ms`);

      expect(p50).toBeLessThan(5000);
    });
  });

  // ========================================
  // Throughput: requests por segundo
  // ========================================

  describe('THROUGHPUT: Requests por segundo', () => {
    it('debería medir throughput para GET /user/profile (10 requests concurrentes)', async () => {
      if (!authHelper.isConfigured()) {
        console.warn('⚠️ Cognito TEST no disponible - test skipped');
        return;
      }

      const concurrency = 10;
      const iterations = 2; // Total 20 requests
      let successCount = 0;
      let errorCount = 0;
      const latencies: number[] = [];

      const start = performance.now();

      for (let iter = 0; iter < iterations; iter++) {
        const promises: Promise<any>[] = [];

        for (let i = 0; i < concurrency; i++) {
          promises.push(
            (async () => {
              try {
                const reqStart = performance.now();
                const response = await apiHelper.get('/user/profile', token);
                const reqEnd = performance.now();
                latencies.push(reqEnd - reqStart);

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

      console.log(`📊 THROUGHPUT GET /user/profile:`);
      console.log(`   Total requests: ${successCount + errorCount}`);
      console.log(`   Success: ${successCount}`);
      console.log(`   Errors: ${errorCount}`);
      console.log(`   Time: ${totalTime.toFixed(2)}s`);
      console.log(`   Throughput: ${throughput.toFixed(2)} req/s`);

      expect(successCount).toBeGreaterThan(errorCount * 10); // 90%+ success rate
      expect(throughput).toBeGreaterThan(0); // Al menos algo de throughput
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
      const coldResponse = await apiHelper.get('/user/profile', token);
      const coldEnd = performance.now();
      const coldLatency = coldEnd - coldStart;

      expect(coldResponse.statusCode).toBe(200);

      // Próximas requests (warm start)
      const warmLatencies: number[] = [];
      for (let i = 0; i < 5; i++) {
        const start = performance.now();
        const response = await apiHelper.get('/user/profile', token);
        const end = performance.now();
        expect(response.statusCode).toBe(200);
        warmLatencies.push(end - start);
      }

      const warmAvg =
        warmLatencies.reduce((a, b) => a + b, 0) / warmLatencies.length;

      console.log(`❄️ COLD vs WARM START:`);
      console.log(`   Cold start: ${coldLatency.toFixed(2)}ms`);
      console.log(`   Warm avg: ${warmAvg.toFixed(2)}ms`);
      console.log(`   Ratio: ${(coldLatency / warmAvg).toFixed(2)}x`);

      // Cold start típicamente es 2-3x más lento que warm start
      // En Lambda, puede ser más (con container startup)
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
                const response = await apiHelper.get('/user/profile', token);
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

      // Validación: menos del 5% de errores
      expect(errorRate).toBeLessThan(5);
    });
  });
});

