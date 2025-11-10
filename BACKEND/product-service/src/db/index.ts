import mongoose from 'mongoose';
import { dbConnection } from './db-connection.js';
import { createLogger } from '../utility/logger.js';

const logger = createLogger('Database');

/**
 * 🔍 Verifica si la conexión está realmente activa
 * No solo un flag booleano - verifica el estado real de mongoose
 * 
 * REGLA PLATINO: Código escalable y mantenible
 * - Verifica estado real de conexión, no solo un flag
 * - Previene conexiones muertas en Lambda warm starts
 * - Permite reconexión automática si la conexión se pierde
 */
function isMongooseConnected(): boolean {
    // mongoose.connection.readyState:
    // 0 = disconnected
    // 1 = connected
    // 2 = connecting
    // 3 = disconnecting
    return mongoose.connection.readyState === 1;
}

/**
 * 🔄 Asegura conexión a MongoDB con reconexión automática
 * 
 * Verifica estado real de la conexión, no solo un flag booleano.
 * Si la conexión está muerta (timeout, red, MongoDB restart), reconecta automáticamente.
 * 
 * REGLA #3: Logger estructurado con contexto
 * REGLA PLATINO: Código resiliente y escalable para producción
 */
export const ensureDatabaseConnection = async (): Promise<void> => {
    if (isMongooseConnected()) {
        logger.debug('MongoDB connection already active', {
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host
        });
        return; // Conexión activa y saludable
    }

    try {
        logger.info('Establishing MongoDB connection...', {
            currentReadyState: mongoose.connection.readyState
        });
        
        await dbConnection();
        
        logger.info('MongoDB connection established successfully', {
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            database: mongoose.connection.name
        });
    } catch (error: any) {
        logger.error('Failed to connect to MongoDB', {
            error: error.message,
            stack: error.stack,
            readyState: mongoose.connection.readyState,
            errorCode: error.code
        });
        throw new Error(`MongoDB connection error: ${error.message}`);
    }
};