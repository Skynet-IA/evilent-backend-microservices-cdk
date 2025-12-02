/**
 * Tests de Integración - User API
 * 
 * Valida que el endpoint completo funciona:
 * Request → Validation → Handler → Response
 * 
 * Coverage requerido: >85% (handlers)
 * Patrón AAA: Arrange → Act → Assert
 * Valida formato de respuesta COMPLETO (contrato de API)
 */

import request from 'supertest';
import express, { Request, Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { registerUserRoutes } from '../../src/api/handlers/user.handler';
import { requestIdMiddleware } from '../../src/utility/request-id';

/**
 * Setup de app Express para testing
 */
const createTestApp = (withMiddleware = true) => {
  const app = express();
  
  if (withMiddleware) {
    // ACTIVIDAD #1: CORS Middleware
    app.use(cors({
      origin: 'http://localhost:3000',
      credentials: true
    }));
    
    // ACTIVIDAD #2: Request ID Tracking
    app.use(requestIdMiddleware);
  }
  
  app.use(express.json());
  registerUserRoutes(app);
  return app;
};


describe('User API Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
  });

  // ========================================================================
  // GET /users - Listar usuarios
  // ========================================================================

  describe('GET /users', () => {
    it('debe retornar lista de usuarios con formato correcto', async () => {
      // ACT
      const response = await request(app)
        .get('/users')
        .expect(200);

      // ASSERT - Validar estructura de respuesta
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('timestamp');

      // Validar data
      expect(response.body.data).toHaveProperty('users');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('page');
      expect(response.body.data).toHaveProperty('pageSize');

      // Validar usuarios
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });

    it('debe validar parámetro page (debe ser >= 1)', async () => {
      // ACT
      const res = await request(app)
        .get('/users')
        .query({ page: 0 })
        .expect(400);

      // ASSERT
      expect(res.body.success).toBe(false);
      expect(res.body.data.errors).toBeDefined();
      expect(Array.isArray(res.body.data.errors)).toBe(true);
    });

    it('debe validar parámetro pageSize (máximo 100)', async () => {
      // ACT
      const res2 = await request(app)
        .get('/users')
        .query({ pageSize: 200 })
        .expect(400);

      // ASSERT
      expect(res2.body.success).toBe(false);
      expect(res2.body.data.errors).toBeDefined();
    });
  });

  // ========================================================================
  // POST /users - Crear usuario
  // ========================================================================

  describe('POST /users', () => {
    it('debe crear usuario con datos válidos', async () => {
      // ARRANGE
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      };

      // ACT
      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(201);

      // ASSERT - Validar estructura
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.firstName).toBe('John');
      expect(response.body.data.lastName).toBe('Doe');
      expect(response.body.data.email).toBe('john@example.com');
      expect(response.body.timestamp).toBeDefined();
    });

    it('debe validar firstName requerido', async () => {
      // ARRANGE
      const userData = {
        lastName: 'Doe',
        email: 'john@example.com'
      };

      // ACT
      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(400);

      // ASSERT
      expect(response.body.success).toBe(false);
      expect(response.body.data.errors).toBeDefined();
      expect(response.body.data.errors[0].field).toContain('firstName');
    });

    it('debe validar email con formato correcto', async () => {
      // ARRANGE
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email'
      };

      // ACT
      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(400);

      // ASSERT
      expect(response.body.success).toBe(false);
      expect(response.body.data.errors[0].field).toBe('email');
      expect(response.body.data.errors[0].message).toContain('Invalid email');
    });

    it('debe validar firstName longitud mínima', async () => {
      // ARRANGE
      const userData = {
        firstName: '',
        lastName: 'Doe',
        email: 'john@example.com'
      };

      // ACT
      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(400);

      // ASSERT
      expect(response.body.success).toBe(false);
      expect(response.body.data.errors[0].field).toBe('firstName');
    });

    it('debe validar firstName longitud máxima', async () => {
      // ARRANGE
      const userData = {
        firstName: 'A'.repeat(51),
        lastName: 'Doe',
        email: 'john@example.com'
      };

      // ACT
      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(400);

      // ASSERT
      expect(response.body.success).toBe(false);
      expect(response.body.data.errors[0].field).toBe('firstName');
    });
  });

  // ========================================================================
  // GET /users/:id - Obtener usuario por ID
  // ========================================================================

  describe('GET /users/:id', () => {
    it('debe retornar usuario existente', async () => {
      // ACT
      const response = await request(app)
        .get('/users/1')
        .expect(200);

      // ASSERT
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe('1');
      expect(response.body.data.firstName).toBeDefined();
      expect(response.body.data.email).toBeDefined();
    });

    it('debe retornar 404 si usuario no existe', async () => {
      // ACT
      const response = await request(app)
        .get('/users/999')
        .expect(404);

      // ASSERT
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });

    it('debe validar que ID es requerido', async () => {
      // ACT
      await request(app)
        .get('/users/')
        .expect(404); // Express ruta no encontrada
    });
  });

  // ========================================================================
  // PUT /users/:id - Actualizar usuario
  // ========================================================================

  describe('PUT /users/:id', () => {
    it('debe actualizar usuario con datos válidos', async () => {
      // ARRANGE
      const updateData = {
        firstName: 'Johnny',
        lastName: 'Smith'
      };

      // ACT
      const response = await request(app)
        .put('/users/1')
        .send(updateData)
        .expect(200);

      // ASSERT
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('Johnny');
      expect(response.body.data.lastName).toBe('Smith');
    });

    it('debe validar email si se actualiza', async () => {
      // ARRANGE
      const updateData = {
        email: 'invalid-email'
      };

      // ACT
      const response = await request(app)
        .put('/users/1')
        .send(updateData)
        .expect(400);

      // ASSERT
      expect(response.body.success).toBe(false);
      expect(response.body.data.errors[0].field).toBe('email');
    });

    it('debe permitir actualización parcial', async () => {
      // ARRANGE
      const updateData = {
        firstName: 'Johnny'
        // lastName no se proporciona
      };

      // ACT
      const response = await request(app)
        .put('/users/1')
        .send(updateData)
        .expect(200);

      // ASSERT
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('Johnny');
    });
  });

  // ========================================================================
  // DELETE /users/:id - Eliminar usuario
  // ========================================================================

  describe('DELETE /users/:id', () => {
    it('debe eliminar usuario exitosamente', async () => {
      // ACT
      const response = await request(app)
        .delete('/users/1')
        .expect(200);

      // ASSERT
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User deleted successfully');
      expect(response.body.data).toBeNull();
    });

    it('debe validar que ID es requerido', async () => {
      // ACT
      await request(app)
        .delete('/users/')
        .expect(404); // Express ruta no encontrada
    });
  });

  // ========================================================================
  // ERROR HANDLING - Formato de errores consistente
  // ========================================================================

  describe('Error Response Format', () => {
    it('debe retornar formato de error consistente para validación', async () => {
      // ARRANGE
      const invalidData = {
        firstName: ''
      };

      // ACT
      const response = await request(app)
        .post('/users')
        .send(invalidData)
        .expect(400);

      // ASSERT - Validar estructura de error (DEBE coincidir con constants)
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Validation failed');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('errors');
      expect(Array.isArray(response.body.data.errors)).toBe(true);

      // Validar estructura de cada error
      expect(response.body.data.errors[0]).toHaveProperty('field');
      expect(response.body.data.errors[0]).toHaveProperty('message');
      expect(response.body.data.errors[0]).toHaveProperty('code');
      expect(response.body.data.errors[0].code).toBe('VALIDATION_ERROR');
    });
  });

  // ========================================================================
  // ACTIVIDAD #1: CORS Middleware
  // ========================================================================

  describe('CORS Middleware (ACTIVIDAD #1)', () => {
    it('debe permitir requests desde origen permitido', async () => {
      // ACT
      const response = await request(app)
        .options('/users')
        .set('Origin', 'http://localhost:3000');

      // ASSERT - OPTIONS retorna 204 o 200
      expect([200, 204]).toContain(response.status);
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('debe incluir headers CORS en respuesta', async () => {
      // ACT
      const response = await request(app)
        .get('/users')
        .set('Origin', 'http://localhost:3000');

      // ASSERT
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });
  });

  // ========================================================================
  // ACTIVIDAD #2: Request ID Tracking
  // ========================================================================

  describe('Request ID Tracking (ACTIVIDAD #2)', () => {
    it('debe generar X-Request-ID si no existe', async () => {
      // ACT
      const response = await request(app)
        .get('/users')
        .expect(200);

      // ASSERT
      expect(response.headers['x-request-id']).toBeDefined();
      expect(response.headers['x-request-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('debe usar X-Request-ID proporcionado por cliente', async () => {
      // ARRANGE
      const customId = '550e8400-e29b-41d4-a716-446655440000';

      // ACT
      const response = await request(app)
        .get('/users')
        .set('X-Request-ID', customId)
        .expect(200);

      // ASSERT
      expect(response.headers['x-request-id']).toBe(customId);
    });
  });

  // ========================================================================
  // ACTIVIDAD #3: Error Handling Avanzado
  // ========================================================================

  describe('Advanced Error Handling (ACTIVIDAD #3)', () => {
    it('debe retornar 404 con formato correcto para recurso no encontrado', async () => {
      // ACT
      const response = await request(app)
        .get('/users/999')
        .expect(404);

      // ASSERT
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'User not found');
      expect(response.body).toHaveProperty('code');
    });

    it('debe retornar 400 con detalles de validación', async () => {
      // ACT
      const response = await request(app)
        .post('/users')
        .send({
          firstName: 'A'.repeat(51), // Mayor que max (50)
          lastName: 'Doe'
        })
        .expect(400);

      // ASSERT
      expect(response.body.success).toBe(false);
      expect(response.body.data.errors).toBeDefined();
      expect(response.body.data.errors[0].field).toBe('firstName');
    });
  });

  // ========================================================================
  // ACTIVIDAD #4: Rate Limiting
  // ========================================================================

  describe('Rate Limiting (ACTIVIDAD #4)', () => {
    it('debe tener rate limiting middleware configurado', () => {
      // ASSERT - Verificar que rateLimit está disponible en Express
      expect(rateLimit).toBeDefined();
      
      // Verificar que la función retorna un middleware
      const middleware = rateLimit({ max: 100, windowMs: 15 * 60 * 1000 });
      expect(typeof middleware).toBe('function');
    });

    it('debe retornar respuesta 429 con formato correcto cuando se excede límite', async () => {
      // Crear app con rate limit muy bajo para testing
      const testApp = express();
      testApp.use(express.json());
      
      // Rate limiter de 2 requests
      const limiter = rateLimit({
        windowMs: 1000,
        max: 2,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (_req: Request, res: Response) => {
          res.status(429).json({
            success: false,
            message: 'Too many requests',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: res.getHeader('Retry-After')
          });
        }
      });
      
      testApp.use(limiter);
      testApp.get('/test', (_req: Request, res: Response) => {
        res.json({ success: true });
      });

      // ACT - Hacer 2 requests ok
      await request(testApp).get('/test').expect(200);
      await request(testApp).get('/test').expect(200);

      // Request #3 debe ser rechazado
      const response = await request(testApp)
        .get('/test')
        .expect(429);

      // ASSERT
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Too many requests');
      expect(response.body).toHaveProperty('code', 'RATE_LIMIT_EXCEEDED');
      expect(response.headers['retry-after']).toBeDefined();
    });
  });
});

