/**
 * 🗄️ MONGODB HELPER - Database Integration
 * 
 * TESTING PURO Y DURO: Conexiones REALES a BD TEST
 * ✅ REGLA #2: URI desde variables de entorno
 * ✅ REGLA CRÍTICA: Tests validan queries REALES contra BD
 * ✅ REGLA #3: Logger estructurado
 */

import mongoose from 'mongoose';
import { createLogger } from '../../src/utility/logger.js';

const logger = createLogger('MongoDBHelper');

/**
 * Helper para operaciones de MongoDB en tests
 * Conecta a BD TEST y proporciona métodos para setup/cleanup
 */
export class MongoDBHelper {
  private mongoUri: string;
  private isConnected: boolean = false;

  constructor() {
    // ✅ REGLA #2: Cargar desde variables de entorno (no hardcoded)
    this.mongoUri = process.env.MONGODB_TEST_URI || '';

    if (!this.mongoUri) {
      logger.warn('⚠️ MongoDB TEST URI no configurada', {
        envVar: 'MONGODB_TEST_URI',
      });
    }

    logger.info('✅ MongoDBHelper inicializado', {
      hasUri: !!this.mongoUri,
    });
  }

  /**
   * Conectar a BD TEST
   * 
   * TESTING PURO Y DURO: Conexión real a MongoDB
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('ℹ️ Ya conectado a MongoDB');
      return;
    }

    try {
      logger.info('🔌 Conectando a MongoDB TEST', {
        uri: this.mongoUri
          ? `${this.mongoUri.split('@')[0]}...@${this.mongoUri.split('@')[1]}`
          : 'unknown',
      });

      await mongoose.connect(this.mongoUri, {
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 5000,
        retryWrites: false,
      });

      this.isConnected = true;

      const serverInfo = await mongoose.connection.db?.admin().serverInfo();

      logger.info('✅ Conectado a MongoDB TEST', {
        version: serverInfo?.version,
        databases: serverInfo?.totalSize
          ? `${Math.round(serverInfo.totalSize / 1024 / 1024)}MB`
          : 'unknown',
      });
    } catch (error) {
      logger.error('❌ Error conectando a MongoDB', {
        error: error instanceof Error ? error.message : String(error),
        uri: this.mongoUri.split('@')[1] || 'unknown',
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
      logger.info('🔌 Desconectando de MongoDB');

      await mongoose.disconnect();

      this.isConnected = false;
      logger.info('✅ Desconectado de MongoDB');
    } catch (error) {
      logger.error('❌ Error desconectando', {
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
    if (!this.isConnected) {
      return;
    }

    try {
      logger.info('🧹 Limpiando datos de test');

      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('No database connection');
      }

      // Eliminar documentos de test en products
      const productsResult = await db.collection('products').deleteMany({
        name: { $regex: '^test_', $options: 'i' },
      });

      logger.info('🗑️ Productos de test eliminados', {
        count: productsResult.deletedCount,
      });

      // Eliminar documentos de test en categories
      const categoriesResult = await db.collection('categories').deleteMany({
        name: { $regex: '^test_', $options: 'i' },
      });

      logger.info('🗑️ Categorías de test eliminadas', {
        count: categoriesResult.deletedCount,
      });

      // Eliminar documentos de test en deals
      const dealsResult = await db.collection('deals').deleteMany({
        name: { $regex: '^test_', $options: 'i' },
      });

      logger.info('🗑️ Deals de test eliminados', {
        count: dealsResult.deletedCount,
      });

      logger.info('✅ Datos de test limpiados', {
        total:
          productsResult.deletedCount +
          categoriesResult.deletedCount +
          dealsResult.deletedCount,
      });
    } catch (error) {
      logger.warn('⚠️ Error limpiando datos', {
        error: error instanceof Error ? error.message : String(error),
      });
      // No lanzar error, solo advertencia
    }
  }

  /**
   * Crear índices de test
   * 
   * Útil para setup de tests
   */
  async ensureIndexes(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('❌ No conectado a MongoDB');
    }

    try {
      logger.info('📋 Verificando/creando índices de test');

      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('No database connection');
      }

      // Crear índice único en email de usuarios
      await db.collection('products').createIndex({ name: 1 });

      // Crear índice en categorías
      await db.collection('categories').createIndex({ name: 1 });

      logger.info('✅ Índices verificados/creados');
    } catch (error) {
      logger.warn('⚠️ Error creando índices', {
        error: error instanceof Error ? error.message : String(error),
      });
      // No lanzar error, solo advertencia
    }
  }

  /**
   * Ejecutar aggregation
   */
  async aggregate(collection: string, pipeline: any[]): Promise<any[]> {
    if (!this.isConnected) {
      throw new Error('❌ No conectado a MongoDB');
    }

    try {
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('No database connection');
      }

      const result = await db
        .collection(collection)
        .aggregate(pipeline)
        .toArray();

      logger.debug('📊 Aggregation ejecutado', {
        collection,
        pipelineStages: pipeline.length,
        resultCount: result.length,
      });

      return result;
    } catch (error) {
      logger.error('❌ Error en aggregation', {
        collection,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Verificar si está conectado
   */
  isConnectedToDb(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Obtener conexión mongoose con acceso a db.collection()
   * @returns mongoose.Connection (o null si no conectado)
   */
  getConnection(): any {
    return mongoose.connection;
  }
}

// Export singleton
export const mongodbHelper = new MongoDBHelper();

