import mongoose from 'mongoose';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { createLogger } from '../utility/logger.js';
import {
    MONGODB_MAX_POOL_SIZE,
    MONGODB_MIN_POOL_SIZE,
    MONGODB_SERVER_SELECTION_TIMEOUT_MS,
    MONGODB_SOCKET_TIMEOUT_MS,
    MONGODB_CONNECT_TIMEOUT_MS,
    MONGODB_MAX_IDLE_TIME_MS,
    MONGODB_RETRY_WRITES,
    MONGODB_RETRY_READS,
    MONGODB_AUTO_INDEX
} from '../config/constants.js';

const logger = createLogger('DBConnection');

mongoose.set('strictQuery', false);

interface MongoDBCredentials {
    MONGODB_URI: string;
}

let credentialsCache: MongoDBCredentials | null = null;

/**
 * Obtiene credenciales de MongoDB desde AWS Secrets Manager.
 * En producción, MONGODB_SECRET_ARN DEBE estar configurado.
 * Si no está disponible, lanza error inmediato.
 */
async function getMongoDBCredentials(): Promise<MongoDBCredentials> {
    if (credentialsCache) {
        return credentialsCache;
    }

    const secretArn = process.env.MONGODB_SECRET_ARN;
    if (!secretArn) {
        throw new Error('Base de datos no configurada. MONGODB_SECRET_ARN no está disponible en variables de entorno.');
    }

    try {
        const secretsClient = new SecretsManagerClient({});

        const command = new GetSecretValueCommand({ SecretId: secretArn });
        const response = await Promise.race([
            secretsClient.send(command),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Secrets Manager timeout - no response after 5 seconds')), 5000)
            )
        ]);

        if (!response.SecretString) {
            throw new Error('Secret no contiene SecretString');
        }

        const secret = JSON.parse(response.SecretString);

        credentialsCache = {
            MONGODB_URI: secret.MONGODB_URI
        };

        logger.info('Credenciales obtenidas de Secrets Manager');
        return credentialsCache;
    } catch (error) {
        credentialsCache = null;
        logger.error('Error obteniendo credenciales de MongoDB', error);
        throw error;
    }
}

/**
 * 🔌 Establece conexión a MongoDB con configuración optimizada para Lambda
 *
 * REGLA #2: Credenciales desde AWS Secrets Manager (nunca hardcoded)
 * REGLA #4: Constantes centralizadas (de src/config/constants.ts)
 * REGLA #10: Costos optimizados - Connection pooling eficiente
 * REGLA PLATINO: Configuración escalable y mantenible
 *
 * Configuración optimizada para AWS Lambda:
 * - Connection pooling: Configurable via variables de entorno
 * - Timeouts configurados para evitar Lambda timeouts
 * - Retry logic para operaciones transitorias
 * - Auto-cerrar conexiones inactivas para reducir costos
 * - Constantes centralizadas para fácil configuración
 */
export const dbConnection = async () => {
    try {
        // Obtener credenciales de AWS Secrets Manager (siempre en producción)
        const credentials = await getMongoDBCredentials();
        const mongoUri = credentials.MONGODB_URI;

        // ✅ Configuración optimizada para Lambda - CONSTANTES CENTRALIZADAS
        await mongoose.connect(mongoUri, {
            // ========================================
            // CONNECTION POOLING - REGLA #10: Costos optimizados
            // ========================================
            maxPoolSize: MONGODB_MAX_POOL_SIZE,        // Máximo conexiones por Lambda instance
            minPoolSize: MONGODB_MIN_POOL_SIZE,         // Mínimo conexiones para warm starts

            // ========================================
            // TIMEOUTS - REGLA #10: Optimización de costos
            // ========================================
            serverSelectionTimeoutMS: MONGODB_SERVER_SELECTION_TIMEOUT_MS,  // Timeout selección servidor
            socketTimeoutMS: MONGODB_SOCKET_TIMEOUT_MS,          // Timeout operaciones
            connectTimeoutMS: MONGODB_CONNECT_TIMEOUT_MS,         // Timeout conexión inicial

            // ========================================
            // RETRY LOGIC - REGLA #6: Defense in depth
            // ========================================
            retryWrites: MONGODB_RETRY_WRITES,      // Reintentar escrituras fallidas
            retryReads: MONGODB_RETRY_READS,       // Reintentar lecturas fallidas

            // ========================================
            // PERFORMANCE Y COSTOS - REGLA #10: Optimización
            // ========================================
            maxIdleTimeMS: MONGODB_MAX_IDLE_TIME_MS,   // Cerrar conexiones inactivas
            autoIndex: MONGODB_AUTO_INDEX,       // No crear índices automáticamente

            // ========================================
            // COMPRESSION - REGLA #10: Reduce ancho de banda/costos
            // ========================================
            compressors: ['zlib'],  // Comprimir datos en tránsito
        });

        logger.info('MongoDB connection established via Secrets Manager', {
            maxPoolSize: MONGODB_MAX_POOL_SIZE,
            minPoolSize: MONGODB_MIN_POOL_SIZE,
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            database: mongoose.connection.name
        });
    } catch (error) {
        logger.error('Error connecting to MongoDB', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            errorName: error instanceof Error ? error.name : undefined
        });
        throw new Error('Error connecting to MongoDB');
    }
}
