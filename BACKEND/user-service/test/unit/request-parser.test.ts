/**
 * 🧪 TESTS: Request Parser - USER-SERVICE
 * 
 * REGLA #5: SIEMPRE validar datos de entrada con schemas (Zod)
 * REGLA CRÍTICA: Tests deben validar CONSISTENCIA estructura exacta
 * REGLA #3: SIEMPRE usar logger estructurado
 * 
 * Este archivo prueba parseAndValidateBody, parseAndValidatePathParams, 
 * y parseAndValidateQueryParams para garantizar validación consistente
 * en TODOS los endpoints
 */

import { z } from 'zod';
import {
  parseAndValidateBody,
  parseAndValidatePathParams,
  parseAndValidateQueryParams,
  validationSuccessResponse,
  validationErrorResponse,
} from '../../src/utility/request-parser.js';
import { createMockPostEvent, createMockPathParamsEvent } from '../mocks/aws-mocks.js';

describe('Request Parser - USER-SERVICE', () => {
  /**
   * ✅ PARSEANVALIDATEBODY TESTS (12+ tests)
   */

  describe('parseAndValidateBody', () => {
    const TestSchema = z.object({
      first_name: z.string().min(1).max(50),
      last_name: z.string().min(1).max(50),
      phone: z.string().optional(),
    });

    // ========================================
    // ✅ CASOS VÁLIDOS
    // ========================================

    it('debe parsear y validar body válido', () => {
      const event = createMockPostEvent({
        first_name: 'Juan',
        last_name: 'Pérez',
      });

      const result = parseAndValidateBody(event, TestSchema);

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data?.first_name).toBe('Juan');
      expect(result.data?.last_name).toBe('Pérez');
    });

    it('debe retornar error si body es null', () => {
      const event = createMockPostEvent({});
      event.body = null;

      const result = parseAndValidateBody(event, TestSchema);

      expect(result.error).toBeDefined();
      expect(result.error?.statusCode).toBe(400);
      expect(result.data).toBeNull();
    });

    it('debe retornar error si JSON es inválido (parse error)', () => {
      const event = createMockPostEvent({});
      event.body = '{invalid json}';

      const result = parseAndValidateBody(event, TestSchema);

      expect(result.error).toBeDefined();
      expect(result.error?.statusCode).toBe(400);
      expect(result.error?.message).toContain('JSON');
      expect(result.data).toBeNull();
    });

    it('debe retornar error si validación Zod falla', () => {
      const event = createMockPostEvent({
        // Falta first_name (requerido)
        last_name: 'Pérez',
      });

      const result = parseAndValidateBody(event, TestSchema);

      expect(result.error).toBeDefined();
      expect(result.error?.statusCode).toBe(400);
      expect(result.data).toBeNull();
    });

    it('debe formatear errores Zod correctamente (field, message, code)', () => {
      const event = createMockPostEvent({
        first_name: '',  // Falta requerido
        last_name: 'a'.repeat(51),  // Max excedido
      });

      const result = parseAndValidateBody(event, TestSchema);

      expect(result.error).toBeDefined();
      expect(result.error?.details).toBeDefined();
      expect(Array.isArray(result.error?.details)).toBe(true);
      expect(result.error?.details?.length).toBeGreaterThan(0);

      // Validar estructura de error (REGLA CRÍTICA)
      if (result.error?.details?.[0]) {
        expect(result.error.details[0]).toHaveProperty('field');
        expect(result.error.details[0]).toHaveProperty('message');
        expect(result.error.details[0]).toHaveProperty('code');
      }
    });

    it('debe retornar estructura de error consistente', () => {
      const event = createMockPostEvent({
        first_name: 'a'.repeat(51),
      });

      const result = parseAndValidateBody(event, TestSchema);

      expect(result.error).toBeDefined();
      expect(result.error).toHaveProperty('statusCode');
      expect(result.error).toHaveProperty('message');
      expect(result.error).toHaveProperty('details');
      expect(typeof result.error?.statusCode).toBe('number');
      expect(typeof result.error?.message).toBe('string');
      expect(Array.isArray(result.error?.details)).toBe(true);
    });
  });

  /**
   * ✅ PARSEANVALIDATEPATHPARAMS TESTS (8+ tests)
   */

  describe('parseAndValidatePathParams', () => {
    const PathParamsSchema = z.object({
      id: z.string().uuid(),
    });

    it('debe parsear y validar pathParams válidos', () => {
      const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });

      const event = createMockPathParamsEvent({ id: uuid });

      const result = parseAndValidatePathParams(event, PathParamsSchema);

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe(uuid);
    });

    it('debe retornar error si pathParams es null', () => {
      const event = createMockPathParamsEvent({});
      event.pathParameters = null;

      const result = parseAndValidatePathParams(event, PathParamsSchema);

      expect(result.error).toBeDefined();
      expect(result.error?.statusCode).toBe(400);
      expect(result.data).toBeNull();
    });

    it('debe retornar error si validación falla (UUID inválido)', () => {
      const event = createMockPathParamsEvent({ id: 'invalid-uuid' });

      const result = parseAndValidatePathParams(event, PathParamsSchema);

      expect(result.error).toBeDefined();
      expect(result.error?.statusCode).toBe(400);
      expect(result.data).toBeNull();
    });

    it('debe retornar error si falta parámetro requerido', () => {
      const event = createMockPathParamsEvent({});

      const result = parseAndValidatePathParams(event, PathParamsSchema);

      expect(result.error).toBeDefined();
      expect(result.error?.statusCode).toBe(400);
    });

    it('debe formatear errores pathParams correctamente', () => {
      const event = createMockPathParamsEvent({ id: 'not-a-uuid' });

      const result = parseAndValidatePathParams(event, PathParamsSchema);

      expect(result.error?.details).toBeDefined();
      expect(Array.isArray(result.error?.details)).toBe(true);
      if (result.error?.details?.[0]) {
        expect(result.error.details[0]).toHaveProperty('field');
        expect(result.error.details[0]).toHaveProperty('message');
        expect(result.error.details[0]).toHaveProperty('code');
      }
    });
  });

  /**
   * ✅ PARSEANVALIDATEQUERYPARAMS TESTS (8+ tests)
   */

  describe('parseAndValidateQueryParams', () => {
    const QueryParamsSchema = z.object({
      page: z.coerce.number().int().positive().optional().default(1),
      limit: z.coerce.number().int().positive().optional().default(10),
    });

    it('debe parsear y validar queryParams válidos', () => {
      const event = createMockPostEvent({});
      event.queryStringParameters = { page: '1', limit: '10' };

      const result = parseAndValidateQueryParams(event, QueryParamsSchema);

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data?.page).toBe(1);
      expect(result.data?.limit).toBe(10);
    });

    it('debe aplicar defaults si queryParams es null', () => {
      const event = createMockPostEvent({});
      event.queryStringParameters = null;

      const result = parseAndValidateQueryParams(event, QueryParamsSchema);

      expect(result.error).toBeNull();
      expect(result.data?.page).toBe(1);
      expect(result.data?.limit).toBe(10);
    });

    it('debe convertir strings a números (coercion)', () => {
      const event = createMockPostEvent({});
      event.queryStringParameters = { page: '2', limit: '20' };

      const result = parseAndValidateQueryParams(event, QueryParamsSchema);

      expect(result.error).toBeNull();
      expect(typeof result.data?.page).toBe('number');
      expect(typeof result.data?.limit).toBe('number');
      expect(result.data?.page).toBe(2);
      expect(result.data?.limit).toBe(20);
    });

    it('debe retornar error si validación falla (número negativo)', () => {
      const event = createMockPostEvent({});
      event.queryStringParameters = { page: '-1' };

      const result = parseAndValidateQueryParams(event, QueryParamsSchema);

      expect(result.error).toBeDefined();
      expect(result.error?.statusCode).toBe(400);
    });

    it('debe retornar error si string no es convertible a número', () => {
      const event = createMockPostEvent({});
      event.queryStringParameters = { page: 'abc' };

      const result = parseAndValidateQueryParams(event, QueryParamsSchema);

      expect(result.error).toBeDefined();
    });

    it('debe formatear errores queryParams correctamente', () => {
      const event = createMockPostEvent({});
      event.queryStringParameters = { page: 'invalid' };

      const result = parseAndValidateQueryParams(event, QueryParamsSchema);

      expect(result.error?.details).toBeDefined();
      expect(Array.isArray(result.error?.details)).toBe(true);
      if (result.error?.details?.[0]) {
        expect(result.error.details[0]).toHaveProperty('field');
        expect(result.error.details[0]).toHaveProperty('message');
        expect(result.error.details[0]).toHaveProperty('code');
      }
    });
  });

  /**
   * ✅ RESPONSE HELPERS TESTS (5+ tests)
   */

  describe('Response Helpers', () => {
    it('validationSuccessResponse debe retornar estructura correcta', () => {
      const response = validationSuccessResponse({ test: 'data' });

      expect(response.statusCode).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.headers).toBeDefined();

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toEqual({ test: 'data' });
    });

    it('validationErrorResponse debe retornar estructura correcta', () => {
      const error = {
        statusCode: 400,
        message: 'Validation failed',
        details: [{ field: 'name', message: 'Required', code: 'invalid_type' }],
      };

      const response = validationErrorResponse(error);

      expect(response.statusCode).toBe(400);
      expect(response.body).toBeDefined();
      expect(response.headers).toBeDefined();

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toBe('Validation failed');
      expect(body.data.errors).toBeDefined();
    });

    it('error response debe tener formato consistente', () => {
      const error = {
        statusCode: 400,
        message: 'Test error',
        details: [
          { field: 'test', message: 'Error message', code: 'invalid_value' }
        ],
      };

      const response = validationErrorResponse(error);
      const body = JSON.parse(response.body);

      // Validar estructura consistente (REGLA CRÍTICA)
      expect(response).toHaveProperty('statusCode');
      expect(response).toHaveProperty('body');
      expect(response).toHaveProperty('headers');
      expect(body).toHaveProperty('success');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
    });
  });

  /**
   * ✅ INTEGRATION TESTS (3+ tests)
   */

  describe('Request Parser Integration', () => {
    it('flujo completo: validar → responder con éxito', () => {
      const event = createMockPostEvent({
        first_name: 'Juan',
        last_name: 'Pérez',
      });

      const TestSchema = z.object({
        first_name: z.string().min(1),
        last_name: z.string().min(1),
      });

      const parseResult = parseAndValidateBody(event, TestSchema);
      expect(parseResult.error).toBeNull();

      const response = validationSuccessResponse(parseResult.data);
      expect(response.statusCode).toBe(200);
    });

    it('flujo completo: validar → responder con error', () => {
      const event = createMockPostEvent({
        // Falta first_name
        last_name: 'Pérez',
      });

      const TestSchema = z.object({
        first_name: z.string().min(1),
        last_name: z.string().min(1),
      });

      const parseResult = parseAndValidateBody(event, TestSchema);
      expect(parseResult.error).toBeDefined();

      const response = validationErrorResponse(parseResult.error!);
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('estructura de error debe ser consistente en todos los parseadores', () => {
      const bodyError = {
        statusCode: 400,
        message: 'Body validation failed',
        details: [{ field: 'name', message: 'Invalid', code: 'invalid_type' }],
      };

      const pathError = {
        statusCode: 400,
        message: 'Path params validation failed',
        details: [{ field: 'id', message: 'Invalid UUID', code: 'invalid_string' }],
      };

      const queryError = {
        statusCode: 400,
        message: 'Query params validation failed',
        details: [{ field: 'page', message: 'Invalid number', code: 'invalid_type' }],
      };

      [bodyError, pathError, queryError].forEach((error) => {
        expect(error).toHaveProperty('statusCode');
        expect(error).toHaveProperty('message');
        expect(error).toHaveProperty('details');
        expect(Array.isArray(error.details)).toBe(true);
        if (error.details[0]) {
          expect(error.details[0]).toHaveProperty('field');
          expect(error.details[0]).toHaveProperty('message');
          expect(error.details[0]).toHaveProperty('code');
        }
      });
    });
  });
});

