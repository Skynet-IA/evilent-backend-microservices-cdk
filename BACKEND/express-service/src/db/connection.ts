/**
 * Database Connection - PostgreSQL
 * 
 * REGLA DE ORO: Centralizar conexión a BD
 * - Connection pooling
 * - Error handling
 * - Logging estructurado
 */

import { Pool, PoolClient } from 'pg';
import logger from '../utility/logger';

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  max: number; // Pool size
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

const getDatabaseConfig = (): DatabaseConfig => {
  const isTest = process.env.NODE_ENV === 'test';
  
  return {
    host: isTest ? process.env.TEST_DB_HOST! : process.env.DB_HOST!,
    port: parseInt(isTest ? process.env.TEST_DB_PORT! : process.env.DB_PORT!),
    user: isTest ? process.env.TEST_DB_USER! : process.env.DB_USER!,
    password: isTest ? process.env.TEST_DB_PASSWORD! : process.env.DB_PASSWORD!,
    database: isTest ? process.env.TEST_DB_NAME! : process.env.DB_NAME!,
    max: isTest ? 5 : 20, // Menos conexiones en test
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
};

// ============================================================================
// CONNECTION POOL
// ============================================================================

/**
 * Pool de conexiones global
 * Reutiliza conexiones para mejor performance
 */
let pool: Pool | null = null;

/**
 * Obtener o crear el pool de conexiones
 */
export const getPool = (): Pool => {
  if (!pool) {
    const config = getDatabaseConfig();
    
    pool = new Pool(config);

    // Logging de eventos del pool
    pool.on('connect', (_client) => {
      logger.debug('Database connection established', {
        host: config.host,
        database: config.database,
      });
    });

    pool.on('error', (err: Error) => {
      logger.error('Unexpected error on idle client', {
        error: err.message,
      });
    });
  }

  return pool;
};

// ============================================================================
// CONNECTION METHODS
// ============================================================================

/**
 * Ejecutar query con conexión del pool
 */
export const query = async (text: string, params?: any[]): Promise<any> => {
  const p = getPool();
  
  try {
    const startTime = Date.now();
    const result = await p.query(text, params);
    const duration = Date.now() - startTime;

    logger.debug('Database query executed', {
      duration,
      rowCount: result.rowCount,
      command: result.command,
    });

    return result;
  } catch (error: any) {
    logger.error('Database query error', {
      query: text,
      params,
      error: error.message,
      code: error.code,
    });
    throw error;
  }
};

/**
 * Obtener una conexión del pool (para transacciones)
 */
export const getClient = async (): Promise<PoolClient> => {
  const p = getPool();
  
  try {
    const client = await p.connect();
    logger.debug('Database client acquired from pool');
    return client;
  } catch (error: any) {
    logger.error('Failed to acquire database client', {
      error: error.message,
    });
    throw error;
  }
};

/**
 * Verificar conexión a la BD
 * Útil para health checks
 */
export const checkConnection = async (): Promise<boolean> => {
  try {
    const p = getPool();
    const result = await p.query('SELECT NOW()');
    
    if (result.rows.length > 0) {
      logger.info('Database connection check successful');
      return true;
    }
    
    return false;
  } catch (error: any) {
    logger.error('Database connection check failed', {
      error: error.message,
    });
    return false;
  }
};

/**
 * Cerrar todas las conexiones del pool
 * Llamar en shutdown de la aplicación
 */
export const closePool = async (): Promise<void> => {
  if (pool) {
    try {
      await pool.end();
      logger.info('Database pool closed successfully');
      pool = null;
    } catch (error: any) {
      logger.error('Error closing database pool', {
        error: error.message,
      });
    }
  }
};

/**
 * Helper para ejecutar queries con retry logic
 */
export const queryWithRetry = async (
  text: string,
  params?: any[],
  maxRetries: number = 3,
  delayMs: number = 100
): Promise<any> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await query(text, params);
    } catch (error: any) {
      lastError = error;

      // Retry solo en ciertos errores
      const retryable = error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT';
      
      if (attempt < maxRetries && retryable) {
        logger.warn('Database query retry', {
          attempt,
          maxRetries,
          error: error.message,
          delay: delayMs * attempt,
        });

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      } else {
        break;
      }
    }
  }

  throw lastError;
};

