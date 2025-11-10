import { APIGatewayEvent } from "aws-lambda";
import { BadRequestError } from "../../types/api-types.js";
import { createLogger } from "../../utility/logger.js";

const logger = createLogger('BodyParser');

/**
 * 📝 Middleware para parsing de JSON en el body de requests
 *
 * Maneja el parsing seguro de JSON en el body de API Gateway
 */
export class BodyParserMiddleware {

  /**
   * Parsea el body JSON de un evento de API Gateway
   *
   * @param event Evento de API Gateway (modificado in-place)
   * @returns Evento con body parseado
   * @throws BadRequestError si el JSON es malformado
   */
  static parse(event: APIGatewayEvent): APIGatewayEvent {
    // Si no hay body, no hacer nada
    if (!event.body) {
      return event;
    }

    // Si el body ya es un objeto (ya parseado), retornar
    if (typeof event.body === 'object') {
      return event;
    }

    // Si el body no es string, es un error
    if (typeof event.body !== 'string') {
      logger.warn('Body no es string ni object', { bodyType: typeof event.body });
      throw new BadRequestError('Formato de body inválido');
    }

    try {
      // Parsear JSON
      const parsedBody = JSON.parse(event.body);

      // Validar que sea un objeto válido
      if (typeof parsedBody !== 'object' || parsedBody === null) {
        throw new Error('Body debe ser un objeto JSON válido');
      }

      // Modificar el evento in-place
      event.body = parsedBody;

      logger.debug('Body JSON parseado exitosamente');

      return event;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.warn('Error parseando JSON del body', { error: errorMessage });
      throw new BadRequestError('JSON malformado en el body de la solicitud');
    }
  }

}
