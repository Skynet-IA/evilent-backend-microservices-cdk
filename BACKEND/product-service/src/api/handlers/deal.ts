import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { createLogger } from "../../utility/logger.js";
import { AuthMiddleware, UnauthorizedError } from "../middleware/auth-middleware.js";
import { UnauthorizedResponse, ErrorResponse } from "../../utility/response.js";
import { ensureDatabaseConnection } from "../../db/index.js";

const logger = createLogger('DealHandler');

/**
 * 🎯 Handler principal para el servicio de deals
 *
 * ARQUITECTURA HÍBRIDA (Regla #9 + Regla Platino):
 * - ✅ Middleware reutilizable (AuthMiddleware)
 * - ✅ Route Map declarativo (escalable)
 * - ✅ Defense in Depth (JWT en API Gateway + Lambda)
 * - ✅ Manejo de errores centralizado
 *
 * Esta arquitectura combina lo mejor de ambos mundos:
 * 1. Middleware modular y testeable
 * 2. Routing declarativo y escalable
 *
 * TODO: Implementar lógica de negocio para deals cuando esté lista
 */

/**
 * 🛣️ Definición de tipos para Route Map declarativo
 */
type RouteHandler = (event: APIGatewayEvent) => Promise<APIGatewayProxyResult>;

interface Route {
    method: string;
    requiresPathParams: boolean;
    handler: RouteHandler;
    description: string;
}

export const handler = async (
    event: APIGatewayEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {

    const requestId = context.awsRequestId;
    const startTime = Date.now();

    try {
        // ========================================
        // 📊 LOGGING: Request iniciada
        // ========================================
        logger.info('Request iniciada', {
            requestId,
            method: event.httpMethod,
            path: event.path,
        });

        // ========================================
        // 🔐 AUTENTICACIÓN JWT (Middleware reutilizable)
        // ========================================
        // REGLA #6: Defense in Depth
        // Capa 1: API Gateway Authorizer (ya validó el token)
        // Capa 2: Lambda JWT Verification (validación adicional)
        const claims = await AuthMiddleware.authenticate(event);

        logger.info('Usuario autenticado (JWT verificado)', {
            userIdHash: claims.userId.substring(0, 8),
            hasEmail: !!claims.userEmail
        });

        // ========================================
        // 💾 ASEGURAR CONEXIÓN A BASE DE DATOS
        // ========================================
        await ensureDatabaseConnection();

        // ========================================
        // 🛣️ ROUTE MAP DECLARATIVO (Regla Platino)
        // ========================================
        // Patrón escalable: Agregar ruta = agregar objeto al array
        // NO modificar lógica de matching
        const method = event.httpMethod.toLowerCase();
        const hasPathParams = event.pathParameters !== null;

        // TODO: Implementar rutas cuando el servicio de deals esté listo
        const routes: Route[] = [
            {
                method: 'get',
                requiresPathParams: false,
                handler: async (e) => {
                    return {
                        statusCode: 200,
                        body: JSON.stringify({ 
                            success: true,
                            message: 'Deal service - Coming soon',
                            data: []
                        }),
                        headers: { 'Content-Type': 'application/json' }
                    };
                },
                description: 'GET /deal - Listar deals (placeholder)'
            }
        ];

        logger.debug('Routing request', {
            method,
            path: event.path,
            hasPathParams,
            userIdHash: claims.userId.substring(0, 8) + '...'
        });

        // ========================================
        // 🔍 BUSCAR RUTA QUE COINCIDA
        // ========================================
        const matchedRoute = routes.find(
            route => route.method === method && route.requiresPathParams === hasPathParams
        );

        if (!matchedRoute) {
            logger.warn('Ruta no encontrada', {
                method,
                path: event.path,
                hasPathParams,
                availableRoutes: routes.map(r => r.description)
            });

            return {
                statusCode: 404,
                body: JSON.stringify({
                    success: false,
                    message: `Ruta ${event.path} con método ${event.httpMethod} no encontrada`,
                    data: {
                        availableRoutes: routes.map(r => r.description)
                    }
                }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

        logger.debug('Ruta encontrada', { description: matchedRoute.description });

        // ========================================
        // ✅ EJECUTAR HANDLER Y RETORNAR RESPONSE
        // ========================================
        const result = await matchedRoute.handler(event);

        const duration = Date.now() - startTime;
        logger.info('Request completada exitosamente', {
            requestId,
            statusCode: result.statusCode,
            duration: `${duration}ms`,
            userIdHash: claims.userId.substring(0, 8)
        });

        return result;

    } catch (error) {
        // ========================================
        // ❌ MANEJO CENTRALIZADO DE ERRORES
        // ========================================
        const duration = Date.now() - startTime;

        if (error instanceof UnauthorizedError) {
            logger.warn('Error de autenticación', {
                requestId,
                error: error.message,
                duration: `${duration}ms`,
                method: event.httpMethod,
                path: event.path
            });

            return UnauthorizedResponse(error.message);

        } else {
            logger.error('Error inesperado no manejado', {
                requestId,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                duration: `${duration}ms`,
                method: event.httpMethod,
                path: event.path
            });

            return ErrorResponse(error);
        }
    }
};

