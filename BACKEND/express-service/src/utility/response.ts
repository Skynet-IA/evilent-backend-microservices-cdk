/**
 * Response Handlers Estructurados
 * 
 * REGLA DE ORO: Todas las respuestas siguen el mismo formato
 * Esto asegura consistencia con user-service y product-service
 * 
 * Formato estándar:
 * {
 *   "success": boolean,
 *   "message": string,
 *   "data": T | null,
 *   "timestamp": ISO8601
 * }
 */

import { Response } from 'express';
import { ERROR_CODES, ERROR_MESSAGES, HTTP_STATUS } from '../config/constants';
import logger from './logger';

/**
 * Interfaz para validación de errores
 */
export interface ApiError {
  field?: string;
  message: string;
  code: string;
}

/**
 * Response Success - Datos
 */
export const successResponse = <T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = HTTP_STATUS.OK
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Response Success - Sin datos (DELETE, etc)
 */
export const successResponseNoData = (
  res: Response,
  message: string = 'Success',
  statusCode: number = HTTP_STATUS.OK
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: null,
    timestamp: new Date().toISOString()
  });
};

/**
 * Response Error - Validación (400)
 */
export const validationErrorResponse = (
  res: Response,
  errors: ApiError[],
  message: string = ERROR_MESSAGES.VALIDATION_ERROR
) => {
  logger.warn('Validation error', { errors, message });
  
  return res.status(HTTP_STATUS.BAD_REQUEST).json({
    success: false,
    message,
    data: {
      errors
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Response Error - Unauthorized (401)
 */
export const unauthorizedErrorResponse = (
  res: Response,
  message: string = ERROR_MESSAGES.UNAUTHORIZED
) => {
  logger.security('Unauthorized access attempt', { message });
  
  return res.status(HTTP_STATUS.UNAUTHORIZED).json({
    success: false,
    message,
    data: null,
    timestamp: new Date().toISOString()
  });
};

/**
 * Response Error - Forbidden (403)
 */
export const forbiddenErrorResponse = (
  res: Response,
  message: string = ERROR_MESSAGES.FORBIDDEN
) => {
  logger.security('Forbidden access attempt', { message });
  
  return res.status(HTTP_STATUS.FORBIDDEN).json({
    success: false,
    message,
    data: null,
    timestamp: new Date().toISOString()
  });
};

/**
 * Response Error - Not Found (404)
 */
export const notFoundErrorResponse = (
  res: Response,
  message: string = ERROR_MESSAGES.NOT_FOUND
) => {
  return res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message,
    code: 'NOT_FOUND_ERROR',
    data: null,
    timestamp: new Date().toISOString()
  });
};

/**
 * Response Error - Conflict (409)
 */
export const conflictErrorResponse = (
  res: Response,
  message: string = ERROR_MESSAGES.CONFLICT
) => {
  return res.status(HTTP_STATUS.CONFLICT).json({
    success: false,
    message,
    data: null,
    timestamp: new Date().toISOString()
  });
};

/**
 * Response Error - Internal Server Error (500)
 */
export const internalServerErrorResponse = (
  res: Response,
  error: any,
  message: string = ERROR_MESSAGES.INTERNAL_SERVER_ERROR
) => {
  logger.error('Internal server error', {
    message,
    errorMessage: error?.message,
    stack: error?.stack
  });
  
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message,
    data: null,
    timestamp: new Date().toISOString()
  });
};

/**
 * Response Error - Service Unavailable (503)
 */
export const serviceUnavailableResponse = (
  res: Response,
  message: string = ERROR_MESSAGES.SERVICE_UNAVAILABLE
) => {
  return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
    success: false,
    message,
    data: null,
    timestamp: new Date().toISOString()
  });
};

/**
 * Generic Error Response
 */
export const errorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data: any = null,
  code: string = ERROR_CODES.INTERNAL_SERVER_ERROR
) => {
  logger.error('API error', { statusCode, message, code });
  
  return res.status(statusCode).json({
    success: false,
    message,
    data: data || { code },
    timestamp: new Date().toISOString()
  });
};

