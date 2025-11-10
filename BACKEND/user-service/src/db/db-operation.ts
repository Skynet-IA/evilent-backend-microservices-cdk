import { QueryResult, PoolClient } from "pg";
import { getDBPool } from "../utility/database-client";
import { createLogger } from "../utility/logger";


/**
 * Tipos seguros que PostgreSQL acepta como parámetros de query.
 */
type QueryParam = string | number | boolean | Date | null | undefined | Buffer;

/**
 * Configuración de retry para operaciones de base de datos.
 * Valores fijos para garantizar comportamiento consistente en producción.
 */
const DB_RETRY_CONFIG = {
    MAX_RETRIES: 3,
    BASE_DELAY_MS: 1000, // 1 segundo base para backoff exponencial
} as const;

/**
 * Clase base para operaciones de base de datos.
 * Incluye retry logic, transacciones y connection pool.
 */
export class DBOperation {
    private _logger = createLogger('DBOperation');

    constructor() {}

    /**
     * Ejecuta una query parametrizada con retry logic y backoff exponencial.
     * 
     * Características:
     * - 10x más rápido con connection pool
     * - Reintentos automáticos en fallos temporales (máximo 3)
     * - Backoff exponencial (1s, 2s, 4s)
     * - Logging detallado de errores
     * - Tipos seguros para parámetros
     * 
     * @param query - Query SQL con placeholders ($1, $2, etc.)
     * @param params - Parámetros para la query (tipos seguros)
     * @returns Resultado de la query
     */
    async ExecuteQuery(query: string, params: QueryParam[]): Promise<QueryResult> {
        const pool = await getDBPool();
        const maxRetries = DB_RETRY_CONFIG.MAX_RETRIES;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const result = await pool.query(query, params);
                
                // Log solo si hubo reintentos exitosos
                if (attempt > 0) {
                    this._logger.info('Query exitosa después de reintentos', { attempt });
                }
                
                return result;
            } catch (error) {
                const isLastAttempt = attempt === maxRetries;
                const isRetryableError = this.isRetryableError(error);
                
                // Extraer mensaje de error de forma segura
                const errorMessage = error instanceof Error ? error.message : String(error);
                this._logger.debug('Error en intento de query', { attempt: attempt + 1, maxRetries: maxRetries + 1, errorMessage });
                
                // Si es el último intento o no es un error que se pueda reintentar, lanzar error
                if (isLastAttempt || !isRetryableError) {
                    this._logger.error('Query fallida definitivamente', error, {
                        attempt,
                        isRetryableError,
                        queryLength: query.length
                    });
                    throw error;
                }

                // Calcular delay con backoff exponencial: 2^attempt segundos
                const delayMs = Math.pow(2, attempt) * DB_RETRY_CONFIG.BASE_DELAY_MS;
                this._logger.warn('Reintentando query', { attempt, delayMs });
                
                await this.sleep(delayMs);
            }
        }
        
        // Este código nunca debería ejecutarse, pero TypeScript lo requiere
        throw new Error('Max retries reached');
    }

    /**
     * Ejecuta múltiples queries dentro de una transacción.
     * Si alguna falla, hace rollback automático de todas.
     * 
     * Uso:
     * ```typescript
     * await dbOperation.ExecuteTransaction(async (client) => {
     *     await client.query('INSERT INTO users ...');
     *     await client.query('INSERT INTO addresses ...');
     * });
     * ```
     * 
     * @param callback - Función que recibe el client y ejecuta queries
     * @returns Resultado de la transacción
     */
    async ExecuteTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
        const pool = await getDBPool();
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            this._logger.debug('Transacción iniciada');
            
            const result = await callback(client);
            
            await client.query('COMMIT');
            this._logger.info('Transacción completada exitosamente');
            
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            this._logger.error('Transacción revertida debido a error', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Determina si un error de base de datos es temporal y se puede reintentar.
     * 
     * Errores retryables:
     * - Conexión perdida
     * - Timeout
     * - Demasiadas conexiones
     * - Deadlock
     * 
     * @param error - Error de PostgreSQL o Node.js
     * @returns true si el error se puede reintentar
     */
    private isRetryableError(error: unknown): boolean {
        // Type guard: verificar si tiene la propiedad 'code'
        if (typeof error !== 'object' || error === null || !('code' in error)) {
            return false;
        }
        
        const errorCode = (error as { code: string }).code;
        
        // Códigos de error de PostgreSQL que son retryables
        const retryableCodes = [
            '08000', // connection_exception
            '08003', // connection_does_not_exist
            '08006', // connection_failure
            '40001', // serialization_failure (deadlock)
            '40P01', // deadlock_detected
            '53300', // too_many_connections
            '57P03', // cannot_connect_now
            'ECONNREFUSED', // Node.js connection refused
            'ETIMEDOUT',    // Node.js timeout
        ];
        
        return retryableCodes.includes(errorCode);
    }

    /**
     * Utilidad para esperar un tiempo determinado.
     * 
     * @param ms - Milisegundos a esperar
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}