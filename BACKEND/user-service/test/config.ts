/**
 * 📋 TEST_CONFIG - Configuración Centralizada para Tests
 * 
 * REGLA CRÍTICA: Consistencia Tests ↔ Código
 * - Todos los timeouts, URLs y credenciales de test centralizadas aquí
 * - SIN datos sensibles (usar .env.test)
 * - NUNCA hardcodear valores directamente en tests
 */

export const TEST_CONFIG = {
  // ========================================
  // API Configuration
  // ========================================
  API_BASE_URL: process.env.API_BASE_URL || (() => {
    throw new Error('API_BASE_URL no configurado en .env.test');
  })(),
  
  COGNITO_POOL_ID: process.env.COGNITO_POOL_ID || (() => {
    throw new Error('COGNITO_POOL_ID no configurado en .env.test');
  })(),
  
  COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID || '',
  COGNITO_DOMAIN: process.env.COGNITO_DOMAIN || '',

  // ========================================
  // Database Configuration (PostgreSQL)
  // ========================================
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432'),
  DB_USER: process.env.DB_USER || 'test_user',
  DB_PASSWORD: process.env.DB_PASSWORD || 'test_password',
  DB_NAME: process.env.DB_NAME || 'evilent_test',
  DB_SSL: process.env.DB_SSL === 'true',

  // ========================================
  // Timeouts (ms)
  // ========================================
  TIMEOUTS: {
    HTTP_REQUEST: 30000,        // 30s para requests HTTP
    DATABASE_OPERATION: 10000,  // 10s para operaciones DB
    COGNITO_AUTH: 15000,        // 15s para autenticación Cognito
  },

  // ========================================
  // Retries
  // ========================================
  RETRIES: {
    HTTP_REQUEST: 3,
    DATABASE_CONNECTION: 5,
  },

  // ========================================
  // Test Users (SOLO para tests)
  // ========================================
  TEST_USERS: {
    TEST_USER_1: {
      email: 'test.user.1@example.com',
      password: 'TempPass123!',
    },
    TEST_USER_2: {
      email: 'test.user.2@example.com',
      password: 'TempPass123!',
    },
  },

  // ========================================
  // Cleanup Configuration
  // ========================================
  CLEANUP: {
    ENABLED: true,
    DELETE_TEST_DATA: true,
    MAX_CLEANUP_TIME: 60000, // 1 minuto máximo
  },

  // ========================================
  // Environment
  // ========================================
  ENVIRONMENT: process.env.ENVIRONMENT || 'test',
  NODE_ENV: process.env.NODE_ENV || 'test',
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
};

/**
 * 🛠️ Test Utilities
 * 
 * Utilidades reutilizables para tests
 * NUNCA hardcodear lógica de test helper directamente en tests
 */
export class TestUtils {
  /**
   * Genera un email único para tests
   * Evita conflictos cuando se crean múltiples usuarios de test
   */
  static generateUniqueEmail(baseEmail: string): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substr(2, 9);
    const [localPart, domain] = baseEmail.split('@');
    return `${localPart}+${timestamp}${randomStr}@${domain}`;
  }

  /**
   * Genera un ID único para tests
   * Útil para identificar datos de test en logs
   */
  static generateUniqueId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `test_${timestamp}_${random}`;
  }

  /**
   * Genera un UUID v4 válido
   * Para campos que requieren UUIDs
   */
  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Pausa ejecución durante N milisegundos
   * Útil para tests que requieren esperar
   */
  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Simula un retry con backoff exponencial
   * Útil para tests de integración con APIs inestables
   */
  static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        const delay = baseDelay * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }
    throw new Error('Should not reach here');
  }

  /**
   * Valida estructura de respuesta de API
   * Verifica que tenga los campos esperados
   */
  static validateApiResponse(response: any): boolean {
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
   * Parsa y valida JSON en body de respuesta
   * REGLA CRÍTICA: Validar formato exacto del código
   */
  static parseResponseBody(body: string): any {
    try {
      return JSON.parse(body);
    } catch (error) {
      throw new Error(`Invalid JSON in response body: ${body}`);
    }
  }
}

