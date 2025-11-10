/**
 * Constantes para mensajes de respuesta
 */
const RESPONSE_MESSAGES = {
    SUCCESS: "success",
    ERROR_OCCURRED: "Error occurred",
    VALIDATION_ERROR: "Validation error",
} as const;

/**
 * Constantes para códigos de estado HTTP estándar
 */
const HTTP_STATUS = {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Interface para la estructura de respuesta de la API
 */
interface ApiResponse {
    statusCode: number;
    body: string;
}

/**
 * Interface para el cuerpo de la respuesta
 */
interface ResponseBody {
    message: string;
    data?: unknown;
}

/**
 * Interface para errores de validación simple
 */
interface ValidationError {
    property: string;
    message: string;
}

/**
 * Formatea una respuesta de la API con el status code, mensaje y datos proporcionados
 * @param statusCode - Código de estado HTTP
 * @param message - Mensaje de la respuesta
 * @param data - Datos opcionales a incluir en la respuesta
 * @returns Respuesta formateada para AWS Lambda
 */
const formatResponse = (statusCode: number, message: string, data?: unknown): ApiResponse => {
    const responseBody: ResponseBody = {
        message,
        ...(data !== undefined && { data }),
    };

    return {
        statusCode,
        body: JSON.stringify(responseBody),
    };
};

/**
 * Crea una respuesta exitosa con datos
 * @param data - Datos a incluir en la respuesta
 * @param message - Mensaje personalizado (opcional, por defecto "success")
 * @returns Respuesta exitosa formateada
 */
export const SuccessResponse = (data: unknown, message: string = RESPONSE_MESSAGES.SUCCESS): ApiResponse => {
    return formatResponse(HTTP_STATUS.OK, message, data);
};

/**
 * Crea una respuesta de error con manejo mejorado de diferentes tipos de errores
 * @param error - Error a procesar (string, Error, array de ValidationError, etc.)
 * @param statusCode - Código de estado HTTP (por defecto 500)
 * @param customMessage - Mensaje personalizado (opcional)
 * @returns Respuesta de error formateada
 */
export const ErrorResponse = (
    error: unknown, 
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    customMessage?: string
): ApiResponse => {
    let errorMessage: string;
    let errorData: unknown;

    // Manejo de errores de validación simple
    if (Array.isArray(error) && error.length > 0 && error[0].property && error[0].message) {
        const validationError = error[0] as ValidationError;
        errorMessage = validationError.message;
        errorData = error;
        statusCode = HTTP_STATUS.BAD_REQUEST;
    }
    // Manejo de objetos Error estándar
    else if (error instanceof Error) {
        errorMessage = error.message;
        errorData = {
            name: error.name,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        };
    }
    // Manejo de strings
    else if (typeof error === 'string') {
        errorMessage = error;
        errorData = error;
    }
    // Manejo de otros tipos
    else {
        errorMessage = customMessage || RESPONSE_MESSAGES.ERROR_OCCURRED;
        errorData = error;
    }

    return formatResponse(statusCode, errorMessage, errorData);
};

/**
 * Crea una respuesta de error de validación específica
 * @param validationErrors - Array de errores de validación
 * @returns Respuesta de error de validación formateada
 */
export const ValidationErrorResponse = (validationErrors: ValidationError[]): ApiResponse => {
    return ErrorResponse(validationErrors, HTTP_STATUS.BAD_REQUEST, RESPONSE_MESSAGES.VALIDATION_ERROR);
};

/**
 * Crea una respuesta de error de autorización
 * @param message - Mensaje de error personalizado
 * @returns Respuesta de error de autorización formateada
 */
export const UnauthorizedResponse = (message: string = "Unauthorized"): ApiResponse => {
    return ErrorResponse(message, HTTP_STATUS.UNAUTHORIZED);
};

/**
 * Crea una respuesta de error de recurso no encontrado
 * @param message - Mensaje de error personalizado
 * @returns Respuesta de error 404 formateada
 */
export const NotFoundResponse = (message: string = "Resource not found"): ApiResponse => {
    return ErrorResponse(message, HTTP_STATUS.NOT_FOUND);
};
