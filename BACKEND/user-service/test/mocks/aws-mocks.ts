/**
 * 🔧 AWS MOCKS - Mocks para AWS Services
 * 
 * REGLA CRÍTICA: Los mocks DEBEN reflejar la estructura EXACTA del código real
 * - APIGatewayEvent debe tener la estructura real
 * - Responses deben coincidir con response.ts
 * - Error formats deben ser idénticos
 * 
 * ✅ Validado contra: src/utility/response.ts
 */

import type { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

// ========================================
// API GATEWAY EVENT MOCK
// ========================================

/**
 * Crea un mock de APIGatewayEvent con estructura real de AWS Lambda
 * REGLA CRÍTICA: Debe coincidir con requestContext de eventos reales
 */
export function createMockAPIGatewayEvent(
  overrides?: Partial<APIGatewayEvent>
): APIGatewayEvent {
  return {
    resource: '/',
    path: '/',
    httpMethod: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mock-token-xyz',
    },
    multiValueHeaders: {},
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    pathParameters: null,
    stageVariables: null,
    requestContext: {
      accountId: '123456789012',
      apiId: 'test-api-id',
      authorizer: {
        claims: {
          sub: 'test-user-id-12345',
          email: 'test@example.com',
          'cognito:username': 'testuser',
          'email_verified': 'true',
        },
      },
      protocol: 'HTTP/1.1',
      httpMethod: 'GET',
      path: '/',
      stage: 'prod',
      requestId: 'test-request-id-xyz123',
      requestTimeEpoch: Date.now(),
      identity: {
        sourceIp: '127.0.0.1',
        userAgent: 'jest-test-agent',
      } as any,
      resourceId: 'test-resource-id',
      resourcePath: '/',
    },
    body: null,
    isBase64Encoded: false,
    ...overrides,
  };
}

/**
 * Crea un APIGatewayEvent para POST requests
 */
export function createMockPostEvent(
  body: unknown,
  overrides?: Partial<APIGatewayEvent>
): APIGatewayEvent {
  return createMockAPIGatewayEvent({
    httpMethod: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mock-token-xyz',
    },
    ...overrides,
  });
}

/**
 * Crea un APIGatewayEvent con pathParameters
 */
export function createMockPathParamsEvent(
  pathParams: Record<string, string>,
  overrides?: Partial<APIGatewayEvent>
): APIGatewayEvent {
  return createMockAPIGatewayEvent({
    pathParameters: pathParams,
    ...overrides,
  });
}

/**
 * Crea un APIGatewayEvent sin autenticación
 * REGLA CRÍTICA: Validar que handlers rechacen tokens inválidos
 */
export function createMockUnauthenticatedEvent(): APIGatewayEvent {
  return createMockAPIGatewayEvent({
    headers: {
      'Content-Type': 'application/json',
      // Sin Authorization header
    },
    requestContext: {
      accountId: '123456789012',
      apiId: 'test-api-id',
      authorizer: undefined, // Sin autorización
      protocol: 'HTTP/1.1',
      httpMethod: 'GET',
      path: '/',
      stage: 'prod',
      requestId: 'test-request-id',
      requestTimeEpoch: Date.now(),
      identity: {
        sourceIp: '127.0.0.1',
        userAgent: 'jest-test',
      } as any,
      resourceId: 'test-resource',
      resourcePath: '/',
    },
  });
}

// ========================================
// RESPONSE MOCKS
// ========================================

/**
 * Valida que una respuesta tenga la estructura correcta de APIGatewayProxyResult
 * REGLA CRÍTICA: Validar contra estructura real
 */
export function isValidApiResponse(response: any): boolean {
  return (
    response &&
    typeof response === 'object' &&
    'statusCode' in response &&
    'body' in response &&
    typeof response.statusCode === 'number' &&
    typeof response.body === 'string'
  );
}

/**
 * Parsa el body de una respuesta API
 * REGLA CRÍTICA: Validar JSON válido
 */
export function parseResponseBody(response: APIGatewayProxyResult): any {
  try {
    return JSON.parse(response.body);
  } catch (error) {
    throw new Error(`Invalid JSON in response body: ${response.body}`);
  }
}

/**
 * Crea un mock de respuesta exitosa
 * Estructura: { message: string, data?: unknown }
 */
export function mockSuccessResponse(data: unknown, message: string = 'success'): APIGatewayProxyResult {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message,
      data,
    }),
  };
}

/**
 * Crea un mock de respuesta de error
 * Estructura: { message: string, data?: unknown }
 */
export function mockErrorResponse(
  statusCode: number,
  message: string,
  data?: unknown
): APIGatewayProxyResult {
  const body: any = { message };
  if (data !== undefined) {
    body.data = data;
  }
  return {
    statusCode,
    body: JSON.stringify(body),
  };
}

/**
 * Crea un mock de respuesta de error de validación
 * Estructura: { message: string, data: { property, message } }
 * REGLA CRÍTICA: Coincidir con ValidationErrorResponse de response.ts
 */
export function mockValidationErrorResponse(
  validationErrors: Array<{ property: string; message: string }>
): APIGatewayProxyResult {
  return {
    statusCode: 400,
    body: JSON.stringify({
      message: validationErrors[0]?.message || 'Validation error',
      data: validationErrors,
    }),
  };
}

// ========================================
// S3 CLIENT MOCK
// ========================================

/**
 * Mock de S3Client
 * NO se usa en user-service actualmente, pero se incluye por consistencia
 */
export const mockS3Client = {
  send: jest
    .fn()
    .mockResolvedValue({
      $metadata: { httpStatusCode: 200 },
    }),
};

export const mockGetSignedUrl = jest
  .fn()
  .mockResolvedValue('https://mock-signed-url.s3.amazonaws.com/test-file.jpg');

// ========================================
// COGNITO VERIFIER MOCK
// ========================================

/**
 * Mock de Cognito JWT Verifier
 * Valida tokens y retorna claims
 */
export class MockCognitoVerifier {
  async verify(token: string): Promise<any> {
    if (!token) {
      throw new Error('Token requerido');
    }

    if (token === 'invalid-token' || token === 'expired-token') {
      throw new Error('Token inválido o expirado');
    }

    // Token válido: retornar claims
    return {
      sub: 'test-user-id-12345',
      email: 'test@example.com',
      'cognito:username': 'testuser',
      'email_verified': 'true',
      aud: 'test-client-id',
      iss: 'https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_XXXXXXX',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
  }
}

// ========================================
// IMPORTS NECESARIOS
// ========================================

// Jest debe importarse desde @jest/globals en el test que lo use
// import { jest } from '@jest/globals';

