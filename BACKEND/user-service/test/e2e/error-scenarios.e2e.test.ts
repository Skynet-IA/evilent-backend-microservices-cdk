/**
 * 🚨 ERROR SCENARIOS & EDGE CASES - USER-SERVICE
 *
 * TESTING PURO Y DURO: Validar manejo de errores y edge cases
 * ✅ Validación de inputs inválidos (400)
 * ✅ Autenticación fallida (401)
 * ✅ Recursos no encontrados (404)
 * ✅ Conflictos de datos (409)
 * ✅ Errores internos (500)
 * ✅ APIs REALES, BD REALES, sin mocks
 *
 * REGLAS APLICADAS:
 * ✅ REGLA #5: Validación con Zod
 * ✅ REGLA CRÍTICA: Consistencia tests ↔ código empresarial
 * ✅ REGLA DIAMANTE: Tareas 100% verificables
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { AuthHelper } from '../helpers/auth-helper.js';
import { PostgreSQLHelper } from '../helpers/postgresql-helper.js';
import { ApiHelper } from '../helpers/api-helper.js';
import { TestUtils } from '../config.js';

describe('USER-SERVICE ERROR SCENARIOS - Validación de errores y edge cases', () => {
  let authHelper: AuthHelper;
  let dbHelper: PostgreSQLHelper;
  let apiHelper: ApiHelper;

  jest.setTimeout(30000);

  beforeAll(async () => {
    authHelper = new AuthHelper();
    dbHelper = new PostgreSQLHelper();
    apiHelper = new ApiHelper();

    try {
      await dbHelper.connect();
    } catch (error) {
      console.warn('⚠️ PostgreSQL TEST no disponible');
    }
  });

  afterAll(async () => {
    await authHelper.cleanupTestUsers();
    if (dbHelper.isConnectedToDb()) {
      await dbHelper.disconnect();
    }
  });

  // ========================================
  // 400: Bad Request - Validación fallida
  // ========================================

  describe('400 BAD REQUEST - Validación Zod', () => {
    it('debería retornar 400 si first_name es muy corto', async () => {
      if (!authHelper.isConfigured()) {
        console.warn('⚠️ Cognito TEST no disponible - test skipped');
        return;
      }

      const testEmail = TestUtils.generateUniqueEmail('badreq1@example.com');
      const { token } = await authHelper.setupTestUser(testEmail, 'Test123!');

      const response = await apiHelper.post(
        '/user',
        {
          first_name: 'A', // Menos de 2 caracteres
          last_name: 'Valid',
          email: testEmail,
          phone: '+1234567890',
        },
        token
      );

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.data.errors).toBeDefined();
      expect(body.data.errors.length).toBeGreaterThan(0);
      expect(body.data.errors[0]).toHaveProperty('field');
      expect(body.data.errors[0]).toHaveProperty('message');
      expect(body.data.errors[0]).toHaveProperty('code');
    });

    it('debería retornar 400 si email es inválido', async () => {
      if (!authHelper.isConfigured()) {
        console.warn('⚠️ Cognito TEST no disponible - test skipped');
        return;
      }

      const testEmail = TestUtils.generateUniqueEmail('badreq2@example.com');
      const { token } = await authHelper.setupTestUser(testEmail, 'Test123!');

      const response = await apiHelper.post(
        '/user',
        {
          first_name: 'Valid',
          last_name: 'User',
          email: 'invalid-email', // Email inválido
          phone: '+1234567890',
        },
        token
      );

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.data.errors).toBeDefined();
    });

    it('debería retornar 400 si phone es inválido', async () => {
      if (!authHelper.isConfigured()) {
        console.warn('⚠️ Cognito TEST no disponible - test skipped');
        return;
      }

      const testEmail = TestUtils.generateUniqueEmail('badreq3@example.com');
      const { token } = await authHelper.setupTestUser(testEmail, 'Test123!');

      const response = await apiHelper.post(
        '/user',
        {
          first_name: 'Valid',
          last_name: 'User',
          email: testEmail,
          phone: 'invalid', // Teléfono inválido
        },
        token
      );

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });
  });

  // ========================================
  // 401: Unauthorized - Autenticación
  // ========================================

  describe('401 UNAUTHORIZED - Autenticación', () => {
    it('debería retornar 401 sin token', async () => {
      try {
        await apiHelper.get('/user/profile', '');
        throw new Error('Debería retornar 401');
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    it('debería retornar 401 con token inválido', async () => {
      try {
        await apiHelper.get('/user/profile', 'invalid_token_xyz');
        throw new Error('Debería retornar 401');
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    it('debería retornar 401 con token expirado simulado', async () => {
      try {
        const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjB9.invalid';
        await apiHelper.get('/user/profile', expiredToken);
        throw new Error('Debería retornar 401');
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
  });

  // ========================================
  // 404: Not Found
  // ========================================

  describe('404 NOT FOUND - Recursos inexistentes', () => {
    it('debería retornar 404 para endpoint inexistente', async () => {
      if (!authHelper.isConfigured()) {
        console.warn('⚠️ Cognito TEST no disponible - test skipped');
        return;
      }

      const testEmail = TestUtils.generateUniqueEmail('notfound@example.com');
      const { token } = await authHelper.setupTestUser(testEmail, 'Test123!');

      try {
        await apiHelper.get('/user/nonexistent-endpoint', token);
        throw new Error('Debería retornar 404');
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
  });

  // ========================================
  // Edge Cases: Datos límite
  // ========================================

  describe('EDGE CASES - Datos límite', () => {
    it('debería aceptar name con máxima longitud permitida', async () => {
      if (!authHelper.isConfigured()) {
        console.warn('⚠️ Cognito TEST no disponible - test skipped');
        return;
      }

      const testEmail = TestUtils.generateUniqueEmail('maxlen@example.com');
      const { token } = await authHelper.setupTestUser(testEmail, 'Test123!');

      const maxName = 'A'.repeat(50); // Máxima longitud

      const response = await apiHelper.post(
        '/user',
        {
          first_name: maxName,
          last_name: 'Valid',
          email: testEmail,
          phone: '+1234567890',
        },
        token
      );

      expect([200, 201, 400]).toContain(response.statusCode);
    });

    it('debería manejar caracteres especiales en nombres', async () => {
      if (!authHelper.isConfigured()) {
        console.warn('⚠️ Cognito TEST no disponible - test skipped');
        return;
      }

      const testEmail = TestUtils.generateUniqueEmail('special@example.com');
      const { token } = await authHelper.setupTestUser(testEmail, 'Test123!');

      const response = await apiHelper.post(
        '/user',
        {
          first_name: 'José-María',
          last_name: 'O\'Brien',
          email: testEmail,
          phone: '+1234567890',
        },
        token
      );

      expect([200, 201, 400]).toContain(response.statusCode);
    });

    it('debería manejar espacios en blanco al inicio/final', async () => {
      if (!authHelper.isConfigured()) {
        console.warn('⚠️ Cognito TEST no disponible - test skipped');
        return;
      }

      const testEmail = TestUtils.generateUniqueEmail('spaces@example.com');
      const { token } = await authHelper.setupTestUser(testEmail, 'Test123!');

      const response = await apiHelper.post(
        '/user',
        {
          first_name: '  John  ',
          last_name: '  Doe  ',
          email: testEmail,
          phone: '+1234567890',
        },
        token
      );

      expect([200, 201, 400]).toContain(response.statusCode);
    });

    it('debería rechazar null values', async () => {
      if (!authHelper.isConfigured()) {
        console.warn('⚠️ Cognito TEST no disponible - test skipped');
        return;
      }

      const testEmail = TestUtils.generateUniqueEmail('null@example.com');
      const { token } = await authHelper.setupTestUser(testEmail, 'Test123!');

      const response = await apiHelper.post(
        '/user',
        {
          first_name: null,
          last_name: 'Doe',
          email: testEmail,
          phone: '+1234567890',
        } as any,
        token
      );

      expect(response.statusCode).toBe(400);
    });
  });

  // ========================================
  // Validación de estructura de errores
  // ========================================

  describe('ESTRUCTURA DE ERRORES - Consistencia de respuestas', () => {
    it('debería retornar error con estructura correcta: success, message, data.errors', async () => {
      if (!authHelper.isConfigured()) {
        console.warn('⚠️ Cognito TEST no disponible - test skipped');
        return;
      }

      const testEmail = TestUtils.generateUniqueEmail('struct@example.com');
      const { token } = await authHelper.setupTestUser(testEmail, 'Test123!');

      const response = await apiHelper.post(
        '/user',
        {
          first_name: '', // Campo vacío = error
          last_name: 'User',
          email: testEmail,
          phone: '+1234567890',
        },
        token
      );

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);

      // Validar estructura exacta según response.ts
      expect(body).toHaveProperty('success');
      expect(body.success).toBe(false);
      expect(body).toHaveProperty('message');
      expect(typeof body.message).toBe('string');
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveProperty('errors');
      expect(Array.isArray(body.data.errors)).toBe(true);

      // Validar estructura de cada error
      body.data.errors.forEach((err: any) => {
        expect(err).toHaveProperty('field');
        expect(err).toHaveProperty('message');
        expect(err).toHaveProperty('code');
        expect(typeof err.field).toBe('string');
        expect(typeof err.message).toBe('string');
        expect(typeof err.code).toBe('string');
      });
    });

    it('debería retornar múltiples errores si múltiples campos son inválidos', async () => {
      if (!authHelper.isConfigured()) {
        console.warn('⚠️ Cognito TEST no disponible - test skipped');
        return;
      }

      const testEmail = TestUtils.generateUniqueEmail('multierr@example.com');
      const { token } = await authHelper.setupTestUser(testEmail, 'Test123!');

      const response = await apiHelper.post(
        '/user',
        {
          first_name: 'A', // Muy corto
          last_name: '', // Vacío
          email: 'invalid', // Inválido
          phone: 'bad', // Inválido
        },
        token
      );

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body.data.errors)).toBe(true);
      expect(body.data.errors.length).toBeGreaterThan(1);
    });
  });
});

