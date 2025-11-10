import { Pool } from 'pg';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { createLogger } from './logger.js';
import { 
    DB_PORT, 
    DB_DEFAULT_NAME, 
    DB_POOL_MAX, 
    DB_POOL_MIN, 
    DB_POOL_IDLE_TIMEOUT_MS, 
    DB_CONNECTION_TIMEOUT_MS 
} from '../config/index.js';

const logger = createLogger('DatabaseClient');

interface DBCredentials {
    username: string;
    password: string;
    host: string;
    port: number;
    dbname: string;
}

let poolInstance: Pool | null = null;
let credentialsCache: DBCredentials | null = null;

/**
 * Obtiene credenciales de AWS Secrets Manager.
 * En producción, DB_SECRET_ARN DEBE estar configurado.
 * Si no está disponible, lanza error inmediato.
 */
async function getDBCredentials(): Promise<DBCredentials> {
    if (credentialsCache) {
        return credentialsCache;
    }

    const secretArn = process.env.DB_SECRET_ARN;
    if (!secretArn) {
        throw new Error('Base de datos no configurada. DB_SECRET_ARN no está disponible en variables de entorno.');
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
            username: secret.username,
            password: secret.password,
            host: process.env.DB_ENDPOINT || secret.host,
            port: secret.port || DB_PORT,
            dbname: process.env.DB_NAME || secret.dbname || DB_DEFAULT_NAME,
        };

        logger.info('Credenciales obtenidas de Secrets Manager');
        logger.info('Conectando directamente a RDS (sin Proxy)', {
            hasEndpoint: !!process.env.DB_ENDPOINT,
            hasDbName: !!process.env.DB_NAME
        });
        
        return credentialsCache;
    } catch (error) {
        credentialsCache = null;
        logger.error('Error obteniendo credenciales', error);
        throw error;
    }
}

/**
 * Obtiene el connection pool de PostgreSQL (singleton).
 * Optimizado para Lambda con conexión directa a RDS (sin Proxy).
 */
export const getDBPool = async (): Promise<Pool> => {
    if (poolInstance) {
        return poolInstance;
    }

    // Detectar si estamos ejecutando tests con túnel SSM
    const isTunnelMode = process.env.TUNNEL_MODE === 'true' ||
                        process.env.TUNNEL_AUTO_MODE === 'true' ||
                        (process.env.DB_ENDPOINT?.includes('localhost') && process.env.TUNNEL_MODE !== 'false') ||
                        (process.env.FORCE_DIRECT_DB === 'true' && process.env.NODE_ENV === 'test');

    let credentials: any;

    if (isTunnelMode) {
        // Modo túnel: conectar via localhost (túnel SSM)
        logger.info('Conectando via túnel SSM a RDS', {
            tunnelEndpoint: 'localhost:5432',
            actualEndpoint: process.env.DB_ENDPOINT,
            database: process.env.DB_NAME,
            tunnelMode: true
        });

        // ✅ CORRECCIÓN: Fail-fast sin fallbacks
        if (!process.env.DB_USER || !process.env.DB_PASSWORD) {
            throw new Error('DB_USER y DB_PASSWORD requeridos en modo túnel');
        }

        credentials = {
            host: 'localhost',  // Siempre localhost en modo túnel
            port: DB_PORT,
            database: process.env.DB_NAME || DB_DEFAULT_NAME,
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        };
    } else if (process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_ENDPOINT) {
        // Modo directo: usar variables de entorno (para tests)
        logger.info('Conectando directamente a RDS con variables de entorno', {
            host: process.env.DB_ENDPOINT,
            database: process.env.DB_NAME,
            hasCredentials: !!(process.env.DB_USER && process.env.DB_PASSWORD)
        });

        credentials = {
            host: process.env.DB_ENDPOINT,
            port: DB_PORT,
            database: process.env.DB_NAME || DB_DEFAULT_NAME,
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        };
    } else {
        // Modo normal: obtener credenciales de Secrets Manager
        credentials = await getDBCredentials();
    }

    poolInstance = new Pool({
        host: credentials.host,
        port: credentials.port,
        database: credentials.database || credentials.dbname,
        user: credentials.username,
        password: credentials.password,

        // Configuración optimizada para Lambda
        max: DB_POOL_MAX,
        min: DB_POOL_MIN,
        idleTimeoutMillis: DB_POOL_IDLE_TIMEOUT_MS,
        connectionTimeoutMillis: DB_CONNECTION_TIMEOUT_MS,
        allowExitOnIdle: true,

        // SSL siempre habilitado para RDS (requerido)
        ssl: {
            rejectUnauthorized: false,
        },
    });

    logger.info('Connection pool creado exitosamente', {
        host: credentials.host,
        port: credentials.port,
        database: credentials.database || credentials.dbname
    });

    poolInstance.on('error', (err) => {
        logger.error('Error inesperado en el connection pool', err);
    });

    return poolInstance;
};
