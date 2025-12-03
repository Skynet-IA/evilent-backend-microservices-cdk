/**
 * Barrel export para utilidades
 * 
 * REGLA #4: Centralizar constantes y helpers en un único punto
 * REGLA CERO DUPLICACIÓN: Un solo lugar para importar utilities
 */

export { successResponse, successResponseNoData } from './response';
export { validationErrorResponse, unauthorizedErrorResponse, forbiddenErrorResponse } from './response';
export { notFoundErrorResponse, conflictErrorResponse, internalServerErrorResponse } from './response';
export { errorResponse, type ApiError } from './response';

export { default as logger } from './logger';

export { validateWithZod, parseWithZod, safeParseWithZod, formatZodErrors } from './zod-validator';
export { type ValidationError, type ZodValidationResult } from './zod-validator';

export { parseAndValidateBody, parseAndValidatePathParams, parseAndValidateQueryParams } from './request-parser';
export { validationSuccessResponse } from './request-parser';
export { type ValidationErrorResponse, type ParseResult } from './request-parser';

export { AppError, ValidationError as AppValidationError, NotFoundError } from './errors';

export { requestIdMiddleware, getRequestId } from '../api/middleware';

