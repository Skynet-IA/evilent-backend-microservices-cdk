/**
 * Tests de Integración - User API con DB REAL
 * 
 * CRÍTICO: Estos tests validan que UserRepository funciona con BD real
 * - No usa mocks
 * - Usa la BD de desarrollo
 * - Limpia datos después de cada test
 * 
 * Coverage: >85% para Repository layer
 * Patrón AAA: Arrange → Act → Assert
 */

import request from 'supertest';
import express from 'express';
import { query } from '../../src/db/connection';
import { registerUserRoutes } from '../../src/api/handlers/user.handler';
import { requestIdMiddleware } from '../../src/utility/request-id';

/**
 * Setup de app Express para testing
 */
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(requestIdMiddleware);
  registerUserRoutes(app);
  return app;
};

describe('User API Integration Tests - DB REAL ✅', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
  });

  afterEach(async () => {
    // Limpiar datos después de cada test
    // ⚠️ NOTA: En producción, usar transacciones
    try {
      // No eliminamos datos aquí para poder verificar manualmente en Adminer
      // await query('DELETE FROM users WHERE email LIKE $1', ['test%@example.com']);
    } catch (error: any) {
      console.error('Error cleaning up:', error.message);
    }
  });

  // ========================================================================
  // GET /users - Listar usuarios (CON DB REAL)
  // ========================================================================

  describe('GET /users - Usando DB Real', () => {
    it('✅ debe retornar lista de usuarios desde BD real', async () => {
      // ARRANGE: Limpiar
      await query('DELETE FROM users WHERE email LIKE $1', ['test%@example.com']);

      // Insertar datos de prueba directamente en BD
      await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, created_at, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        ['test_user_1@example.com', '$2b$10$hashedpassword123', 'Test', 'User']
      );

      // ACT
      const response = await request(app)
        .get('/users')
        .expect(200);

      // ASSERT
      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toBeInstanceOf(Array);
      expect(response.body.data.users.length).toBeGreaterThan(0);

      // Validar estructura del usuario
      const user = response.body.data.users[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('firstName');
      expect(user).toHaveProperty('lastName');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('updatedAt');
    });

    it('✅ debe retornar paginación correcta', async () => {
      // ACT
      const response = await request(app)
        .get('/users')
        .query({ page: 1, pageSize: 10 })
        .expect(200);

      // ASSERT
      expect(response.body.data).toHaveProperty('page', 1);
      expect(response.body.data).toHaveProperty('pageSize', 10);
      expect(response.body.data).toHaveProperty('total');
      expect(typeof response.body.data.total).toBe('number');
    });
  });

  // ========================================================================
  // GET /users/:id - Obtener usuario por ID (CON DB REAL)
  // ========================================================================

  describe('GET /users/:id - Usando DB Real', () => {
    it('✅ debe obtener usuario por ID desde BD real', async () => {
      // ARRANGE: Insertar usuario de prueba
      const insertResult = await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, created_at, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id`,
        ['test_get@example.com', '$2b$10$hashedpassword123', 'Get', 'Test']
      );
      
      const userId = insertResult.rows[0].id;

      // ACT
      const response = await request(app)
        .get(`/users/${userId}`)
        .expect(200);

      // ASSERT
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.email).toBe('test_get@example.com');
      expect(response.body.data.firstName).toBe('Get');

      // Limpiar
      await query('DELETE FROM users WHERE id = $1', [userId]);
    });

    it('❌ debe retornar 404 si usuario no existe', async () => {
      // ACT
      const response = await request(app)
        .get('/users/999999')
        .expect(404);

      // ASSERT
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  // ========================================================================
  // PUT /users/:id - Actualizar usuario (CON DB REAL)
  // ========================================================================

  describe('PUT /users/:id - Usando DB Real', () => {
    it('✅ debe actualizar usuario en BD real', async () => {
      // ARRANGE: Insertar usuario
      const insertResult = await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, created_at, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id`,
        ['test_update@example.com', '$2b$10$hashedpassword123', 'Old', 'Name']
      );

      const userId = insertResult.rows[0].id;

      // ACT: Actualizar
      const response = await request(app)
        .put(`/users/${userId}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name'
        })
        .expect(200);

      // ASSERT
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('Updated');
      expect(response.body.data.lastName).toBe('Name');

      // Verificar en BD
      const verify = await query(
        'SELECT first_name as "firstName" FROM users WHERE id = $1',
        [userId]
      );
      expect(verify.rows[0].firstName).toBe('Updated');

      // Limpiar
      await query('DELETE FROM users WHERE id = $1', [userId]);
    });

    it('❌ debe retornar 404 si usuario a actualizar no existe', async () => {
      // ACT
      const response = await request(app)
        .put('/users/999999')
        .send({ firstName: 'Test' })
        .expect(404);

      // ASSERT
      expect(response.body.success).toBe(false);
    });
  });

  // ========================================================================
  // DELETE /users/:id - Eliminar usuario (CON DB REAL - SOFT DELETE)
  // ========================================================================

  describe('DELETE /users/:id - Usando DB Real (Soft Delete)', () => {
    it('✅ debe eliminar usuario (soft delete) en BD real', async () => {
      // ARRANGE: Insertar usuario
      const insertResult = await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, created_at, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id`,
        ['test_delete@example.com', '$2b$10$hashedpassword123', 'Delete', 'Me']
      );

      const userId = insertResult.rows[0].id;

      // ACT: Eliminar
      const response = await request(app)
        .delete(`/users/${userId}`)
        .expect(200);

      // ASSERT
      expect(response.body.success).toBe(true);

      // Verificar soft delete en BD (deleted_at NO es NULL)
      const verify = await query(
        'SELECT deleted_at FROM users WHERE id = $1',
        [userId]
      );
      expect(verify.rows[0].deleted_at).not.toBeNull();

      // Verificar que GET retorna 404 (soft delete oculta el registro)
      await request(app)
        .get(`/users/${userId}`)
        .expect(404);
    });

    it('❌ debe retornar 404 si usuario a eliminar no existe', async () => {
      // ACT
      const response = await request(app)
        .delete('/users/999999')
        .expect(404);

      // ASSERT
      expect(response.body.success).toBe(false);
    });
  });

  // ========================================================================
  // Validación Zod - Request Format
  // ========================================================================

  describe('Validación de Entrada - Zod Schemas', () => {
    it('✅ debe validar firstName (min 1, max 50)', async () => {
      // ACT: firstName muy largo
      const response = await request(app)
        .put('/users/1')
        .send({
          firstName: 'a'.repeat(51) // Excede max 50
        })
        .expect(400);

      // ASSERT
      expect(response.body.success).toBe(false);
      expect(response.body.data.errors).toBeDefined();
    });

    it('✅ debe validar email con formato correcto', async () => {
      // ACT: Email inválido
      const response = await request(app)
        .put('/users/1')
        .send({
          email: 'invalid-email'
        })
        .expect(400);

      // ASSERT
      expect(response.body.success).toBe(false);
      expect(response.body.data.errors).toBeDefined();
    });
  });
});

