/**
 * Tests Básicos - User Profile Endpoints
 * 
 * VERIFICACIÓN RÁPIDA: Estructura y validación de endpoints
 * (Sin dependencia de BD real para tests rápidos)
 * 
 * REGLA CRÍTICA: Tests validan ESTRUCTURA y FORMATO
 */

import request from 'supertest';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { registerUserRoutes } from '../../src/api/handlers/user.handler';
import { requestIdMiddleware } from '../../src/api/middleware';

/**
 * Setup app para testing (con todos los middlewares)
 */
const createTestApp = () => {
  const app = express();
  
  // CORS Middleware (SEMANA 2 PART 1)
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(express.json());
  
  // Request ID Middleware (SEMANA 2 PART 1)
  app.use(requestIdMiddleware);
  
  // Rate Limiting Middleware (SEMANA 2 PART 1)
  const rateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 100, // 100 requests por ventana
    handler: (_req, res) => {
      res.status(429).json({
        success: false,
        message: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }
  });
  app.use(rateLimiter);

  registerUserRoutes(app);
  return app;
};

describe('User Profile Endpoints - Basic Structure Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
  });

  // ========================================================================
  // VALIDACIÓN DE ESTRUCTURA DE ENDPOINTS
  // ========================================================================

  describe('✅ Endpoints Registrados', () => {
    it('✅ GET /user/profile endpoint debe existir', async () => {
      // ACT: Hacer request (aunque falle por BD, el endpoint debe responder)
      const response = await request(app)
        .get('/user/profile')
        .query({ userId: '1' });

      // ASSERT: No debe ser 404 (ruta no encontrada)
      expect(response.status).not.toBe(404);
    });

    it('✅ POST /user/profile endpoint debe existir', async () => {
      // ACT
      const response = await request(app)
        .post('/user/profile')
        .query({ userId: '1' })
        .send({ firstName: 'Test' });

      // ASSERT
      expect(response.status).not.toBe(404);
    });
  });

  // ========================================================================
  // VALIDACIÓN DE ENTRADA (Zod Validation)
  // ========================================================================

  describe('✅ Validación de Entrada (Input Validation)', () => {
    it('❌ POST /user/profile debe rechazar firstName > 50 caracteres', async () => {
      // ACT
      const response = await request(app)
        .post('/user/profile')
        .query({ userId: '1' })
        .send({
          firstName: 'a'.repeat(51) // Excede límite
        });

      // ASSERT
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.data.errors).toBeDefined();
    });

    it('❌ POST /user/profile debe rechazar email inválido', async () => {
      // ACT
      const response = await request(app)
        .post('/user/profile')
        .query({ userId: '1' })
        .send({
          email: 'invalid-email-format'
        });

      // ASSERT
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('❌ GET /user/profile debe rechazar sin userId', async () => {
      // ACT: No proporcionar userId
      const response = await request(app)
        .get('/user/profile');

      // ASSERT
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // ========================================================================
  // VALIDACIÓN DE RESPUESTA (Response Format)
  // ========================================================================

  describe('✅ Formato de Respuestas', () => {
    it('✅ Respuestas de error deben incluir code field', async () => {
      // ACT: Trigger error con firstName muy largo
      const response = await request(app)
        .post('/user/profile')
        .query({ userId: '1' })
        .send({ firstName: 'x'.repeat(51) })
        .expect(400);

      // ASSERT
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('✅ Respuestas deben incluir X-Request-ID header', async () => {
      // ACT
      const response = await request(app)
        .get('/user/profile')
        .query({ userId: '1' });

      // ASSERT
      expect(response.headers['x-request-id']).toBeDefined();
      // Validar formato UUID
      expect(response.headers['x-request-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('✅ Response body debe tener estructura consistente', async () => {
      // ACT
      const response = await request(app)
        .post('/user/profile')
        .query({ userId: '1' })
        .send({ firstName: 'Valid' });

      // ASSERT: Validar que tiene las propiedades requeridas
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('timestamp');
      
      // ✅ CRITICAL: No debe haber campos inesperados
      const expectedFields = ['success', 'message', 'data', 'timestamp'];
      const actualFields = Object.keys(response.body);
      expect(actualFields.sort()).toEqual(expectedFields.sort());
    });
  });

  // ========================================================================
  // VALIDACIÓN DE CORS
  // ========================================================================

  describe('✅ CORS Headers', () => {
    it('✅ OPTIONS request debe retornar CORS headers', async () => {
      // ACT
      const response = await request(app)
        .options('/user/profile')
        .expect(204); // CORS retorna 204 No Content

      // ASSERT
      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toBeDefined();
    });

    it('✅ GET request debe incluir CORS headers', async () => {
      // ACT
      const response = await request(app)
        .get('/user/profile')
        .query({ userId: '1' });

      // ASSERT
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('✅ POST request debe incluir CORS headers', async () => {
      // ACT
      const response = await request(app)
        .post('/user/profile')
        .query({ userId: '1' })
        .send({ firstName: 'Test' });

      // ASSERT
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  // ========================================================================
  // VALIDACIÓN DE RATE LIMITING
  // ========================================================================

  describe('✅ Rate Limiting', () => {
    it('✅ Rate limiter debe estar activo (headers presentes)', async () => {
      // ACT: Hacer múltiples requests rápidamente
      const requests = Array(5).fill(null).map(() =>
        request(app)
          .get('/user/profile')
          .query({ userId: '1' })
      );

      const responses = await Promise.all(requests);

      // ASSERT: Al menos una debe tener rate limit headers
      const hasRateLimitHeader = responses.some(
        r => r.headers['x-ratelimit-limit'] || r.headers['ratelimit-limit']
      );
      
      // O al menos 429 status en alguna
      const has429 = responses.some(r => r.status === 429);
      
      expect(hasRateLimitHeader || has429).toBe(true);
    });
  });
});

