import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

/**
 * 🌐 Middleware para manejo seguro de CORS en producción
 *
 * Configuración minimalista y segura para entornos de producción.
 * No usa wildcards ni configura credenciales automáticamente.
 */
export class CorsMiddleware {

  /**
   * Headers CORS seguros para producción
   * Solo permite métodos necesarios, sin wildcards
   */
  private static getSecureHeaders(): Record<string, string> {
    return {
      'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Max-Age': '86400', // 24 horas
    };
  }

  /**
   * Crea respuesta OPTIONS para preflight requests (solo si es necesario)
   * En producción, API Gateway normalmente maneja esto automáticamente
   */
  static createOptionsResponse(): APIGatewayProxyResult {
    return {
      statusCode: 200,
      headers: this.getSecureHeaders(),
      body: '',
    };
  }

  /**
   * Maneja requests OPTIONS solo si son explícitamente necesarios
   * En producción normal, esto debería ser manejado por API Gateway
   */
  static handleOptions(event: APIGatewayEvent): APIGatewayProxyResult | null {
    if (event.httpMethod === 'OPTIONS') {
      return this.createOptionsResponse();
    }
    return null;
  }

  /**
   * Agrega headers CORS mínimos a una respuesta (solo si es requerido)
   * Útil para desarrollo local o entornos que requieren CORS explícito
   */
  static addMinimalCorsHeaders(response: APIGatewayProxyResult): APIGatewayProxyResult {
    // Solo agregar si no existen headers CORS
    const hasCorsHeaders = Object.keys(response.headers || {}).some(
      header => header.toLowerCase().startsWith('access-control-')
    );

    if (!hasCorsHeaders) {
      return {
        ...response,
        headers: {
          ...response.headers,
          ...this.getSecureHeaders(),
        },
      };
    }

    return response;
  }
}
