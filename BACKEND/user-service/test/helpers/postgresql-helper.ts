/**
 * 🗄️ POSTGRESQL HELPER - Database Integration
 * 
 * TESTING PURO Y DURO: Conexiones REALES a BD TEST
 * ✅ REGLA #2: URI desde variables de entorno
 * ✅ REGLA CRÍTICA: Tests validan queries REALES contra BD
 * ✅ REGLA #3: Logger estructurado
 */

import { Pool, PoolClient } from 'pg';
import { createLogger } from '../../src/utility/logger.js';

const logger = createLogger('PostgreSQLHelper');

/**
 * Helper para operaciones de PostgreSQL en tests
 * Conecta a BD TEST y proporciona métodos para setup/cleanup
 */
export class PostgreSQLHelper {
  private pool: Pool | null = null;
  private client: PoolClient | null = null;
  private dbUri: string;
  private isConnected: boolean = false;

  constructor() {
    // ✅ REGLA #2: Cargar desde variables de entorno (no hardcoded)
    this.dbUri = process.env.POSTGRES_TEST_URI || '';

    if (!this.dbUri) {
      logger.warn('⚠️ PostgreSQL TEST URI no configurada', {
        envVar: 'POSTGRES_TEST_URI',
      });
    }

    logger.info('✅ PostgreSQLHelper inicializado', {
      hasUri: !!this.dbUri,
    });
  }

  /**
   * Conectar a BD TEST
   * 
   * TESTING PURO Y DURO: Conexión real a PostgreSQL
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('ℹ️ Ya conectado a PostgreSQL');
      return;
    }

    try {
      logger.info('🔌 Conectando a PostgreSQL TEST', {
        uri: this.dbUri.split('@')[1] || 'unknown', // Solo mostrar host
      });

      // Crear pool de conexiones
      this.pool = new Pool({
        connectionString: this.dbUri,
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Obtener conexión de prueba
      this.client = await this.pool.connect();

      // Verificar conexión
      const result = await this.client.query('SELECT NOW()');
      logger.info('✅ Conectado a PostgreSQL TEST', {
        timestamp: result.rows[0].now,
      });

      this.isConnected = true;
    } catch (error) {
      logger.error('❌ Error conectando a PostgreSQL', {
        error: error instanceof Error ? error.message : String(error),
        uri: this.dbUri.split('@')[1] || 'unknown',
      });
      throw error;
    }
  }

  /**
   * Desconectar de BD TEST
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      logger.info('🔌 Desconectando de PostgreSQL');

      if (this.client) {
        await this.client.release();
      }

      if (this.pool) {
        await this.pool.end();
      }

      this.isConnected = false;
      logger.info('✅ Desconectado de PostgreSQL');
    } catch (error) {
      logger.error('❌ Error desconectando', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Ejecutar query en BD TEST
   * 
   * TESTING PURO Y DURO: Query real contra BD
   */
  async query(sql: string, params?: any[]): Promise<any> {
    if (!this.pool) {
      throw new Error('❌ No conectado a PostgreSQL');
    }

    try {
      logger.debug('📝 Ejecutando query', {
        sql: sql.substring(0, 50),
        paramsCount: params?.length || 0,
      });

      const result = await this.pool.query(sql, params);

      logger.debug('✅ Query ejecutada', {
        rowCount: result.rowCount,
      });

      return result;
    } catch (error) {
      logger.error('❌ Error en query', {
        sql: sql.substring(0, 50),
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Limpiar datos de test
   * 
   * Elimina todos los datos de test creados durante la prueba
   */
  async cleanupTestData(): Promise<void> {
    if (!this.pool) {
      return;
    }

    try {
      logger.info('🧹 Limpiando datos de test');

      // Eliminar usuarios de test (creados_con prefijo test_)
      await this.pool.query(
        "DELETE FROM users WHERE email LIKE 'test_%@example.com'"
      );

      // Eliminar sesiones de test
      await this.pool.query(
        "DELETE FROM sessions WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE 'test_%@example.com')"
      );

      logger.info('✅ Datos de test limpiados');
    } catch (error) {
      logger.warn('⚠️ Error limpiando datos', {
        error: error instanceof Error ? error.message : String(error),
      });
      // No lanzar error, solo advertencia
    }
  }

  /**
   * Crear tabla de test
   * 
   * Útil para setup de tests
   */
  async createTestTables(): Promise<void> {
    if (!this.pool) {
      throw new Error('❌ No conectado a PostgreSQL');
    }

    try {
      logger.info('📋 Creando tablas de test');

      // Las tablas deberían existir si la migración se ejecutó
      // Este es solo un helper de verificación
      const result = await this.pool.query(
        `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users')`
      );

      if (!result.rows[0].exists) {
        logger.warn(
          '⚠️ Tabla users no existe. Ejecutar migraciones primero'
        );
      } else {
        logger.info('✅ Tablas existentes verificadas');
      }
    } catch (error) {
      logger.error('❌ Error verificando tablas', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Verificar si está conectado
   */
  isConnectedToDb(): boolean {
    return this.isConnected;
  }

  /**
   * Obtener pool (para queries avanzadas)
   */
  getPool(): Pool | null {
    return this.pool;
  }
}

// Export singleton
export const postgresqlHelper = new PostgreSQLHelper();

