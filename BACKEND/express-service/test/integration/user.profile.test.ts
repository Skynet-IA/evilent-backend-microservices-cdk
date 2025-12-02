/**
 * Tests E2E - User Profile Endpoints
 * 
 * SEMANA 2 PART 3: Verificar que los endpoints funcionan CORRECTAMENTE
 * 
 * Endpoints bajo prueba:
 * - GET /user/profile (obtener perfil autenticado)
 * - POST /user/profile (actualizar perfil autenticado)
 * 
 * Patrón AAA: Arrange → Act → Assert
 * REGLA CRÍTICA: Tests validan código REAL (no mocks simplificados)
 */

import request from 'supertest';
import express from 'express';
import { query } from '../../src/db/connection';
import { registerUserRoutes } from '../../src/api/handlers/user.handler';
import { requestIdMiddleware } from '../../src/utility/request-id';

/**
 * Setup app para testing
 */
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(requestIdMiddleware);
  registerUserRoutes(app);
  return app;
};

describe('User Profile Endpoints - E2E Tests', () => {
  let app: express.Application;
  let testUserId: string;

  beforeEach(async () => {
    app = createTestApp();

    // ARRANGE: Crear usuario de prueba en BD
    try {
      const result = await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, created_at, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id`,
        ['test_profile@example.com', '$2b$10$hashedpassword', 'Test', 'Profile']
      );
      testUserId = result.rows[0].id;
    } catch (error: any) {
      console.error('Setup error:', error.message);
    }
  });

  afterEach(async () => {
    // Limpiar datos de prueba
    try {
      if (testUserId) {
        await query('DELETE FROM users WHERE id = $1', [testUserId]);
      }
    } catch (error: any) {
      console.error('Cleanup error:', error.message);
    }
  });

  // ========================================================================
  // GET /user/profile
  // ========================================================================

  describe('GET /user/profile', () => {
    it('✅ debe retornar perfil del usuario con formato correcto', async () => {
      // ACT
      const response = await request(app)
        .get('/user/profile')
        .query({ userId: testUserId })
        .expect(200);

      // ASSERT
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Profile retrieved successfully');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('timestamp');

      // Validar estructura del perfil
      const profile = response.body.data;
      expect(profile).toHaveProperty('id');
      expect(profile).toHaveProperty('email');
      expect(profile).toHaveProperty('firstName');
      expect(profile).toHaveProperty('lastName');
      expect(profile).toHaveProperty('createdAt');
      expect(profile).toHaveProperty('updatedAt');

      // Validar valores
      expect(profile.id).toBe(testUserId);
      expect(profile.email).toBe('test_profile@example.com');
      expect(profile.firstName).toBe('Test');
      expect(profile.lastName).toBe('Profile');
    });

    it('❌ debe retornar 400 si userId falta', async () => {
      // ACT
      const response = await request(app)
        .get('/user/profile')
        .expect(400);

      // ASSERT
      expect(response.body.success).toBe(false);
      expect(response.body.data.errors).toBeDefined();
    });

    it('❌ debe retornar 404 si usuario no existe', async () => {
      // ACT
      const response = await request(app)
        .get('/user/profile')
        .query({ userId: '999999' })
        .expect(404);

      // ASSERT
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('✅ debe incluir X-Request-ID en response', async () => {
      // ACT
      const response = await request(app)
        .get('/user/profile')
        .query({ userId: testUserId });

      // ASSERT
      expect(response.headers['x-request-id']).toBeDefined();
      expect(response.headers['x-request-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });
  });

  // ========================================================================
  // POST /user/profile
  // ========================================================================

  describe('POST /user/profile', () => {
    it('✅ debe actualizar perfil del usuario', async () => {
      // ACT
      const response = await request(app)
        .post('/user/profile')
        .query({ userId: testUserId })
        .send({
          firstName: 'Updated',
          lastName: 'Name'
        })
        .expect(200);

      // ASSERT
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Profile updated successfully');
      expect(response.body.data.firstName).toBe('Updated');
      expect(response.body.data.lastName).toBe('Name');

      // Verificar que se guardó en BD
      const verify = await query(
        'SELECT first_name as "firstName", last_name as "lastName" FROM users WHERE id = $1',
        [testUserId]
      );
      expect(verify.rows[0].firstName).toBe('Updated');
      expect(verify.rows[0].lastName).toBe('Name');
    });

    it('✅ debe actualizar solo firstName si lastName no se proporciona', async () => {
      // ACT
      const response = await request(app)
        .post('/user/profile')
        .query({ userId: testUserId })
        .send({
          firstName: 'OnlyFirst'
        })
        .expect(200);

      // ASSERT
      expect(response.body.data.firstName).toBe('OnlyFirst');
      expect(response.body.data.lastName).toBe('Profile'); // No cambió
    });

    it('❌ debe validar firstName (max 50 caracteres)', async () => {
      // ACT
      const response = await request(app)
        .post('/user/profile')
        .query({ userId: testUserId })
        .send({
          firstName: 'a'.repeat(51) // Excede max
        })
        .expect(400);

      // ASSERT
      expect(response.body.success).toBe(false);
      expect(response.body.data.errors).toBeDefined();
    });

    it('❌ debe validar email con formato correcto', async () => {
      // ACT
      const response = await request(app)
        .post('/user/profile')
        .query({ userId: testUserId })
        .send({
          email: 'invalid-email'
        })
        .expect(400);

      // ASSERT
      expect(response.body.success).toBe(false);
    });

    it('❌ debe retornar 400 si userId falta', async () => {
      // ACT
      const response = await request(app)
        .post('/user/profile')
        .send({
          firstName: 'Test'
        })
        .expect(400);

      // ASSERT
      expect(response.body.success).toBe(false);
    });

    it('✅ debe incluir X-Request-ID en response', async () => {
      // ACT
      const response = await request(app)
        .post('/user/profile')
        .query({ userId: testUserId })
        .send({
          firstName: 'Test'
        });

      // ASSERT
      expect(response.headers['x-request-id']).toBeDefined();
    });
  });

  // ========================================================================
  // Response Format Validation (CRITICAL FOR FRONTEND)
  // ========================================================================

  describe('Response Format - Frontend Compatibility', () => {
    it('✅ GET /user/profile debe retornar formato exacto que frontend espera', async () => {
      // ACT
      const response = await request(app)
        .get('/user/profile')
        .query({ userId: testUserId })
        .expect(200);

      // ASSERT: Validar contrato completo
      expect(response.body).toMatchObject({
        success: true,
        message: expect.any(String),
        data: {
          id: expect.any(Number),
          email: expect.any(String),
          firstName: expect.any(String),
          lastName: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        },
        timestamp: expect.any(String)
      });

      // ✅ CRITICAL: No debe haber campos extra ni faltantes
      const expectedFields = ['success', 'message', 'data', 'timestamp'];
      const actualFields = Object.keys(response.body);
      expect(actualFields.sort()).toEqual(expectedFields.sort());
    });

    it('✅ POST /user/profile debe retornar formato exacto que frontend espera', async () => {
      // ACT
      const response = await request(app)
        .post('/user/profile')
        .query({ userId: testUserId })
        .send({ firstName: 'Updated' })
        .expect(200);

      // ASSERT: Validar contrato completo
      expect(response.body).toMatchObject({
        success: true,
        message: expect.any(String),
        data: {
          id: expect.any(Number),
          email: expect.any(String),
          firstName: expect.stringMatching('Updated'),
          lastName: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        },
        timestamp: expect.any(String)
      });
    });

    it('✅ Errores deben retornar formato consistente', async () => {
      // ACT
      const response = await request(app)
        .get('/user/profile')
        .query({ userId: '999999' })
        .expect(404);

      // ASSERT
      expect(response.body).toMatchObject({
        success: false,
        message: expect.any(String),
        code: 'NOT_FOUND_ERROR', // ✅ CRITICAL: Code debe estar presente
        data: null,
        timestamp: expect.any(String)
      });
    });
  });
});

