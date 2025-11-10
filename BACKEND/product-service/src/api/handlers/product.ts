import { ProductService } from "../../service/index.js";
import { ProductRepository, CategoryRepository } from "../../repository/index.js";
import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { createLogger } from "../../utility/logger.js";
import { AuthMiddleware } from "../middleware/auth-middleware.js";
import { ApiError, UnauthorizedError } from "../../types/api-types.js";
import { UnauthorizedResponse, ErrorResponse } from "../../utility/response.js";
import { ensureDatabaseConnection } from "../../db/index.js";

const service = new ProductService(new ProductRepository(), new CategoryRepository());
const logger = createLogger('ProductHandler');

/**
 * 🎯 Handler principal para el servicio de productos
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

        const routes: Route[] = [
            {
                method: 'get',
                requiresPathParams: false,
                handler: (e) => service.GetProducts(e),
                description: 'GET /product - Listar productos'
            },
            {
                method: 'get',
                requiresPathParams: true,
                handler: (e) => service.GetProduct(e),
                description: 'GET /product/{id} - Obtener producto por ID'
            },
            {
                method: 'post',
                requiresPathParams: false,
                handler: (e) => service.CreateProduct(e),
                description: 'POST /product - Crear producto'
            },
            {
                method: 'put',
                requiresPathParams: true,
                handler: (e) => service.UpdateProduct(e),
                description: 'PUT /product/{id} - Actualizar producto'
            },
            {
                method: 'delete',
                requiresPathParams: true,
                handler: (e) => service.DeletProduct(e),
                description: 'DELETE /product/{id} - Eliminar producto'
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
        // ✅ REGLA #6: Defense in Depth
        // ========================================
        const duration = Date.now() - startTime;

        // Manejo de ApiError (errores esperados)
        if (error instanceof ApiError) {
            logger.warn('Error de API manejado', {
                requestId,
                statusCode: error.statusCode,
                code: error.code,
                error: error.message,
                duration: `${duration}ms`,
                method: event.httpMethod,
                path: event.path
            });

            // Casos especiales según tipo de error
            if (error instanceof UnauthorizedError) {
            return UnauthorizedResponse(error.message);
            }

            return ErrorResponse(error);
        }

        // Manejo de errores inesperados
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
};


