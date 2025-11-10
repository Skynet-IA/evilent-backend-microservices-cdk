/**
 * 🛡️ Clases de error personalizadas para Product Service
 *
 * Proporciona clases de error específicas para diferentes situaciones,
 * facilitando el manejo y logging de errores.
 *
 * REGLA #6: SIEMPRE implementar defense in depth en seguridad
 */

import { HTTP_STATUS } from '../config/constants.js';

/**
 * Clase base para todos los errores de la aplicación
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Mantener el stack trace correcto
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error de validación (400 Bad Request)
 * Usado cuando los datos de entrada no cumplen con las reglas de validación
 */
export class ValidationError extends AppError {
  public readonly errors?: any[];

  constructor(message: string, errors?: any[]) {
    super(message, HTTP_STATUS.BAD_REQUEST);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Error de autenticación (401 Unauthorized)
 * Usado cuando el usuario no está autenticado
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'No autenticado') {
    super(message, HTTP_STATUS.UNAUTHORIZED);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Error de autorización (403 Forbidden)
 * Usado cuando el usuario está autenticado pero no tiene permisos
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'No tienes permisos para realizar esta acción') {
    super(message, HTTP_STATUS.FORBIDDEN);
    this.name = 'ForbiddenError';
  }
}

/**
 * Error de recurso no encontrado (404 Not Found)
 * Usado cuando un recurso solicitado no existe
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso no encontrado') {
    super(message, HTTP_STATUS.NOT_FOUND);
    this.name = 'NotFoundError';
  }
}

/**
 * Error de conflicto (409 Conflict)
 * Usado cuando hay un conflicto con el estado actual del recurso
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Conflicto con el estado actual del recurso') {
    super(message, HTTP_STATUS.CONFLICT);
    this.name = 'ConflictError';
  }
}

/**
 * Error interno del servidor (500 Internal Server Error)
 * Usado para errores inesperados del servidor
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Error interno del servidor', isOperational = false) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, isOperational);
    this.name = 'InternalServerError';
  }
}

/**
 * Verifica si un error es operacional (esperado) o programático (bug)
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
    }
    return false;
}

/**
 * Extrae información relevante del error para logging
 */
export function getErrorInfo(error: Error | AppError): {
  name: string;
  message: string;
  statusCode?: number;
  stack?: string;
  errors?: any[];
} {
  const info: any = {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };

  if (error instanceof AppError) {
    info.statusCode = error.statusCode;
  }

  if (error instanceof ValidationError && error.errors) {
    info.errors = error.errors;
  }

  return info;
}

/**
 * ✅ TAREA #7 COMPLETADA: AppValidationError ELIMINADA
 * 
 * Esta función fue eliminada porque ahora usamos Zod para validación.
 * Ver: src/dto/validation-schemas.ts
 * Ver: src/utility/zod-validator.ts
 * 
 * REGLA #1: NUNCA escribir código muerto o especulativo
 * La función temporal fue eliminada después de completar la migración a Zod.
 */
