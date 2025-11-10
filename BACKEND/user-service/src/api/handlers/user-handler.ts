import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { UserRepository } from "../../repository/index.js";
import { UserService } from "../../service/index.js";
import { AuthMiddleware } from "../middleware/auth-middleware.js";
import { BodyParserMiddleware } from "../middleware/body-parser.js";
import { CorsMiddleware } from "../middleware/cors-middleware.js";
import { ApiError } from "../../types/api-types.js";
import { ErrorResponse, NotFoundResponse } from "../../utility/response.js";
import { createLogger } from "../../utility/logger.js";
import { config } from "../../config/index.js";

const logger = createLogger('UserHandler');

// Inicializar servicio (singleton para reutilización entre invocaciones)
const service = new UserService(new UserRepository());

/**
 * 🎯 Handler principal para el servicio de usuarios
 *
 * ARQUITECTURA HÍBRIDA (Regla #9 + Regla Platino):
 * - ✅ Middleware reutilizable (AuthMiddleware)
 * - ✅ Route Map declarativo (escalable)
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
    // 📊 LOGGING: Request iniciada (sin datos sensibles)
    // ========================================
    logger.info('Request iniciada', {
      requestId,
      method: event.httpMethod,
      path: event.path,
    });

    // ========================================
    // 🌐 MANEJO CORS (solo para desarrollo/testing)
    // ========================================
    if (config.isCorsEnabled) {
      const corsResponse = CorsMiddleware.handleOptions(event);
      if (corsResponse) {
        return CorsMiddleware.addMinimalCorsHeaders(corsResponse);
      }
    }

    // ========================================
    // 📝 PARSING DEL BODY JSON
    // ========================================
    const parsedEvent = BodyParserMiddleware.parse(event);

    // ========================================
    // 🔐 AUTENTICACIÓN JWT (Middleware reutilizable)
    // ========================================
    const claims = await AuthMiddleware.authenticate(parsedEvent);

    // ========================================
    // 🛣️ ROUTE MAP DECLARATIVO (Regla Platino)
    // ========================================
    // Patrón escalable: Agregar ruta = agregar objeto al array
    // NO modificar lógica de matching
    const method = event.httpMethod.toLowerCase();
    const hasPathParams = event.pathParameters !== null;

    const routes: Route[] = [
      {
        method: 'post',
        requiresPathParams: false,
        handler: (e) => service.CreateProfile(e, claims.userId, claims.userEmail),
        description: 'POST /user - Crear perfil de usuario'
      },
      {
        method: 'get',
        requiresPathParams: false,
        handler: (e) => service.GetProfile(e, claims.userId, claims.userEmail),
        description: 'GET /user - Obtener perfil de usuario'
      },
      {
        method: 'put',
        requiresPathParams: false,
        handler: (e) => service.UpdateProfile(e, claims.userId),
        description: 'PUT /user - Actualizar perfil de usuario'
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

      const notFoundResponse = NotFoundResponse(
        `Ruta ${event.path} con método ${event.httpMethod} no encontrada`
      );

      if (config.isCorsEnabled) {
        return CorsMiddleware.addMinimalCorsHeaders(notFoundResponse);
      }

      return notFoundResponse;
    }

    logger.debug('Ruta encontrada', { description: matchedRoute.description });

    // ========================================
    // ✅ EJECUTAR HANDLER Y RETORNAR RESPONSE
    // ========================================
    const result = await matchedRoute.handler(parsedEvent);

    const duration = Date.now() - startTime;
    logger.info('Request completada exitosamente', {
      requestId,
      statusCode: result.statusCode,
      duration: `${duration}ms`,
      userIdHash: claims.userId.substring(0, 8)
    });

    if (config.isCorsEnabled) {
      return CorsMiddleware.addMinimalCorsHeaders(result);
    }

    return result;

  } catch (error) {
    // ========================================
    // ❌ MANEJO CENTRALIZADO DE ERRORES
    // ========================================
    const duration = Date.now() - startTime;

    if (error instanceof ApiError) {
      logger.warn('Error de API manejado', {
        requestId,
        error: error.message,
        statusCode: error.statusCode,
        code: error.code,
        duration: `${duration}ms`,
        method: event.httpMethod,
        path: event.path
      });

      const errorResponse = ErrorResponse(error, error.statusCode, error.message);

      if (config.isCorsEnabled) {
        return CorsMiddleware.addMinimalCorsHeaders(errorResponse);
      }

      return errorResponse;

    } else {
      logger.error('Error inesperado no manejado', {
        requestId,
        error: error instanceof Error ? error.message : String(error),
        stack: config.isDevelopment && error instanceof Error ? error.stack : undefined,
        duration: `${duration}ms`,
        method: event.httpMethod,
        path: event.path
      });

      const errorResponse = ErrorResponse(error);

      if (config.isCorsEnabled) {
        return CorsMiddleware.addMinimalCorsHeaders(errorResponse);
      }

      return errorResponse;
    }
  }
};
