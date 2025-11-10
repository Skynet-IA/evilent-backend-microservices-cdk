/**
 * 🌐 API HELPER - HTTP Integration
 * 
 * TESTING PURO Y DURO: Llamadas REALES a API (Lambda + API Gateway)
 * ✅ REGLA #2: API URL desde variables de entorno
 * ✅ REGLA CRÍTICA: Tests validan respuestas REALES de API
 * ✅ REGLA #3: Logger estructurado + retry automático
 */

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { createLogger } from '../../src/utility/logger.js';
import { TestUtils } from '../config.js';

const logger = createLogger('ApiHelper');

export interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  data?: any;
  token?: string;
  headers?: Record<string, string>;
}

export interface ApiResponse {
  statusCode: number;
  body: any;
  headers: Record<string, any>;
}

/**
 * Helper para requests HTTP a la API en tests
 * Incluye retry automático y manejo de errores
 */
export class ApiHelper {
  private baseURL: string;
  private timeout: number;
  private maxRetries: number;

  constructor() {
    // ✅ REGLA #2: Cargar desde variables de entorno (no hardcoded)
    this.baseURL = process.env.API_BASE_URL_TEST || process.env.API_BASE_URL || '';
    this.timeout = parseInt(
      process.env.API_TIMEOUT_TEST || process.env.TEST_TIMEOUT || '30000',
      10
    );
    this.maxRetries = parseInt(
      process.env.API_RETRIES || '3',
      10
    );

    if (!this.baseURL) {
      logger.warn('⚠️ API URL no configurada', {
        envVars: ['API_BASE_URL_TEST', 'API_BASE_URL'],
      });
    }

    logger.info('✅ ApiHelper inicializado', {
      baseURL: this.baseURL.split('?')[0] || 'unknown',
      timeout: this.timeout,
      maxRetries: this.maxRetries,
    });
  }

  /**
   * Ejecutar request HTTP con retry automático
   * 
   * TESTING PURO Y DURO: Reintenta en caso de fallos transitorios
   */
  private async requestWithRetry(
    config: AxiosRequestConfig,
    retries: number = this.maxRetries
  ): Promise<AxiosResponse<any>> {
    let lastError: any;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        logger.debug('🔄 Request HTTP', {
          method: config.method,
          url: config.url,
          attempt: attempt + 1,
          maxAttempts: retries + 1,
        });

        const response = await axios({
          ...config,
          baseURL: this.baseURL,
          timeout: this.timeout,
          validateStatus: () => true, // No lanzar error en cualquier status
        });

        logger.debug('✅ Response HTTP', {
          method: config.method,
          url: config.url,
          statusCode: response.status,
        });

        return response;
      } catch (error) {
        lastError = error;

        if (attempt === retries) {
          break; // Último intento
        }

        // Backoff exponencial: 1s, 2s, 4s, 8s
        const delay = Math.pow(2, attempt) * 1000;
        logger.warn('⚠️ Request falló, reintentando', {
          method: config.method,
          url: config.url,
          attempt: attempt + 1,
          nextRetryIn: `${delay}ms`,
          error: error instanceof Error ? error.message : String(error),
        });

        await TestUtils.sleep(delay);
      }
    }

    logger.error('❌ Request falló después de reintentos', {
      method: config.method,
      url: config.url,
      maxRetries: retries,
      error: lastError instanceof Error ? lastError.message : String(lastError),
    });

    throw lastError;
  }

  /**
   * Request genérico HTTP
   */
  private async request(
    method: string,
    path: string,
    data?: any,
    token?: string,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await this.requestWithRetry({
      method,
      url: path,
      data,
      headers,
    });

    return {
      statusCode: response.status,
      body: response.data,
      headers: response.headers,
    };
  }

  /**
   * GET request
   */
  async get(
    path: string,
    token?: string,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse> {
    logger.info('🔍 GET request', { path });
    return this.request('GET', path, undefined, token, customHeaders);
  }

  /**
   * POST request
   */
  async post(
    path: string,
    data: any,
    token?: string,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse> {
    logger.info('📝 POST request', { path, dataKeys: Object.keys(data || {}) });
    return this.request('POST', path, data, token, customHeaders);
  }

  /**
   * PUT request
   */
  async put(
    path: string,
    data: any,
    token?: string,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse> {
    logger.info('📝 PUT request', { path, dataKeys: Object.keys(data || {}) });
    return this.request('PUT', path, data, token, customHeaders);
  }

  /**
   * DELETE request
   */
  async delete(
    path: string,
    token?: string,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse> {
    logger.info('🗑️ DELETE request', { path });
    return this.request('DELETE', path, undefined, token, customHeaders);
  }

  /**
   * PATCH request
   */
  async patch(
    path: string,
    data: any,
    token?: string,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse> {
    logger.info('📝 PATCH request', { path, dataKeys: Object.keys(data || {}) });
    return this.request('PATCH', path, data, token, customHeaders);
  }

  /**
   * Validar respuesta de error (REGLA CRÍTICA)
   * 
   * Verifica que la estructura de error sea correcta
   */
  validateErrorResponse(
    response: ApiResponse,
    expectedStatusCode: number
  ): void {
    if (response.statusCode !== expectedStatusCode) {
      throw new Error(
        `❌ Status esperado ${expectedStatusCode}, recibido ${response.statusCode}`
      );
    }

    const body = response.body;

    if (!body.hasOwnProperty('success')) {
      throw new Error('❌ Response sin campo "success"');
    }

    if (body.success !== false) {
      throw new Error('❌ Success debe ser false en error response');
    }

    logger.info('✅ Error response válido', {
      statusCode: response.statusCode,
      message: body.message,
    });
  }

  /**
   * Validar respuesta de éxito (REGLA CRÍTICA)
   * 
   * Verifica que la estructura de éxito sea correcta
   */
  validateSuccessResponse(
    response: ApiResponse,
    expectedStatusCode: number = 200
  ): void {
    if (response.statusCode !== expectedStatusCode) {
      throw new Error(
        `❌ Status esperado ${expectedStatusCode}, recibido ${response.statusCode}`
      );
    }

    const body = response.body;

    if (!body.hasOwnProperty('success')) {
      throw new Error('❌ Response sin campo "success"');
    }

    if (body.success !== true) {
      throw new Error('❌ Success debe ser true en éxito response');
    }

    if (!body.hasOwnProperty('data')) {
      throw new Error('❌ Response sin campo "data"');
    }

    logger.info('✅ Success response válido', {
      statusCode: response.statusCode,
    });
  }

  /**
   * Obtener Base URL configurada
   */
  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Obtener timeout configurado
   */
  getTimeout(): number {
    return this.timeout;
  }
}

// Export singleton
export const apiHelper = new ApiHelper();

